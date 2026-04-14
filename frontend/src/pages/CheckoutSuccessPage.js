import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('checking');
  const sessionId = searchParams.get('session_id');

  const pollStatus = useCallback(async (attempts = 0) => {
    if (!sessionId || attempts >= 5) {
      if (attempts >= 5) setStatus('timeout');
      return;
    }
    try {
      const { data } = await axios.get(`${API}/checkout/status/${sessionId}`, { withCredentials: true });
      if (data.payment_status === 'paid') {
        setStatus('success');
        clearCart();
        return;
      } else if (data.status === 'expired') {
        setStatus('expired');
        return;
      }
      setTimeout(() => pollStatus(attempts + 1), 2000);
    } catch {
      setStatus('error');
    }
  }, [sessionId, clearCart]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (sessionId) pollStatus();
    else navigate('/');
  }, [user, sessionId, navigate, pollStatus]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9] flex items-center justify-center" data-testid="checkout-success-page">
      <div className="max-w-md mx-auto px-6 text-center">
        {status === 'checking' && (
          <div>
            <Loader2 className="w-12 h-12 text-[#143D2E] mx-auto mb-4 animate-spin" />
            <h1 className="font-heading text-2xl font-medium text-[#1E2320] mb-2">Memverifikasi Pembayaran...</h1>
            <p className="text-sm text-[#6C7A70]">Mohon tunggu sebentar</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="font-heading text-2xl font-medium text-[#1E2320] mb-2" data-testid="payment-success">Pembayaran Berhasil!</h1>
            <p className="text-sm text-[#6C7A70] mb-6">Terima kasih atas pembelian Anda. Produk digital sudah dapat diakses.</p>
            <div className="flex flex-col gap-3">
              <Button className="rounded-full bg-[#143D2E] hover:bg-[#143D2E]/90 text-white" onClick={() => navigate('/orders')} data-testid="view-orders-btn">
                Lihat Pesanan Saya
              </Button>
              <Link to="/products" className="text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors">
                Kembali ke Katalog
              </Link>
            </div>
          </div>
        )}
        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <div>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" strokeWidth={1.5} />
            <h1 className="font-heading text-2xl font-medium text-[#1E2320] mb-2" data-testid="payment-failed">
              {status === 'expired' ? 'Sesi Pembayaran Kadaluarsa' : 'Terjadi Kesalahan'}
            </h1>
            <p className="text-sm text-[#6C7A70] mb-6">
              {status === 'expired' ? 'Silakan coba lagi.' : 'Gagal memverifikasi pembayaran. Silakan cek email Anda untuk konfirmasi.'}
            </p>
            <Button className="rounded-full bg-[#143D2E] hover:bg-[#143D2E]/90 text-white" onClick={() => navigate('/cart')}>
              Kembali ke Keranjang
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
