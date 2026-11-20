// client/src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, LogIn, AlertCircle, Sparkles, User, Store, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract ?next= query param
  const searchParams = new URLSearchParams(location.search);
  const nextParam = searchParams.get('next');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.enterCredentials', 'Please enter your email and password'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      const user = res?.user || res?.data?.user;
      const role = user?.role || 'customer';

      // Role-specific home redirection
      if (nextParam && nextParam.startsWith('/')) {
        navigate(nextParam, { replace: true });
      } else if (role === 'seller') {
        navigate('/seller', { replace: true });
      } else if (role === 'partner') {
        navigate('/partner', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const errCode = err?.code || err?.response?.data?.error?.code;
      if (errCode === 'AUTH_INVALID_CREDENTIALS') {
        setError(t('auth.invalidCredentials', 'Invalid email or password. Please try again.'));
      } else {
        setError(err?.message || t('errors.UNKNOWN', 'Login failed. Please check your network and credentials.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setError('');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with Brand and Marathi Toggle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <Link to="/" className="text-2xl font-black font-serif text-bark flex items-center gap-1.5">
            <span>NativeRise</span>
          </Link>
          <LanguageToggle />
        </div>

        <h2 className="text-center text-3xl font-bold font-serif text-ink tracking-tight">
          {t('auth.signInTitle', 'Sign in to your account')}
        </h2>
        <p className="mt-2 text-center text-sm text-ink-2">
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800 hover:underline">
            {t('auth.registerHere', 'Register here')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow-sm border border-line rounded-card sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-btn flex items-start gap-2.5 text-danger text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                {t('common.email', 'Email Address')}
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink p-1 rounded transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              disabled={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? t('common.loading', 'Signing in...') : t('auth.signIn', 'Sign In')}
            </Button>
          </form>

          {/* Quick Demo Logins per Section 21.2 */}
          <div className="mt-8 pt-6 border-t border-line">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-ink-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-primary-700" />
              <span>{t('auth.demoLoginsTitle', 'Quick Demo Logins (1-Click)')}</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('rohan.customer@demo.nativerise.test', 'customer')}
                className="w-full flex items-center justify-between p-2.5 rounded-btn border border-line hover:border-primary-600 bg-cream-2/40 hover:bg-cream text-left transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-700 shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Customer: Rohan Patil</span>
                    <span className="text-[11px] text-ink-2">rohan.customer@demo.nativerise.test</span>
                  </div>
                </div>
                <span className="text-primary-800 font-semibold text-[11px]">Use &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('sunita.seller@demo.nativerise.test', 'seller')}
                className="w-full flex items-center justify-between p-2.5 rounded-btn border border-line hover:border-primary-600 bg-cream-2/40 hover:bg-cream text-left transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Seller: Sunita Gawande</span>
                    <span className="text-[11px] text-ink-2">sunita.seller@demo.nativerise.test</span>
                  </div>
                </div>
                <span className="text-primary-800 font-semibold text-[11px]">Use &rarr;</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('sanjay.partner@demo.nativerise.test', 'partner')}
                className="w-full flex items-center justify-between p-2.5 rounded-btn border border-line hover:border-primary-600 bg-cream-2/40 hover:bg-cream text-left transition text-xs"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-ink block">Partner: Sanjay Jadhav</span>
                    <span className="text-[11px] text-ink-2">sanjay.partner@demo.nativerise.test</span>
                  </div>
                </div>
                <span className="text-primary-800 font-semibold text-[11px]">Use &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
