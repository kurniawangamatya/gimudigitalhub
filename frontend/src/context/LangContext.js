import React, { createContext, useContext, useState, useCallback } from 'react';

const LangContext = createContext(null);

const translations = {
  id: {
    // Navbar
    nav_home: 'Beranda',
    nav_products: 'Produk',
    nav_categories: 'Kategori',
    nav_testimonials: 'Testimoni',
    nav_login: 'Masuk',
    nav_register: 'Daftar',
    nav_cart: 'Keranjang',
    nav_profile: 'Profil Saya',
    nav_orders: 'Pesanan Saya',
    nav_admin: 'Admin Dashboard',
    nav_logout: 'Keluar',

    // Hero
    hero_badge: 'Platform Edukasi Medis #1',
    hero_title_1: 'Tingkatkan Kompetensi',
    hero_title_2: 'Medis Anda',
    hero_desc: 'Akses ribuan produk digital berkualitas untuk dokter umum, dokter gigi, dan mahasiswa kedokteran. Dari e-book hingga bank soal.',
    hero_cta: 'Jelajahi Produk',
    hero_register: 'Daftar Gratis',

    // Stats
    stat_users: 'Pengguna Aktif',
    stat_products: 'Produk Digital',
    stat_satisfaction: 'Tingkat Kepuasan',
    stat_access: 'Akses Seumur Hidup',

    // Categories
    cat_title: 'Temukan Produk yang Anda Butuhkan',
    cat_label: 'Kategori',
    cat_ebook: 'E-Book Medis',
    cat_ebook_desc: 'Buku digital lengkap untuk dokter umum dan dokter gigi',
    cat_video: 'Video Kursus',
    cat_video_desc: 'Kursus video HD dengan sertifikat dan akses seumur hidup',
    cat_template: 'Template Dokumen',
    cat_template_desc: 'Template rekam medis, informed consent, dan dokumen klinis',
    cat_quiz: 'Bank Soal',
    cat_quiz_desc: 'Soal latihan UKMPPD & UKMP2DG dengan pembahasan lengkap',
    cat_count_ebook: '50+ judul',
    cat_count_video: '30+ kursus',
    cat_count_template: '80+ template',
    cat_count_quiz: '3000+ soal',
    cat_view_all: 'Lihat semua',

    // Features
    feat_label: 'Mengapa Kami',
    feat_title: 'Platform Terpercaya untuk Profesional Medis',
    feat_1_title: 'Konten Berkualitas',
    feat_1_desc: 'Dibuat oleh praktisi dan akademisi berpengalaman di bidangnya.',
    feat_2_title: 'Update Berkala',
    feat_2_desc: 'Materi selalu diperbarui sesuai perkembangan ilmu kedokteran terbaru.',
    feat_3_title: 'Akses Seumur Hidup',
    feat_3_desc: 'Beli sekali, akses selamanya. Termasuk semua update konten.',
    feat_4_title: 'Sertifikat Resmi',
    feat_4_desc: 'Dapatkan sertifikat untuk setiap kursus video yang diselesaikan.',
    feat_rating: 'Rating pengguna',

    // Testimonials
    testi_label: 'Testimoni',
    testi_title: 'Dipercaya oleh Ribuan Profesional Medis',

    // CTA
    cta_title: 'Mulai Tingkatkan Kompetensi Anda Hari Ini',
    cta_desc: 'Bergabung dengan ribuan dokter dan tenaga medis yang telah mempercayakan pengembangan profesional mereka kepada Gimu Digital Hub.',
    cta_explore: 'Jelajahi Produk',
    cta_register: 'Daftar Sekarang',

    // Products page
    products_title: 'Katalog Produk',
    products_desc: 'Temukan produk digital terbaik untuk pengembangan profesional Anda',
    products_all: 'Semua',
    products_search: 'Cari produk...',
    products_none: 'Tidak ada produk ditemukan',
    products_add_cart: 'Tambah',

    // Product detail
    detail_back: 'Kembali ke Katalog',
    detail_includes: 'Termasuk:',
    detail_add_cart: 'Tambah ke Keranjang',
    detail_reviews: 'ulasan',

    // Category labels
    cat_label_ebook: 'E-Book',
    cat_label_video: 'Video Kursus',
    cat_label_template: 'Template',
    cat_label_quiz: 'Bank Soal',

    // Cart
    cart_title: 'Keranjang Anda',
    cart_back: 'Lanjut Belanja',
    cart_empty: 'Keranjang Anda kosong',
    cart_explore: 'Jelajahi Produk',
    cart_summary: 'Ringkasan Pesanan',
    cart_subtotal: 'Subtotal',
    cart_total: 'Total',
    cart_checkout: 'Checkout',
    cart_removed: 'Dihapus dari keranjang',
    cart_added: 'Ditambahkan ke keranjang!',
    cart_add_fail: 'Gagal menambahkan ke keranjang',
    cart_remove_fail: 'Gagal menghapus item',
    cart_checkout_fail: 'Gagal memulai checkout',

    // Checkout
    checkout_verifying: 'Memverifikasi Pembayaran...',
    checkout_wait: 'Mohon tunggu sebentar',
    checkout_success: 'Pembayaran Berhasil!',
    checkout_success_desc: 'Terima kasih atas pembelian Anda. Produk digital sudah dapat diakses.',
    checkout_view_orders: 'Lihat Pesanan Saya',
    checkout_back_catalog: 'Kembali ke Katalog',
    checkout_expired: 'Sesi Pembayaran Kadaluarsa',
    checkout_error: 'Terjadi Kesalahan',
    checkout_expired_desc: 'Silakan coba lagi.',
    checkout_error_desc: 'Gagal memverifikasi pembayaran. Silakan cek email Anda untuk konfirmasi.',
    checkout_back_cart: 'Kembali ke Keranjang',

    // Auth
    auth_welcome_back: 'Selamat Datang Kembali',
    auth_login_desc: 'Masuk ke akun Anda',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_login_btn: 'Masuk',
    auth_logging_in: 'Masuk...',
    auth_no_account: 'Belum punya akun?',
    auth_register_now: 'Daftar sekarang',
    auth_forgot: 'Lupa password?',
    auth_create_account: 'Buat Akun Baru',
    auth_register_desc: 'Mulai akses produk digital medis terbaik',
    auth_name: 'Nama Lengkap',
    auth_register_btn: 'Daftar',
    auth_registering: 'Mendaftar...',
    auth_has_account: 'Sudah punya akun?',
    auth_login_here: 'Masuk di sini',
    auth_pass_min: 'Password minimal 6 karakter',

    // Forgot/Reset password
    forgot_title: 'Lupa Password',
    forgot_desc: 'Masukkan email Anda untuk mereset password',
    forgot_submit: 'Kirim Link Reset',
    forgot_sending: 'Mengirim...',
    forgot_sent_title: 'Email Terkirim',
    forgot_sent_desc: 'Jika email terdaftar, link reset password telah dikirim. Periksa inbox Anda.',
    forgot_reset_link: 'Klik di sini untuk reset password',
    forgot_back: 'Kembali ke halaman login',
    forgot_back_login: 'Kembali ke Login',
    reset_title: 'Reset Password',
    reset_desc: 'Buat password baru untuk akun Anda',
    reset_new_pass: 'Password Baru',
    reset_confirm: 'Konfirmasi Password Baru',
    reset_submit: 'Reset Password',
    reset_saving: 'Menyimpan...',
    reset_success_title: 'Password Berhasil Direset',
    reset_success_desc: 'Anda sekarang bisa login dengan password baru.',
    reset_login_now: 'Masuk Sekarang',
    reset_confirm_mismatch: 'Konfirmasi password tidak cocok',
    reset_invalid_token: 'Token tidak valid',

    // Profile
    profile_title: 'Profil Saya',
    profile_desc: 'Kelola informasi profil dan keamanan akun Anda',
    profile_name: 'Nama Lengkap',
    profile_phone: 'Nomor Telepon',
    profile_spec: 'Spesialisasi',
    profile_institution: 'Institusi',
    profile_save: 'Simpan Perubahan',
    profile_saving: 'Menyimpan...',
    profile_change_pass: 'Ubah Password',
    profile_current_pass: 'Password Saat Ini',
    profile_new_pass: 'Password Baru',
    profile_confirm_pass: 'Konfirmasi Password',
    profile_change_btn: 'Ubah Password',
    profile_changing: 'Mengubah...',
    profile_joined: 'Bergabung',
    profile_back: 'Kembali',

    // Orders
    orders_title: 'Pesanan Saya',
    orders_empty: 'Belum ada pesanan',
    orders_explore: 'Jelajahi Produk',
    orders_complete: 'Selesai',
    orders_products: 'produk',
    orders_back: 'Kembali',

    // Footer
    footer_desc: 'Platform digital terpercaya untuk produk edukasi kedokteran dan kedokteran gigi.',
    footer_products: 'Produk',
    footer_info: 'Informasi',
    footer_about: 'Tentang Kami',
    footer_faq: 'FAQ',
    footer_contact: 'Kontak',
    footer_rights: 'All rights reserved.',

    // Misc
    back: 'Kembali',
    qty: 'Qty',
    generic_error: 'Terjadi kesalahan. Silakan coba lagi.',
  },

  en: {
    nav_home: 'Home',
    nav_products: 'Products',
    nav_categories: 'Categories',
    nav_testimonials: 'Testimonials',
    nav_login: 'Sign In',
    nav_register: 'Sign Up',
    nav_cart: 'Cart',
    nav_profile: 'My Profile',
    nav_orders: 'My Orders',
    nav_admin: 'Admin Dashboard',
    nav_logout: 'Log Out',

    hero_badge: '#1 Medical Education Platform',
    hero_title_1: 'Enhance Your Medical',
    hero_title_2: 'Competence',
    hero_desc: 'Access thousands of quality digital products for general practitioners, dentists, and medical students. From e-books to exam prep.',
    hero_cta: 'Explore Products',
    hero_register: 'Sign Up Free',

    stat_users: 'Active Users',
    stat_products: 'Digital Products',
    stat_satisfaction: 'Satisfaction Rate',
    stat_access: 'Lifetime Access',

    cat_title: 'Find the Products You Need',
    cat_label: 'Categories',
    cat_ebook: 'Medical E-Books',
    cat_ebook_desc: 'Comprehensive digital books for doctors and dentists',
    cat_video: 'Video Courses',
    cat_video_desc: 'HD video courses with certificates and lifetime access',
    cat_template: 'Document Templates',
    cat_template_desc: 'Medical records, informed consent, and clinical document templates',
    cat_quiz: 'Question Bank',
    cat_quiz_desc: 'Practice questions with detailed explanations for medical exams',
    cat_count_ebook: '50+ titles',
    cat_count_video: '30+ courses',
    cat_count_template: '80+ templates',
    cat_count_quiz: '3000+ questions',
    cat_view_all: 'View all',

    feat_label: 'Why Us',
    feat_title: 'Trusted Platform for Medical Professionals',
    feat_1_title: 'Quality Content',
    feat_1_desc: 'Created by experienced practitioners and academics in their fields.',
    feat_2_title: 'Regular Updates',
    feat_2_desc: 'Materials are always updated according to the latest medical developments.',
    feat_3_title: 'Lifetime Access',
    feat_3_desc: 'Buy once, access forever. Including all content updates.',
    feat_4_title: 'Official Certificates',
    feat_4_desc: 'Get certificates for every completed video course.',
    feat_rating: 'User rating',

    testi_label: 'Testimonials',
    testi_title: 'Trusted by Thousands of Medical Professionals',

    cta_title: 'Start Enhancing Your Competence Today',
    cta_desc: 'Join thousands of doctors and medical professionals who have entrusted their professional development to Gimu Digital Hub.',
    cta_explore: 'Explore Products',
    cta_register: 'Sign Up Now',

    products_title: 'Product Catalog',
    products_desc: 'Find the best digital products for your professional development',
    products_all: 'All',
    products_search: 'Search products...',
    products_none: 'No products found',
    products_add_cart: 'Add',

    detail_back: 'Back to Catalog',
    detail_includes: 'Includes:',
    detail_add_cart: 'Add to Cart',
    detail_reviews: 'reviews',

    cat_label_ebook: 'E-Book',
    cat_label_video: 'Video Course',
    cat_label_template: 'Template',
    cat_label_quiz: 'Question Bank',

    cart_title: 'Your Cart',
    cart_back: 'Continue Shopping',
    cart_empty: 'Your cart is empty',
    cart_explore: 'Explore Products',
    cart_summary: 'Order Summary',
    cart_subtotal: 'Subtotal',
    cart_total: 'Total',
    cart_checkout: 'Checkout',
    cart_removed: 'Removed from cart',
    cart_added: 'Added to cart!',
    cart_add_fail: 'Failed to add to cart',
    cart_remove_fail: 'Failed to remove item',
    cart_checkout_fail: 'Failed to start checkout',

    checkout_verifying: 'Verifying Payment...',
    checkout_wait: 'Please wait a moment',
    checkout_success: 'Payment Successful!',
    checkout_success_desc: 'Thank you for your purchase. Your digital products are now accessible.',
    checkout_view_orders: 'View My Orders',
    checkout_back_catalog: 'Back to Catalog',
    checkout_expired: 'Payment Session Expired',
    checkout_error: 'An Error Occurred',
    checkout_expired_desc: 'Please try again.',
    checkout_error_desc: 'Failed to verify payment. Please check your email for confirmation.',
    checkout_back_cart: 'Back to Cart',

    auth_welcome_back: 'Welcome Back',
    auth_login_desc: 'Sign in to your account',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_login_btn: 'Sign In',
    auth_logging_in: 'Signing in...',
    auth_no_account: "Don't have an account?",
    auth_register_now: 'Sign up now',
    auth_forgot: 'Forgot password?',
    auth_create_account: 'Create New Account',
    auth_register_desc: 'Start accessing the best medical digital products',
    auth_name: 'Full Name',
    auth_register_btn: 'Sign Up',
    auth_registering: 'Signing up...',
    auth_has_account: 'Already have an account?',
    auth_login_here: 'Sign in here',
    auth_pass_min: 'Password must be at least 6 characters',

    forgot_title: 'Forgot Password',
    forgot_desc: 'Enter your email to reset your password',
    forgot_submit: 'Send Reset Link',
    forgot_sending: 'Sending...',
    forgot_sent_title: 'Email Sent',
    forgot_sent_desc: 'If the email is registered, a password reset link has been sent. Check your inbox.',
    forgot_reset_link: 'Click here to reset password',
    forgot_back: 'Back to login page',
    forgot_back_login: 'Back to Login',
    reset_title: 'Reset Password',
    reset_desc: 'Create a new password for your account',
    reset_new_pass: 'New Password',
    reset_confirm: 'Confirm New Password',
    reset_submit: 'Reset Password',
    reset_saving: 'Saving...',
    reset_success_title: 'Password Reset Successful',
    reset_success_desc: 'You can now login with your new password.',
    reset_login_now: 'Sign In Now',
    reset_confirm_mismatch: 'Password confirmation does not match',
    reset_invalid_token: 'Invalid token',

    profile_title: 'My Profile',
    profile_desc: 'Manage your profile information and account security',
    profile_name: 'Full Name',
    profile_phone: 'Phone Number',
    profile_spec: 'Specialization',
    profile_institution: 'Institution',
    profile_save: 'Save Changes',
    profile_saving: 'Saving...',
    profile_change_pass: 'Change Password',
    profile_current_pass: 'Current Password',
    profile_new_pass: 'New Password',
    profile_confirm_pass: 'Confirm Password',
    profile_change_btn: 'Change Password',
    profile_changing: 'Changing...',
    profile_joined: 'Joined',
    profile_back: 'Back',

    orders_title: 'My Orders',
    orders_empty: 'No orders yet',
    orders_explore: 'Explore Products',
    orders_complete: 'Completed',
    orders_products: 'products',
    orders_back: 'Back',

    footer_desc: 'Trusted digital platform for medical and dental education products.',
    footer_products: 'Products',
    footer_info: 'Information',
    footer_about: 'About Us',
    footer_faq: 'FAQ',
    footer_contact: 'Contact',
    footer_rights: 'All rights reserved.',

    back: 'Back',
    qty: 'Qty',
    generic_error: 'Something went wrong. Please try again.',
  },
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('gimu_lang') || 'id'; } catch { return 'id'; }
  });

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'id' ? 'en' : 'id';
      try { localStorage.setItem('gimu_lang', next); } catch {}
      return next;
    });
  }, []);

  const setLanguage = useCallback((l) => {
    setLang(l);
    try { localStorage.setItem('gimu_lang', l); } catch {}
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['id']?.[key] || key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
