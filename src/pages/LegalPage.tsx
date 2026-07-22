import React from 'react';
import { ShieldCheck, FileText, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  type: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms of Service';
  const subtitle = isPrivacy
    ? 'How we collect, protect, and use your personal information.'
    : 'Rules, guidelines, and terms governing your use of Vendora.';

  const lastUpdated = 'July 22, 2026';

  const sections = isPrivacy
    ? [
        {
          id: 'collection',
          title: '1. Information We Collect',
          content:
            'We collect information you provide directly to us when creating an account, making a purchase, subscribing to newsletters, or communicating with support. This includes your name, email address, shipping address, payment information, and transaction history.',
        },
        {
          id: 'usage',
          title: '2. How We Use Your Information',
          content:
            'We use personal information to process transactions, fulfill orders, send order updates, prevent fraudulent activities, provide customer support, and improve platform functionality. We do not sell your personal data to third-party advertisers.',
        },
        {
          id: 'sharing',
          title: '3. Data Sharing & Security',
          content:
            'Your data is shared only with verified payment processors and shipping fulfillment partners necessary to deliver your purchases. All data transfers are protected with 256-bit SSL encryption and strict access controls.',
        },
        {
          id: 'cookies',
          title: '4. Cookies & Analytics',
          content:
            'We use cookies to maintain active login sessions, remember cart contents, and analyze site performance. You can manage or disable cookie preferences through your browser settings.',
        },
      ]
    : [
        {
          id: 'acceptance',
          title: '1. Acceptance of Terms',
          content:
            'By accessing or using the Vendora marketplace platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue using our services immediately.',
        },
        {
          id: 'user-accounts',
          title: '2. User Accounts & Security',
          content:
            'You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account. You must notify Vendora immediately of any unauthorized access.',
        },
        {
          id: 'merchant-rules',
          title: '3. Merchant & Seller Obligations',
          content:
            'Vendors listing products on Vendora must ensure all goods are authentic, comply with consumer protection laws, and fulfill orders within published shipping windows. Counterfeit goods result in immediate account termination.',
        },
        {
          id: 'payments-refunds',
          title: '4. Payments, Escrow & Refunds',
          content:
            'All store checkouts are processed securely. Payments may be held in temporary escrow until parcel delivery confirmation. Refunds are governed by our global 30-day return policy.',
        },
      ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              {isPrivacy ? <Lock className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{title}</h1>
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Official Legal Document</span>
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* ── Document Body ────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="space-y-3 border-b border-slate-800/60 pb-6 last:border-b-0 last:pb-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{section.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-6">
                {section.content}
              </p>
            </div>
          ))}

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 text-center">
            If you have questions regarding these legal terms, please reach out to our team at{' '}
            <a href="mailto:privacy@vendora.store" className="text-purple-400 hover:underline">
              privacy@vendora.store
            </a>.
          </div>
        </div>

      </div>
    </div>
  );
};
