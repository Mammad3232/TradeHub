import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ShoppingCart, Minus, Plus, Loader2, ArrowRight, Store } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { getProductById, type Product } from '../services/productService';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: {
    id: number;
    title: string;
    brand?: string | null;
    price: number;
    image: string;
    rating: number;
    category?: string;
    stockQuantity?: number;
    stock?: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

const BACKEND_ORIGIN = 'http://localhost:5229';
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E" +
  "%3Crect width='400' height='400' fill='%230f172a'/%3E" +
  "%3Crect x='140' y='130' width='120' height='90' rx='12' fill='%231e293b'/%3E" +
  "%3Ccircle cx='175' cy='158' r='12' fill='%2334d399' opacity='.35'/%3E" +
  "%3Cpolygon points='160,215 220,175 220,215' fill='%2334d399' opacity='.35'/%3E" +
  "%3C/svg%3E";

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

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, pushToast, setMiniCartOpen } = useShop();
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch full details (description, stock, vendor name, etc.)
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setQuantity(1);

    getProductById(product.id)
      .then((data) => {
        if (isMounted) {
          setDetailProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load quick view details:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product.id, isOpen]);

  // Trap focus and manage body overflow & Escape key close
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll<HTMLElement>(focusableElementsString);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Fallback chain: detail Product -> parent Product -> hardcoded fallback
  const displayProduct = detailProduct || product;
  const title = displayProduct.title;
  const price = displayProduct.price;
  const rating = displayProduct.rating;
  const category = displayProduct.category;
  const brand = displayProduct.brand || 'Vendora';
  const imageSrc = displayProduct.image;
  const description = detailProduct?.description || (loading ? '' : 'No description available.');
  const stockQuantity = detailProduct?.stockQuantity ?? displayProduct.stockQuantity ?? (displayProduct as any).stock ?? 50;
  const isOutOfStock = stockQuantity <= 0;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      if (stockQuantity !== null && quantity >= stockQuantity) {
        pushToast(`Maximum available stock reached (Only ${stockQuantity} left).`, 'info');
        return;
      }
      setQuantity((q) => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: product.id,
      title: title,
      price: price,
      image: resolveImage(imageSrc),
      brand: brand,
      stock: stockQuantity,
      stockQuantity: stockQuantity,
      quantity: quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
    pushToast(`"${title.split(' ').slice(0, 3).join(' ')}..." added to cart!`, 'cart');
    if (setMiniCartOpen) {
      setMiniCartOpen(true);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl bg-[#131320] border border-purple-500/20 rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Product Image */}
          <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center relative aspect-square md:aspect-auto md:h-full">
            <img
              src={resolveImage(imageSrc)}
              alt={title}
              className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
            />
            {category && (
              <span className="absolute top-3 left-3 bg-purple-950/80 backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                {category}
              </span>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Brand / Vendor */}
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-purple-400 uppercase">
                <span>{brand}</span>
                {detailProduct?.vendorName && (
                  <span className="flex items-center gap-1.5 text-slate-400 normal-case font-medium">
                    <Store className="w-3.5 h-3.5 text-purple-400" />
                    {detailProduct.vendorName}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
                {title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-300 ml-1">
                  {rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-500">
                  ({t('product.reviews') || 'verified reviews'})
                </span>
              </div>

              {/* Price */}
              <div className="text-2xl md:text-3xl font-extrabold text-purple-400">
                {formatPrice(price)}
              </div>

              {/* Description */}
              <div className="border-t border-slate-800/80 my-3" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('common.description') || 'Description'}
              </h4>
              <div className="max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Loading details...</span>
                  </div>
                ) : (
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-4 pt-3 border-t border-slate-800/80">
              {/* Quantity Selector & Stock Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('product.quantity')}:
                  </span>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('inc')}
                      disabled={isOutOfStock}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stock Indicator */}
                <div>
                  {isOutOfStock ? (
                    <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {t('product.outOfStock')}
                    </span>
                  ) : (
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {t('product.inStock')}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                  addedToCart
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 scale-102'
                    : isOutOfStock
                    ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-600/35 hover:-translate-y-0.5 active:translate-y-0'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {addedToCart ? t('product.addedToCart') : t('product.addToCart')}
              </button>

              {/* View Full Details link */}
              <Link
                to={`/product/${product.id}`}
                onClick={onClose}
                className="text-center text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors hover:underline pt-1 flex items-center justify-center gap-1.5"
              >
                {t('product.viewFullDetails')}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
