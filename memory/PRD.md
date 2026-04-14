# Gimu Digital Hub - PRD

## Problem Statement
Landing page dan platform e-commerce untuk produk digital kedokteran dan kedokteran gigi. Target pasar: dokter umum, dokter gigi, dan masyarakat umum.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI (Port 3000)
- **Backend**: FastAPI + Motor (MongoDB async) (Port 8001)
- **Database**: MongoDB
- **Payment**: Stripe via emergentintegrations
- **Auth**: JWT (httpOnly cookies) + bcrypt

## User Personas
1. **Dokter Umum** - Membutuhkan e-book, video kursus, template rekam medis
2. **Dokter Gigi** - Membutuhkan materi kedokteran gigi, dental photography, template
3. **Mahasiswa Kedokteran** - Membutuhkan bank soal UKMPPD/UKMP2DG
4. **Masyarakat Umum** - Edukasi kesehatan dasar

## Core Requirements
- Landing page informatif (hero, stats, categories, features, testimonials, CTA)
- Katalog produk dengan filter kategori dan pencarian
- Detail produk dengan fitur add-to-cart
- Sistem keranjang belanja
- Checkout via Stripe
- Autentikasi (register, login, logout)
- Halaman pesanan

## What's Been Implemented (Apr 14, 2026)
- Full landing page with hero, stats, 4 categories, features, testimonials (marquee), CTA
- Product catalog with category filters (e-book, video, template, quiz) and search
- Product detail pages
- JWT authentication (register, login, logout, refresh)
- Shopping cart (add, remove, clear)
- Stripe checkout integration
- Payment status polling
- Orders page
- 10 seed products (medical & dental)
- Admin user seeding
- Responsive design with Outfit/Manrope fonts
- Organic & Earthy theme (#143D2E primary)
- User profile page (name, phone, specialization, institution)
- Change password from profile page
- Forgot password flow (request reset token)
- Reset password flow (set new password via token)
- Admin dashboard with stats overview (products, users, orders, revenue)
- Admin CRUD: create, edit, delete products with form dialog
- Admin product table with category filters and search
- Admin-only route protection (role-based access)
- Email notifikasi via Brevo: welcome email, reset password email, konfirmasi pembelian
- Admin test email button di dashboard
- Manajemen user admin: tabel pengguna, ubah role (user/admin), ban/unban user
- Banned user tidak bisa login (403)
- Tab Produk dan Pengguna di admin dashboard

## Test Results
- Backend: 100% (13/13 tests passing)
- Frontend: 95% (all pages load, all flows work)

## Prioritized Backlog
### P0 (Critical)
- None remaining

### P1 (Important)
- Product search debouncing
- Order history with product details
- User profile page
- Password reset flow

### P2 (Nice to have)
- Admin dashboard for product management
- Product reviews and ratings
- Wishlist functionality
- Email notifications on purchase
- Multi-language support (ID/EN)
- Social sharing

## Next Tasks
1. Add admin panel for product CRUD
2. Implement product reviews
3. Add user profile/settings page
4. Implement password reset flow
5. Add email notifications
