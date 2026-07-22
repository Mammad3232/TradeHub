import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  Globe2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  Heart,
} from 'lucide-react';

const stats = [
  { label: 'Gross Merchandise Volume', value: '$10M+', icon: TrendingUp },
  { label: 'Independent Creators',     value: '50,000+', icon: Users },
  { label: 'Global Destinations',      value: '120+', icon: Globe2 },
  { label: 'Platform Reliability',     value: '99.99%', icon: ShieldCheck },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Uncompromising Trust',
    desc: 'Every vendor is verified and every transaction is protected with 256-bit encryption and escrow guarantees.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Users,
    title: 'Creator-First Economy',
    desc: 'We offer industry-leading low commission fees so independent makers and brands keep more of what they earn.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Zap,
    title: 'High-Performance Tech',
    desc: 'Lightning-fast store fronts, real-time inventory synchronization, and automated analytics for seamless shopping.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Award,
    title: 'Curated Quality',
    desc: 'We carefully curate products across electronics, fashion, and lifestyle goods to ensure buyers receive top quality.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center max-w-4xl mx-auto space-y-6">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-wider mx-auto">
            <ShoppingBag className="w-4 h-4" />
            <span>About Vendora</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Empowering Independent Creators &amp; Modern Brands
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Vendora was founded with a singular mission: to democratize global e-commerce. We build modern tools that empower independent merchants to showcase products and connect directly with millions of passionate shoppers.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-xl shadow-purple-600/30"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/vendor-register"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all"
            >
              <span>Become a Merchant</span>
            </Link>
          </div>
        </div>

        {/* ── Stats Counter Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-[#0E1524] border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-3 hover:border-purple-500/40 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">{value}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Core Values Grid ─────────────────────────────────────────── */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Our Core Principles</h2>
            <p className="text-sm text-slate-400">The values that guide how we build, scale, and support our global community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <div
                key={title}
                className="bg-[#0E1524] border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex gap-5 hover:border-slate-700 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} ${border} border ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
