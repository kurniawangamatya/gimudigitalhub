import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLang } from '../context/LangContext';
import { toast } from 'sonner';

const categoryLabels = {
  ebook: 'E-Book',
  video: 'Video Kursus',
  template: 'Template',
  quiz: 'Bank Soal',
};

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t } = useLang();

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(product.id);
      toast.success(t('cart_added'));
    } catch {
      toast.error(t('cart_add_fail'));
    }
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="bg-white border border-[#E5E7E2] rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-[#143D2E] text-white text-[10px] uppercase tracking-wider" data-testid={`badge-${product.id}`}>
            {product.badge}
          </Badge>
        )}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold bg-white/90 backdrop-blur-sm text-[#143D2E] px-2.5 py-1 rounded-full">
            {categoryLabels[product.category] || product.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-heading font-medium text-base text-[#1E2320] mb-1.5 line-clamp-1">{product.title}</h3>
        <p className="text-sm text-[#6C7A70] mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-[#1E2320]">{product.rating}</span>
          <span className="text-xs text-[#6C7A70]">({product.reviews_count})</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-heading font-semibold text-lg text-[#143D2E]">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            className="rounded-full bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-xs px-4"
            onClick={handleAddToCart}
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            {t('products_add_cart')}
          </Button>
        </div>
      </div>
    </div>
  );
}
