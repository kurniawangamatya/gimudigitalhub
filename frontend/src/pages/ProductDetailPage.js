import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';
import { ShoppingCart, Star, Check, ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryLabels = {
  ebook: 'E-Book', video: 'Video Kursus', template: 'Template', quiz: 'Bank Soal',
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API}/products/${id}`);
        setProduct(data);
      } catch {
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await addToCart(product.id);
      toast.success('Ditambahkan ke keranjang!');
    } catch {
      toast.error('Gagal menambahkan ke keranjang');
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]">
      <div className="max-w-5xl mx-auto px-6 md:px-8 animate-pulse">
        <div className="h-6 bg-[#F0F2ED] rounded w-24 mb-8" />
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-[#F0F2ED] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-[#F0F2ED] rounded w-3/4" />
            <div className="h-4 bg-[#F0F2ED] rounded w-full" />
            <div className="h-4 bg-[#F0F2ED] rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="product-detail-page">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <button
          className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-8"
          onClick={() => navigate('/products')}
          data-testid="back-to-products"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Kembali ke Katalog
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full aspect-[4/3] object-cover"
            />
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-[#143D2E] text-white text-[10px] uppercase tracking-wider">
                {product.badge}
              </Badge>
            )}
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.15em] font-bold text-[#8FA998]">
              {categoryLabels[product.category] || product.category}
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl tracking-tight font-medium text-[#1E2320] mt-2 mb-3" data-testid="product-title">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-[#E5E7E2]'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-[#1E2320]">{product.rating}</span>
              <span className="text-sm text-[#6C7A70]">({product.reviews_count} ulasan)</span>
            </div>

            <p className="text-base text-[#6C7A70] leading-relaxed mb-6">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading font-medium text-sm text-[#1E2320] mb-3">Termasuk:</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#6C7A70]">
                      <Check className="w-4 h-4 text-[#143D2E]" strokeWidth={2} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-end gap-4 mb-6">
              <span className="font-heading font-semibold text-3xl text-[#143D2E]" data-testid="product-price">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <Button
              className="w-full rounded-full py-3 text-sm font-semibold bg-[#143D2E] hover:bg-[#143D2E]/90 text-white"
              onClick={handleAddToCart}
              data-testid="add-to-cart-detail"
            >
              <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Tambah ke Keranjang
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
