import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Truck,
  Store,
  ShieldCheck,
  RotateCcw,
  Plus,
  Minus,
  Share2,
  Sparkles,
  Maximize2,
  Check,
  Loader2,
} from 'lucide-react';
import productsData from '../mocks/products.json';
import { useShop } from '../context/ShopContext';
import { getProductById } from '../services/productService';

interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
}

const mockReviews: Review[] = [
  {
    id: 1,
    author: 'Aysel Qasımova',
    rating: 5,
    date: '2026-07-10',
    comment: 'Absolutely exceeded my expectations! The build quality is premium, and delivery took less than 24 hours. Highly recommend to anyone looking for a solid premium upgrade.',
    likes: 12,
  },
  {
    id: 2,
    author: 'Murad Məmmədov',
    rating: 4,
    date: '2026-07-08',
    comment: 'Very good product, fits perfectly into my workspace setup. The design is sleek, but the instruction booklet could have been a bit more comprehensive. Overall, 4.5/5!',
    likes: 8,
  },
  {
    id: 3,
    author: 'Leyla Əliyeva',
    rating: 5,
    date: '2026-06-25',
    comment: 'The support team was incredibly helpful in answering my variant questions, and the item arrived in absolute pristine condition. A top-tier purchase from Vendora!',
    likes: 19,
  },
];

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems, pushToast } = useShop();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [activeColor, setActiveColor] = useState<string>('Space Black');
  const [activeSize, setActiveSize] = useState<string>('256GB');

  useEffect(() => {
    if (id) {
      setLoading(true);
      getProductById(Number(id))
        .then((data) => setProduct(data))
        .catch(() => {
          const fallback = productsData.find((p) => String(p.id) === String(id)) || productsData[0];
          setProduct(fallback);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-purple-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // Set alternative gallery images depending on product image
  const galleryImages = [
    product.image || product.imageUrl,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
  ];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isExpandedImage, setIsExpandedImage] = useState<boolean>(false);

  // Variant configs
  const colors = [
    { name: 'Space Black', class: 'bg-[#1E1E1E]' },
    { name: 'Titanium Gray', class: 'bg-[#7A7D80]' },
    { name: 'Deep Purple', class: 'bg-[#3E2C41]' },
    { name: 'Satin Silver', class: 'bg-[#E3E4E5]' },
  ];

  const sizes = ['128GB', '256GB', '512GB', '1TB'];

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity((q) => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  // Derived wishlist state — reactive to global store
  const isWishlisted = wishlistItems.some((w) => String(w.id) === String(product.id));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      brand: product.vendorName,
    });
    pushToast(`"${product.title.split(' ').slice(0, 3).join(' ')}…" added to cart!`, 'cart');
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      brand: product.vendorName,
      category: product.category,
      rating: product.rating,
    });
    const action = isWishlisted ? 'removed from' : 'added to';
    pushToast(`"${product.title.split(' ').slice(0, 3).join(' ')}…" ${action} wishlist!`, 'info');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard!');
  };

  // Compare Price logic
  const originalPrice = product.price * 1.25;

  return (
    <div className="bg-[#060913] min-h-screen text-slate-100 font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:translate-x-[-2px] transition-all"
          >
            <ArrowLeft className="h-4 w-4 text-purple-400" />
            <span>Back to Marketplace</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Share2 className="w-4.5 h-4.5" />
            <span className="hidden sm:inline">Share Product</span>
          </button>
        </div>

        {/* ─── Main Two-Column Grid Area ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-[#111827] border border-slate-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          
          {/* Ambient Purple Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* LEFT COLUMN: Gallery View (5 Grid slots) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Primary Main Image Container */}
            <div className="relative aspect-square w-full rounded-2xl border border-slate-800/60 bg-slate-950 overflow-hidden flex items-center justify-center group shadow-inner">
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Maximize Image overlay */}
              <button
                type="button"
                onClick={() => setIsExpandedImage(true)}
                title="Expand Showcase View"
                className="absolute right-4 top-4 bg-slate-900/80 border border-slate-850 p-2.5 rounded-xl text-slate-400 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Tag indicator */}
              <div className="absolute left-4 top-4 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-500/20 shadow-md uppercase tracking-wider">
                Platform Choice
              </div>
            </div>

            {/* Thumbnail selector gallery grid */}
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border-2 transition-all cursor-pointer flex items-center justify-center relative ${
                    activeImageIndex === index
                      ? 'border-purple-500 shadow-md shadow-purple-600/10'
                      : 'border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product thumbnail angle ${index + 1}`}
                    className={`w-full h-full object-cover transition-opacity duration-305 ${
                      activeImageIndex === index ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Specifications & Purchase options */}
          <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-6">
            
            <div className="space-y-6">
              
              {/* Brand and category info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                    <Store className="w-3.5 h-3.5 text-purple-400" />
                    <span>Vendor:</span>
                    <Link
                      to="/vendor/dashboard"
                      className="text-purple-400 hover:text-purple-300 transition-colors font-bold underline decoration-purple-500/30"
                    >
                      {product.vendorName}
                    </Link>
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight pt-1">
                  {product.title}
                </h1>
              </div>

              {/* Review star rating distribution */}
              <div className="flex items-center gap-3 bg-[#0E1524] p-3 rounded-xl border border-slate-800/80 w-fit">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4.5 w-4.5 ${
                        star <= Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <span className="text-xs font-bold text-slate-200">{product.rating} / 5</span>
                <span className="text-[11px] text-slate-500 font-semibold">(154 verified reviews)</span>
              </div>

              <hr className="border-slate-800/80" />

              {/* High fidelity pricing section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Value</span>
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  {/* Crossed-out original price */}
                  <span className="text-sm font-semibold text-slate-500 line-through mt-1">
                    ${originalPrice.toFixed(2)}
                  </span>
                  
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Save 20%
                  </span>
                </div>
              </div>

              <hr className="border-slate-800/80" />

              {/* Variant 1: Color selection */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Color:</span>
                  <span className="font-bold text-purple-400">{activeColor}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setActiveColor(color.name)}
                      title={color.name}
                      className={`w-9 h-9 rounded-full ${color.class} border-2 transition-all hover:scale-105 cursor-pointer relative flex items-center justify-center ${
                        activeColor === color.name
                          ? 'border-purple-500 ring-2 ring-purple-500/30'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {activeColor === color.name && (
                        <Check className="w-4 h-4 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant 2: Size selection */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Storage Capacity:</span>
                  <span className="font-bold text-purple-400">{activeSize}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setActiveSize(size)}
                      className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeSize === size
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-650/15'
                          : 'bg-[#0E1524] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Quantity selection and primary call to actions */}
            <div className="space-y-5 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                
                {/* Quantity selector */}
                <div className="flex items-center justify-between border border-slate-800 bg-[#0E1524] rounded-xl p-1.5 w-full sm:w-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('dec')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus className="h-4.5 w-4.5" />
                  </button>
                  <span className="px-6 text-sm font-bold text-white min-w-[40px] text-center select-none font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('inc')}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Primary Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full bg-purple-600 hover:bg-purple-500 active:scale-[.98] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer ${
                    addedToCart ? 'bg-emerald-600 hover:bg-emerald-550' : ''
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{addedToCart ? 'Redirecting to Cart...' : 'Add to Cart'}</span>
                </button>

                {/* Secondary Wishlist button */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`p-4 rounded-xl border border-slate-800 bg-[#0E1524] transition-all hover:bg-slate-800/50 cursor-pointer ${
                    isWishlisted ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`h-5.5 w-5.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Premium Shipping and Security metadata */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-800/80 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">Free Courier Shipping</span>
                  <span className="text-[9px] text-slate-550">Arrives in 1-2 days</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">256-bit Encrypted</span>
                  <span className="text-[9px] text-slate-550">Safe, secure gateway</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <RotateCcw className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">Flexible Returns</span>
                  <span className="text-[9px] text-slate-550">30-day money-back</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ─── BOTTOM SECTION: Tabs Detail Section ─── */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-left">
          
          {/* Tab Button Menu */}
          <div className="flex items-center border-b border-slate-800/80 mb-8 overflow-x-auto text-xs sm:text-sm font-semibold select-none gap-2">
            {[
              { id: 'description', label: 'Product Description' },
              { id: 'specifications', label: 'Technical Specifications' },
              { id: 'reviews', label: `Customer Reviews (${mockReviews.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-6 py-4.5 relative whitespace-nowrap cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab 1 Content: Description */}
          {activeTab === 'description' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="prose max-w-none text-slate-400 text-sm leading-relaxed space-y-4">
                <p>
                  Elevate your daily operations and lifestyle with our premier catalog flagship. Engineered to satisfy extreme standards of performance, layout, and longevity, this product introduces deep architectural comfort matching any demanding work setup.
                </p>
                <p>
                  Using next-generation sustainable packaging, high-durability metals/plastics, and state of the art responsive chip configurations, we guarantee top tier longevity. Each item passes three levels of strict quality validation before final warehouse release.
                </p>
              </div>

              {/* Core Feature Bullet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="bg-[#0E1524] border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Industrial Materials</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Crafted with lightweight, high-performance composites to resist daily wear and tear.</p>
                  </div>
                </div>
                <div className="bg-[#0E1524] border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Ergonomic Architecture</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Built dynamically to provide peak productivity without causing user fatigue over long intervals.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2 Content: Specifications */}
          {activeTab === 'specifications' && (
            <div className="animate-in fade-in duration-200 overflow-hidden border border-slate-800/80 rounded-2xl">
              <div className="grid grid-cols-1 divide-y divide-slate-800/60 bg-[#0E1524] text-xs sm:text-sm">
                {[
                  { key: 'Product Brand', val: 'Vendora Premium Essentials' },
                  { key: 'Model ID', val: `VN-${id || '7752'}` },
                  { key: 'Origin', val: 'Imported Premium Assembly' },
                  { key: 'Materials', val: 'Aviation-grade aluminum, recycled polycarbonate' },
                  { key: 'Weight', val: '320 grams (unpacked)' },
                  { key: 'Warranty Period', val: '12 Months Full Coverage Platform Warranty' },
                  { key: 'Colorways Available', val: 'Space Black, Titanium Gray, Deep Purple, Satin Silver' },
                ].map((spec) => (
                  <div key={spec.key} className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 hover:bg-[#111827]/40 transition-colors">
                    <span className="font-bold text-slate-400 uppercase tracking-wide">{spec.key}</span>
                    <span className="sm:col-span-2 text-slate-200 font-semibold">{spec.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3 Content: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Ratings Summary Header */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#0E1524] border border-slate-800/80 p-6 sm:p-8 rounded-2xl">
                
                {/* Average stars */}
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">4.8</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-5 w-5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Average rating from verified buyers</span>
                </div>

                {/* Rating distribution bar graphics */}
                <div className="md:col-span-8 space-y-2 text-xs">
                  {[
                    { rating: 5, pct: '82%', count: 126 },
                    { rating: 4, pct: '12%', count: 18 },
                    { rating: 3, pct: '4%', count: 6 },
                    { rating: 2, pct: '2%', count: 3 },
                    { rating: 1, pct: '0%', count: 1 },
                  ].map((row) => (
                    <div key={row.rating} className="flex items-center gap-3.5">
                      <span className="font-bold text-slate-400 w-12 text-right">{row.rating} Star</span>
                      
                      {/* Progress Bar Container */}
                      <div className="flex-grow h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: row.pct }} />
                      </div>
                      
                      <span className="font-bold text-slate-300 w-10 text-right">{row.pct}</span>
                      <span className="text-[10px] text-slate-500 w-12 text-left">({row.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Feed list */}
              <div className="space-y-5">
                {mockReviews.map((review) => (
                  <div key={review.id} className="bg-[#0E1524] border border-slate-800/80 p-5 sm:p-6 rounded-2xl text-left space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.author}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{review.date}</span>
                      </div>
                      
                      {/* Individual Star ratings */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${
                              star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <button type="button" className="hover:text-purple-400 transition-colors cursor-pointer">
                        Helpful ({review.likes})
                      </button>
                      <span className="text-slate-700">|</span>
                      <button type="button" className="hover:text-white transition-colors cursor-pointer">
                        Report Abuse
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── FULLSCREEN EXPANDED IMAGE VIEW MODAL ─── */}
      {isExpandedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center">
            
            {/* Close modal button */}
            <button
              type="button"
              onClick={() => setIsExpandedImage(false)}
              className="absolute -top-12 right-2 sm:right-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg z-10 text-xs font-bold"
            >
              ✕ Close
            </button>

            <img
              src={galleryImages[activeImageIndex]}
              alt={product.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-slate-850 shadow-2xl animate-in zoom-in duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductDetail;
