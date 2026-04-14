import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, BookOpen, Video, FileText, HelpCircle, LayoutGrid } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryFilters = [
  { key: 'all', label: 'Semua', icon: LayoutGrid },
  { key: 'ebook', label: 'E-Book', icon: BookOpen },
  { key: 'video', label: 'Video', icon: Video },
  { key: 'template', label: 'Template', icon: FileText },
  { key: 'quiz', label: 'Bank Soal', icon: HelpCircle },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (search) params.search = search;
        const { data } = await axios.get(`${API}/products`, { params });
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, search]);

  const setCategory = (cat) => {
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl tracking-tight font-medium text-[#1E2320] mb-2" data-testid="products-title">
            Katalog Produk
          </h1>
          <p className="text-base text-[#6C7A70]">Temukan produk digital terbaik untuk pengembangan profesional Anda</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {categoryFilters.map((cat) => (
              <Button
                key={cat.key}
                variant={activeCategory === cat.key ? 'default' : 'outline'}
                className={`rounded-full text-xs px-4 ${
                  activeCategory === cat.key
                    ? 'bg-[#143D2E] text-white hover:bg-[#143D2E]/90'
                    : 'border-[#E5E7E2] text-[#6C7A70] hover:text-[#143D2E] hover:border-[#143D2E]/30'
                }`}
                onClick={() => setCategory(cat.key)}
                data-testid={`filter-${cat.key}`}
              >
                <cat.icon className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                {cat.label}
              </Button>
            ))}
          </div>
          <div className="relative md:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C7A70]" strokeWidth={1.5} />
            <Input
              placeholder="Cari produk..."
              className="pl-9 w-full md:w-64 rounded-full border-[#E5E7E2] bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E5E7E2] animate-pulse">
                <div className="h-48 bg-[#F0F2ED] rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-[#F0F2ED] rounded w-3/4" />
                  <div className="h-3 bg-[#F0F2ED] rounded w-full" />
                  <div className="h-3 bg-[#F0F2ED] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="text-lg text-[#6C7A70]">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
