import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  ShieldCheck,
  ShoppingBag,
  Truck,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

interface FaqItem {
  id: number;
  category: 'Orders' | 'Shipping' | 'Sellers' | 'Account';
  q: string;
  a: string;
}

const faqsList: FaqItem[] = [
  {
    id: 1,
    category: 'Orders',
    q: 'How do I place an order on Vendora?',
    a: 'Simply browse products, click "Add to Cart", and proceed to checkout. Enter your shipping address and payment info, then click "Pay Now" to confirm.',
  },
  {
    id: 2,
    category: 'Orders',
    q: 'Where can I see my order history and receipts?',
    a: 'Navigate to "My Orders" from the header user dropdown menu to view all past orders, receipt summaries, and item tracking numbers.',
  },
  {
    id: 3,
    category: 'Shipping',
    q: 'How long does shipping usually take?',
    a: 'Standard shipping takes 3 to 5 business days depending on your delivery address. Tracking info is updated in real time.',
  },
  {
    id: 4,
    category: 'Shipping',
    q: 'What is the standard shipping fee?',
    a: 'We offer a flat shipping rate of $10.00 per order, with free shipping promotions available during promotional events.',
  },
  {
    id: 5,
    category: 'Sellers',
    q: 'How do I register as a merchant vendor?',
    a: 'Click "Become a Vendor" in the header or footer menu and submit your store details. Approval is completed within 24 to 48 hours.',
  },
  {
    id: 6,
    category: 'Account',
    q: 'How do I change my password or profile info?',
    a: 'Log into your account, click on your profile avatar in the top right header, and access your profile settings.',
  },
];

export const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredFaqs = useMemo(() => {
    return faqsList.filter((item) => {
      const matchesSearch =
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ── Hero Search Section ───────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <HelpCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-white">How Can We Help?</h1>
            <p className="text-xs sm:text-sm text-slate-400">Search answers, shipping guides, and common questions.</p>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. shipping, returns, payment)..."
              className="w-full bg-[#060913] border border-slate-700 focus:border-purple-500 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* ── Category Filter Pills ──────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['All', 'Orders', 'Shipping', 'Sellers', 'Account'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                  : 'bg-[#0E1524] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── FAQ Accordions ────────────────────────────────────────────── */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
              No matching help articles found. Try searching with different keywords.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-[#0E1524] border rounded-2xl overflow-hidden transition-all ${
                    isOpen ? 'border-purple-500/40' : 'border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md uppercase">
                        {faq.category}
                      </span>
                      <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                        {faq.q}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-800/60">
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Direct Support Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
          <div className="bg-[#0E1524] border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Still need assistance?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Send a message to our support team.</p>
              <Link to="/contact" className="text-xs font-bold text-purple-400 hover:underline mt-1 inline-block">
                Contact Support →
              </Link>
            </div>
          </div>

          <div className="bg-[#0E1524] border border-slate-800 p-6 rounded-3xl flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Selling on Vendora?</h3>
              <p className="text-xs text-slate-400 mt-0.5">Explore seller docs and merchant tools.</p>
              <Link to="/vendor-register" className="text-xs font-bold text-emerald-400 hover:underline mt-1 inline-block">
                Vendor Hub →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
