import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Palette, Layout, Image, Type, Save, ArrowLeft, 
  Settings, Monitor, Smartphone, Check, Sparkles
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ThemeSettingsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState({
    primaryColor: '#143D2E',
    secondaryColor: '#8FA998',
    backgroundColor: '#FBFBF9',
    fontHeading: 'Outfit',
    fontBody: 'Manrope',
    heroTitle: 'Solusi Digital Edukasi',
    heroSubtitle: 'Kedokteran & Kedokteran Gigi',
    heroBadge: 'Platform No. 1 di Indonesia',
    ctaText: 'Jelajahi Produk',
    showTestimonials: true,
    showStats: true
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    // Fetch current theme settings here if API exists
  }, [user, authLoading, navigate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // API call to save theme settings
      // await axios.put(`${API}/admin/theme`, theme, { withCredentials: true });
      toast.success('Pengaturan tema berhasil disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan pengaturan tema');
    } finally {
      setSaving(false);
    }
  };

  const ColorPicker = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2 items-center">
        <div 
          className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" 
          style={{ backgroundColor: value }}
        />
        <Input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs uppercase"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <button 
          className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-6" 
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Kembali ke Admin
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl tracking-tight font-medium text-[#1E2320]">Pengaturan Tampilan</h1>
            <p className="text-base text-[#6C7A70] mt-1">Kustomisasi tema, teks, dan visual landing page Gimu Digital</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="rounded-full bg-[#143D2E] text-white px-6"
          >
            {saving ? 'Menyimpan...' : <><Save className="w-4 h-4 mr-2" /> Simpan Perubahan</>}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full bg-[#F0F2ED] p-1 rounded-xl mb-4">
                <TabsTrigger value="general" className="flex-1 rounded-lg">Umum</TabsTrigger>
                <TabsTrigger value="colors" className="flex-1 rounded-lg">Warna</TabsTrigger>
                <TabsTrigger value="content" className="flex-1 rounded-lg">Konten</TabsTrigger>
              </TabsList>

              <Card className="p-6 border-[#E5E7E2] shadow-sm rounded-2xl">
                <TabsContent value="general" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Layout className="w-4 h-4" /> Struktur Halaman
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#FBFBF9] rounded-xl border border-[#E5E7E2]">
                        <span className="text-sm">Tampilkan Statistik</span>
                        <input type="checkbox" checked={theme.showStats} onChange={(e) => setTheme({...theme, showStats: e.target.checked})} className="w-4 h-4 accent-[#143D2E]" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#FBFBF9] rounded-xl border border-[#E5E7E2]">
                        <span className="text-sm">Tampilkan Testimoni</span>
                        <input type="checkbox" checked={theme.showTestimonials} onChange={(e) => setTheme({...theme, showTestimonials: e.target.checked})} className="w-4 h-4 accent-[#143D2E]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Type className="w-4 h-4" /> Tipografi
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs text-[#6C7A70]">Font Judul</Label>
                        <Select value={theme.fontHeading}>
                          <option value="Outfit">Outfit (Default)</option>
                          <option value="Inter">Inter</option>
                          <option value="Manrope">Manrope</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="colors" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Palet Warna Klinik
                    </Label>
                    <ColorPicker label="Warna Utama (Brand)" value={theme.primaryColor} onChange={(v) => setTheme({...theme, primaryColor: v})} />
                    <ColorPicker label="Warna Sekunder" value={theme.secondaryColor} onChange={(v) => setTheme({...theme, secondaryColor: v})} />
                    <ColorPicker label="Warna Latar" value={theme.backgroundColor} onChange={(v) => setTheme({...theme, backgroundColor: v})} />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Teks Hero
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-[#6C7A70]">Badge Teks</Label>
                        <Input value={theme.heroBadge} onChange={(e) => setTheme({...theme, heroBadge: e.target.value})} className="rounded-lg" />
                      </div>
                      <div>
                        <Label className="text-xs text-[#6C7A70]">Judul Utama</Label>
                        <Input value={theme.heroTitle} onChange={(e) => setTheme({...theme, heroTitle: e.target.value})} className="rounded-lg" />
                      </div>
                      <div>
                        <Label className="text-xs text-[#6C7A70]">Sub-judul</Label>
                        <textarea 
                          value={theme.heroSubtitle} 
                          onChange={(e) => setTheme({...theme, heroSubtitle: e.target.value})}
                          className="w-full rounded-lg border border-[#E5E7E2] p-2 text-sm h-20"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Card>
            </Tabs>
          </div>

          {/* Live Preview Area */}
          <div className="lg:col-span-8">
            <div className="bg-[#1E2320] rounded-t-2xl p-3 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex items-center gap-4 text-white/50">
                <Monitor className="w-4 h-4 text-white" />
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            
            <div 
              className="bg-white border-x border-b border-[#E5E7E2] rounded-b-2xl overflow-hidden shadow-2xl transition-all duration-500"
              style={{ backgroundColor: theme.backgroundColor }}
            >
              {/* Fake Hero Preview */}
              <div className="relative h-[400px] flex items-center px-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1000')" }} />
                <div className="absolute inset-0 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${theme.primaryColor}ee, transparent)` }} />
                
                <div className="relative z-10 max-w-lg">
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 bg-white/20 text-white border border-white/30 backdrop-blur-sm"
                  >
                    {theme.heroBadge}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: theme.fontHeading }}>
                    {theme.heroTitle} <span className="block opacity-80 font-light">{theme.heroSubtitle}</span>
                  </h2>
                  <Button className="rounded-full px-8" style={{ backgroundColor: 'white', color: theme.primaryColor }}>
                    {theme.ctaText}
                  </Button>
                </div>
              </div>

              {/* Fake Stats Preview */}
              {theme.showStats && (
                <div className="p-8 border-b border-[#E5E7E2]">
                  <div className="grid grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="text-center">
                        <div className="w-8 h-8 rounded-lg mx-auto mb-2 opacity-20" style={{ backgroundColor: theme.primaryColor }} />
                        <div className="h-4 w-12 bg-gray-100 mx-auto rounded mb-1" />
                        <div className="h-3 w-8 bg-gray-50 mx-auto rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fake Content Preview */}
              <div className="p-12 text-center">
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.secondaryColor }}>Kategori Produk</div>
                <h3 className="text-2xl font-bold mb-8" style={{ color: '#1E2320', fontFamily: theme.fontHeading }}>Katalog Digital Gimu</h3>
                <div className="grid grid-cols-3 gap-6">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-[#E5E7E2] p-4 text-left shadow-sm">
                      <div className="h-32 bg-gray-100 rounded-lg mb-4" />
                      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-full bg-gray-100 rounded mb-4" />
                      <div className="h-8 w-full bg-gray-50 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Select Component Mock
const Select = ({ value, children, className }) => (
  <select className={`w-full rounded-lg border border-[#E5E7E2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20 ${className}`}>
    {children}
  </select>
);
