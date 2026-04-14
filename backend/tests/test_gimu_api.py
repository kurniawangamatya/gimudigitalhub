"""
Tests for Gimu Digital Hub - Auth, Products, Cart endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s

@pytest.fixture(scope="module")
def auth_session(session):
    resp = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@gimudigital.com", "password": "admin123"})
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return session

# ============ PRODUCTS ============
class TestProducts:
    """Product listing and detail endpoints"""

    def test_get_all_products(self, session):
        resp = session.get(f"{BASE_URL}/api/products")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 10, f"Expected 10 products, got {len(data)}"

    def test_filter_by_category_ebook(self, session):
        resp = session.get(f"{BASE_URL}/api/products?category=ebook")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) > 0
        for p in data:
            assert p["category"] == "ebook"

    def test_get_single_product(self, session):
        resp = session.get(f"{BASE_URL}/api/products/ebook-anatomi-klinis")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "ebook-anatomi-klinis"
        assert "title" in data
        assert "price" in data

    def test_product_not_found(self, session):
        resp = session.get(f"{BASE_URL}/api/products/nonexistent-product")
        assert resp.status_code == 404

# ============ AUTH ============
class TestAuth:
    """Authentication endpoints"""

    def test_admin_login(self, session):
        resp = session.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@gimudigital.com", "password": "admin123"})
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == "admin@gimudigital.com"

    def test_login_wrong_password(self, session):
        s = requests.Session()
        resp = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@gimudigital.com", "password": "wrongpass"})
        assert resp.status_code == 401

    def test_register_new_user(self, session):
        import uuid
        unique_email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        resp = session.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Test User",
            "email": unique_email,
            "password": "test123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == unique_email.lower()

    def test_get_me_authenticated(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == "admin@gimudigital.com"

    def test_get_me_unauthenticated(self):
        s = requests.Session()
        resp = s.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 401

# ============ CART ============
class TestCart:
    """Cart endpoints (requires auth)"""

    def test_get_cart_empty(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/cart")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data or isinstance(data, list)

    def test_add_to_cart(self, auth_session):
        resp = auth_session.post(f"{BASE_URL}/api/cart", json={"product_id": "ebook-anatomi-klinis", "quantity": 1})
        assert resp.status_code == 200

    def test_get_cart_with_items(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/cart")
        assert resp.status_code == 200

    def test_delete_from_cart(self, auth_session):
        # Add first
        auth_session.post(f"{BASE_URL}/api/cart", json={"product_id": "ebook-farmakologi", "quantity": 1})
        resp = auth_session.delete(f"{BASE_URL}/api/cart/ebook-farmakologi")
        assert resp.status_code == 200
