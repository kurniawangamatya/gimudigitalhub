import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ShoppingCart, User, Menu, X, BookOpen, LogOut, Package, UserCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-white/70 border-b border-[#E5E7E2] shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="brand-logo">
          <div className="w-9 h-9 rounded-xl bg-[#143D2E] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <span className="font-heading font-semibold text-lg text-[#1E2320] tracking-tight">
            Gimu Digital Hub
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-[#6C7A70] hover:text-[#143D2E] transition-colors" data-testid="nav-home">Beranda</Link>
          <Link to="/products" className="text-sm font-medium text-[#6C7A70] hover:text-[#143D2E] transition-colors" data-testid="nav-products">Produk</Link>
          <a href="/#categories" className="text-sm font-medium text-[#6C7A70] hover:text-[#143D2E] transition-colors" data-testid="nav-categories">Kategori</a>
          <a href="/#testimonials" className="text-sm font-medium text-[#6C7A70] hover:text-[#143D2E] transition-colors" data-testid="nav-testimonials">Testimoni</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/cart" className="relative" data-testid="cart-button">
                <Button variant="ghost" size="icon" className="text-[#143D2E]">
                  <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
                </Button>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-[#143D2E] text-white" data-testid="cart-count">
                    {cartCount}
                  </Badge>
                )}
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#143D2E]" data-testid="user-menu-trigger">
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="profile-link">
                    <UserCircle className="w-4 h-4 mr-2" /> Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')} data-testid="orders-link">
                    <Package className="w-4 h-4 mr-2" /> Pesanan Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-button">
                    <LogOut className="w-4 h-4 mr-2" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-sm text-[#143D2E]" onClick={() => navigate('/login')} data-testid="login-button">
                Masuk
              </Button>
              <Button className="text-sm rounded-full px-6 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white" onClick={() => navigate('/register')} data-testid="register-button">
                Daftar
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-[#143D2E]"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-[#E5E7E2] px-6 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-[#1E2320]" onClick={() => setMobileOpen(false)}>Beranda</Link>
          <Link to="/products" className="block text-sm font-medium text-[#1E2320]" onClick={() => setMobileOpen(false)}>Produk</Link>
          {user ? (
            <>
              <Link to="/cart" className="block text-sm font-medium text-[#1E2320]" onClick={() => setMobileOpen(false)}>Keranjang ({cartCount})</Link>
              <Link to="/profile" className="block text-sm font-medium text-[#1E2320]" onClick={() => setMobileOpen(false)}>Profil Saya</Link>
              <Link to="/orders" className="block text-sm font-medium text-[#1E2320]" onClick={() => setMobileOpen(false)}>Pesanan Saya</Link>
              <button className="text-sm font-medium text-red-600" onClick={() => { handleLogout(); setMobileOpen(false); }}>Keluar</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 text-sm" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Masuk</Button>
              <Button className="flex-1 text-sm bg-[#143D2E] text-white" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Daftar</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
