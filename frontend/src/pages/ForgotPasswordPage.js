import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Terjadi kesalahan. Silakan coba lagi.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, { email, origin_url: window.location.origin });
      setSent(true);
      if (data.token) setResetToken(data.token);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] px-6" data-testid="forgot-password-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#143D2E] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-semibold text-xl text-[#1E2320]">Gimu Digital Hub</span>
          </Link>
          <h1 className="font-heading text-2xl font-medium text-[#1E2320]">Lupa Password</h1>
          <p className="text-sm text-[#6C7A70] mt-1">Masukkan email Anda untuk mereset password</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 border border-[#E5E7E2] shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
            <h2 className="font-heading font-medium text-lg text-[#1E2320] mb-2" data-testid="forgot-password-success">
              Email Terkirim
            </h2>
            <p className="text-sm text-[#6C7A70] mb-4">
              Jika email terdaftar, link reset password telah dikirim. Periksa inbox Anda.
            </p>
            {resetToken && (
              <Link
                to={`/reset-password?token=${resetToken}`}
                className="inline-block text-sm font-medium text-[#143D2E] hover:underline mb-4"
                data-testid="reset-password-link"
              >
                Klik di sini untuk reset password
              </Link>
            )}
            <div className="pt-2">
              <Link to="/login" className="text-sm text-[#6C7A70] hover:text-[#143D2E] transition-colors">
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E5E7E2] shadow-sm space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg" data-testid="forgot-password-error">{error}</div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm text-[#1E2320]">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C7A70]" strokeWidth={1.5} />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 rounded-xl border-[#E5E7E2]"
                  required
                  data-testid="forgot-email-input"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full rounded-full py-2.5 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm font-semibold"
              disabled={loading}
              data-testid="forgot-submit-button"
            >
              {loading ? 'Mengirim...' : 'Kirim Link Reset'}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-[#6C7A70] mt-6">
          <Link to="/login" className="text-[#143D2E] font-medium hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
