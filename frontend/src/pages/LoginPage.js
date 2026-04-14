import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useLang } from '../context/LangContext';

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Terjadi kesalahan. Silakan coba lagi.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).filter(Boolean).join(' ');
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] px-6" data-testid="login-page">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#143D2E] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-semibold text-xl text-[#1E2320]">Gimu Digital Hub</span>
          </Link>
          <h1 className="font-heading text-2xl font-medium text-[#1E2320]">{t('auth_welcome_back')}</h1>
          <p className="text-sm text-[#6C7A70] mt-1">{t('auth_login_desc')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#E5E7E2] shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg" data-testid="login-error">{error}</div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm text-[#1E2320]">{t('auth_email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 rounded-xl border-[#E5E7E2]"
              required
              data-testid="login-email-input"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm text-[#1E2320]">{t('auth_password')}</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-[#E5E7E2] pr-10"
                required
                data-testid="login-password-input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C7A70]"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full py-2.5 bg-[#143D2E] hover:bg-[#143D2E]/90 text-white text-sm font-semibold"
            disabled={loading}
            data-testid="login-submit-button"
          >
            {loading ? t('auth_logging_in') : t('auth_login_btn')}
          </Button>
          <div className="text-center">
            <Link to="/forgot-password" className="text-xs text-[#6C7A70] hover:text-[#143D2E] transition-colors" data-testid="forgot-password-link">
              {t('auth_forgot')}
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-[#6C7A70] mt-6">
          {t('auth_no_account')}{' '}
          <Link to="/register" className="text-[#143D2E] font-medium hover:underline" data-testid="go-to-register">{t('auth_register_now')}</Link>
        </p>
      </div>
    </div>
  );
}
