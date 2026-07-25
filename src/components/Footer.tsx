import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Compass, Globe, Mail, ArrowUpRight, Send, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface FooterUser {
  isLoggedIn: boolean;
  role: string;
}

interface FooterProps {
  currentUser?: FooterUser;
}

// ── Static link definitions ────────────────────────────────────────────────────
// `requireRole` — if set, the link is only rendered for matching roles.
// If absent, the link is always shown.
const platformLinks: { label: string; to: string; requireRole?: string[] }[] = [
  { label: 'Marketplace', to: '/' },
  {
    label: 'Vendor Portal',
    to: '/vendor/dashboard',
    requireRole: ['Vendor', 'Admin', 'Seller'],
  },
  {
    label: 'Admin Dashboard',
    to: '/admin',
    requireRole: ['Admin'],
  },
  { label: 'My Orders', to: '/my-orders' },
];

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Careers',  to: '/careers' },
  { label: 'Blog',     to: '/blog' },
  { label: 'Press',    to: '/press' },
];

const supportLinks = [
  { label: 'Help Center',      to: '/help' },
  { label: 'Contact Us',       to: '/contact' },
  { label: 'Privacy Policy',   to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
];

const socials = [
  { label: 'Website', Icon: Globe,   href: 'https://vendora.store' },
  { label: 'Explore', Icon: Compass, href: '/deals' },
  { label: 'Email',   Icon: Mail,    href: 'mailto:support@vendora.store' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export const Footer: React.FC<FooterProps> = ({ currentUser }) => {
  const { pushToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    pushToast('Thank you for subscribing to our newsletter!', 'info');
    setNewsletterEmail('');
  };

  /** Filter platform links based on the current user's role */
  const visiblePlatformLinks = platformLinks.filter((link) => {
    if (!link.requireRole) return true;                          // always visible
    if (!currentUser?.isLoggedIn) return false;                  // must be logged in
    return link.requireRole.includes(currentUser.role);          // role match
  });

  const footerColumns = [
    { group: 'Platform', links: visiblePlatformLinks },
    { group: 'Company',  links: companyLinks },
    { group: 'Support',  links: supportLinks },
  ];

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400">
      {/* ── Main Grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/30">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                Vendora
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              A next-generation multi-vendor marketplace connecting independent creators and customers worldwide.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-800 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map(({ group, links }) => (
            <div key={group} className="space-y-4">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">{group}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all text-purple-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Newsletter Banner ────────────────────────────────────── */}
        <div className="mt-12 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white">Stay in the loop</h4>
            <p className="text-xs text-slate-400 mt-0.5">Get new product drops and exclusive deals directly to your inbox.</p>
          </div>
          <form className="flex w-full sm:w-auto gap-2" onSubmit={handleSubscribe}>
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 sm:w-60 bg-slate-900 border border-slate-800 text-slate-100 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Subscribe</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* ── Bottom Bar ──────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Vendora Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>for creator-first commerce.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
