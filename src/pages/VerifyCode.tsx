import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const CORRECT_OTP = "123456";

export const VerifyCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve email from React Router state or fallback to a default
  const email = location.state?.email || 'user@example.com';

  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  // References for the 6 input elements
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const shake = (msg: string) => {
    setError(msg);
    setShaking(true);
    setIsInvalid(true);
    setTimeout(() => setShaking(false), 500);
  };

  // Restrict to numeric inputs
  const handleChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return;

    // Reset error state on new key entries
    setIsInvalid(false);
    setError('');

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Backspace Support
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setIsInvalid(false);
      setError('');
      if (!code[index] && index > 0) {
        // Move to previous box, clear it
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Just clear current box
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  // Paste Support: auto-distribute digits across boxes
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      return shake('Please paste a valid 6-digit numeric code.');
    }

    setIsInvalid(false);
    setError('');
    const digits = pastedData.split('');
    setCode(digits);
    // Focus the last input box
    inputRefs.current[5]?.focus();
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setError('');
    setIsInvalid(false);
    // Mock resend code notification
    alert(`A new 6-digit verification code has been sent to ${email}!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length < 6) {
      return shake('Please enter the full 6-digit verification code.');
    }

    setError('');
    setLoading(true);

    // Simulate verification API delay
    await new Promise((r) => setTimeout(r, 1500));

    // Strict validation check against CORRECT_OTP
    if (verificationCode !== CORRECT_OTP) {
      setLoading(false);
      return shake('Invalid verification code. Please check your email and try again.');
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      navigate('/reset-password');
    }, 1500);
  };

  const isFormComplete = code.every((digit) => digit !== '');

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-12 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center mx-auto w-20 h-20 rounded-full bg-emerald-50 ring-8 ring-emerald-100 animate-bounce">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verification Successful</h2>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              Code verified! Taking you to reset your password...
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
          <div className="relative">
            <Link
              to="/login"
              className="absolute -top-1 -left-2 text-slate-400 hover:text-slate-700 flex items-center gap-1.5 text-xs font-semibold p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
            <div className="pt-8 text-left">
              <h1 className="text-2xl font-bold text-slate-900">Verify Code</h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>. Please enter it below.
              </p>
            </div>
          </div>

          {/* Test credentials helper banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
            <p className="font-bold uppercase tracking-wider mb-0.5">Mock Test Code:</p>
            <p>Enter the code <span className="font-semibold select-all text-amber-955 bg-amber-200/50 px-1 py-0.5 rounded">123456</span> to complete validation.</p>
          </div>

          {/* Error Banner with shake */}
          {error && (
            <div
              className={`flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
            >
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 code inputs */}
            <div
              className={`flex items-center justify-between gap-2.5 ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 text-2xl font-bold text-slate-900 text-center bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all ${
                    isInvalid
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                />
              ))}
            </div>

            {/* Verify Action */}
            <button
              type="submit"
              disabled={loading || !isFormComplete}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold text-sm shadow-md shadow-amber-400/30 hover:shadow-amber-400/50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* Resend Ticker */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className={`text-sm font-semibold transition-colors ${
                resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:text-amber-700'
              }`}
            >
              {resendTimer > 0 ? `Didn't receive the code? Resend in ${resendTimer}s` : "Didn't receive the code? Resend"}
            </button>
          </div>
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
