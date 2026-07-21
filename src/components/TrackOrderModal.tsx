import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Truck, Calendar, Check } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [orderId, setOrderId] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Please enter a valid Order ID.');
      return;
    }
    setError('');
    setIsLocating(true);

    // Simulate 1.5 seconds delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLocating(false);
    setShowStatus(true);
  };

  const handleClose = () => {
    // Reset state and close
    setOrderId('');
    setShowStatus(false);
    setIsLocating(false);
    setError('');
    onClose();
  };

  const steps = [
    { label: 'Ordered', status: 'completed', date: 'July 14, 2026' },
    { label: 'Shipped', status: 'completed', date: 'July 15, 2026' },
    { label: 'Out for Delivery (Current)', status: 'current', date: 'Today, 9:30 AM' },
    { label: 'Delivered', status: 'pending', date: 'Est. Tomorrow' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      {/* Modal Card */}
      <div className="w-full max-w-md bg-[#151C2C] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-indigo-400" />
            <span>Track Your Package</span>
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close tracking modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!showStatus ? (
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="orderId" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Enter your Order ID (e.g., #12345)
                </label>
                <input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g., #12345"
                  disabled={isLocating}
                  className="w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700"
                />
                {error && (
                  <p className="text-xs text-rose-400 font-medium animate-in fade-in duration-200">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLocating || !orderId.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Locating package...</span>
                  </>
                ) : (
                  <span>Track Package</span>
                )}
              </button>
            </form>
          ) : (
            /* Success State: shipping tracker UI */
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <Truck className="h-4 w-4 text-emerald-400" />
                    <span>Out for Delivery</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your package with ID <span className="font-semibold text-slate-350">{orderId}</span> is on the way.
                  </p>
                </div>
              </div>

              {/* Simple progress stepper */}
              <div className="relative pl-6 space-y-6 border-l border-slate-800 ml-3">
                {steps.map((stepItem) => {
                  const isCompleted = stepItem.status === 'completed';
                  const isCurrent = stepItem.status === 'current';

                  return (
                    <div key={stepItem.label} className="relative">
                      {/* Step Indicator Dot */}
                      <span className={`absolute -left-9 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : isCurrent
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : isCurrent ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                        )}
                      </span>

                      {/* Step Details */}
                      <div>
                        <span className={`text-xs font-bold ${
                          isCompleted ? 'text-slate-300' : isCurrent ? 'text-indigo-400' : 'text-slate-500'
                        }`}>
                          {stepItem.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{stepItem.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Done button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm text-center"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
