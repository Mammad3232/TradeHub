import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Briefcase,
  ShoppingCart,
  Check,
  X,
} from 'lucide-react';
import { registerApi } from '../services/authService';

type Role = 'buyer' | 'seller';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
  role: Role;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirm: '',
    role: 'buyer',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const shake = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const meetsMinLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);

  const isPasswordValid = meetsMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName) {
      return shake('Please enter your full name.');
    }
    if (!trimmedEmail) {
      return shake('Please enter your email address.');
    }
    if (!form.password) {
      return shake('Please enter a password.');
    }
    if (!isPasswordValid) {
      return shake('Password does not meet the complexity requirements.');
    }
    if (form.password !== form.confirm) {
      return shake('Passwords do not match.');
    }
    if (!termsAccepted) {
      return shake('You must accept the Terms and Conditions to register.');
    }

    setError('');
    setLoading(true);

    try {
      await registerApi({
        fullName: trimmedName,
        email: trimmedEmail,
        password: form.password,
        role: form.role === 'seller' ? 'Vendor' : 'Customer',
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setLoading(false);
      return shake(err.message || 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center px-4 text-slate-100">
        <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600" />
          <div className="flex items-center justify-center mx-auto w-20 h-20 rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Account Created!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Welcome to Vendora, <span className="font-bold text-purple-400">{form.name.trim()}</span>!<br />
              Redirecting you to log in...
            </p>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 animate-[progress_1.5s_linear_forwards] rounded-full" />
          </div>
        </div>
        <style>{`
          @keyframes progress { from { width: 0%; } to { width: 100%; } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans grid grid-cols-1 lg:grid-cols-12 overflow-hidden antialiased select-none">
      
      {/* ─── LEFT PANEL: Branding & Value Proposition (5 Columns) ─── */}
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
              Create your Vendora identity.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Register as a buyer to shop top-tier catalog assets, or sign up as a seller to publish shop listings globally.
            </p>
          </div>

          {/* Icon highlights list */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-450 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Expand Storefront Reach</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Establish seller catalogs and reach thousands of verified active buyers instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Direct Vendor Messaging</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Interact dynamically, negotiate order lines, and coordinate logistics directly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer legal notices */}
        <div className="relative z-10 text-[10px] text-slate-500">
          <span>© 2026 Vendora Marketplace. All rights reserved.</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Registration Form (7 Columns) ─── */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative overflow-y-auto">
        {/* Glow orb */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto space-y-7 z-10 text-left">
          
          {/* Header titles */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create your account</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Join thousands of buyers and sellers on the Vendora network.
            </p>
          </div>

          {/* Simple Tab Toggler Switcher */}
          <div className="flex border-b border-slate-800/80 text-xs sm:text-sm font-semibold gap-1 select-none">
            <Link
              to="/login"
              className="px-4 py-3 text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign In
            </Link>
            <span className="px-4 py-3 text-purple-400 border-b-2 border-purple-500 font-bold">
              Create Account
            </span>
          </div>

          {/* Error Banner with shake */}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  className="w-full pl-11 pr-11 py-2.5 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              {/* Password complexity checklist requirements display */}
              {form.password && (
                <div className="bg-[#0E1524] border border-slate-800 p-3 rounded-xl space-y-2 mt-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password Requirements</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {meetsMinLength ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                      <span className={meetsMinLength ? 'text-emerald-400' : 'text-slate-500'}>Min. 8 chars</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                      <span className={hasUppercase ? 'text-emerald-400' : 'text-slate-500'}>1 Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                      <span className={hasLowercase ? 'text-emerald-400' : 'text-slate-500'}>1 Lowercase</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                      <span className={hasNumber ? 'text-emerald-400' : 'text-slate-500'}>1 Number</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 bg-[#0E1524] border border-slate-800 text-white text-sm placeholder:text-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Account Role Selector Buyer vs Seller */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Account Focus
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold select-none">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'buyer' }))}
                  className={`py-3 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.role === 'buyer'
                      ? 'bg-purple-500/10 border-purple-500 text-white font-extrabold ring-1 ring-purple-500/20'
                      : 'bg-[#0E1524] border-slate-800 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buyer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: 'seller' }))}
                  className={`py-3 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    form.role === 'seller'
                      ? 'bg-purple-500/10 border-purple-500 text-white font-extrabold ring-1 ring-purple-500/20'
                      : 'bg-[#0E1524] border-slate-800 text-slate-400 hover:border-slate-750'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Seller / Vendor</span>
                </button>
              </div>
            </div>

            {/* Accept Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4.5 h-4.5 bg-slate-900 border-slate-800 text-purple-650 rounded focus:ring-purple-500 focus:ring-offset-[#060913] cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-[11px] font-semibold text-slate-400 cursor-pointer select-none leading-relaxed">
                I accept the <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms displayed...'); }} className="text-purple-405 hover:underline font-bold">Terms of Service</a> and <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy Policy...'); }} className="text-purple-405 hover:underline font-bold">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-85 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-650/15 hover:shadow-purple-500/25 active:scale-[.98] transition-all flex items-center justify-center gap-2 cursor-pointer pt-2"
            >
              {loading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          {/* Social connections login */}
          <div className="space-y-5 pt-1">
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

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => alert('Registering with Google (Simulated)...')}
                className="flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-600 bg-[#0E1524]/50 hover:bg-[#0E1524] text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer"
              >
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
                onClick={() => alert('Registering with GitHub (Simulated)...')}
                className="flex items-center justify-center gap-2 py-3 border border-slate-800 hover:border-slate-600 bg-[#0E1524]/50 hover:bg-[#0E1524] text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer"
              >
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
export default Register;
