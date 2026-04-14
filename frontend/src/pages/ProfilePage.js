import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Phone, Stethoscope, Building, Lock, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Terjadi kesalahan. Silakan coba lagi.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [institution, setInstitution] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API}/profile`, { withCredentials: true });
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setSpecialization(data.specialization || '');
        setInstitution(data.institution || '');
      } catch {
        toast.error('Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authLoading, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await axios.put(`${API}/profile`, { name, phone, specialization, institution }, { withCredentials: true });
      toast.success('Profil berhasil diperbarui');
      checkAuth();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) { setPasswordError('Password baru minimal 6 karakter'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Konfirmasi password tidak cocok'); return; }
    setPasswordSaving(true);
    try {
      await axios.post(`${API}/profile/change-password`, { current_password: currentPassword, new_password: newPassword }, { withCredentials: true });
      toast.success('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#F0F2ED] rounded w-48" />
            <div className="bg-white rounded-2xl p-8 border border-[#E5E7E2] space-y-4">
              <div className="h-4 bg-[#F0F2ED] rounded w-1/3" />
              <div className="h-10 bg-[#F0F2ED] rounded" />
              <div className="h-4 bg-[#F0F2ED] rounded w-1/3" />
              <div className="h-10 bg-[#F0F2ED] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#FBFBF9]" data-testid="profile-page">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <button
          className="flex items-center gap-1.5 text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors mb-8"
          onClick={() => navigate(-1)}
          data-testid="profile-back-button"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} /> Kembali
        </button>

        <h1 className="font-heading text-3xl tracking-tight font-medium text-[#1E2320] mb-2" data-testid="profile-title">
          Profil Saya
        </h1>
        <p className="text-base text-[#6C7A70] mb-8">Kelola informasi profil dan keamanan akun Anda</p>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm mb-6 overflow-hidden">
          <div className="bg-[#143D2E] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center">
                <User className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-white font-heading font-medium text-lg">{profile?.name || 'User'}</h2>
                <p className="text-white/60 text-sm">{profile?.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="p-6 space-y-5" data-testid="profile-form">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="name" className="text-sm text-[#1E2320] flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5 text-[#8FA998]" strokeWidth={1.5} /> Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Nama Anda"
                  className="rounded-xl border-[#E5E7E2]"
                  data-testid="profile-name-input"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm text-[#1E2320] flex items-center gap-1.5 mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#8FA998]" strokeWidth={1.5} /> Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="rounded-xl border-[#E5E7E2]"
                  data-testid="profile-phone-input"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="specialization" className="text-sm text-[#1E2320] flex items-center gap-1.5 mb-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#8FA998]" strokeWidth={1.5} /> Spesialisasi
                </Label>
                <Input
                  id="specialization"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Dokter Umum, Dokter Gigi, dll."
                  className="rounded-xl border-[#E5E7E2]"
                  data-testid="profile-specialization-input"
                />
              </div>
              <div>
                <Label htmlFor="institution" className="text-sm text-[#1E2320] flex items-center gap-1.5 mb-1.5">
                  <Building className="w-3.5 h-3.5 text-[#8FA998]" strokeWidth={1.5} /> Institusi
                </Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Nama RS / Klinik / Universitas"
                  className="rounded-xl border-[#E5E7E2]"
                  data-testid="profile-institution-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6C7A70]">
              <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Email: {profile?.email}</span>
              <span className="text-[#E5E7E2]">|</span>
              <span>Bergabung: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
            </div>

            <Button
              type="submit"
              className="rounded-full px-6 py-2.5 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm font-semibold"
              disabled={profileSaving}
              data-testid="profile-save-button"
            >
              {profileSaving ? (
                <>Menyimpan...</>
              ) : (
                <><Save className="w-4 h-4 mr-1.5" strokeWidth={1.5} /> Simpan Perubahan</>
              )}
            </Button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-[#E5E7E2] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7E2] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#143D2E]" strokeWidth={1.5} />
            <h3 className="font-heading font-medium text-base text-[#1E2320]">Ubah Password</h3>
          </div>
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4" data-testid="change-password-form">
            {passwordError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg" data-testid="password-error">{passwordError}</div>
            )}
            <div>
              <Label htmlFor="currentPassword" className="text-sm text-[#1E2320]">Password Saat Ini</Label>
              <div className="relative mt-1.5">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan password saat ini"
                  className="rounded-xl border-[#E5E7E2] pr-10"
                  required
                  data-testid="current-password-input"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C7A70]" onClick={() => setShowCurrent(!showCurrent)}>
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword" className="text-sm text-[#1E2320]">Password Baru</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="rounded-xl border-[#E5E7E2] pr-10"
                    required
                    data-testid="new-password-input"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C7A70]" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm text-[#1E2320]">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="mt-1.5 rounded-xl border-[#E5E7E2]"
                  required
                  data-testid="confirm-password-input"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="rounded-full px-6 py-2.5 border-[#143D2E] text-[#143D2E] hover:bg-[#143D2E]/5 text-sm font-semibold"
              disabled={passwordSaving}
              data-testid="change-password-button"
            >
              {passwordSaving ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
