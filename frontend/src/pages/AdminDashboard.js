import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Plus, Pencil, Trash2, MoreVertical, Package, Users, ShoppingCart,
  DollarSign, BookOpen, Video, FileText, HelpCircle, ArrowLeft, X, Search, Mail, Send,
  Shield, ShieldOff, UserCheck, Ban
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categoryOptions = [
  { value: 'ebook', label: 'E-Book', icon: BookOpen },
  { value: 'video', label: 'Video Kursus', icon: Video },
  { value: 'template', label: 'Template', icon: FileText },
  { value: 'quiz', label: 'Bank Soal', icon: HelpCircle },
];

const categoryLabels = { ebook: 'E-Book', video: 'Video', template: 'Template', quiz: 'Bank Soal' };

function formatApiError(detail) {
  if (detail == null) return 'Terjadi kesalahan.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(' ');
  return String(detail);
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7E2] p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5 text-white" strokeWidth={1.5} />
        </div>
        <span className="text-sm text-[#6C7A70]">{label}</span>
      </div>
      <p className="font-heading font-semibold text-2xl text-[#1E2320]">{value}</p>
    </div>
  );
}

function ProductFormDialog({ open, onClose, product, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('ebook');
  const [imageUrl, setImageUrl] = useState('');
  const [features, setFeatures] = useState('');
  const [badge, setBadge] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setPrice(String(product.price || ''));
      setCategory(product.category || 'ebook');
      setImageUrl(product.image_url || '');
      setFeatures((product.features || []).join(', '));
      setBadge(product.badge || '');
    } else {
      setTitle(''); setDescription(''); setPrice(''); setCategory('ebook');
      setImageUrl(''); setFeatures(''); setBadge('');
    }
    setError('');
  }, [product, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Judul wajib diisi'); return; }
    if (!description.trim()) { setError('Deskripsi wajib diisi'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Harga harus lebih dari 0'); return; }

    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      image_url: imageUrl.trim(),
      features: features.split(',').map(f => f.trim()).filter(Boolean),
      badge: badge.trim(),
    };

    try {
      if (isEdit) {
        await axios.put(`${API}/admin/products/${product.id}`, payload, { withCredentials: true });
        toast.success('Produk berhasil diperbarui');
      } else {
        await axios.post(`${API}/admin/products`, payload, { withCredentials: true });
        toast.success('Produk berhasil ditambahkan');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="product-form-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg" data-testid="product-form-error">{error}</div>}

          <div>
            <Label className="text-sm text-[#1E2320]">Judul Produk *</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nama produk" className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-title-input" />
          </div>
          <div>
            <Label className="text-sm text-[#1E2320]">Deskripsi *</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Deskripsi produk"
              className="mt-1.5 w-full rounded-xl border border-[#E5E7E2] px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#143D2E]/20"
              data-testid="product-description-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-[#1E2320]">Harga (USD) *</Label>
              <Input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-price-input" />
            </div>
            <div>
              <Label className="text-sm text-[#1E2320]">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-sm text-[#1E2320]">URL Gambar</Label>
            <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-image-input" />
          </div>
          <div>
            <Label className="text-sm text-[#1E2320]">Fitur (pisahkan dengan koma)</Label>
            <Input value={features} onChange={e => setFeatures(e.target.value)} placeholder="Fitur 1, Fitur 2, Fitur 3" className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-features-input" />
          </div>
          <div>
            <Label className="text-sm text-[#1E2320]">Badge</Label>
            <Input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Best Seller, New, Popular" className="mt-1.5 rounded-xl border-[#E5E7E2]" data-testid="product-badge-input" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-full border-[#E5E7E2]" onClick={onClose}>Batal</Button>
            <Button type="submit" className="flex-1 rounded-full bg-[#143D2E] hover:bg-[#143D2E]/90 text-white" disabled={saving} data-testid="product-form-submit">
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({ open, onClose, product, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/admin/products/${product.id}`, { withCredentials: true });
      toast.success('Produk berhasil dihapus');
      onConfirm();
      onClose();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm" data-testid="delete-confirm-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">Hapus Produk</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#6C7A70] mt-2">
          Apakah Anda yakin ingin menghapus <strong>"{product?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 rounded-full" onClick={onClose}>Batal</Button>
          <Button variant="destructive" className="flex-1 rounded-full" onClick={handleDelete} disabled={deleting} data-testid="confirm-delete-button">
            {deleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const handleTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const { data } = await axios.post(`${API}/admin/test-email`, {}, { withCredentials: true });
      toast.success(`${data.message} ke ${data.sent_to}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/products`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchData();
  }, [user, authLoading, navigate, fetchData]);

  const filtered = products.filter(p => {
    const matchCat = filterCategory === 'all' || p.category === filterCategory;
    const matchSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const openCreate = () => { setEditProduct(null); setFormOpen(true); };
  const openEdit = (p) => { setEditProduct(p); setFormOpen(true); };
  const openDelete = (p) => { setDeleteProduct(p); setDeleteOpen(true); };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      toast.success(`Role berhasil diubah ke ${newRole}`);
      fetchData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const handleToggleBan = async (userId, banned) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/ban`, { banned }, { withCredentials: true });
      toast.success(banned ? 'User berhasil dinonaktifkan' : 'User berhasil diaktifkan kembali');
      fetchData();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  };

  const filteredUsers = users.filter(u =>
    !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 animate-pulse space-y-6">
          <div className="h-8 bg-[#F0F2ED] rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#F0F2ED] rounded-2xl" />)}
          </div>
          <div className="h-64 bg-[#F0F2ED] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <button className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-6" onClick={() => navigate('/')} data-testid="admin-back">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Kembali ke Beranda
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl tracking-tight font-medium text-[#1E2320]" data-testid="admin-title">Admin Dashboard</h1>
            <p className="text-base text-[#6C7A70] mt-1">Kelola produk dan pengguna Gimu Digital Hub</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-full border-[#143D2E] text-[#143D2E] hover:bg-[#143D2E] hover:text-white"
            onClick={() => navigate('/admin/theme')}
          >
            <Palette className="w-4 h-4 mr-2" /> Pengaturan Tampilan
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" data-testid="admin-stats">
            <StatCard icon={Package} label="Total Produk" value={stats.total_products} color="bg-[#143D2E]" />
            <StatCard icon={Users} label="Total Pengguna" value={stats.total_users} color="bg-[#8FA998]" />
            <StatCard icon={ShoppingCart} label="Total Pesanan" value={stats.total_orders} color="bg-amber-500" />
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${stats.total_revenue.toFixed(2)}`} color="bg-emerald-500" />
          </div>
        )}

        {/* Email Notification Status */}
        <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-testid="email-config-card">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1E2320]">Email Notifikasi Aktif</p>
              <p className="text-xs text-[#6C7A70]">Brevo (Sendinblue) &mdash; Welcome, Reset Password, Konfirmasi Pembelian</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs border-[#E5E7E2] text-[#143D2E]"
            onClick={handleTestEmail}
            disabled={sendingTestEmail}
            data-testid="test-email-button"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            {sendingTestEmail ? 'Mengirim...' : 'Kirim Test Email'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#F0F2ED] rounded-xl p-1 mb-6">
            <TabsTrigger value="products" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#143D2E] data-[state=active]:shadow-sm" data-testid="tab-products">
              <Package className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Produk
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#143D2E] data-[state=active]:shadow-sm" data-testid="tab-users">
              <Users className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Pengguna
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-end mb-4">
              <Button className="rounded-full px-5 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm font-semibold" onClick={openCreate} data-testid="add-product-button">
                <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Tambah Produk
              </Button>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5E7E2] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  <Button variant={filterCategory === 'all' ? 'default' : 'outline'} size="sm" className={`rounded-full text-xs ${filterCategory === 'all' ? 'bg-[#143D2E] text-white' : 'border-[#E5E7E2] text-[#6C7A70]'}`} onClick={() => setFilterCategory('all')} data-testid="admin-filter-all">
                    Semua ({products.length})
                  </Button>
                  {categoryOptions.map(c => (
                    <Button key={c.value} variant={filterCategory === c.value ? 'default' : 'outline'} size="sm" className={`rounded-full text-xs ${filterCategory === c.value ? 'bg-[#143D2E] text-white' : 'border-[#E5E7E2] text-[#6C7A70]'}`} onClick={() => setFilterCategory(c.value)} data-testid={`admin-filter-${c.value}`}>
                      {c.label} ({stats?.category_counts?.[c.value] || 0})
                    </Button>
                  ))}
                </div>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C7A70]" strokeWidth={1.5} />
                  <Input placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 rounded-full border-[#E5E7E2] text-sm" data-testid="admin-search-input" />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F2ED]/50">
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Produk</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Kategori</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Harga</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Rating</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Badge</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-[#6C7A70]" data-testid="no-admin-products">Tidak ada produk ditemukan</TableCell></TableRow>
                  ) : (
                    filtered.map(p => (
                      <TableRow key={p.id} className="hover:bg-[#F0F2ED]/30" data-testid={`admin-product-row-${p.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#1E2320] truncate max-w-[200px]">{p.title}</p>
                              <p className="text-xs text-[#6C7A70] truncate max-w-[200px]">{p.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] uppercase tracking-wider border-[#E5E7E2] text-[#6C7A70]">{categoryLabels[p.category] || p.category}</Badge></TableCell>
                        <TableCell className="font-heading font-medium text-sm text-[#143D2E]">${p.price.toFixed(2)}</TableCell>
                        <TableCell className="text-sm text-[#1E2320]">{p.rating} ({p.reviews_count})</TableCell>
                        <TableCell>{p.badge ? <Badge className="bg-[#143D2E]/10 text-[#143D2E] text-[10px] uppercase">{p.badge}</Badge> : <span className="text-xs text-[#E5E7E2]">-</span>}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`admin-product-menu-${p.id}`}><MoreVertical className="w-4 h-4 text-[#6C7A70]" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)} data-testid={`edit-product-${p.id}`}><Pencil className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDelete(p)} className="text-red-600 focus:text-red-600" data-testid={`delete-product-${p.id}`}><Trash2 className="w-3.5 h-3.5 mr-2" /> Hapus</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5E7E2] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <p className="text-sm font-medium text-[#1E2320]">{users.length} pengguna terdaftar</p>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C7A70]" strokeWidth={1.5} />
                  <Input placeholder="Cari pengguna..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-9 rounded-full border-[#E5E7E2] text-sm" data-testid="admin-user-search" />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F0F2ED]/50">
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Pengguna</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Role</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Status</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold">Bergabung</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-[#6C7A70] font-semibold w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-[#6C7A70]">Tidak ada pengguna ditemukan</TableCell></TableRow>
                  ) : (
                    filteredUsers.map(u => {
                      const isSelf = u._id === user?._id || u.email === user?.email;
                      return (
                        <TableRow key={u._id || u.email} className="hover:bg-[#F0F2ED]/30" data-testid={`admin-user-row-${u._id || u.email}`}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium text-[#1E2320]">{u.name || '-'} {isSelf && <span className="text-[10px] text-[#8FA998]">(Anda)</span>}</p>
                              <p className="text-xs text-[#6C7A70]">{u.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] uppercase tracking-wider ${u.role === 'admin' ? 'bg-[#143D2E] text-white' : 'bg-[#F0F2ED] text-[#6C7A70]'}`}>
                              {u.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.banned ? (
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-red-200 text-red-600 bg-red-50">Nonaktif</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-green-200 text-green-700 bg-green-50">Aktif</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-[#6C7A70]">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </TableCell>
                          <TableCell>
                            {!isSelf && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`admin-user-menu-${u._id}`}><MoreVertical className="w-4 h-4 text-[#6C7A70]" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {u.role === 'user' ? (
                                    <DropdownMenuItem onClick={() => handleChangeRole(u._id, 'admin')} data-testid={`make-admin-${u._id}`}>
                                      <Shield className="w-3.5 h-3.5 mr-2" /> Jadikan Admin
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleChangeRole(u._id, 'user')} data-testid={`make-user-${u._id}`}>
                                      <ShieldOff className="w-3.5 h-3.5 mr-2" /> Jadikan User
                                    </DropdownMenuItem>
                                  )}
                                  {u.banned ? (
                                    <DropdownMenuItem onClick={() => handleToggleBan(u._id, false)} data-testid={`unban-user-${u._id}`}>
                                      <UserCheck className="w-3.5 h-3.5 mr-2" /> Aktifkan Kembali
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleToggleBan(u._id, true)} className="text-red-600 focus:text-red-600" data-testid={`ban-user-${u._id}`}>
                                      <Ban className="w-3.5 h-3.5 mr-2" /> Nonaktifkan
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editProduct}
        onSaved={fetchData}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        product={deleteProduct}
        onConfirm={fetchData}
      />
    </div>
  );
}
