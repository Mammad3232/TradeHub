import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  setCurrentLocation: (loc: string) => void;
}

const countries = [
  'Azerbaijan',
  'United States',
  'United Kingdom',
  'Germany',
  'Turkey',
  'Canada',
  'Australia',
  'Japan',
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  setCurrentLocation,
}) => {
  const [tempLocation, setTempLocation] = useState(currentLocation);
  const [zipCode, setZipCode] = useState('');

  // Reset tempLocation to current location whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setTempLocation(currentLocation);
      setZipCode('');
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  const handleZipApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim()) {
      setTempLocation(`US (Zip: ${zipCode.trim()})`);
    }
  };

  const handleDone = () => {
    setCurrentLocation(tempLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 text-left">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/40 border-b border-slate-850 flex justify-between items-center">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <span>Choose your location</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            Delivery options and delivery speeds may vary for different regions or zip codes.
          </p>

          {/* Zip Code Apply Form */}
          <form onSubmit={handleZipApply} className="space-y-2">
            <label htmlFor="modal-zip" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Enter a US Zip Code
            </label>
            <div className="flex gap-2">
              <input
                id="modal-zip"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 10001"
                className="flex-grow bg-slate-950 text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-750 active:scale-95 transition-all"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="bg-slate-900 px-3 text-slate-500 font-bold uppercase tracking-wider">or select country</span>
            </div>
          </div>

          {/* Country Dropdown */}
          <div className="space-y-1.5">
            <label htmlFor="modal-country" className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Ship outside the US
            </label>
            <select
              id="modal-country"
              value={tempLocation.startsWith('US (Zip:') ? 'United States' : tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition-colors"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Selected Preview */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-400">Selected destination:</span>
            <span className="font-bold text-amber-500">{tempLocation}</span>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-850 flex justify-end">
            <button
              onClick={handleDone}
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-[.98]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
