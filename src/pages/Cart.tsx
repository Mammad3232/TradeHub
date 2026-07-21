import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Minus,
  Plus,
  Store,
  HelpCircle,
  Package,
  ShieldCheck,
  Lock,
  Gift,
  CheckCircle2,
  XCircle,
  Loader2,
  Tag,
  ArrowLeft,
} from 'lucide-react';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  category: string;
  vendorName: string;
  image: string;
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    title: 'Aether Sound Wave Wireless Headphones',
    price: 299.99,
    quantity: 1,
    category: 'Electronics',
    vendorName: 'Aether Audio Labs',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=70',
  },
  {
    id: 2,
    title: 'Chronos Classic Minimalist Watch',
    price: 189.50,
    quantity: 2,
    category: 'Accessories',
    vendorName: 'Chronos Horology',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=70',
  },
  {
    id: 3,
    title: 'Apex Leather Laptop Backpack',
    price: 120.00,
    quantity: 1,
    category: 'Bags',
    vendorName: 'Apex Goods Co.',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=70',
  },
];

const SHIPPING = 5.00;
const TAX_RATE = 0.10;
const VALID_PROMO = 'HONOR10';
const PROMO_RATE = 0.10;

const categoryColours: Record<string, string> = {
  Electronics: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Accessories: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Bags: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [promoInput, setPromoInput] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [promoMessage, setPromoMessage] = useState('');

  const increaseQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setRemovingId(id);
    setTimeout(() => {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      setRemovingId(null);
    }, 300);
  };

  const applyPromoCode = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoStatus('idle');

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (promoInput.trim().toUpperCase() === VALID_PROMO) {
      setIsPromoApplied(true);
      setPromoStatus('success');
      setPromoMessage(`Discount applied! You saved 10% on your items.`);
    } else {
      setIsPromoApplied(false);
      setPromoStatus('error');
      setPromoMessage(`"${promoInput}" is invalid. Try using code HONOR10.`);
    }
    setPromoLoading(false);
  };

  const removePromo = () => {
    setIsPromoApplied(false);
    setPromoStatus('idle');
    setPromoMessage('');
    setPromoInput('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const promoDiscount = isPromoApplied ? subtotal * PROMO_RATE : 0;
  const discountedSub = subtotal - promoDiscount;
  const tax = discountedSub * TAX_RATE;
  const total = discountedSub + SHIPPING + tax;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center px-4 py-20 gap-6 text-slate-100">
        <div className="w-24 h-24 rounded-3xl bg-[#111827] border border-slate-800 flex items-center justify-center shadow-lg relative">
          <ShoppingCart className="h-10 w-10 text-slate-500 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your shopping cart is empty</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Discover outstanding products, configure your variants, and customize your orders in the Vendora catalog.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-650/20 active:scale-[.98] cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-200 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Navigation back and header banner */}
        <div className="flex flex-col gap-4 text-left mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-450 hover:text-white hover:translate-x-[-2px] transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-purple-400" />
            <span>Back to Products</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="bg-[#111827] border border-slate-800 p-3.5 rounded-2xl flex-shrink-0 shadow-lg text-purple-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>Shopping Cart</span>
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-0.5 rounded-full text-xs font-semibold">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure quantities, evaluate subtotal discounts, and finalize checkout operations.
              </p>
            </div>
          </div>
        </div>

        {/* Two column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Cart Items list (2/3 width) */}
          <div className="lg:col-span-8 w-full space-y-4">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative text-left">
              <div className="divide-y divide-slate-800/80">
                {cartItems.map((item, index) => {
                  const lineTotal = item.price * item.quantity;
                  const categoryBadge = categoryColours[item.category] || 'bg-slate-800 text-slate-350 border-slate-750';
                  const isRemoving = removingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col sm:flex-row gap-5 py-6 items-start sm:items-center justify-between transition-all duration-300 ${
                        index === 0 ? 'pt-0' : ''
                      } ${index === cartItems.length - 1 ? 'pb-0' : ''} ${
                        isRemoving ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'
                      }`}
                    >
                      {/* Thumbnail Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-800/80 bg-[#0E1524] flex items-center justify-center">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow min-w-0 space-y-1.5 text-left">
                        <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${categoryBadge}`}>
                          {item.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug truncate pr-4" title={item.title}>
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-slate-450 text-xs font-semibold">
                          <Store className="h-3.5 w-3.5 text-purple-450" />
                          <span className="text-[11px] text-slate-400">Sold by {item.vendorName}</span>
                        </div>
                      </div>

                      {/* Quantity Toggles & Prices */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/60 pt-4 sm:pt-0">
                        
                        {/* Price information */}
                        <div className="text-left sm:text-right">
                          <p className="text-base sm:text-lg font-extrabold text-white">${lineTotal.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-500 font-mono">${item.price.toFixed(2)} each</p>
                        </div>

                        {/* Quantity and Delete layout */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-850 rounded-lg overflow-hidden bg-[#0E1524] p-0.5">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[28px] text-center text-xs font-bold text-white select-none font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-500 hover:text-rose-455 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shopping page redirection */}
            <div className="text-left">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider"
              >
                <span>← Add more catalog items</span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (1/3 width) */}
          <div className="lg:col-span-4 w-full sticky top-8 space-y-4">
            
            {/* ─── Order Summary details ─── */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-left relative">
              <div className="px-6 py-5 border-b border-slate-850">
                <h2 className="text-base font-bold text-white uppercase tracking-wider">Order Summary</h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Cost breakdown rows */}
                <div className="space-y-3.5 text-xs font-semibold text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="text-slate-100">${subtotal.toFixed(2)}</span>
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-emerald-450 animate-in fade-in duration-200">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Promo ({VALID_PROMO} -10%)
                      </span>
                      <span className="font-bold">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1 select-none">
                      <span>Shipping Fee</span>
                      <div className="relative group">
                        <HelpCircle className="h-3.5 w-3.5 text-slate-650 cursor-help hover:text-slate-400 transition-colors" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-slate-900 border border-slate-800 text-slate-400 text-[10px] px-3 py-2 rounded-xl shadow-2xl z-10 leading-relaxed pointer-events-none text-center">
                          Vendora standard courier transit rate.
                        </div>
                      </div>
                    </span>
                    <span className="text-slate-100">${SHIPPING.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax estimate (10%)</span>
                    <span className="text-slate-100">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <hr className="border-slate-850" />

                {/* Grand Total display */}
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total price</span>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-white tracking-tight">${total.toFixed(2)}</p>
                    {isPromoApplied && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                        Discount applied
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Proceed to Checkout button */}
                <button
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-purple-600 hover:bg-purple-500 active:scale-[.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-550/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>

                {/* Encrypted payment secure info */}
                <div className="flex items-start gap-2.5 bg-[#0E1524] p-3.5 rounded-xl border border-slate-850">
                  <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Transactions are locked under 256-bit SSL encryption. All platform checkouts are fully secured.
                  </p>
                </div>

                {/* Buyer protections */}
                <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-850 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Buyer Assurance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span>Easy Claims</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ─── Promo Code section ─── */}
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 text-left shadow-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-purple-400" /> Coupon / Promo Code
              </span>

              {isPromoApplied ? (
                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3.5 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">{VALID_PROMO}</p>
                      <p className="text-[10px] text-slate-500">10% discount applied</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="text-[10px] text-slate-450 hover:text-rose-400 font-bold transition-colors underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          if (promoStatus !== 'idle') setPromoStatus('idle');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                        placeholder="e.g. HONOR10"
                        className="w-full pl-9 pr-3 py-2 bg-[#0E1524] border border-slate-800 text-white placeholder:text-slate-600 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-semibold font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      disabled={promoLoading || !promoInput.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-[.98] cursor-pointer flex items-center justify-center min-w-[70px]"
                    >
                      {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </div>

                  {promoStatus === 'success' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-semibold animate-in fade-in duration-200">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{promoMessage}</span>
                    </div>
                  )}

                  {promoStatus === 'error' && (
                    <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold animate-in fade-in duration-200">
                      <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{promoMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
          {/* END RIGHT COLUMN */}

        </div>
      </div>
    </div>
  );
};
export default Cart;
