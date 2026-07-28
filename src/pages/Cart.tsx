import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  User,
  Mail,
  MapPin,
  Calendar,
  Lock,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useCurrency } from '../context/CurrencyContext';
import { createOrder } from '../services/orderService';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal, pushToast } = useShop();
  const { formatPrice, t } = useCurrency();

  // ── Shipping Form State ──────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [address, setAddress]   = useState('');

  // ── Payment Form State ───────────────────────────────────────────────────
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv]               = useState('');

  // ── UX & Processing States ───────────────────────────────────────────────
  const [formError, setFormError]       = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Calculations ─────────────────────────────────────────────────────────
  const shippingFee = cartItems.length > 0 ? 10.0 : 0.0;
  const finalTotal  = cartTotal + shippingFee;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setExpiryDate(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setExpiryDate(raw);
    }
  };

  // Format CVV (3 digits max)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvv(raw);
  };

  // ── Payment Submission Handler ──────────────────────────────────────────
  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim() || !address.trim()) {
      setFormError('Please fill out all shipping information fields.');
      return;
    }

    if (!cardHolder.trim() || !cardNumber.trim() || !expiryDate.trim() || !cvv.trim()) {
      setFormError('Please complete all payment card details.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Card number must be 16 digits.');
      return;
    }

    if (cvv.length < 3) {
      setFormError('CVV must be 3 digits.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Your shopping cart is currently empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // Check authentication before attempting the order
      const token = localStorage.getItem('tradehub_token');
      if (!token) {
        setIsProcessing(false);
        setFormError('You must be logged in to place an order. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const orderPayload = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      console.log('[Cart] Submitting order to POST /api/orders', orderPayload);
      console.log('[Cart] JWT token present:', !!token);

      const result = await createOrder(orderPayload);
      console.log('[Cart] Order created successfully:', result);

      clearCart();
      pushToast('Payment Successful! Order Confirmed.', 'cart');
      setIsProcessing(false);
      navigate('/my-orders');
    } catch (err: any) {
      setIsProcessing(false);
      console.error('[Cart] Order submission failed:', err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to place order. Please try again.';
      setFormError(`Error: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-extrabold uppercase tracking-widest mb-1">
              <ShoppingCart className="w-4 h-4" />
              <span>Checkout Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Shopping Cart &amp; Checkout
            </h1>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* ── Empty Cart State ───────────────────────────────────────────── */}
        {cartItems.length === 0 ? (
          <div className="bg-[#0E1524] border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6 my-12 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">{t('cart.emptyMessage')}</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Before proceeding to checkout, please add items to your shopping cart.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-xl shadow-purple-600/30"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('cart.browseProducts')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── Main Two-Column Layout ───────────────────────────────────── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* ════════ LEFT COLUMN: Cart Items List (7 cols) ════════ */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Cart Items Review</span>
                  <span className="text-xs font-black bg-purple-600/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {cartItems.filter(Boolean).map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#0E1524] border border-slate-800 hover:border-slate-700 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-lg group"
                  >
                    {/* Thumbnail + Title/Brand */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0">
                        <img
                          src={item?.image || ''}
                          alt={item?.title || 'Product'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                          {item?.brand || 'Vendora'}
                        </p>
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                          {item?.title || 'Product'}
                        </h3>
                        <p className="text-sm font-black text-purple-400 mt-1">
                          {formatPrice(item?.price ?? 0)}
                        </p>
                      </div>
                    </div>

                    {/* Qty Controls + Subtotal + Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                      {/* Qty Selector */}
                      <div className="flex items-center gap-1 bg-[#060913] border border-slate-800 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, (item?.quantity ?? 1) - 1)}
                          disabled={(item?.quantity ?? 1) <= 1}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item?.stock}
                          value={item?.quantity ?? 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) {
                              updateQty(item.id, val);
                            }
                          }}
                          onBlur={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) val = 1;
                            if (item?.stock !== undefined && item?.stock !== null && val > item.stock) {
                              val = item.stock;
                            }
                            updateQty(item.id, val);
                          }}
                          className="w-10 text-center text-sm font-bold text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500 rounded border border-slate-800/80 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, (item?.quantity ?? 1) + 1)}
                          disabled={item?.stock !== undefined && item?.stock !== null && (item?.quantity ?? 1) >= item.stock}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-black text-white">
                          {formatPrice((item?.price ?? 0) * (item?.quantity ?? 1))}
                        </span>
                      </div>

                      {/* Trash Button */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════════ RIGHT COLUMN: Checkout & Payment Form (5 cols) ════════ */}
            <div className="lg:col-span-5">
              <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl p-8 shadow-[0_0_40px_-15px_rgba(79,70,229,0.15)] sticky top-6">
                
                <form onSubmit={handlePayNow} className="space-y-5">
                  
                  {/* Header */}
                  <div className="border-b border-slate-800/80 pb-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-400" />
                      <span>Checkout &amp; Payment</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      256-bit encrypted secure transaction portal.
                    </p>
                  </div>

                  {/* ── SECTION 1: SHIPPING DETAILS ── */}
                  <div>
                    <h3 className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-4 mt-8 first:mt-0 flex items-center gap-2">
                      <span>Shipping Details</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Delivery Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Commerce St, New York, NY"
                            className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── SECTION 2: PAYMENT METHOD ── */}
                  <div>
                    <h3 className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase mb-4 mt-8 first:mt-0 flex items-center gap-2">
                      <span>Payment Method</span>
                    </h3>

                    <div className="space-y-4">
                      {/* Cardholder Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Cardholder Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                          />
                        </div>
                      </div>

                      {/* Card Number */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                          Card Number
                        </label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="XXXX XXXX XXXX XXXX"
                            className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white font-mono tracking-wider placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                          />
                        </div>
                      </div>

                      {/* Expiry Date & CVV Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                            Expiry Date
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                              type="text"
                              required
                              value={expiryDate}
                              onChange={handleExpiryChange}
                              placeholder="MM/YY"
                              className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                            CVV Code
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            <input
                              type="password"
                              required
                              value={cvv}
                              onChange={handleCvvChange}
                              placeholder="3 digits"
                              className="w-full bg-[#131B2C] border border-slate-700/60 rounded-xl px-4 py-3.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pl-11"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Error Banner */}
                  {formError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold">
                      {formError}
                    </div>
                  )}

                  {/* ── SECTION 3: ORDER SUMMARY ── */}
                  <div className="bg-[#131B2C]/50 rounded-2xl p-5 mt-6 border border-slate-800/50">
                    <div className="flex justify-between text-sm text-slate-400 mb-3">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">{formatPrice(cartTotal)}</span>
                    </div>

                    <div className="flex justify-between text-sm text-slate-400 mb-3">
                      <span>Shipping Fee</span>
                      <span className="font-semibold text-white">{formatPrice(shippingFee)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold text-white mt-4 pt-4 border-t border-slate-800">
                      <span>Total</span>
                      <span className="text-xl font-bold text-indigo-400">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>

                  {/* Stripe-Grade Pay Now Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-4 mt-6 transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay Now - {formatPrice(finalTotal)}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Protected by 256-Bit SSL Encryption</span>
                  </div>

                </form>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
