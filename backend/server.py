from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import uuid
import bcrypt
import jwt
import secrets
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
)
from email_service import (
    send_email, welcome_email_html, reset_password_email_html, purchase_confirmation_email_html
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

# ============ MODELS ============
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ProductOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    price: float
    category: str
    image_url: str
    features: List[str] = []
    rating: float = 4.5
    reviews_count: int = 0
    badge: str = ""

class CartItemRequest(BaseModel):
    product_id: str
    quantity: int = 1

class CheckoutRequest(BaseModel):
    origin_url: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    institution: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProductCreateRequest(BaseModel):
    title: str
    description: str
    price: float
    category: str
    image_url: str = ""
    features: List[str] = []
    badge: str = ""

class ProductUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    features: Optional[List[str]] = None
    badge: Optional[str] = None

class UserRoleUpdate(BaseModel):
    role: str

class UserBanUpdate(BaseModel):
    banned: bool

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")

# ============ AUTH ROUTES ============
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(req.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": req.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    # Send welcome email (fire-and-forget)
    import asyncio
    asyncio.ensure_future(send_email(email, req.name, "Selamat Datang di Gimu Digital Hub!", welcome_email_html(req.name)))
    return {"id": user_id, "email": email, "name": req.name, "role": "user"}

class ForgotPasswordWithOrigin(BaseModel):
    email: str
    origin_url: Optional[str] = None

@api_router.post("/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.now(timezone.utc) < datetime.fromisoformat(locked_until):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("banned"):
        raise HTTPException(status_code=403, detail="Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.")

    await db.login_attempts.delete_one({"identifier": identifier})
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, refresh_token)
    return {"id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        set_auth_cookies(response, access_token, token)
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ============ PROFILE ROUTES ============
@api_router.get("/profile")
async def get_profile(request: Request):
    user = await get_current_user(request)
    return {
        "id": user["_id"],
        "email": user.get("email", ""),
        "name": user.get("name", ""),
        "role": user.get("role", "user"),
        "phone": user.get("phone", ""),
        "specialization": user.get("specialization", ""),
        "institution": user.get("institution", ""),
        "created_at": user.get("created_at", ""),
    }

@api_router.put("/profile")
async def update_profile(req: UpdateProfileRequest, request: Request):
    user = await get_current_user(request)
    update_data = {}
    if req.name is not None:
        update_data["name"] = req.name
    if req.phone is not None:
        update_data["phone"] = req.phone
    if req.specialization is not None:
        update_data["specialization"] = req.specialization
    if req.institution is not None:
        update_data["institution"] = req.institution
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": update_data})
    updated = await db.users.find_one({"_id": ObjectId(user["_id"])}, {"_id": 0, "password_hash": 0})
    return updated

@api_router.post("/profile/change-password")
async def change_password(req: ChangePasswordRequest, request: Request):
    user_with_id = await get_current_user(request)
    full_user = await db.users.find_one({"_id": ObjectId(user_with_id["_id"])})
    if not verify_password(req.current_password, full_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Password saat ini salah")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")
    new_hash = hash_password(req.new_password)
    await db.users.update_one({"_id": ObjectId(user_with_id["_id"])}, {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}})
    return {"message": "Password berhasil diubah"}

# ============ FORGOT/RESET PASSWORD ============
@api_router.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordWithOrigin):
    email = req.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "Jika email terdaftar, link reset password telah dikirim"}
    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "token": token,
        "user_id": str(user["_id"]),
        "email": email,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    # Build reset link
    origin = req.origin_url.rstrip("/") if req.origin_url else ""
    reset_link = f"{origin}/reset-password?token={token}" if origin else f"/reset-password?token={token}"
    logger.info(f"Password reset token for {email}: {token}")
    logger.info(f"Reset link: {reset_link}")
    # Send reset email
    user_name = user.get("name", email)
    import asyncio
    asyncio.ensure_future(send_email(email, user_name, "Reset Password - Gimu Digital Hub", reset_password_email_html(user_name, reset_link)))
    return {"message": "Jika email terdaftar, link reset password telah dikirim", "token": token}

@api_router.post("/auth/reset-password")
async def reset_password(req: ResetPasswordRequest):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password baru minimal 6 karakter")
    token_doc = await db.password_reset_tokens.find_one({"token": req.token, "used": False})
    if not token_doc:
        raise HTTPException(status_code=400, detail="Token tidak valid atau sudah digunakan")
    expires_at = token_doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Token sudah kadaluarsa")
    new_hash = hash_password(req.new_password)
    await db.users.update_one({"_id": ObjectId(token_doc["user_id"])}, {"$set": {"password_hash": new_hash}})
    await db.password_reset_tokens.update_one({"token": req.token}, {"$set": {"used": True}})
    return {"message": "Password berhasil direset"}

