"""Tests for Profile endpoints and Forgot/Reset Password flows"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@gimudigital.com"
ADMIN_PASSWORD = "admin123"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "test123"


@pytest.fixture(scope="module")
def admin_session():
    session = requests.Session()
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return session


@pytest.fixture(scope="module")
def user_session():
    session = requests.Session()
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"User login failed: {r.status_code} {r.text}")
    return session


class TestProfileGet:
    """GET /api/profile tests"""

    def test_get_profile_authenticated(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/profile")
        assert r.status_code == 200
        data = r.json()
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert "name" in data
        assert "phone" in data
        assert "specialization" in data
        assert "institution" in data

    def test_get_profile_unauthenticated(self):
        r = requests.get(f"{BASE_URL}/api/profile")
        assert r.status_code in [401, 403]


class TestProfileUpdate:
    """PUT /api/profile tests"""

    def test_update_profile_fields(self, admin_session):
        payload = {
            "name": "Admin Test Updated",
            "phone": "081234567890",
            "specialization": "Dokter Umum",
            "institution": "RS Test"
        }
        r = admin_session.put(f"{BASE_URL}/api/profile", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("name") == "Admin Test Updated"
        assert data.get("phone") == "081234567890"

    def test_update_profile_persisted(self, admin_session):
        r = admin_session.get(f"{BASE_URL}/api/profile")
        assert r.status_code == 200
        data = r.json()
        assert data.get("name") == "Admin Test Updated"

    def test_update_profile_empty_body(self, admin_session):
        r = admin_session.put(f"{BASE_URL}/api/profile", json={})
        assert r.status_code == 400


class TestChangePassword:
    """POST /api/profile/change-password tests"""

    def test_change_password_wrong_current(self, user_session):
        r = user_session.post(f"{BASE_URL}/api/profile/change-password", json={
            "current_password": "wrongpassword",
            "new_password": "newpass123"
        })
        assert r.status_code == 400
        data = r.json()
        assert "detail" in data

    def test_change_password_too_short(self, user_session):
        r = user_session.post(f"{BASE_URL}/api/profile/change-password", json={
            "current_password": TEST_USER_PASSWORD,
            "new_password": "abc"
        })
        assert r.status_code == 400

    def test_change_password_success(self, user_session):
        # Change to temp password
        r = user_session.post(f"{BASE_URL}/api/profile/change-password", json={
            "current_password": TEST_USER_PASSWORD,
            "new_password": "test123_new"
        })
        assert r.status_code == 200
        data = r.json()
        assert "message" in data

        # Change back to original
        r2 = user_session.post(f"{BASE_URL}/api/profile/change-password", json={
            "current_password": "test123_new",
            "new_password": TEST_USER_PASSWORD
        })
        assert r2.status_code == 200


class TestForgotPassword:
    """POST /api/auth/forgot-password tests"""

    def test_forgot_password_registered_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": ADMIN_EMAIL})
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        assert "token" in data  # demo mode returns token

    def test_forgot_password_unregistered_email(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": "notexist@example.com"})
        assert r.status_code == 200
        data = r.json()
        assert "message" in data
        # Should NOT return token for unregistered email
        assert "token" not in data


class TestResetPassword:
    """POST /api/auth/reset-password tests"""

    def test_reset_password_valid_token(self):
        # First get a token
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": TEST_USER_EMAIL})
        assert r.status_code == 200
        token = r.json().get("token")
        assert token, "Token should be returned for registered email"

        # Reset password using token
        r2 = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": token,
            "new_password": TEST_USER_PASSWORD
        })
        assert r2.status_code == 200
        data = r2.json()
        assert "message" in data

    def test_reset_password_invalid_token(self):
        r = requests.post(f"{BASE_URL}/api/auth/reset-password", json={
            "token": "invalidtoken123",
            "new_password": "newpass123"
        })
        assert r.status_code == 400

    def test_reset_password_used_token(self):
        # Get token
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": TEST_USER_EMAIL})
        token = r.json().get("token")
        # Use it once
        requests.post(f"{BASE_URL}/api/auth/reset-password", json={"token": token, "new_password": TEST_USER_PASSWORD})
        # Use again
        r2 = requests.post(f"{BASE_URL}/api/auth/reset-password", json={"token": token, "new_password": "another123"})
        assert r2.status_code == 400

    def test_reset_password_too_short(self):
        r = requests.post(f"{BASE_URL}/api/auth/forgot-password", json={"email": TEST_USER_EMAIL})
        token = r.json().get("token")
        r2 = requests.post(f"{BASE_URL}/api/auth/reset-password", json={"token": token, "new_password": "abc"})
        assert r2.status_code == 400
