import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
  X,
  ShieldCheck,
} from 'lucide-react';

export interface HeaderCurrentUser {
  isLoggedIn: boolean;
  role: string;
  name?: string;
  email?: string;
}

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
  currentUser?: HeaderCurrentUser;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 3,
  wishlistCount = 2,
  currentUser: propUser,
}) => {
  // ── Auth state — supports prop passing from App.tsx or localStorage fallback
  const rawSession = localStorage.getItem('vendora_active_user');
  const localUser = rawSession
    ? (JSON.parse(rawSession) as HeaderCurrentUser)
    : { isLoggedIn: false, role: 'Guest', name: '', email: '' };

  const currentUser = propUser ?? localUser;

  const isLoggedIn = !!currentUser?.isLoggedIn;
  const isAdmin    = isLoggedIn && currentUser?.role === 'Admin';

  // Derive avatar initials: "Alex Doe" → "AD"
  const initials = (currentUser?.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ME';
  // ─────────────────────────────────────────────────────────────────────────
  const [query,                  setQuery]                  = useState('');
  const [category,               setCategory]               = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [mobileMenuOpen,         setMobileMenuOpen]         = useState(false);
  const [mobileSearchOpen,       setMobileSearchOpen]       = useState(false);
  const [profileOpen,            setProfileOpen]            = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(
        `/?search=${encodeURIComponent(query.trim())}&category=${encodeURIComponent(category)}`
      );
      setMobileSearchOpen(false);
    }
  };

  const categories = ['All', 'Electronics', 'Fashion', 'Home Decor', 'Books', 'Fitness', 'Beverages'];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#060913]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 md:gap-8">
          
          {/* ─── 1. Left Side: Logo & Mobile Menu Trigger */}
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
              <span className="text-xl md:text-2xl font-bold text-white tracking-tight">Vendora</span>
            </Link>
          </div>

          {/* ─── 2. Middle: Smart Search Panel (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex w-full bg-[#111827] border border-slate-700 rounded-full overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all relative"
            >
              {/* Category selector button */}
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 px-4 bg-[#1A2333] border-r border-slate-700 text-sm text-slate-350 hover:text-white transition-colors cursor-pointer whitespace-nowrap min-w-[70px] select-none"
              >
                <span>{category}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Categories selection dropdown card */}
              {isCategoryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  <div className="absolute left-0 top-12 mt-1 w-48 bg-[#0E1524] border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-1.5 space-y-0.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setCategory(cat);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            category === cat
                              ? 'bg-purple-650/15 text-purple-400'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Search text input */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full bg-transparent border-none text-sm text-white px-4 py-2.5 outline-none placeholder:text-slate-500"
              />

              {/* Search button */}
              <button
                type="submit"
                className="px-5 bg-purple-600 hover:bg-purple-500 text-white transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* ─── 3. Right Side: User Actions */}
          <div className="flex items-center gap-3 md:gap-5 text-slate-300">
            {/* Mobile search input toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 cursor-pointer"
              aria-label="Toggle search input"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Heart */}
            <Link
              to="/cart"
              className="hidden sm:flex hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800 group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Counter Badge */}
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#060913] group-hover:border-slate-800 transition-colors">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ── Admin pill — desktop only, Admins only ── */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 transition-all text-xs font-bold"
                title="Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* ── Auth Area ── */}
            <div className="pl-2 md:pl-4 md:border-l border-slate-700">
              {!isLoggedIn ? (
                /* STATE A — GUEST: Sign In link */
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
                /* STATE B — AUTHENTICATED: Avatar chip + dropdown */
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-all cursor-pointer group"
                    aria-label="Open user menu"
                  >
                    {/* Gradient avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-black shadow-md ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all flex-shrink-0">
                      {initials}
                    </div>
                    {/* Name + chevron — desktop */}
                    <div className="hidden md:flex items-center gap-1">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {(currentUser.name ?? 'Account').split(' ')[0]}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Dropdown card */}
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-[#0E1524] border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User header */}
                      <div className="px-4 py-3.5 border-b border-slate-800/80 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{currentUser.name ?? 'User'}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUser.email ?? ''}</p>
                        </div>
                      </div>

                      {/* Nav items */}
                      <div className="p-1.5 space-y-0.5">
                        <Link
                          to="/my-orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>
                        <Link
                          to="/my-orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-slate-500" />
                          My Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      {/* Sign out */}
                      <div className="p-1.5 border-t border-slate-800/80">
                        <button
                          type="button"
                          onClick={() => {
                            localStorage.removeItem('vendora_active_user');
                            setProfileOpen(false);
                            window.location.href = '/';
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/8 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          Sign Out
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

      {/* Expandable Mobile Search field */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#060913] px-4 py-3 animate-in slide-in-from-top duration-200">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center h-10 w-full bg-[#111827] border border-slate-800 rounded-full overflow-hidden"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-grow bg-transparent text-white text-xs px-4 focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 h-full flex items-center justify-center cursor-pointer"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* ─── Drawer Menu Panel (Mobile Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-[#060913] text-slate-100 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <ShoppingBag className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold text-base">Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Account</h4>
                <div className="space-y-0.5">
                  {isLoggedIn ? (
                    /* Logged-in user block */
                    <>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 mb-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{currentUser.name ?? 'User'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{currentUser.email ?? ''}</p>
                        </div>
                      </div>
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors"
                      >
                        My Profile &amp; Orders
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('vendora_active_user');
                          setMobileMenuOpen(false);
                          window.location.href = '/';
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-colors cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    /* Guest links */
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors"
                      >
                        Sign In / Register
                      </Link>
                      <Link
                        to="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors"
                      >
                        Returns &amp; Orders
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Merchants</h4>
                <div className="space-y-0.5">
                  <Link
                    to="/vendor-register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-505/5 transition-colors"
                  >
                    Become a Vendor
                  </Link>
                  <Link
                    to="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors"
                  >
                    Vendor Dashboard
                  </Link>
                </div>
              </div>

              {/* Admin section — only shown to Admin users */}
              {isAdmin && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-500/70 uppercase tracking-widest px-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    Administration
                  </h4>
                  <div className="space-y-0.5">
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-350 hover:text-white hover:bg-slate-850 transition-colors"
                    >
                      Users Management
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