# ============ PRODUCT ROUTES ============
@api_router.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# ============ CART ROUTES ============
@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request)
    cart_items = await db.cart.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    enriched = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched.append({**item, "product": product})
    return enriched

@api_router.post("/cart")
async def add_to_cart(req: CartItemRequest, request: Request):
    user = await get_current_user(request)
    existing = await db.cart.find_one({"user_id": user["_id"], "product_id": req.product_id})
    if existing:
        await db.cart.update_one(
            {"user_id": user["_id"], "product_id": req.product_id},
            {"$inc": {"quantity": req.quantity}}
        )
    else:
        await db.cart.insert_one({
            "user_id": user["_id"],
            "product_id": req.product_id,
            "quantity": req.quantity,
            "added_at": datetime.now(timezone.utc).isoformat()
        })
    return {"message": "Added to cart"}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, request: Request):
    user = await get_current_user(request)
    await db.cart.delete_one({"user_id": user["_id"], "product_id": product_id})
    return {"message": "Removed from cart"}

@api_router.delete("/cart")
async def clear_cart(request: Request):
    user = await get_current_user(request)
    await db.cart.delete_many({"user_id": user["_id"]})
    return {"message": "Cart cleared"}

# ============ CHECKOUT ROUTES ============
@api_router.post("/checkout/create-session")
async def create_checkout_session(req: CheckoutRequest, request: Request, http_request: Request):
    user = await get_current_user(request)
    cart_items = await db.cart.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    product_ids = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            total += product["price"] * item["quantity"]
            product_ids.append(item["product_id"])

    if total <= 0:
        raise HTTPException(status_code=400, detail="Invalid cart total")

    origin_url = req.origin_url.rstrip("/")
    success_url = f"{origin_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/cart"

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)

    checkout_request = CheckoutSessionRequest(
        amount=round(total, 2),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": user["_id"], "user_email": user["email"], "product_ids": ",".join(product_ids)}
    )
    session = await stripe_checkout.create_checkout_session(checkout_request)

    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": user["_id"],
        "user_email": user["email"],
        "amount": round(total, 2),
        "currency": "usd",
        "product_ids": product_ids,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    user = await get_current_user(request)
    transaction = await db.payment_transactions.find_one({"session_id": session_id, "user_id": user["_id"]}, {"_id": 0})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.get("payment_status") == "paid":
        return transaction

    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)

    update_data = {"payment_status": status.payment_status, "status": status.status}
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update_data})

    if status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        await db.cart.delete_many({"user_id": user["_id"]})
        order_id = str(uuid.uuid4())
        await db.orders.insert_one({
            "id": order_id,
            "user_id": user["_id"],
            "user_email": user["email"],
            "product_ids": transaction.get("product_ids", []),
            "amount": transaction.get("amount", 0),
            "currency": "usd",
            "session_id": session_id,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        # Send purchase confirmation email
        product_names = []
        for pid in transaction.get("product_ids", []):
            p = await db.products.find_one({"id": pid}, {"_id": 0, "title": 1})
            if p:
                product_names.append(p["title"])
        user_name = user.get("name", user.get("email", ""))
        import asyncio
        asyncio.ensure_future(send_email(
            user["email"], user_name,
            "Konfirmasi Pembelian - Gimu Digital Hub",
            purchase_confirmation_email_html(user_name, order_id, transaction.get("amount", 0), product_names)
        ))

    updated = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    return updated

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        if webhook_response.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": webhook_response.session_id})
            if transaction and transaction.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete"}}
                )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ============ ORDERS ============
@api_router.get("/orders")
async def get_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["_id"]}, {"_id": 0}).to_list(100)
    return orders

# ============ ADMIN ROUTES ============
@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    total_products = await db.products.count_documents({})
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_revenue = 0.0
    orders = await db.orders.find({}, {"_id": 0, "amount": 1}).to_list(1000)
    for o in orders:
        total_revenue += o.get("amount", 0)
    category_counts = {}
    for cat in ["ebook", "video", "template", "quiz"]:
        category_counts[cat] = await db.products.count_documents({"category": cat})
    return {
        "total_products": total_products,
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": round(total_revenue, 2),
        "category_counts": category_counts
    }

