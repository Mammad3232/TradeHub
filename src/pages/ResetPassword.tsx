import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState('');
  const [shaking, setShaking]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const shake = (msg: string) => {
    setError(msg);
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const meetsMinLength = password.length >= 8;
  const hasUppercase   = /[A-Z]/.test(password);
  const hasLowercase   = /[a-z]/.test(password);
  const hasNumber      = /[0-9]/.test(password);
  const isPasswordValid = meetsMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      return shake('Please enter a new password.');
    }
    if (!isPasswordValid) {
      return shake('Password does not meet the complexity requirements.');
    }
    if (password !== confirm) {
      return shake('Passwords do not match.');
    }

    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 1500));

    // Update active or dummy user password (e.g. if we have a mocked list, find a dummy and update it)
    // For simplicity of mock, we just let it succeed
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-12 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center mx-auto w-20 h-20 rounded-full bg-emerald-50 ring-8 ring-emerald-100 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Password Reset Complete</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Your password has been successfully updated.<br />
              Redirecting you to login…
            </p>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-slate-900 p-2 rounded-xl shadow-lg group-hover:shadow-amber-500/20 transition-shadow">
          <ShoppingBag className="h-6 w-6 text-amber-400" />
        </div>
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Vendora<span className="text-amber-500">.store</span>
        </span>
      </Link>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

        <div className="px-8 pt-8 pb-10 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
            <p className="text-sm text-slate-500 mt-1">Please choose a secure new password for your account.</p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              className={`flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-password" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="reset-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reset-confirm" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  id="reset-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-gray-50 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    confirm && confirm !== password
                      ? 'border-red-300 focus:ring-red-400'
                      : confirm && confirm === password
                      ? 'border-emerald-300 focus:ring-emerald-400'
                      : 'border-gray-200 focus:ring-amber-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:opacity-75 disabled:cursor-not-allowed text-slate-900 font-bold text-sm shadow-md shadow-amber-400/30 hover:shadow-amber-400/50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password…
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
