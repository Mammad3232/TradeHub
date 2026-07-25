import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mockProducts from '../mocks/products.json';
import {
  Search,
  Heart,
  HeartOff,
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
  X,
  Shield,
  ShieldCheck,
  Store,
  LayoutDashboard,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export interface HeaderCurrentUser {
  isLoggedIn: boolean;
  role: string;
  name?: string;
  email?: string;
  logoUrl?: string;
  avatarUrl?: string;
}

interface HeaderProps {
  cartCount?: number;      // kept for prop-compat; context takes priority
  wishlistCount?: number;  // kept for prop-compat; context takes priority
  currentUser?: HeaderCurrentUser;
  siteSettings?: { siteName: string };
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser: propUser,
  siteSettings,
  onSignOut,
}) => {
  const navigate = useNavigate();

  // ── Global shop state ────────────────────────────────────────────────────
  const {
    cartItems,
    cartCount,
    cartTotal,
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    moveToCart,
    removeFromCart,
    updateQty,
    toasts,
    pushToast,
    dismissToast,
    miniCartOpen,
    setMiniCartOpen,
  } = useShop();

  // ── Auth ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('vendora_user');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('vendora_active_user');
    if (onSignOut) onSignOut();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const rawSession =
    localStorage.getItem('vendora_user') ||
    localStorage.getItem('mockUser') ||
    localStorage.getItem('vendora_active_user');
  const localUser = rawSession
    ? (JSON.parse(rawSession) as HeaderCurrentUser)
    : { isLoggedIn: false, role: 'Guest', name: '', email: '' };

  const currentUser = propUser ?? localUser;
  const isLoggedIn  = !!currentUser?.isLoggedIn;
  const isAdmin     = isLoggedIn && currentUser?.role === 'Admin';
  const isVendor    = isLoggedIn && currentUser?.role === 'Vendor';

  const initials = (currentUser?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ME';

  // ── Local UI state ───────────────────────────────────────────────────────
  const [query,            setQuery]            = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCategoryOpen,   setIsCategoryOpen]   = useState(false);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [profileOpen,      setProfileOpen]      = useState(false);

  const profileRef  = useRef<HTMLDivElement>(null);
  const miniCartRef = useRef<HTMLDivElement>(null);

  // Filter top 5 live autocomplete suggestions based on query
  const liveSuggestions = useMemo(() => {
    if (query.trim().length < 2) return [];
    const term = query.toLowerCase().trim();
    return (mockProducts as any[])
      .filter((p) => {
        const titleMatch    = (p.title || '').toLowerCase().includes(term);
        const categoryMatch = (p.category || '').toLowerCase().includes(term);
        const vendorMatch   = (p.vendorName || '').toLowerCase().includes(term);
        return titleMatch || categoryMatch || vendorMatch;
      })
      .slice(0, 5);
  }, [query]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (miniCartRef.current && !miniCartRef.current.contains(e.target as Node)) {
        setMiniCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setMiniCartOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home Decor', 'Books', 'Fitness', 'Beverages'];

  return (
    <>
      {/* ════════════════════════ GLOBAL TOAST STACK ════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl shadow-black/40 border text-sm font-semibold animate-in slide-in-from-bottom-3 fade-in duration-300
              bg-[#111827] border-slate-700 text-white"
          >
            <span className={`text-lg leading-none ${
              toast.type === 'cart' ? '🛒' : toast.type === 'wishlist' ? '❤️' : 'ℹ️'
            }`} />
            <span className="flex-1 max-w-[240px] truncate">{toast.text}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <header className="sticky top-0 z-50 w-full bg-[#060913]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 md:gap-8">

            {/* ─── 1. Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:bg-purple-500 transition-colors">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {siteSettings?.siteName || 'Vendora'}
                </span>
              </Link>
            </div>

            {/* ─── 2. Smart Search (desktop) */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full bg-[#111827] border border-slate-700 rounded-full overflow-visible focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all relative"
              >
                {/* Category Selector Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center gap-2 px-4 h-full bg-[#1A2333] border-r border-slate-700 rounded-l-full text-sm text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap select-none"
                  >
                    <span>{selectedCategory}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu (Absolute Positioning) */}
                  {isCategoryOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-48 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                        {categories.map((cat) => (
                          <div
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryOpen(false);
                              if (cat === 'All') {
                                navigate('/');
                              } else {
                                const slug = cat.toLowerCase().replace(/\s+/g, '-');
                                navigate(`/category/${slug}`);
                              }
                            }}
                            className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                              selectedCategory === cat
                                ? 'bg-purple-600/20 text-purple-400 font-bold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span>{cat}</span>
                            {selectedCategory === cat && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={query}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Search for products, brands and more..."
                    className="w-full bg-transparent border-none text-sm text-white px-4 py-2.5 outline-none placeholder:text-slate-500"
                  />

                  {/* ── Live Suggestion Autocomplete Dropdown ── */}
                  {query.trim().length >= 2 && showSuggestions && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {liveSuggestions.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 font-medium">
                            No matching products found
                          </div>
                        ) : (
                          liveSuggestions.map((product) => (
                            <div
                              key={product.id}
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                setQuery('');
                                setShowSuggestions(false);
                              }}
                              className="hover:bg-slate-800/80 cursor-pointer transition-colors p-3 flex items-center gap-3 group"
                            >
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-800 flex-shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-white text-sm font-bold truncate group-hover:text-purple-300 transition-colors">
                                  {product.title}
                                </h4>
                                <p className="text-xs text-slate-400 truncate">
                                  {product.category} • {product.vendorName || 'Vendora'}
                                </p>
                              </div>
                              <span className="text-purple-400 font-semibold text-sm ml-auto whitespace-nowrap">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className="px-5 bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center cursor-pointer rounded-r-full"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* ─── 3. Right Side Actions */}
            <div className="flex items-center gap-3 md:gap-5 text-slate-300">
              {/* Mobile search toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="md:hidden hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 cursor-pointer"
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link — routes to /wishlist */}
              <Link
                to="/wishlist"
                className="hidden sm:flex hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 relative cursor-pointer items-center justify-center"
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 transition-colors ${wishlistCount > 0 ? 'text-rose-400 fill-rose-500/20' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full px-0.5 border-2 border-[#060913]">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon — links to /cart */}
              <div className="relative" ref={miniCartRef}>
                <Link
                  to="/cart"
                  className="relative hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 group cursor-pointer flex items-center justify-center"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-purple-600 text-white text-[9px] font-black flex items-center justify-center rounded-full px-0.5 border-2 border-[#060913] group-hover:border-slate-800 transition-colors">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* ── Mini Cart Dropdown */}
                {miniCartOpen && (
                  <div className="absolute right-0 top-14 w-[340px] sm:w-[380px] bg-[#0E1524] border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-bold text-white">
                          Cart
                          {cartCount > 0 && (
                            <span className="ml-2 text-[10px] font-black bg-purple-600/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                              {cartCount} item{cartCount !== 1 ? 's' : ''}
                            </span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMiniCartOpen(false)}
                        className="text-slate-500 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Items */}
                    {cartItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-slate-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400">Your cart is empty</p>
                        <p className="text-xs text-slate-600">Add some products to get started</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 scrollbar-thin">
                          {cartItems.filter(Boolean).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
                              {/* Thumbnail */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0">
                                <img
                                  src={item?.image || ''}
                                  alt={item?.title || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white line-clamp-1">{item?.title || 'Product'}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{item?.brand || 'Vendora'}</p>
                                <p className="text-xs font-black text-purple-400 mt-1">${((item?.price ?? 0) * (item?.quantity ?? 1)).toFixed(2)}</p>
                              </div>

                              {/* Qty controls */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, (item?.quantity ?? 1) - 1)}
                                  disabled={(item?.quantity ?? 1) <= 1}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-white w-5 text-center">{item?.quantity ?? 1}</span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, (item?.quantity ?? 1) + 1)}
                                  disabled={item?.stock !== undefined && item?.stock !== null && (item?.quantity ?? 1) >= item.stock}
                                  className="w-5 h-5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="ml-1 text-slate-600 hover:text-rose-400 cursor-pointer transition-colors flex-shrink-0"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-slate-800 space-y-3 bg-[#0B1120]">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400 font-medium">Subtotal</span>
                            <span className="font-black text-white text-base">${cartTotal.toFixed(2)}</span>
                          </div>
                          <Link
                            to="/checkout"
                            onClick={() => setMiniCartOpen(false)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-purple-600/30 cursor-pointer"
                          >
                            <span>Go to Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link
                            to="/cart"
                            onClick={() => setMiniCartOpen(false)}
                            className="w-full flex items-center justify-center py-2.5 border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition-colors"
                          >
                            View Full Cart
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Role-based shortcut pills */}
              {currentUser?.isLoggedIn && currentUser?.role === 'Admin' && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 transition-all text-xs font-bold"
                  title="Admin Panel"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
              {currentUser?.isLoggedIn && currentUser?.role === 'Vendor' && (
                <Link
                  to="/vendor/dashboard"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-300 transition-all text-xs font-bold"
                  title="Vendor Dashboard"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Vendor</span>
                </Link>
              )}

              {/* Auth area */}
              <div className="pl-2 md:pl-4 md:border-l border-slate-700">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-300">Sign In</span>
                  </Link>
                ) : (
                  <div ref={profileRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((p) => !p)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group"
                      aria-label="Open user menu"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden shadow-md ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all flex-shrink-0 flex items-center justify-center bg-slate-800">
                        {currentUser?.logoUrl || currentUser?.avatarUrl ? (
                          <img src={currentUser.logoUrl || currentUser.avatarUrl} alt="User logo" className="object-cover w-full h-full rounded-full" />
                        ) : (
                          <span className="text-[11px] font-black text-white">{initials}</span>
                        )}
                      </div>
                      <div className="hidden md:flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {(currentUser.name ?? 'Account').split(' ')[0]}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-12 w-56 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 flex-shrink-0">
                            {currentUser?.logoUrl || currentUser?.avatarUrl ? (
                              <img src={currentUser.logoUrl || currentUser.avatarUrl} alt="User logo" className="object-cover w-full h-full rounded-full" />
                            ) : (
                              <span className="text-xs font-black text-white">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser.name ?? 'User'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{currentUser.email ?? ''}</p>
                          </div>
                        </div>

                        <div className="p-1.5 space-y-0.5">
                          <Link to="/my-orders" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                            <User className="w-4 h-4 text-slate-500" /> My Profile
                          </Link>
                          <Link to="/my-orders" onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">
                            <ShoppingBag className="w-4 h-4 text-slate-500" /> My Orders
                          </Link>
                          {isAdmin && (
                            <Link to="/admin" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors">
                              <ShieldCheck className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          {isVendor && (
                            <Link to="/vendor/dashboard" onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/8 transition-colors">
                              <LayoutDashboard className="w-4 h-4" /> Vendor Dashboard
                            </Link>
                          )}
                        </div>

                        <div className="p-1.5 border-t border-slate-800/80">
                          <button type="button" onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-colors cursor-pointer">
                            <X className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-slate-800 bg-[#060913] px-4 py-3 animate-in slide-in-from-top duration-200">
            <form onSubmit={handleSearchSubmit}
              className="flex items-center h-10 w-full bg-[#111827] border border-slate-800 rounded-full overflow-hidden">
              <input
                type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-grow bg-transparent text-white text-xs px-4 focus:outline-none placeholder:text-slate-500"
              />
              <button type="submit"
                className="bg-purple-600 text-white px-4 h-full flex items-center justify-center cursor-pointer">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-80 max-w-[85vw] bg-[#060913] text-slate-100 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-base">Menu</span>
                </div>
                <button type="button" onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-grow p-4 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Account</h4>
                  <div className="space-y-0.5">
                    {isLoggedIn ? (
                      <>
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-2">
                          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 flex-shrink-0">
                            {currentUser?.logoUrl || currentUser?.avatarUrl ? (
                              <img src={currentUser.logoUrl || currentUser.avatarUrl} alt="User logo" className="object-cover w-full h-full rounded-full" />
                            ) : (
                              <span className="text-xs font-black text-white">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser.name ?? 'User'}</p>
                            <p className="text-[10px] text-slate-500 truncate">{currentUser.email ?? ''}</p>
                          </div>
                        </div>
                        <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors">
                          My Profile & Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                            🛡️ Admin Panel
                          </Link>
                        )}
                        <button type="button" onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-colors cursor-pointer">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors">
                          Sign In / Register
                        </Link>
                        <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors">
                          Returns & Orders
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Merchants</h4>
                  <div className="space-y-0.5">
                    {/* Become a Vendor CTA — always visible */}
                    <Link to="/vendor-register" onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 transition-colors">
                      Become a Vendor
                    </Link>
                    {/* Vendor Dashboard — only for Vendors and Admins */}
                    {(isVendor || isAdmin) && (
                      <Link to="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/8 transition-colors">
                        Vendor Dashboard
                      </Link>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-red-500/70 uppercase tracking-widest px-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" /> Administration
                    </h4>
                    <div className="space-y-0.5">
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors">
                        <ShieldCheck className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
