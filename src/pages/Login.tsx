import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShoppingBag,
  CheckCircle2,
  LockKeyhole,
} from 'lucide-react';
import { type CurrentUser, normalizeUser } from '../App';
import { loginApi } from '../services/authService';

interface LoginProps {
  /** Called by App.tsx immediately after a successful login so React state updates without a page reload. */
  onLogin?: (user: CurrentUser) => void;
  handleLogin?: (user: CurrentUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, handleLogin }) => {
  const navigate = useNavigate();
  const loginCallback = handleLogin || onLogin;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Brute Force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0); // in seconds

  // Initialize: Load remembered email & Seed default users for testing
  useEffect(() => {
    const dbRaw = localStorage.getItem('vendora_users');
    if (!dbRaw) {
      const defaultUsers = [
        {
          name: 'Admin User',
          email: 'admin@vendora.store',
          password: 'Password123',
          role: 'Admin',
        },
        {
          name: 'Admin User',
          email: 'admin@vendora.com',
          password: 'Password123',
          role: 'Admin',
        },
        {
          name: 'John Buyer',
          email: 'buyer@vendora.store',
          password: 'Password123',
          role: 'Customer',
        },
      ];
      localStorage.setItem('vendora_users', JSON.stringify(defaultUsers));
    }

    const rememberedEmail = localStorage.getItem('vendora_remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Lockout countdown timer effect
  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime((time) => {
          if (time <= 1) {
            clearInterval(interval);
            setFailedAttempts(0); // reset failures on lock expiration
            return 0;
          }
          return time - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const shake = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutTime > 0) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return shake('Please enter your email address.');
    }
    if (!password) {
      return shake('Please enter your password.');
    }

    setError('');
    setLoading(true);

    try {
      const authRes = await loginApi({ email: trimmedEmail, password });

      if (rememberMe) {
        localStorage.setItem('vendora_remember_email', trimmedEmail);
      } else {
        localStorage.removeItem('vendora_remember_email');
      }

      const sessionUser: CurrentUser = {
        isLoggedIn: true,
        name: authRes.user.fullName,
        email: authRes.user.email,
        role: authRes.user.role as CurrentUser['role'],
      };

      localStorage.setItem('vendora_user', JSON.stringify(sessionUser));
      localStorage.setItem('mockUser', JSON.stringify(sessionUser));
      localStorage.setItem('vendora_active_user', JSON.stringify(sessionUser));

      if (loginCallback) loginCallback(sessionUser);

      setLoading(false);

      if (sessionUser.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setLoading(false);
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      if (nextFailures >= 3) {
        setLockoutTime(30);
        return shake('Too many failed attempts. Please try again in 30 seconds.');
      } else {
        return shake(err.message || 'Invalid email or password.');
      }
    }
  };

  const isLocked = lockoutTime > 0;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans grid grid-cols-1 lg:grid-cols-12 overflow-hidden antialiased select-none">
      
      {/* ─── LEFT PANEL: Branding & Visual details (5 Columns) ─── */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0B1120] to-[#060913] p-12 border-r border-slate-800/80 flex-col justify-between text-left relative overflow-hidden">
        
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        
        {/* Purple Glowing Orbs */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-10 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header branding */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-650/20 group-hover:scale-105 transition-transform flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              Vendora
            </span>
          </Link>
        </div>

        {/* Premium Value Statement */}
        <div className="relative z-10 space-y-8 my-auto pr-4">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full w-fit block">
              Marketplace 2.0
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
              Join the next generation of e-commerce.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience lightning fast trade operations, customizable variants, and secured payments under the robust Vendora cloud engine.
            </p>
          </div>

          {/* Icon highlights list */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-450 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Industrial Fast Deliveries</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated vendor dispatch channels delivering orders within 1-2 days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <LockKeyhole className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">256-bit Encrypted Checkouts</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Every checkout checkout details is locked and protected behind gateway firewalls.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer legal notices */}
        <div className="relative z-10 text-[10px] text-slate-500">
          <span>© 2026 Vendora Marketplace. All rights reserved.</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Form Container (7 Columns) ─── */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative">
        {/* Glow orb */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto space-y-8 z-10 text-left">
          
          {/* Header titles */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome back</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Enter your credentials to continue shopping on Vendora.
            </p>
          </div>

          {/* Simple Tab Toggler Switcher */}
          <div className="flex border-b border-slate-800/80 text-xs sm:text-sm font-semibold gap-1 select-none">
            <span className="px-4 py-3 text-purple-400 border-b-2 border-purple-500 font-bold">
              Sign In
            </span>
            <Link
              to="/register"
              className="px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {/* Test Credentials banner */}
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-3.5 text-[10px] sm:text-xs text-purple-300 space-y-1.5">
            <p className="font-bold uppercase tracking-wider text-purple-400">Sandbox Test Accounts:</p>
            <p>Admin/Seller Email: <span className="font-semibold select-all text-white bg-slate-900/60 px-1 py-0.5 rounded font-mono">admin@vendora.store</span></p>
            <p>Buyer Email: <span className="font-semibold select-all text-white bg-slate-900/60 px-1 py-0.5 rounded font-mono">buyer@vendora.store</span></p>
            <p>Universal Password: <span className="font-semibold select-all text-white bg-slate-900/60 px-1 py-0.5 rounded font-mono">Password123</span></p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-4 py-3 text-xs sm:text-sm ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
            >
              <AlertCircle className="h-4.5 w-4.5 mt-0.5 flex-shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  disabled={isLocked || loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all disabled:opacity-50 font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="login-password" className="font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  disabled={isLocked || loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all disabled:opacity-50 font-medium font-mono"
                />
                
                {/* Visibility toggler toggle */}
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  disabled={isLocked || loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                disabled={isLocked || loading}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4.5 h-4.5 bg-slate-900 border-slate-800 text-purple-650 rounded focus:ring-purple-500 focus:ring-offset-[#060913] cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                Remember my email address on this device
              </label>
            </div>

            {/* Large Primary Action Button */}
            <button
              type="submit"
              disabled={isLocked || loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-85 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-650/15 hover:shadow-purple-500/25 active:scale-[.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="space-y-6 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#060913] px-3 font-bold text-slate-500 tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social accounts login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => alert('Authenticating with Google (Simulated)...')}
                className="flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-600 bg-[#0E1524]/50 hover:bg-[#0E1524] text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer"
              >
                {/* SVG Google icon logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.535 0-6.4-2.865-6.4-6.4s2.865-6.4 6.4-6.4c1.582 0 3.027.574 4.15 1.523l3.056-3.056C19.348 2.559 15.992 1.5 12.24 1.5 6.364 1.5 1.5 6.364 1.5 12.24s4.864 10.74 10.74 10.74c5.963 0 10.87-4.29 10.87-10.74 0-.64-.06-1.28-.18-1.955H12.24z"
                  />
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => alert('Authenticating with GitHub (Simulated)...')}
                className="flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-600 bg-[#0E1524]/50 hover:bg-[#0E1524] text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer"
              >
                {/* lucide github placeholder */}
                <svg className="w-4 h-4 fill-slate-300" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};
export default Login;
