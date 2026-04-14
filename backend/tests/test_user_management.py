"""Backend tests for Admin User Management features"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@gimudigital.com"
ADMIN_PASS = "admin123"
TEST_EMAIL = "test@example.com"
TEST_PASS = "test123"

def get_admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return r.cookies

def get_user_token():
    # Try login first, register if not exists
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
    if r.status_code != 200:
        requests.post(f"{BASE_URL}/api/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASS, "name": "Test User"})
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
    return r.cookies

# GET /api/admin/users
class TestGetAdminUsers:
    """Test GET /api/admin/users"""

    def test_admin_can_get_users(self):
        cookies = get_admin_token()
        r = requests.get(f"{BASE_URL}/api/admin/users", cookies=cookies)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"Got {len(data)} users")

    def test_users_have_required_fields(self):
        cookies = get_admin_token()
        r = requests.get(f"{BASE_URL}/api/admin/users", cookies=cookies)
        assert r.status_code == 200
        users = r.json()
        for u in users:
            assert "_id" in u or "id" in u, "Must have _id or id"
            assert "email" in u
            assert "role" in u
            assert "banned" in u
            assert "password_hash" not in u, "password_hash must not be returned"
        print("All users have required fields, no password_hash exposed")

    def test_non_admin_gets_403(self):
        cookies = get_user_token()
        r = requests.get(f"{BASE_URL}/api/admin/users", cookies=cookies)
        assert r.status_code == 403
        print("Non-admin gets 403 as expected")

    def test_unauthenticated_gets_401_or_403(self):
        r = requests.get(f"{BASE_URL}/api/admin/users")
        assert r.status_code in (401, 403)
        print(f"Unauthenticated gets {r.status_code}")


# GET user_id for test user
def get_test_user_id():
    cookies = get_admin_token()
    r = requests.get(f"{BASE_URL}/api/admin/users", cookies=cookies)
    users = r.json()
    for u in users:
        if u.get("email") == TEST_EMAIL:
            return u.get("_id") or u.get("id")
    return None

def get_admin_user_id():
    cookies = get_admin_token()
    r = requests.get(f"{BASE_URL}/api/admin/users", cookies=cookies)
    users = r.json()
    for u in users:
        if u.get("email") == ADMIN_EMAIL:
            return u.get("_id") or u.get("id")
    return None


class TestRoleChange:
    """Test PUT /api/admin/users/{user_id}/role"""

    def test_change_user_to_admin_and_back(self):
        cookies = get_admin_token()
        user_id = get_test_user_id()
        assert user_id, "test user not found"

        # Change to admin
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "admin"}, cookies=cookies)
        assert r.status_code == 200, f"Failed to change to admin: {r.text}"
        print("Changed test user to admin")

        # Change back to user
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "user"}, cookies=cookies)
        assert r.status_code == 200, f"Failed to change back to user: {r.text}"
        print("Changed test user back to user")

    def test_self_role_change_rejected(self):
        cookies = get_admin_token()
        admin_id = get_admin_user_id()
        assert admin_id, "admin not found"
        r = requests.put(f"{BASE_URL}/api/admin/users/{admin_id}/role", json={"role": "user"}, cookies=cookies)
        assert r.status_code == 400
        print(f"Self role change correctly rejected: {r.json()}")

    def test_invalid_role_rejected(self):
        cookies = get_admin_token()
        user_id = get_test_user_id()
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "superadmin"}, cookies=cookies)
        assert r.status_code == 400
        print("Invalid role correctly rejected")

    def test_non_admin_role_change_gets_403(self):
        cookies = get_user_token()
        user_id = get_test_user_id()
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "admin"}, cookies=cookies)
        assert r.status_code == 403
        print("Non-admin gets 403 on role change")


class TestBanUser:
    """Test PUT /api/admin/users/{user_id}/ban"""

    def test_ban_and_unban_user(self):
        cookies = get_admin_token()
        user_id = get_test_user_id()
        assert user_id, "test user not found"

        # Ensure user role is 'user' before banning
        requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "user"}, cookies=cookies)

        # Ban user
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/ban", json={"banned": True}, cookies=cookies)
        assert r.status_code == 200, f"Ban failed: {r.text}"
        print("Banned test user")

        # Unban
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/ban", json={"banned": False}, cookies=cookies)
        assert r.status_code == 200, f"Unban failed: {r.text}"
        print("Unbanned test user")

    def test_self_ban_rejected(self):
        cookies = get_admin_token()
        admin_id = get_admin_user_id()
        assert admin_id
        r = requests.put(f"{BASE_URL}/api/admin/users/{admin_id}/ban", json={"banned": True}, cookies=cookies)
        assert r.status_code == 400
        print(f"Self ban rejected: {r.json()}")

    def test_banned_user_cannot_login(self):
        admin_cookies = get_admin_token()
        user_id = get_test_user_id()
        assert user_id

        # Ensure user is user role (not admin)
        requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "user"}, cookies=admin_cookies)

        # Ban user
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/ban", json={"banned": True}, cookies=admin_cookies)
        assert r.status_code == 200

        # Try login
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
        assert r.status_code == 403, f"Banned user should get 403, got {r.status_code}: {r.text}"
        print(f"Banned user correctly blocked: {r.json()}")

        # Cleanup: unban
        requests.put(f"{BASE_URL}/api/admin/users/{user_id}/ban", json={"banned": False}, cookies=admin_cookies)
        print("Cleaned up: user unbanned")

    def test_ban_admin_rejected(self):
        admin_cookies = get_admin_token()
        # Create a second admin for this test - first check if there's another admin
        r = requests.get(f"{BASE_URL}/api/admin/users", cookies=admin_cookies)
        users = r.json()
        other_admins = [u for u in users if u.get("role") == "admin" and u.get("email") != ADMIN_EMAIL]

        if not other_admins:
            # Promote test user to admin
            user_id = get_test_user_id()
            requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "admin"}, cookies=admin_cookies)
            other_admin_id = user_id
        else:
            other_admin_id = other_admins[0].get("_id") or other_admins[0].get("id")

        r = requests.put(f"{BASE_URL}/api/admin/users/{other_admin_id}/ban", json={"banned": True}, cookies=admin_cookies)
        assert r.status_code == 400, f"Should reject banning another admin, got {r.status_code}: {r.text}"
        print(f"Ban admin correctly rejected: {r.json()}")

        # Cleanup
        user_id = get_test_user_id()
        requests.put(f"{BASE_URL}/api/admin/users/{user_id}/role", json={"role": "user"}, cookies=admin_cookies)

    def test_non_admin_ban_gets_403(self):
        user_cookies = get_user_token()
        user_id = get_test_user_id()
        r = requests.put(f"{BASE_URL}/api/admin/users/{user_id}/ban", json={"banned": True}, cookies=user_cookies)
        assert r.status_code == 403
        print("Non-admin gets 403 on ban")