@api_router.post("/admin/products")
async def admin_create_product(req: ProductCreateRequest, request: Request):
    await require_admin(request)
    product_id = req.title.lower().replace(" ", "-").replace(".", "")[:50] + "-" + str(uuid.uuid4())[:8]
    product_doc = {
        "id": product_id,
        "title": req.title,
        "description": req.description,
        "price": round(req.price, 2),
        "category": req.category,
        "image_url": req.image_url,
        "features": req.features,
        "rating": 0.0,
        "reviews_count": 0,
        "badge": req.badge,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    created = await db.products.find_one({"id": product_id}, {"_id": 0})
    return created

@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, req: ProductUpdateRequest, request: Request):
    await require_admin(request)
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    update_data = {}
    if req.title is not None:
        update_data["title"] = req.title
    if req.description is not None:
        update_data["description"] = req.description
    if req.price is not None:
        update_data["price"] = round(req.price, 2)
    if req.category is not None:
        update_data["category"] = req.category
    if req.image_url is not None:
        update_data["image_url"] = req.image_url
    if req.features is not None:
        update_data["features"] = req.features
    if req.badge is not None:
        update_data["badge"] = req.badge
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, request: Request):
    await require_admin(request)
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

@api_router.get("/admin/users")
async def admin_get_users(request: Request):
    await require_admin(request)
    users = await db.users.find({}, {"password_hash": 0}).to_list(1000)
    for u in users:
        u["_id"] = str(u["_id"])
    return users

@api_router.put("/admin/users/{user_id}/role")
async def admin_update_user_role(user_id: str, req: UserRoleUpdate, request: Request):
    admin = await require_admin(request)
    if req.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role harus 'user' atau 'admin'")
    if user_id == admin["_id"]:
        raise HTTPException(status_code=400, detail="Tidak bisa mengubah role sendiri")
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": req.role, "updated_at": datetime.now(timezone.utc).isoformat()}})
    updated = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return updated

@api_router.put("/admin/users/{user_id}/ban")
async def admin_ban_user(user_id: str, req: UserBanUpdate, request: Request):
    admin = await require_admin(request)
    if user_id == admin["_id"]:
        raise HTTPException(status_code=400, detail="Tidak bisa ban akun sendiri")
    target = await db.users.find_one({"_id": ObjectId(user_id)})
    if not target:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    if target.get("role") == "admin" and req.banned:
        raise HTTPException(status_code=400, detail="Tidak bisa ban admin lain. Ubah role ke user terlebih dahulu.")
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"banned": req.banned, "updated_at": datetime.now(timezone.utc).isoformat()}})
    updated = await db.users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    updated["_id"] = str(updated["_id"])
    return updated

@api_router.post("/admin/test-email")
async def admin_test_email(request: Request):
    user = await require_admin(request)
    success = await send_email(
        user["email"],
        user.get("name", "Admin"),
        "Test Email - Gimu Digital Hub",
        "<div style='font-family:Arial,sans-serif;padding:24px;'><h2>Test Email Berhasil!</h2><p>Email notifikasi Gimu Digital Hub sudah terkonfigurasi dengan benar.</p></div>"
    )
    if success:
        return {"message": "Test email berhasil dikirim", "sent_to": user["email"]}
    return {"message": "Gagal mengirim email. Periksa konfigurasi Brevo.", "sent_to": user["email"]}

