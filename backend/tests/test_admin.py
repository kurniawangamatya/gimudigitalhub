"""Admin dashboard CRUD endpoint tests"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "admin@gimudigital.com"
ADMIN_PASSWORD = "admin123"
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123"

@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    resp = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return s

@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    # Try register first (ignore if already exists)
    s.post(f"{BASE_URL}/api/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": "Test User"})
    resp = s.post(f"{BASE_URL}/api/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if resp.status_code != 200:
        pytest.skip("Test user login failed")
    return s

# Admin stats
class TestAdminStats:
    def test_admin_stats_success(self, admin_session):
        resp = admin_session.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_products" in data
        assert "total_users" in data
        assert "total_orders" in data
        assert "total_revenue" in data
        assert "category_counts" in data
        assert isinstance(data["total_products"], int)
        assert isinstance(data["total_revenue"], float)

    def test_admin_stats_forbidden_for_user(self, user_session):
        resp = user_session.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 403

    def test_admin_stats_unauthenticated(self):
        resp = requests.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 401


# Admin product CRUD
class TestAdminProducts:
    created_product_id = None

    def test_create_product(self, admin_session):
        payload = {
            "title": "TEST_Admin Product",
            "description": "Test description for admin product",
            "price": 9.99,
            "category": "ebook",
            "image_url": "https://example.com/img.jpg",
            "features": ["Feature 1", "Feature 2"],
            "badge": "New"
        }
        resp = admin_session.post(f"{BASE_URL}/api/admin/products", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == payload["title"]
        assert data["price"] == 9.99
        assert data["category"] == "ebook"
        assert "id" in data
        TestAdminProducts.created_product_id = data["id"]

    def test_create_product_forbidden_for_user(self, user_session):
        payload = {"title": "X", "description": "X", "price": 1.0, "category": "ebook", "image_url": ""}
        resp = user_session.post(f"{BASE_URL}/api/admin/products", json=payload)
        assert resp.status_code == 403

    def test_update_product(self, admin_session):
        pid = TestAdminProducts.created_product_id
        if not pid:
            pytest.skip("No created product")
        resp = admin_session.put(f"{BASE_URL}/api/admin/products/{pid}", json={"title": "TEST_Updated Product", "price": 19.99})
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Updated Product"
        assert data["price"] == 19.99

    def test_update_product_verify_persistence(self, admin_session):
        pid = TestAdminProducts.created_product_id
        if not pid:
            pytest.skip("No created product")
        # Verify via GET /api/products/{id}
        resp = admin_session.get(f"{BASE_URL}/api/products/{pid}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Updated Product"

    def test_update_product_forbidden_for_user(self, user_session):
        pid = TestAdminProducts.created_product_id or "some-id"
        resp = user_session.put(f"{BASE_URL}/api/admin/products/{pid}", json={"title": "X"})
        assert resp.status_code == 403

    def test_update_nonexistent_product(self, admin_session):
        resp = admin_session.put(f"{BASE_URL}/api/admin/products/nonexistent-id-xyz", json={"title": "X"})
        assert resp.status_code == 404

    def test_delete_product(self, admin_session):
        pid = TestAdminProducts.created_product_id
        if not pid:
            pytest.skip("No created product")
        resp = admin_session.delete(f"{BASE_URL}/api/admin/products/{pid}")
        assert resp.status_code == 200
        # Verify deleted
        verify = admin_session.get(f"{BASE_URL}/api/products/{pid}")
        assert verify.status_code == 404

    def test_delete_product_forbidden_for_user(self, user_session):
        resp = user_session.delete(f"{BASE_URL}/api/admin/products/some-id")
        assert resp.status_code == 403

    def test_delete_nonexistent_product(self, admin_session):
        resp = admin_session.delete(f"{BASE_URL}/api/admin/products/nonexistent-id-xyz")
        assert resp.status_code == 404


# Admin users
class TestAdminUsers:
    def test_get_users_admin(self, admin_session):
        resp = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        # Verify no passwords in response
        for user in data:
            assert "password_hash" not in user
            assert "password" not in user

    def test_get_users_forbidden_for_user(self, user_session):
        resp = user_session.get(f"{BASE_URL}/api/admin/users")
        assert resp.status_code == 403
