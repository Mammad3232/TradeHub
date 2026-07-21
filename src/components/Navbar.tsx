import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, ShoppingCart, X, ChevronDown, User } from 'lucide-react';
import { LocationModal } from './LocationModal';
import { LanguageCurrencyModal, languages } from './LanguageCurrencyModal';
import { SubNavbar } from './SubNavbar';

interface NavbarProps {
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount = 2 }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLangCurrModalOpen, setIsLangCurrModalOpen] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('Azerbaijan');
  const [language, setLanguage] = useState('EN');
  const [currency, setCurrency] = useState('USD');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}&category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* ─── Top Row: Main Header (Amazon Style) ──────────────────────────────── */}
      <div className="bg-slate-900 text-white text-sm px-4 py-2 flex items-center justify-between gap-4 h-14">
        
        {/* Left: Brand Logo & Deliver To */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-1 border border-transparent hover:border-white rounded-sm px-2 py-1 transition-all h-11"
          >
            <span className="text-xl font-extrabold tracking-tight text-white">
              Vendora
            </span>
            <span className="text-amber-500 font-bold text-xs">.store</span>
          </Link>

          {/* Deliver to [Country] */}
          <button 
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden sm:flex items-center gap-1 border border-transparent hover:border-white rounded-sm px-2 py-1 transition-all h-11 text-left cursor-pointer"
          >
            <MapPin className="h-4.5 w-4.5 mt-2 text-slate-350" />
            <div className="text-[11px] leading-tight">
              <span className="text-slate-400 block font-normal">Deliver to</span>
              <span className="text-white font-bold block text-xs truncate max-w-[120px]">
                {deliveryLocation}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Composite Search Bar */}
        <form 
          onSubmit={handleSearch} 
          className="flex-1 max-w-3xl flex items-center h-10 bg-white rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 transition-all shadow-sm"
        >
          {/* Category Dropdown */}
          <div className="relative h-full bg-slate-100 hover:bg-slate-200 border-r border-slate-200 transition-colors flex items-center px-3 cursor-pointer group text-slate-700">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold pr-4 cursor-pointer focus:outline-none appearance-none"
            >
              <option value="All">All Departments</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home Decor">Home Decor</option>
              <option value="Bags">Bags</option>
              <option value="Beverages">Beverages</option>
            </select>
            <ChevronDown className="h-3 w-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>

          {/* Text Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items by keywords, categories, or brands..."
            className="flex-grow bg-white text-slate-900 text-sm px-3 py-2 h-full focus:outline-none placeholder:text-slate-400"
          />

          {/* Search Button */}
          <button 
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-900 px-6 h-full font-bold flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Submit search"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Right: Actions Block */}
        <div className="flex items-center gap-1.5">
          {/* Account & Sign in */}
          <Link 
            to="/login"
            className="border border-transparent hover:border-white rounded-sm px-2.5 py-1 transition-all h-11 text-left hidden sm:flex flex-col justify-center leading-tight"
          >
            <span className="text-[11px] text-slate-400 font-normal">Hello, Sign in</span>
            <span className="text-white font-bold block text-xs flex items-center gap-0.5">
              Account & Lists
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </span>
          </Link>

          {/* Language & Currency — Amazon Style flag trigger */}
          <button
            type="button"
            onClick={() => setIsLangCurrModalOpen(true)}
            className="flex items-center gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer select-none transition-all h-11 hidden lg:flex flex-shrink-0"
            title="Language & Currency Settings"
          >
            <span className="text-lg leading-none">
              {languages.find((l) => l.code === language)?.flag ?? '🌐'}
            </span>
            <span className="text-white font-bold text-sm tracking-wide">{language}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Returns & Orders */}
          <Link 
            to="/my-orders"
            className="border border-transparent hover:border-white rounded-sm px-2.5 py-1 transition-all h-11 text-left hidden md:flex flex-col justify-center leading-tight"
          >
            <span className="text-[11px] text-slate-400 font-normal">Returns</span>
            <span className="text-white font-bold block text-xs">& Orders</span>
          </Link>

          {/* Cart Block */}
          <Link 
            to="/cart"
            className="border border-transparent hover:border-white rounded-sm px-2.5 py-1 transition-all h-11 flex items-center gap-1.5 cursor-pointer relative"
          >
            <div className="relative pt-1.5">
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 min-w-[19px] h-[19px] bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            </div>
            <span className="text-white font-bold text-xs mt-3 hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* ─── Bottom Row: Sub Header (Category navigation) ──────────────────── */}
      <SubNavbar onMenuClick={() => setMobileMenuOpen((v) => !v)} />

      {/* ─── Mobile Sidebar Overlay Drawer ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-80 max-w-[85vw] bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200 text-left">
            {/* Header / Profile */}
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-slate-700 p-1.5 rounded-full">
                  <User className="h-5 w-5 text-slate-300" />
                </div>
                <span className="font-bold text-sm">Hello, Sign in</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links Directory */}
            <div className="flex-grow p-4 space-y-6 overflow-y-auto">
              {/* Profile Links */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account & Orders</h3>
                <div className="space-y-1">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400 transition-colors">Sign In / Register</Link>
                  <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400 transition-colors">Returns & Orders</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400 transition-colors">Shopping Cart</Link>
                </div>
              </div>

              {/* Roles Directory */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Business Portal</h3>
                <div className="space-y-1">
                  <Link to="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-amber-400 hover:text-amber-300 font-semibold">Become a Vendor</Link>
                  <Link to="/vendor/products" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400 transition-colors">Manage Store Products</Link>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm hover:text-amber-400 transition-colors">Platform Admin Settings</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Choose Location Modal ────────────────────────────────────────── */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={deliveryLocation}
        setCurrentLocation={setDeliveryLocation}
      />
      {/* ─── Language & Currency Modal ────────────────────────────────── */}
      <LanguageCurrencyModal
        isOpen={isLangCurrModalOpen}
        onClose={() => setIsLangCurrModalOpen(false)}
        currentLanguage={language}
        currentCurrency={currency}
        onSave={(lang, curr) => {
          setLanguage(lang);
          setCurrency(curr);
        }}
      />
    </header>
  );
};
