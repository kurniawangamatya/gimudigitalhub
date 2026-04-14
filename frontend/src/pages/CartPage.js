import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, fetchCart, removeFromCart, cartLoading } = useCart();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const handleCheckout = async () => {
    try {
      const originUrl = window.location.origin;
      const { data } = await axios.post(`${API}/checkout/create-session`, { origin_url: originUrl }, { withCredentials: true });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Gagal memulai checkout');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Dihapus dari keranjang');
    } catch {
      toast.error('Gagal menghapus item');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="cart-page">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <button
          className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-8"
          onClick={() => navigate('/products')}
          data-testid="back-to-products-cart"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Lanjut Belanja
        </button>

        <h1 className="font-heading text-3xl tracking-tight font-medium text-[#1E2320] mb-8" data-testid="cart-title">
          Keranjang Anda
        </h1>

        {cartLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5E7E2] animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-[#F0F2ED] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#F0F2ED] rounded w-1/2" />
                    <div className="h-3 bg-[#F0F2ED] rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7E2]" data-testid="empty-cart">
            <ShoppingCart className="w-12 h-12 text-[#E5E7E2] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg text-[#6C7A70] mb-4">Keranjang Anda kosong</p>
            <Button
              className="rounded-full px-6 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white"
              onClick={() => navigate('/products')}
            >
              Jelajahi Produk
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-white rounded-2xl p-5 border border-[#E5E7E2] flex gap-4"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <img
                    src={item.product?.image_url}
                    alt={item.product?.title}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-medium text-sm text-[#1E2320] line-clamp-1">{item.product?.title}</h3>
                    <p className="text-xs text-[#6C7A70] mt-0.5">Qty: {item.quantity}</p>
                    <p className="font-heading font-semibold text-base text-[#143D2E] mt-2">
                      ${(item.product?.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button
                    className="text-[#6C7A70] hover:text-red-500 transition-colors self-start"
                    onClick={() => handleRemove(item.product_id)}
                    data-testid={`remove-item-${item.product_id}`}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-[#E5E7E2] sticky top-24">
                <h3 className="font-heading font-medium text-base text-[#1E2320] mb-4">Ringkasan Pesanan</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6C7A70]">Subtotal</span>
                    <span className="text-[#1E2320] font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#E5E7E2] pt-3 flex justify-between">
                    <span className="font-heading font-medium text-[#1E2320]">Total</span>
                    <span className="font-heading font-semibold text-lg text-[#143D2E]" data-testid="cart-total">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full rounded-full py-3 text-sm font-semibold bg-[#143D2E] hover:bg-[#143D2E]/90 text-white"
                  onClick={handleCheckout}
                  data-testid="checkout-button"
                >
                  Checkout <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