# ============ SEED DATA ============
SEED_PRODUCTS = [
    {
        "id": "ebook-anatomi-klinis",
        "title": "E-Book Anatomi Klinis Lengkap",
        "description": "Panduan komprehensif anatomi klinis untuk dokter umum dan mahasiswa kedokteran. Dilengkapi ilustrasi detail dan studi kasus.",
        "price": 15.00,
        "category": "ebook",
        "image_url": "https://images.unsplash.com/photo-1676313496173-e3b325353087?w=600",
        "features": ["500+ halaman", "Ilustrasi HD", "Studi kasus", "Update berkala"],
        "rating": 4.8,
        "reviews_count": 124,
        "badge": "Best Seller"
    },
    {
        "id": "ebook-farmakologi",
        "title": "E-Book Farmakologi Praktis",
        "description": "Referensi cepat farmakologi untuk praktik sehari-hari. Dosis, interaksi obat, dan efek samping.",
        "price": 12.00,
        "category": "ebook",
        "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600",
        "features": ["Referensi dosis", "Interaksi obat", "Format ringkas", "Offline access"],
        "rating": 4.6,
        "reviews_count": 89,
        "badge": ""
    },
    {
        "id": "video-bedah-minor",
        "title": "Video Kursus Bedah Minor",
        "description": "Kursus video lengkap prosedur bedah minor untuk dokter umum. Dari persiapan hingga follow-up pasien.",
        "price": 25.00,
        "category": "video",
        "image_url": "https://images.unsplash.com/photo-1666886573264-38075cc56104?w=600",
        "features": ["20+ video HD", "Sertifikat", "Forum diskusi", "Akses seumur hidup"],
        "rating": 4.9,
        "reviews_count": 203,
        "badge": "Popular"
    },
    {
        "id": "video-radiologi-dasar",
        "title": "Video Kursus Radiologi Dasar",
        "description": "Pelajari interpretasi foto rontgen, CT scan, dan MRI dari dasar. Cocok untuk dokter umum.",
        "price": 20.00,
        "category": "video",
        "image_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600",
        "features": ["15+ video", "Quiz interaktif", "Studi kasus", "Sertifikat"],
        "rating": 4.7,
        "reviews_count": 156,
        "badge": ""
    },
    {
        "id": "template-rekam-medis",
        "title": "Template Rekam Medis Digital",
        "description": "Koleksi template rekam medis digital yang siap pakai untuk klinik dan praktik mandiri.",
        "price": 10.00,
        "category": "template",
        "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600",
        "features": ["50+ template", "Format editable", "Sesuai standar", "Update gratis"],
        "rating": 4.5,
        "reviews_count": 78,
        "badge": "New"
    },
    {
        "id": "template-informed-consent",
        "title": "Template Informed Consent",
        "description": "Kumpulan template informed consent untuk berbagai prosedur medis dan dental.",
        "price": 8.00,
        "category": "template",
        "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600",
        "features": ["30+ template", "Legal reviewed", "Bilingual", "Customizable"],
        "rating": 4.4,
        "reviews_count": 45,
        "badge": ""
    },
    {
        "id": "quiz-ukmppd",
        "title": "Bank Soal UKMPPD Premium",
        "description": "2000+ soal latihan UKMPPD dengan pembahasan lengkap. Tingkatkan peluang kelulusan Anda.",
        "price": 18.00,
        "category": "quiz",
        "image_url": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600",
        "features": ["2000+ soal", "Pembahasan detail", "Simulasi ujian", "Progress tracking"],
        "rating": 4.8,
        "reviews_count": 312,
        "badge": "Best Seller"
    },
    {
        "id": "ebook-kedokteran-gigi",
        "title": "E-Book Kedokteran Gigi Terpadu",
        "description": "Panduan lengkap kedokteran gigi dari konservasi hingga bedah mulut. Untuk dokter gigi dan calon dokter gigi.",
        "price": 16.00,
        "category": "ebook",
        "image_url": "https://images.unsplash.com/photo-1619691249147-c5689d88016b?w=600",
        "features": ["400+ halaman", "Gambar klinis", "Protokol terbaru", "Case-based"],
        "rating": 4.7,
        "reviews_count": 98,
        "badge": ""
    },
    {
        "id": "video-dental-photography",
        "title": "Video Kursus Dental Photography",
        "description": "Teknik fotografi dental profesional untuk dokumentasi dan presentasi kasus.",
        "price": 22.00,
        "category": "video",
        "image_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600",
        "features": ["12 video", "Setting kamera", "Editing tips", "Portfolio guide"],
        "rating": 4.6,
        "reviews_count": 67,
        "badge": "New"
    },
    {
        "id": "quiz-dental",
        "title": "Bank Soal Kedokteran Gigi",
        "description": "1500+ soal latihan kedokteran gigi dengan pembahasan. Persiapan UKMP2DG terbaik.",
        "price": 15.00,
        "category": "quiz",
        "image_url": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600",
        "features": ["1500+ soal", "Pembahasan lengkap", "Timer ujian", "Leaderboard"],
        "rating": 4.7,
        "reviews_count": 189,
        "badge": "Popular"
    }
]

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@gimudigital.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

async def seed_products():
    count = await db.products.count_documents({})
    if count == 0:
        await db.products.insert_many(SEED_PRODUCTS)
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.products.create_index("category")
    await db.products.create_index("id", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.password_reset_tokens.create_index("token")
    await seed_admin()
    await seed_products()
    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write(f"# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {os.environ.get('ADMIN_EMAIL', 'admin@gimudigital.com')}\n- Password: {os.environ.get('ADMIN_PASSWORD', 'admin123')}\n- Role: admin\n\n")
        f.write(f"## Test User\n- Email: test@example.com\n- Password: test123\n- Role: user\n\n")
        f.write(f"## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n\n")
        f.write(f"## Product Endpoints\n- GET /api/products\n- GET /api/products/{{id}}\n\n")
        f.write(f"## Cart Endpoints\n- GET /api/cart\n- POST /api/cart\n- DELETE /api/cart/{{product_id}}\n- DELETE /api/cart\n\n")
        f.write(f"## Checkout Endpoints\n- POST /api/checkout/create-session\n- GET /api/checkout/status/{{session_id}}\n\n")
        f.write(f"## Profile Endpoints\n- GET /api/profile\n- PUT /api/profile\n- POST /api/profile/change-password\n\n")
        f.write(f"## Password Reset Endpoints\n- POST /api/auth/forgot-password\n- POST /api/auth/reset-password\n")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
