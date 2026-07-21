import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sparkles, Compass } from 'lucide-react';

const suggestions = [
  'Wireless Headphones',
  'Mechanical Keyboard',
  'Smartwatch',
  'Gaming Mouse',
  'USB-C Hub',
];

export const NotFound: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (term: string) => {
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative min-h-screen bg-[#060913] flex flex-col items-center justify-center overflow-hidden px-4 text-slate-200">

      {/* ── Ambient background glows ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/4 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] bg-indigo-600/5 rounded-full blur-[80px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(to right, #a855f7 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Content wrapper ── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full space-y-8">

        {/* Floating icon badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
          <Compass className="w-3.5 h-3.5" />
          <span>Lost in the Cosmos</span>
        </div>

        {/* ── Massive glowing 404 ── */}
        <div className="relative select-none">
          <h1
            className="text-[10rem] sm:text-[14rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-violet-400 to-amber-500"
            style={{ filter: 'drop-shadow(0 0 60px rgba(168, 85, 247, 0.35))' }}
          >
            404
          </h1>
          {/* Ghost decorative sparkles */}
          <Sparkles className="absolute -top-4 -right-4 w-7 h-7 text-amber-400/50 animate-pulse" />
          <Sparkles className="absolute bottom-4 -left-4 w-5 h-5 text-purple-400/40 animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>

        {/* Headline & description */}
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
            Oops! You wandered too far.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto">
            The page you are looking for must have drifted into the void. Let's get you back on track — try searching for what you need below.
          </p>
        </div>

        {/* ── Search bar ── */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3 shadow-xl focus-within:border-purple-500/60 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
            <Search className="w-4.5 h-4.5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-bold rounded-xl transition-all"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-xs text-slate-500 font-semibold self-center mr-1">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="text-xs px-3 py-1.5 bg-[#0E1524] hover:bg-[#1A2333] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-full font-semibold transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#111827] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-xs text-slate-600 pt-4">
          If you believe this is an error, please{' '}
          <Link to="/contact" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            contact support
          </Link>
          .
        </p>

      </div>
    </div>
  );
};

export default NotFound;
