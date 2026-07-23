import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { createOrder } from '../services/orderService';

interface FormData {
  fullName: string;
  addressLine1: string;
  city: string;
  postalCode: string;
}

interface FormErrors {
  fullName?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
}

interface PaymentData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

interface PaymentErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
}

export const Checkout: React.FC = () => {
  const { cartItems, clearCart } = useShop();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const navigate = useNavigate();

  // ── Shipping Form State ──────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    addressLine1: '',
    city: '',
    postalCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [shaking, setShaking] = useState(false);

  // ── Payment Form State ───────────────────────────────────────
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Handle Shipping Input Changes ────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // ── Handle Payment Input Changes ─────────────────────────────
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // Restrict to numbers only
      const digits = value.replace(/\D/g, '');
      const truncated = digits.slice(0, 16);
      // Format: 1234 5678 9012 3456
      const formatted = truncated.match(/.{1,4}/g)?.join(' ') || '';
      setPaymentData((prev) => ({ ...prev, cardNumber: formatted }));
      if (paymentErrors.cardNumber) {
        setPaymentErrors((prev) => ({ ...prev, cardNumber: undefined }));
      }
    } else if (name === 'cardholderName') {
      // Only letters and spaces
      const clean = value.replace(/[^a-zA-Z\s]/g, '');
      setPaymentData((prev) => ({ ...prev, cardholderName: clean }));
      if (paymentErrors.cardholderName) {
        setPaymentErrors((prev) => ({ ...prev, cardholderName: undefined }));
      }
    } else if (name === 'expiryDate') {
      // Restrict to numbers only
      const digits = value.replace(/\D/g, '');
      const truncated = digits.slice(0, 4);
      // Format: MM / YY
      let formatted = truncated;
      if (truncated.length > 2) {
        formatted = `${truncated.slice(0, 2)} / ${truncated.slice(2)}`;
      }
      setPaymentData((prev) => ({ ...prev, expiryDate: formatted }));
      if (paymentErrors.expiryDate) {
        setPaymentErrors((prev) => ({ ...prev, expiryDate: undefined }));
      }
    } else if (name === 'cvv') {
      // Restrict to numbers only
      const digits = value.replace(/\D/g, '');
      const truncated = digits.slice(0, 3);
      setPaymentData((prev) => ({ ...prev, cvv: truncated }));
      if (paymentErrors.cvv) {
        setPaymentErrors((prev) => ({ ...prev, cvv: undefined }));
      }
    }
  };

  // ── Validation logic: Shipping Form ──────────────────────────
  const validateShippingForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = formData.fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = 'Full Name is required.';
    } else if (trimmedName.length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters long.';
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      newErrors.fullName = 'Please enter a valid full name using only letters and spaces.';
    }

    const trimmedAddress = formData.addressLine1.trim();
    if (!trimmedAddress) {
      newErrors.addressLine1 = 'Address Line 1 is required.';
    } else if (trimmedAddress.length < 5) {
      newErrors.addressLine1 = 'Address must be at least 5 characters long.';
    }

    const trimmedCity = formData.city.trim();
    if (!trimmedCity) {
      newErrors.city = 'City is required.';
    } else if (trimmedCity.length < 2) {
      newErrors.city = 'City must be at least 2 characters long.';
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedCity)) {
      newErrors.city = 'City must contain only letters.';
    }

    const trimmedPostal = formData.postalCode.trim();
    if (!trimmedPostal) {
      newErrors.postalCode = 'Postal Code is required.';
    } else if (!/^[a-zA-Z0-9]{4,6}$/.test(trimmedPostal)) {
      newErrors.postalCode = 'Postal Code must be exactly 4 to 6 alphanumeric characters.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return false;
    }

    return true;
  };

  // ── Validation logic: Payment Form ───────────────────────────
  const validatePaymentForm = (): boolean => {
    const newErrors: PaymentErrors = {};

    // 1. CARD NUMBER: exactly 16 digits (excluding spaces)
    const cleanCard = paymentData.cardNumber.replace(/\s/g, '');
    if (!cleanCard) {
      newErrors.cardNumber = 'Card Number is required.';
    } else if (cleanCard.length !== 16) {
      newErrors.cardNumber = 'Card Number must be exactly 16 digits.';
    }

    // 2. CARDHOLDER NAME: at least 3 characters
    const trimmedHolder = paymentData.cardholderName.trim();
    if (!trimmedHolder) {
      newErrors.cardholderName = 'Cardholder Name is required.';
    } else if (trimmedHolder.length < 3) {
      newErrors.cardholderName = 'Cardholder Name must be at least 3 characters.';
    }

    // 3. EXPIRY DATE: valid MM / YY month (01-12)
    const cleanExpiry = paymentData.expiryDate.replace(/\s|\//g, '');
    if (!paymentData.expiryDate) {
      newErrors.expiryDate = 'Expiry Date is required.';
    } else if (cleanExpiry.length !== 4) {
      newErrors.expiryDate = 'Expiry Date must be in MM / YY format.';
    } else {
      const month = parseInt(cleanExpiry.slice(0, 2), 10);
      if (month < 1 || month > 12) {
        newErrors.expiryDate = 'Please enter a valid month (01-12).';
      }
    }

    // 4. CVV: exactly 3 digits
    if (!paymentData.cvv) {
      newErrors.cvv = 'CVV is required.';
    } else if (paymentData.cvv.length !== 3) {
      newErrors.cvv = 'CVV must be exactly 3 digits.';
    }

    setPaymentErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return false;
    }

    return true;
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaymentForm()) return;

    setIsProcessing(true);

    try {
      if (cartItems.length > 0) {
        const orderPayload = cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        }));
        await createOrder(orderPayload);
        clearCart();
      }
      setIsProcessing(false);
      setStep('success');
      setTimeout(() => navigate('/my-orders'), 2500);
    } catch (err: any) {
      setIsProcessing(false);
      alert(err.message || 'Failed to place order. Please try again.');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-[60svh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-full animate-bounce">
          <CheckCircle className="h-14 w-14 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white">Order Placed!</h2>
        <p className="text-slate-400">Redirecting you to your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout</h1>

        {/* Step indicators */}
        <div className="flex items-center space-x-4 text-sm bg-slate-900/40 p-4 rounded-xl border border-slate-800/60">
          {['shipping', 'payment'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center space-x-2 font-medium ${step === s ? 'text-indigo-400' : 'text-slate-500'}`}>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs border ${
                  step === s 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'border-slate-700 text-slate-500'
                }`}>
                  {i + 1}
                </span>
                <span className="capitalize">{s}</span>
              </div>
              {i === 0 && <div className="flex-1 h-px bg-slate-800"></div>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* ── SHIPPING ADDRESS STEP ────────────────────────────────── */}
          {step === 'shipping' && (
            <form 
              onSubmit={handleContinueToPayment}
              noValidate
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 lg:col-span-2 max-w-xl transition-all duration-300 ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
            >
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
                <MapPin className="h-5 w-5" />
                <h2 className="font-bold text-white text-lg">Shipping Address</h2>
              </div>

              {/* Full Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      errors.fullName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Address Line 1 Field */}
              <div className="space-y-1.5">
                <label htmlFor="addressLine1" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Address Line 1
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="addressLine1"
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="Enter address line 1"
                    className={`w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      errors.addressLine1
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.addressLine1 && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City Field */}
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className={`w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      errors.city
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.city && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Postal Code Field */}
              <div className="space-y-1.5">
                <label htmlFor="postalCode" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Postal Code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                  <input
                    id="postalCode"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter postal code"
                    className={`w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border transition-all ${
                      errors.postalCode
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`}
                  />
                </div>
                {errors.postalCode && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-[0.99]"
              >
                Continue to Payment
              </button>
            </form>
          )}

          {/* ── PAYMENT STEP ────────────────────────────────────────── */}
          {step === 'payment' && (
            <form 
              onSubmit={handlePlaceOrder}
              noValidate
              className={`bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 lg:col-span-2 max-w-xl transition-all duration-300 ${
                shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
              }`}
              style={shaking ? { animation: 'shake 0.5s ease-in-out' } : {}}
            >
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
                <CreditCard className="h-5 w-5" />
                <h2 className="font-bold text-white text-lg">Payment Details</h2>
              </div>

              {/* Card Number Field */}
              <div className="space-y-1.5">
                <label htmlFor="cardNumber" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Card Number
                </label>
                <input 
                  id="cardNumber"
                  type="text" 
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={isProcessing}
                  className={`w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border transition-all ${
                    paymentErrors.cardNumber
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`} 
                />
                {paymentErrors.cardNumber && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {paymentErrors.cardNumber}
                  </p>
                )}
              </div>

              {/* Cardholder Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="cardholderName" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Cardholder Name
                </label>
                <input 
                  id="cardholderName"
                  type="text" 
                  name="cardholderName"
                  value={paymentData.cardholderName}
                  onChange={handlePaymentChange}
                  placeholder="John Doe"
                  disabled={isProcessing}
                  className={`w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border transition-all ${
                    paymentErrors.cardholderName
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`} 
                />
                {paymentErrors.cardholderName && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {paymentErrors.cardholderName}
                  </p>
                )}
              </div>

              {/* Two Column Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date Field */}
                <div className="space-y-1.5">
                  <label htmlFor="expiryDate" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Expiry Date
                  </label>
                  <input 
                    id="expiryDate"
                    type="text" 
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handlePaymentChange}
                    placeholder="MM / YY"
                    maxLength={7}
                    disabled={isProcessing}
                    className={`w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border transition-all ${
                      paymentErrors.expiryDate
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`} 
                  />
                  {paymentErrors.expiryDate && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {paymentErrors.expiryDate}
                    </p>
                  )}
                </div>

                {/* CVV Field */}
                <div className="space-y-1.5">
                  <label htmlFor="cvv" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    CVV
                  </label>
                  <input 
                    id="cvv"
                    type="password" 
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    placeholder="•••"
                    maxLength={3}
                    disabled={isProcessing}
                    className={`w-full bg-slate-950 text-slate-100 text-sm px-4 py-3 rounded-xl border transition-all ${
                      paymentErrors.cvv
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    }`} 
                  />
                  {paymentErrors.cvv && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {paymentErrors.cvv}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep('shipping')}
                  disabled={isProcessing}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Back to Address
                </button>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* CSS Shake Keyframes */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};
