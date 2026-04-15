# Test Credentials

## Admin
- Email: admin@gimudigital.com
- Password: admin123
- Role: admin

## Test User
- Email: test@example.com
- Password: test123
- Role: user

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/refresh

## Product Endpoints
- GET /api/products
- GET /api/products/{id}

## Cart Endpoints
- GET /api/cart
- POST /api/cart
- DELETE /api/cart/{product_id}
- DELETE /api/cart

## Checkout Endpoints
- POST /api/checkout/create-session
- GET /api/checkout/status/{session_id}

## Profile Endpoints
- GET /api/profile
- PUT /api/profile
- POST /api/profile/change-password

## Password Reset Endpoints
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
