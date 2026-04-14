import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, Eye, EyeOff, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Terjadi kesalahan. Silakan coba lagi.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password minimal 6 karakter'); return; }
    if (newPassword !== confirmPassword) { setError('Konfirmasi password tidak cocok'); return; }
    if (!token) { setError('Token tidak valid'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { token, new_password: newPassword });
      setSuccess(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] px-6" data-testid="reset-password-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#143D2E] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-semibold text-xl text-[#1E2320]">Gimu Digital Hub</span>
          </Link>
          <h1 className="font-heading text-2xl font-medium text-[#1E2320]">Reset Password</h1>
          <p className="text-sm text-[#6C7A70] mt-1">Buat password baru untuk akun Anda</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7E2] shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-heading font-medium text-lg text-[#1E2320] mb-2" data-testid="reset-password-success">
              Password Berhasil Direset
            </h2>
            <p className="text-sm text-[#6C7A70] mb-4">
              Anda sekarang bisa login dengan password baru.
            </p>
            <Button
              className="rounded-full px-6 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm"
              onClick={() => navigate('/login')}
              data-testid="go-to-login-after-reset"
            >
              Masuk Sekarang
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E5E7E2] shadow-sm space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg" data-testid="reset-password-error">{error}</div>
            )}
            <div>
              <Label htmlFor="newPassword" className="text-sm text-[#1E2320]">Password Baru</Label>
              <div className="relative mt-1.5">
                <Input
                  id="newPassword"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl border-[#E5E7E2] pr-10"
                  required
                  data-testid="reset-new-password-input"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C7A70]" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm text-[#1E2320]">Konfirmasi Password Baru</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 rounded-xl border-[#E5E7E2]"
                required
                data-testid="reset-confirm-password-input"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full py-2.5 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm font-semibold"
              disabled={loading}
              data-testid="reset-submit-button"
            >
              {loading ? 'Menyimpan...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[#6C7A70] mt-6">
          <Link to="/login" className="text-[#143D2E] font-medium hover:underline">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}
