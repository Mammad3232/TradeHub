import React, { useState } from 'react';
import { Store, User, FileText, Mail, ChevronDown, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { LegalModal } from '../components/LegalModal';

interface Country {
  flagUrl: string;
  code: string;
  dialCode: string;
  name: string;
}

export const BecomeVendorPage: React.FC = () => {
  const [formData, setFormData] = useState({
    storeName: '',
    fullName: '',
    taxId: '',
    email: '',
    phone: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /* ── Legal Modal State ────────────────────────────────────── */
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (type: 'terms' | 'privacy', e: React.MouseEvent) => {
    e.preventDefault();
    setModalType(type);
    setIsLegalModalOpen(true);
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>({
    flagUrl: 'https://flagcdn.com/w20/az.png',
    code: 'AZ',
    dialCode: '+994',
    name: 'Azerbaijan'
  });

  const countries: Country[] = [
    { flagUrl: 'https://flagcdn.com/w20/az.png', code: 'AZ', dialCode: '+994', name: 'Azerbaijan' },
    { flagUrl: 'https://flagcdn.com/w20/us.png', code: 'EN', dialCode: '+1', name: 'United States' },
    { flagUrl: 'https://flagcdn.com/w20/tr.png', code: 'TR', dialCode: '+90', name: 'Turkey' },
    { flagUrl: 'https://flagcdn.com/w20/gb.png', code: 'UK', dialCode: '+44', name: 'United Kingdom' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // VÖEN üçün yalnız rəqəm daxil edilməsini təmin edirik
    if (name === 'taxId') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData({ ...formData, [name]: numbersOnly });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // İstifadəçi yazdıqca xətanı silirik
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.storeName.length < 3) {
      newErrors.storeName = 'Store name must be at least 3 characters.';
    }
    
    const nameWords = formData.fullName.trim().split(/\s+/).filter(Boolean);
    if (nameWords.length < 2) {
      newErrors.fullName = 'Please enter your full First and Last name.';
    }

    if (formData.taxId.length !== 10) {
      newErrors.taxId = 'VÖEN must be exactly 10 digits.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.phone.length < 7) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the terms and conditions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      // Simulyasiya: 2 saniyə sonra uğurla göndərilir
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 2000);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center px-4 py-20 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-2xl mx-auto bg-[#151C2C] p-10 rounded-2xl border border-slate-800 text-center shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
          <p className="text-slate-400">
            Thank you for applying to be a vendor. Our team will review your details and contact you within 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl mx-auto bg-[#151C2C] p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-8 text-left">
          <Store className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Merchant Application Form</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business / Store Name */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Business / Store Name
            </label>
            <div className={`flex items-center bg-[#0B1120] border ${errors.storeName ? 'border-red-500' : 'border-slate-800'} rounded-lg p-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all`}>
              <Store className="w-5 h-5 text-slate-500 mr-3" />
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder="e.g., TechStore Baku"
                className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-655"
              />
            </div>
            {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
          </div>

          {/* Legal Representative Full Name */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Legal Representative Full Name
            </label>
            <div className={`flex items-center bg-[#0B1120] border ${errors.fullName ? 'border-red-500' : 'border-slate-800'} rounded-lg p-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all`}>
              <User className="w-5 h-5 text-slate-500 mr-3" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="e.g., Malik Mammadov"
                className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-655"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Tax ID / VÖEN Number */}
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Tax ID / VÖEN Number (Exactly 10 digits)
            </label>
            <div className={`flex items-center bg-[#0B1120] border ${errors.taxId ? 'border-red-500' : 'border-slate-800'} rounded-lg p-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all`}>
              <FileText className="w-5 h-5 text-slate-500 mr-3" />
              <input
                type="text"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder="1500000001"
                className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-655 tracking-widest"
              />
            </div>
            {errors.taxId && <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Email */}
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Business Email
              </label>
              <div className={`flex items-center bg-[#0B1120] border ${errors.email ? 'border-red-500' : 'border-slate-800'} rounded-lg p-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all`}>
                <Mail className="w-5 h-5 text-slate-500 mr-3" />
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@example.com"
                  className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-655"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Premium Phone Input with Dropdown */}
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className={`relative flex items-center bg-[#0B1120] border ${errors.phone ? 'border-red-500' : 'border-slate-800'} rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition-all`}>
                
                {/* Left Side: Country Trigger (PRESERVED 100% UNTOUCHED) */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-l-lg transition-colors focus:outline-none cursor-pointer"
                >
                  <img src={selectedCountry.flagUrl} alt={selectedCountry.code} className="w-5 shadow-sm rounded-sm" />
                  <span className="font-semibold text-sm">{selectedCountry.code}</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                {/* Vertical Divider */}
                <div className="w-[1px] h-6 bg-slate-700"></div>

                {/* Right Side: Fully Interactive Number Input */}
                <div className="flex items-center flex-1 px-3 py-3">
                  <span className="text-slate-500 mr-2 text-sm select-none pointer-events-none">{selectedCountry.dialCode}</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="50 123 4567"
                    className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-sm autofill:bg-[#131B2C] autofill:text-white [webkit-text-fill-color:white] [transition:background-color_5000s_ease-in-out_0s]"
                  />
                </div>

                {/* The Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#151C2C] border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-800/40">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left cursor-pointer"
                        >
                          <img src={country.flagUrl} alt={country.code} className="w-5 shadow-sm rounded-sm" />
                          <span className="font-medium text-slate-200">{country.name}</span>
                          <span className="text-slate-500 text-sm ml-auto">{country.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pt-4 text-left">
            <label className={`flex items-center gap-3 cursor-pointer ${errors.agreedToTerms ? 'animate-pulse' : ''}`}>
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-slate-700 bg-[#0B1120] text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <span className={`text-sm ${errors.agreedToTerms ? 'text-red-400 font-medium' : 'text-slate-400'}`}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => openLegalModal('terms', e)}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={(e) => openLegalModal('privacy', e)}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Store Application'
            )}
          </button>

        </form>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <AlertCircle size={14} />
          <p>All registration information is stored securely on encrypted databases.</p>
        </div>
      </div>

      {/* ── Legal Modal ───────────────────────────────────────── */}
      <LegalModal
        isOpen={isLegalModalOpen}
        type={modalType}
        onClose={() => setIsLegalModalOpen(false)}
        onAccept={() => setFormData((prev) => ({ ...prev, agreedToTerms: true }))}
      />
    </div>
  );
};
