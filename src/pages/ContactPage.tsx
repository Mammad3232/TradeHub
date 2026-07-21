import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FaqItem {
  q: string;
  a: string;
}

const contactCards = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'support@vendora.store',
    sub: 'Replies within 2–4 business hours',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+1 (800) 883-4920',
    sub: 'Mon – Fri, 9 AM – 6 PM (EST)',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: MapPin,
    label: 'Visit Us',
    value: '12 Commerce Ave, Suite 400',
    sub: 'New York, NY 10001, USA',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

const faqs: FaqItem[] = [
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you will receive a tracking link via email. You can also log in and navigate to "My Orders" → "Track Order" for a live step-by-step timeline of your parcel\'s journey.',
  },
  {
    q: 'What is the return & refund policy?',
    a: 'We offer a 30-day hassle-free return window for most items. Simply open your order on the "My Orders" page, click "Request Return", and follow the instructions. Refunds are processed within 3–5 business days once the item is received.',
  },
  {
    q: 'How do I become a seller on Vendora?',
    a: 'Visit our "Become a Vendor" page and complete the seller application. Once approved (usually within 48 hours), you will gain access to your full vendor dashboard to list products and manage orders.',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`border rounded-xl overflow-hidden transition-all ${
              isOpen ? 'border-purple-500/40 bg-[#111827]' : 'border-slate-800 bg-[#0E1524]'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer group"
            >
              <span className={`text-sm font-bold transition-colors ${isOpen ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                {item.q}
              </span>
              {isOpen
                ? <ChevronUp className="w-4 h-4 text-purple-400 flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 flex-shrink-0 transition-colors" />
              }
            </button>
            {isOpen && (
              <div className="px-4 pb-4">
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  return (
    <div className="bg-[#060913] min-h-screen text-slate-200 pb-24 font-sans">

      {/* ── Hero Banner ── */}
      <div className="relative bg-[#0B1120] border-b border-slate-800/70 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-purple-600/8 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Support Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Our team is ready to assist you with any questions, order issues, or vendor inquiries. Reach us via the form below or through any of our direct channels.
          </p>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ────────────── LEFT COLUMN ────────────── */}
          <div className="space-y-8">

            {/* Contact Cards */}
            <div>
              <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>Contact Channels</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {contactCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="flex items-start gap-4 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all group"
                    >
                      <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl border ${card.bg} ${card.border}`}>
                        <Icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{card.label}</p>
                        <p className="text-sm font-bold text-white truncate">{card.value}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{card.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAQ Accordion */}
            <div>
              <h2 className="text-base font-extrabold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Frequently Asked Questions</span>
              </h2>
              <FaqAccordion items={faqs} />
            </div>

          </div>

          {/* ────────────── RIGHT COLUMN ────────────── */}
          <div className="sticky top-8">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">

              {/* Glow accent */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Send a Message</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Fill out the form and we will respond within one business day.
                  </p>
                </div>

                {submitted ? (
                  /* ── Success state ── */
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-extrabold text-white">Message Sent!</h3>
                    <p className="text-sm text-slate-400 max-w-xs">
                      Thanks for reaching out. Our team will get back to you at{' '}
                      <span className="text-purple-400 font-semibold">{formState.email}</span> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSubmitted(false); setFormState({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-2 text-xs text-slate-500 hover:text-white font-semibold transition-colors cursor-pointer"
                    >
                      Send another message →
                    </button>
                  </div>
                ) : (
                  /* ── Form ── */
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name & Email row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="c-name"
                          name="name"
                          type="text"
                          required
                          value={formState.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all font-medium"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="c-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Email Address <span className="text-rose-400">*</span>
                        </label>
                        <input
                          id="c-email"
                          name="email"
                          type="email"
                          required
                          value={formState.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-subject" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Subject <span className="text-rose-400">*</span>
                      </label>
                      <select
                        id="c-subject"
                        name="subject"
                        required
                        value={formState.subject}
                        onChange={handleChange}
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all font-medium cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Select a topic…</option>
                        <option value="order">Order & Shipping Issue</option>
                        <option value="return">Return or Refund Request</option>
                        <option value="vendor">Vendor / Seller Inquiry</option>
                        <option value="technical">Technical / Account Problem</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="c-message" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Message <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        id="c-message"
                        name="message"
                        rows={5}
                        required
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Describe your issue or question in detail…"
                        className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all resize-none font-medium leading-relaxed"
                      />
                      <div className="flex justify-end">
                        <span className="text-[10px] text-slate-600 font-semibold">
                          {formState.message.length} / 1000
                        </span>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-500/25 transition-all active:scale-[.98] cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>

                    <p className="text-center text-[10px] text-slate-600">
                      By submitting, you agree to our{' '}
                      <span className="text-slate-500 font-semibold cursor-pointer hover:text-purple-400 transition-colors">Privacy Policy</span>.
                    </p>

                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
