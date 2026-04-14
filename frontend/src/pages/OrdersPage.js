import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, ArrowLeft, ExternalLink } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OrdersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${API}/orders`, { withCredentials: true });
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="orders-page">
      <div className="max-w-4xl mx-auto px-6 md:px-8">
        <button
          className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-8"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Kembali
        </button>

        <h1 className="font-heading text-3xl tracking-tight font-medium text-[#1E2320] mb-8" data-testid="orders-title">
          Pesanan Saya
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E5E7E2] animate-pulse">
                <div className="h-4 bg-[#F0F2ED] rounded w-1/3 mb-3" />
                <div className="h-3 bg-[#F0F2ED] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E5E7E2]" data-testid="no-orders">
            <Package className="w-12 h-12 text-[#E5E7E2] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg text-[#6C7A70] mb-4">Belum ada pesanan</p>
            <Button
              className="rounded-full px-6 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white"
              onClick={() => navigate('/products')}
            >
              Jelajahi Produk
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-6 border border-[#E5E7E2]"
                data-testid={`order-${order.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-[#6C7A70]">Order #{order.id?.slice(0, 8)}</p>
                    <p className="font-heading font-semibold text-lg text-[#143D2E] mt-1">${order.amount?.toFixed(2)}</p>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200" data-testid={`order-status-${order.id}`}>
                    {order.status === 'completed' ? 'Selesai' : order.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#6C7A70]">
                  {order.product_ids?.length || 0} produk &bull; {order.created_at ? new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
