import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

const jobsList: JobPosting[] = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer (React/Node)',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'Lead high-throughput checkout and microservices development for thousands of active merchants.',
  },
  {
    id: 2,
    title: 'Senior Product Designer (UI/UX)',
    department: 'Design',
    location: 'New York, NY / Remote',
    type: 'Full-time',
    description: 'Craft beautiful, accessible e-commerce storefront experiences and seller dashboard analytics.',
  },
  {
    id: 3,
    title: 'Vendor Growth & Partner Specialist',
    department: 'Operations',
    location: 'London, UK / Remote',
    type: 'Full-time',
    description: 'Help onboard, empower, and scale independent brands joining the Vendora ecosystem.',
  },
  {
    id: 4,
    title: 'DevOps & Cloud Infrastructure Lead',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Architect scalable Kubernetes clusters and high-availability database replication.',
  },
];

export const CareersPage: React.FC = () => {
  const { pushToast } = useShop();
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const closeModal = () => {
    setSelectedJob(null);
    setIsSubmitting(false);
    setIsSubmitted(false);
    setFullName('');
    setEmail('');
    setPortfolioUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);

    // Simulate fake API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      pushToast(`Application submitted for "${selectedJob.title}"!`, 'info');
      setFullName('');
      setEmail('');
      setPortfolioUrl('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-extrabold uppercase tracking-wider mx-auto">
            <Briefcase className="w-4 h-4" />
            <span>Join Our Team</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Build the Future of Independent Commerce
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We are a remote-first team of engineers, designers, and e-commerce strategists building tools for creator-first retail worldwide.
          </p>
        </div>

        {/* ── Open Positions List ───────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-white">Open Roles ({jobsList.length})</h2>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Remote-First Company</span>
          </div>

          <div className="space-y-4">
            {jobsList.map((job) => (
              <div
                key={job.id}
                className="bg-[#0E1524] border border-slate-800 hover:border-purple-500/40 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase">
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">{job.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedJob(job)}
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-center"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Quick Apply Modal Overlay ────────────────────────────────────── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  {selectedJob.department} Application
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedJob.location} • {selectedJob.type}</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-colors disabled:opacity-50"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Success State vs Form View */}
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-white">Application Received!</h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Success! Your application has been received. Our team will review your details and reach out soon.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Portfolio / LinkedIn URL</label>
                  <input
                    type="url"
                    required
                    disabled={isSubmitting}
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/janesmith"
                    className="w-full bg-[#060913] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
