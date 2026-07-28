import React, { useState, useEffect, useMemo } from 'react';
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
  PackageX,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useCurrency } from '../context/CurrencyContext';
import { getProductById } from '../services/productService';

// ── Constants ──────────────────────────────────────────────────────────────────
const BACKEND_ORIGIN = 'http://localhost:5229';

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E" +
  "%3Crect width='400' height='400' fill='%230f172a'/%3E" +
  "%3Crect x='140' y='130' width='120' height='90' rx='12' fill='%231e293b'/%3E" +
  "%3Ccircle cx='175' cy='158' r='12' fill='%2334d399' opacity='.35'/%3E" +
  "%3Cpolygon points='160,215 220,175 220,215' fill='%2334d399' opacity='.35'/%3E" +
  "%3C/svg%3E";

/** Resolve a potentially-relative image path returned by the backend. */
function resolveImage(raw?: string | null): string {
  if (!raw) return PLACEHOLDER_IMAGE;
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('blob:') ||
    raw.startsWith('data:')
  ) {
    return raw;
  }
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

// ── Static mock reviews ─────────────────────────────────────────────────────
interface Review {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
  likes: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Aysel Qasımova',
    rating: 5,
    date: '2026-07-10',
    comment:
      'Absolutely exceeded my expectations! The build quality is premium, and delivery took less than 24 hours. Highly recommend to anyone looking for a solid premium upgrade.',
    likes: 12,
  },
  {
    id: 2,
    author: 'Murad Məmmədov',
    rating: 4,
    date: '2026-07-08',
    comment:
      'Very good product, fits perfectly into my workspace setup. The design is sleek, but the instruction booklet could have been a bit more comprehensive. Overall, 4.5/5!',
    likes: 8,
  },
  {
    id: 3,
    author: 'Leyla Əliyeva',
    rating: 5,
    date: '2026-06-25',
    comment:
      'The support team was incredibly helpful in answering my variant questions, and the item arrived in absolute pristine condition. A top-tier purchase from Vendora!',
    likes: 19,
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems, pushToast } = useShop();
  const { formatPrice } = useCurrency();

  // ── All hooks unconditionally at top ────────────────────────────────────────
  const [product, setProduct]             = useState<any>(null);
  const [loading, setLoading]             = useState<boolean>(true);
  const [fetchError, setFetchError]       = useState<boolean>(false);
  const [quantity, setQuantity]           = useState<number>(1);
  const [addedToCart, setAddedToCart]     = useState<boolean>(false);
  const [activeTab, setActiveTab]         = useState<'description' | 'specifications' | 'reviews'>('description');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isExpandedImage, setIsExpandedImage]   = useState<boolean>(false);

  // Fetch product on mount / id change
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setFetchError(false);
    setActiveImageIndex(0);
    setQuantity(1);

    getProductById(Number(id))
      .then((data) => setProduct(data))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived values (safe even when product is null) ──────────────────────────
  const resolvedImage = useMemo(() => resolveImage(product?.image), [product]);

  /**
   * Gallery images: built from the product's actual image data.
   * The backend currently returns a single `image` string; if it later
   * returns an `images` array we merge both here.
   * Fake/hardcoded stock photos are intentionally excluded.
   */
  const galleryImages = useMemo<string[]>(() => {
    const extra: string[] = Array.isArray(product?.images)
      ? (product.images as string[]).map(resolveImage).filter(Boolean)
      : [];
    const primary = resolvedImage !== PLACEHOLDER_IMAGE ? resolvedImage : null;
    const all = [
      ...(primary ? [primary] : []),
      ...extra.filter((img) => img !== primary),
    ];
    return all.length > 0 ? all : [PLACEHOLDER_IMAGE];
  }, [product, resolvedImage]);

  const maxStock      = product?.stockQuantity ?? product?.stock ?? null;
  const originalPrice = product ? Number(product.price) * 1.25 : 0;
  const isWishlisted  = wishlistItems.some((w) => String(w.id) === String(product?.id));
  const isOutOfStock  = maxStock !== null && maxStock <= 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      if (maxStock !== null && maxStock > 0 && quantity >= maxStock) {
        pushToast(`Maximum available stock reached (Only ${maxStock} item${maxStock > 1 ? 's' : ''} available).`, 'info');
        return;
      }
      setQuantity((q) => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id:       product.id,
      title:    product.title,
      price:    Number(product.price),
      image:    resolvedImage,
      brand:    product.vendorName || product.brand || 'Vendora',
      stock:    maxStock ?? undefined,
      quantity: quantity,
    });
    pushToast(`"${(product.title as string).split(' ').slice(0, 3).join(' ')}..." added to cart!`, 'cart');
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist({
      id:       product.id,
      title:    product.title,
      price:    Number(product.price),
      image:    resolvedImage,
      brand:    product.vendorName,
      category: product.category,
      rating:   product.rating,
    });
    const action = isWishlisted ? 'removed from' : 'added to';
    pushToast(`"${(product.title as string).split(' ').slice(0, 3).join(' ')}..." ${action} wishlist!`, 'info');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    pushToast('Product link copied to clipboard!', 'info');
  };

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center text-purple-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  // ── Error / Not found state ───────────────────────────────────────────────────
  if (fetchError || !product) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-800/60 flex items-center justify-center">
          <PackageX className="w-10 h-10 text-slate-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-sm text-slate-400">This product may have been removed or doesn't exist.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  // ── Spec rows from real data ──────────────────────────────────────────────────
  const specRows = [
    { key: 'Brand',       val: product.brand || 'Vendora' },
    { key: 'Model ID',    val: `VN-${id ?? product.id}` },
    { key: 'Category',    val: product.category || 'General' },
    ...(product.subcategory ? [{ key: 'Subcategory', val: product.subcategory }] : []),
    { key: 'Vendor',      val: product.vendorName || 'Vendora Store' },
    { key: 'Stock',       val: maxStock !== null ? `${maxStock} units available` : 'In Stock' },
    { key: 'Warranty',    val: '12 Months Full Coverage' },
    {
      key: 'Listed',
      val: product.createdAt
        ? new Date(product.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A',
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
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
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share Product</span>
          </button>
        </div>

        {/* Main Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-[#111827] border border-slate-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* LEFT: Gallery */}
          <div className="lg:col-span-6 space-y-6">

            {/* Primary Image — object-contain preserves aspect ratio, no forced stretch */}
            <div className="relative aspect-square w-full rounded-2xl border border-slate-800/60 bg-slate-950 overflow-hidden flex items-center justify-center group shadow-inner">
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.title}
                className="max-w-full max-h-full object-contain rounded-xl transition-opacity duration-300"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
              />
              <button
                type="button"
                onClick={() => setIsExpandedImage(true)}
                title="Expand image"
                className="absolute right-4 top-4 bg-slate-900/80 border border-slate-700 p-2.5 rounded-xl text-slate-400 hover:text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {isOutOfStock ? (
                <div className="absolute left-4 top-4 bg-red-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  Out of Stock
                </div>
              ) : (
                <div className="absolute left-4 top-4 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-purple-500/20 shadow-md uppercase tracking-wider">
                  Platform Choice
                </div>
              )}
            </div>

            {/* Thumbnails — only rendered when there are 2+ images; hidden for single-image products */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {galleryImages.map((imgSrc, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border-2 transition-all cursor-pointer flex items-center justify-center ${
                      activeImageIndex === index
                        ? 'border-purple-500 shadow-md shadow-purple-600/10'
                        : 'border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    <img
                      src={imgSrc}
                      alt={`Thumbnail ${index + 1}`}
                      className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${
                        activeImageIndex === index ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                      }`}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-6 flex flex-col justify-between text-left space-y-6">
            <div className="space-y-6">

              {/* Category + Vendor + Brand */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-purple-500/10 text-purple-400 text-[10px] font-bold px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
                    {product.category || 'General'}
                  </span>
                  {product.vendorName && (
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
                  )}
                  {product.brand && (
                    <span className="text-[10px] text-slate-400 font-semibold bg-slate-800/60 border border-slate-700 px-2 py-0.5 rounded-full">
                      {product.brand}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight pt-1">
                  {product.title}
                </h1>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-3 bg-[#0E1524] p-3 rounded-xl border border-slate-800/80 w-fit">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <span className="text-xs font-bold text-slate-200">{Number(product.rating).toFixed(1)} / 5</span>
                <span className="text-[11px] text-slate-500 font-semibold">(verified reviews)</span>
              </div>

              <hr className="border-slate-800/80" />

              {/* Pricing + stock indicator */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Purchase Value</span>
                <div className="flex items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {formatPrice(Number(product.price))}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 line-through mt-1">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Save 20%
                  </span>
                </div>
                {maxStock !== null && (
                  <div className={`text-xs font-semibold flex items-center gap-1.5 ${
                    isOutOfStock ? 'text-red-400' : maxStock <= 10 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                      isOutOfStock ? 'bg-red-400' : maxStock <= 10 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    {isOutOfStock
                      ? 'Out of Stock'
                      : maxStock <= 10
                      ? `Low Stock — Only ${maxStock} left!`
                      : `${maxStock} in Stock`}
                  </div>
                )}
              </div>

              <hr className="border-slate-800/80" />

              {/* Subcategory chip — only when available */}
              {product.subcategory && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Subcategory:</span>
                  <span className="text-xs text-white font-bold bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full">
                    {product.subcategory}
                  </span>
                </div>
              )}
            </div>

            {/* Qty + Add to Cart */}
            <div className="space-y-5 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">

                {/* Quantity selector */}
                <div className="flex items-center justify-between border border-slate-800 bg-[#0E1524] rounded-xl p-1.5 w-full sm:w-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('dec')}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 text-sm font-bold text-white min-w-[40px] text-center select-none font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange('inc')}
                    disabled={isOutOfStock || (maxStock !== null && quantity >= maxStock)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full font-bold py-4 px-8 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] ${
                    addedToCart
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20 hover:shadow-purple-500/30'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                    </>
                  )}
                </button>

                {/* Wishlist button */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                    isWishlisted
                      ? 'text-rose-500 border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                      : 'text-slate-400 border-slate-800 bg-[#0E1524] hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-800/80 text-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Truck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">Free Courier</span>
                  <span className="text-[9px] text-slate-500">Arrives in 1-2 days</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">256-bit Encrypted</span>
                  <span className="text-[9px] text-slate-500">Secure gateway</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-300">Easy Returns</span>
                  <span className="text-[9px] text-slate-500">30-day money-back</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-[#111827] border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-left">

          {/* Tab Buttons */}
          <div className="flex items-center border-b border-slate-800/80 mb-8 overflow-x-auto text-xs sm:text-sm font-semibold select-none gap-2">
            {[
              { id: 'description',    label: 'Product Description' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'reviews',        label: `Reviews (${MOCK_REVIEWS.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 sm:px-6 py-4 relative whitespace-nowrap cursor-pointer transition-all ${
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

          {/* Tab 1: Description */}
          {activeTab === 'description' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-slate-400 text-sm leading-relaxed space-y-4">
                {product.description ? (
                  <p>{product.description}</p>
                ) : (
                  <>
                    <p>
                      Elevate your daily operations and lifestyle with this premier product from our catalog. Engineered to satisfy extreme standards of performance, design, and longevity.
                    </p>
                    <p>
                      Each item passes three levels of strict quality validation before final warehouse release, ensuring you receive nothing less than perfection.
                    </p>
                  </>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: '✓', title: 'Premium Materials',  desc: 'Crafted with high-performance composites to resist daily wear and tear.' },
                  { icon: '✓', title: 'Quality Verified',    desc: 'Passes 3 levels of strict quality validation before warehouse release.' },
                  { icon: '✓', title: 'Secure Payments',     desc: 'All transactions processed through encrypted secure gateways.' },
                  { icon: '✓', title: 'Fast Delivery',       desc: 'Free courier shipping — arrives within 1 to 2 business days.' },
                ].map((feat) => (
                  <div key={feat.title} className="bg-[#0E1524] border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Specifications — from real product data */}
          {activeTab === 'specifications' && (
            <div className="animate-in fade-in duration-200 overflow-hidden border border-slate-800/80 rounded-2xl">
              <div className="grid grid-cols-1 divide-y divide-slate-800/60 bg-[#0E1524] text-xs sm:text-sm">
                {specRows.map((spec) => (
                  <div key={spec.key} className="grid grid-cols-1 sm:grid-cols-3 p-4 gap-2 hover:bg-[#111827]/40 transition-colors">
                    <span className="font-bold text-slate-400 uppercase tracking-wide">{spec.key}</span>
                    <span className="sm:col-span-2 text-slate-200 font-semibold">{spec.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-[#0E1524] border border-slate-800/80 p-6 sm:p-8 rounded-2xl">
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center space-y-2">
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {Number(product.rating).toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">Average from verified buyers</span>
                </div>
                <div className="md:col-span-8 space-y-2 text-xs">
                  {[
                    { rating: 5, pct: '82%', count: 126 },
                    { rating: 4, pct: '12%', count: 18 },
                    { rating: 3, pct: '4%',  count: 6 },
                    { rating: 2, pct: '2%',  count: 3 },
                    { rating: 1, pct: '0%',  count: 1 },
                  ].map((row) => (
                    <div key={row.rating} className="flex items-center gap-3.5">
                      <span className="font-bold text-slate-400 w-12 text-right">{row.rating} Star</span>
                      <div className="flex-grow h-2 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: row.pct }} />
                      </div>
                      <span className="font-bold text-slate-300 w-10 text-right">{row.pct}</span>
                      <span className="text-[10px] text-slate-500 w-12">({row.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="bg-[#0E1524] border border-slate-800/80 p-5 sm:p-6 rounded-2xl text-left space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{review.author}</h4>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{review.date}</span>
                      </div>
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
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
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

      {/* Fullscreen Image Modal */}
      {isExpandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsExpandedImage(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsExpandedImage(false)}
              className="absolute -top-12 right-2 sm:right-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer shadow-lg text-xs font-bold"
            >
              Close
            </button>
            <img
              src={galleryImages[activeImageIndex]}
              alt={product.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl border border-slate-800 shadow-2xl animate-in zoom-in duration-200"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
