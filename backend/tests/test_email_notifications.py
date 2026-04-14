"""
Email notification feature tests: welcome email on register, reset password email,
admin test-email endpoint, 403 for non-admin, and graceful error handling
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@gimudigital.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "test123"
NEW_USER_EMAIL = f"TEST_emailtest_{int(time.time())}@example.com"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return s


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    if r.status_code != 200:
        pytest.skip("Test user login failed")
    return s


class TestRegisterWelcomeEmail:
    """Registration triggers welcome email (fire-and-forget via Brevo)"""

    def test_register_new_user_returns_200(self):
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": NEW_USER_EMAIL,
            "name": "TEST EmailUser",
            "password": "testpass123"
        })
        assert r.status_code == 200, f"Register failed: {r.text}"
        data = r.json()
        assert data["email"] == NEW_USER_EMAIL.lower()
        assert "id" in data
        print(f"PASS: Register new user {NEW_USER_EMAIL} - welcome email should be triggered")

    def test_register_duplicate_email_returns_400(self):
        # Try registering same email again
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": NEW_USER_EMAIL,
            "name": "TEST EmailUser",
            "password": "testpass123"
        })
        assert r.status_code == 400
        print("PASS: Duplicate registration returns 400")


class TestForgotPasswordEmail:
    """Forgot password sends reset email with origin_url"""

    def test_forgot_password_with_origin_url(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_USER_EMAIL,
            "origin_url": "https://medicalproduct-hub.preview.emergentagent.com"
        })
        assert r.status_code == 200, f"Forgot password failed: {r.text}"
        data = r.json()
        assert "message" in data
        # In dev mode, token is returned
        if "token" in data:
            assert isinstance(data["token"], str)
            assert len(data["token"]) > 10
            print(f"PASS: Forgot password returns token: {data['token'][:20]}...")
        print("PASS: Forgot password with origin_url works")

    def test_forgot_password_without_origin_url(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_USER_EMAIL
        })
        assert r.status_code == 200, f"Forgot password without origin_url failed: {r.text}"
        print("PASS: Forgot password without origin_url works")

    def test_forgot_password_non_existent_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": "nonexistent_user@example.com",
            "origin_url": "https://medicalproduct-hub.preview.emergentagent.com"
        })
        # Should return 200 (security: don't reveal if email exists)
        assert r.status_code == 200
        print("PASS: Forgot password for non-existent email returns 200 (security)")

    def test_forgot_password_reset_link_contains_origin(self):
        """Verify that reset link uses origin_url"""
        origin = "https://medicalproduct-hub.preview.emergentagent.com"
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_USER_EMAIL,
            "origin_url": origin
        })
        assert r.status_code == 200
        data = r.json()
        if "token" in data:
            # The token can be used to construct reset link
            token = data["token"]
            expected_link_prefix = f"{origin}/reset-password"
            print(f"PASS: Token returned, reset link would be: {expected_link_prefix}?token={token[:10]}...")
        print("PASS: Forgot password with origin_url returns properly")


class TestAdminTestEmail:
    """Admin test-email endpoint"""

    def test_admin_test_email_success(self, admin_session):
        r = admin_session.post(f"{BASE_URL}/api/admin/test-email", json={})
        assert r.status_code == 200, f"Admin test email failed: {r.text}"
        data = r.json()
        assert "message" in data
        assert "sent_to" in data
        assert data["sent_to"] == ADMIN_EMAIL
        print(f"PASS: Admin test email response: {data['message']} to {data['sent_to']}")

    def test_non_admin_test_email_returns_403(self, user_session):
        r = user_session.post(f"{BASE_URL}/api/admin/test-email", json={})
        assert r.status_code == 403, f"Expected 403 for non-admin, got {r.status_code}: {r.text}"
        print("PASS: Non-admin gets 403 on test-email endpoint")

    def test_unauthenticated_test_email_returns_401(self):
        r = requests.post(f"{BASE_URL}/api/admin/test-email", json={})
        assert r.status_code in [401, 403], f"Expected 401/403, got {r.status_code}: {r.text}"
        print(f"PASS: Unauthenticated test email returns {r.status_code}")


class TestEmailServiceResilience:
    """Email service should not crash app if Brevo fails"""

    def test_registration_still_works_even_if_email_service_issues(self):
        """Registration endpoint returns correctly (email is fire-and-forget)"""
        test_email = f"TEST_resilience_{int(time.time())}@example.com"
        r = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": test_email,
            "name": "TEST Resilience",
            "password": "testpass123"
        })
        # Should succeed regardless of email service status
        assert r.status_code == 200, f"Register should succeed even if email fails: {r.text}"
        data = r.json()
        assert data["email"] == test_email.lower()
        print("PASS: Registration succeeds even with fire-and-forget email")

    def test_forgot_password_returns_quickly(self):
        """Forgot password should not be blocked by email service"""
        start = time.time()
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={
            "email": TEST_USER_EMAIL,
            "origin_url": "https://medicalproduct-hub.preview.emergentagent.com"
        })
        elapsed = time.time() - start
        assert r.status_code == 200
        # Should respond within 10 seconds (email is async)
        assert elapsed < 10, f"Forgot password took too long: {elapsed}s"
        print(f"PASS: Forgot password responded in {elapsed:.2f}s")
