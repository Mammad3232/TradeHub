import React, { useEffect } from 'react';
import { X, Lock, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'terms' | 'privacy';
  onClose: () => void;
  onAccept?: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  type,
  onClose,
  onAccept,
}) => {
  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const subtitle = isPrivacy
    ? 'How we collect, protect, and handle your personal data on TradeHub.'
    : 'Guidelines, user obligations, and terms governing your use of TradeHub.';

  const privacySections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content:
        'TradeHub collects information you provide directly during account registration, order placement, or vendor store creation. This includes your name, email address, delivery shipping address, billing contact details, and encrypted transaction history.',
    },
    {
      id: 'usage',
      title: '2. How We Use Your Data',
      content:
        'Your information is strictly utilized to process checkout orders, send dispatch tracking alerts, manage buyer-seller communications, prevent fraudulent transactions, and maintain platform security. We never sell or lease your personal data to external marketing agencies.',
    },
    {
      id: 'security',
      title: '3. Data Security & Encryption',
      content:
        'All communications between your browser and TradeHub are encrypted using industry-standard 256-bit TLS/SSL protocols. Sensitive authentication credentials and payment data are protected using cryptographic hashing and tokenized payment gateways.',
    },
    {
      id: 'cookies',
      title: '4. Cookies & Session Management',
      content:
        'We use essential session storage cookies to maintain active login sessions, preserve cart items, and save user interface preferences. You can adjust your browser cookie settings at any time, though disabling cookies may affect some platform features.',
    },
    {
      id: 'rights',
      title: '5. Your Rights & Profile Data',
      content:
        'You retain full ownership of your personal information. You can access, update, or request the erasure of your profile and transaction records by visiting your Account Settings or contacting TradeHub Support.',
    },
  ];

  const termsSections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content:
        'By creating an account, browsing products, or opening a vendor store on TradeHub, you agree to comply with and be bound by these Terms of Service. If you disagree with any portion of these terms, you must discontinue using our services.',
    },
    {
      id: 'accounts',
      title: '2. Account Security & Responsibilities',
      content:
        'You are solely responsible for maintaining the confidentiality of your credentials and for all activities under your account. You agree to notify TradeHub immediately of any suspected unauthorized access or security breaches.',
    },
    {
      id: 'merchant-rules',
      title: '3. Merchant & Buyer Guidelines',
      content:
        'Vendors agree to list authentic products, accurately represent inventory, and fulfill orders promptly. Buyers agree to complete authorized payments. Listing counterfeit, prohibited, or fraudulent items will result in immediate store termination and asset forfeiture.',
    },
    {
      id: 'payments-escrow',
      title: '4. Payments, Escrow & Returns',
      content:
        'Transactions are processed through verified gateways. Payments may be held in protective buyer-seller escrow until order delivery is confirmed. Returns and refunds are governed by TradeHub’s standard 30-day Buyer Guarantee.',
    },
    {
      id: 'liability',
      title: '5. Limitation of Liability',
      content:
        'TradeHub provides a digital marketplace platform "as is". While we enforce strict vendor verification and security controls, TradeHub is not liable for indirect or consequential damages resulting from third-party seller delays or service interruptions.',
    },
  ];

  const sections = isPrivacy ? privacySections : termsSections;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-[#0E1524] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-[#0B1120] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-2xl border ${
              isPrivacy
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}>
              {isPrivacy ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{title}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">{subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable Modal Content ────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <p className="text-xs text-purple-200/90 leading-relaxed font-medium">
              Official legal agreement effective as of <span className="font-bold text-white">July 2026</span>. Please review the terms carefully.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.id} className="space-y-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {section.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* ── Modal Footer Actions ────────────────────────────────────── */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-[#0B1120] flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-semibold hidden sm:inline">
            TradeHub Governance & Security
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAccept?.();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
