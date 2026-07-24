import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Package,
  DollarSign,
  Layers,
  Image as ImageIcon,
  FileText,
  Hash,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { createProduct, type CreateProductInput } from '../services/productService';
import apiClient from '../services/apiClient';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Category {
  id: number;
  name: string;
  productCount: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful product creation so the parent can re-fetch the table */
  onSuccess: () => void;
}

// ── Default / blank form ───────────────────────────────────────────────────────

const blankForm = (): CreateProductInput => ({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  imageUrl: '',
  categoryId: 0,
});

// ── Component ─────────────────────────────────────────────────────────────────

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<CreateProductInput>(blankForm());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch categories from the live API; fall back to hardcoded list on failure
  useEffect(() => {
    if (!isOpen) return;
    apiClient
      .get<never, Category[]>('/categories')
      .then(setCategories)
      .catch(() => {
        setCategories([
          { id: 1, name: 'Electronics', productCount: 0 },
          { id: 2, name: 'Clothing', productCount: 0 },
          { id: 3, name: 'Home & Kitchen', productCount: 0 },
          { id: 4, name: 'Sports', productCount: 0 },
          { id: 5, name: 'Books', productCount: 0 },
        ]);
      });
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(blankForm());
      setError(null);
      setSaved(false);
      setImageError(false);
    }
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    },
    [loading, onClose]
  );
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Field change helper
  const set = <K extends keyof CreateProductInput>(key: K, value: CreateProductInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side guard
    if (!form.name.trim()) return setError('Product name is required.');
    if (form.categoryId < 1) return setError('Please select a category.');
    if (form.price <= 0) return setError('Price must be greater than zero.');
    if (form.stockQuantity < 0) return setError('Stock quantity cannot be negative.');
    if (!form.imageUrl.trim()) return setError('Image URL is required.');

    setError(null);
    setLoading(true);

    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl.trim(),
        categoryId: Number(form.categoryId),
      });

      setSaved(true);
      // Brief success flash, then close and trigger parent refresh
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Shared input style
  const inputClass =
    'w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/60 hover:border-slate-700 transition-all font-medium';

  const labelClass = 'block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5';

  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
    >
      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal box */}
      <div className="relative z-10 w-full max-w-2xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div>
              <h2
                id="add-product-modal-title"
                className="text-base font-bold text-white tracking-tight"
              >
                Add New Product
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Fill in the details below to publish a new listing.
              </p>
            </div>
          </div>
          <button
            type="button"
            id="add-product-modal-close"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <form
          id="add-product-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          {/* Product Name */}
          <div>
            <label htmlFor="ap-name" className={labelClass}>
              Product Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                id="ap-name"
                type="text"
                required
                maxLength={300}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                className={`${inputClass} pl-9`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="ap-category" className={labelClass}>
                Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <select
                  id="ap-category"
                  required
                  value={form.categoryId === 0 ? '' : form.categoryId}
                  onChange={(e) => set('categoryId', Number(e.target.value))}
                  className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ap-price" className={labelClass}>
                Price ($) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ap-price"
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                  value={form.price === 0 ? '' : form.price}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`${inputClass} pl-9 font-mono`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Stock Quantity */}
          <div>
            <label htmlFor="ap-stock" className={labelClass}>
              Stock Quantity <span className="text-red-400">*</span>
            </label>
            <input
              id="ap-stock"
              type="number"
              required
              min="0"
              value={form.stockQuantity === 0 ? '' : form.stockQuantity}
              onChange={(e) => set('stockQuantity', parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 50"
              className={`${inputClass} font-mono`}
              disabled={loading}
            />
          </div>

          {/* Image URL + live preview */}
          <div>
            <label htmlFor="ap-imageUrl" className={labelClass}>
              Image URL <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3 items-start">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ap-imageUrl"
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) => {
                    set('imageUrl', e.target.value);
                    setImageError(false);
                  }}
                  placeholder="https://images.unsplash.com/photo-…"
                  className={`${inputClass} pl-9`}
                  disabled={loading}
                />
              </div>

              {/* Live image preview thumbnail */}
              <div className="w-12 h-12 flex-shrink-0 rounded-xl border border-slate-700 bg-slate-900 overflow-hidden flex items-center justify-center">
                {form.imageUrl && !imageError ? (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </div>
            {imageError && form.imageUrl && (
              <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                Image failed to load — please check the URL.
              </p>
            )}
          </div>

          {/* Description (optional) */}
          <div>
            <label htmlFor="ap-description" className={labelClass}>
              Description
              <span className="ml-1.5 text-[10px] text-slate-500 normal-case font-normal tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <textarea
                id="ap-description"
                rows={4}
                maxLength={2000}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Provide an engaging description of the product…"
                className={`${inputClass} pl-9 resize-y min-h-[90px]`}
                disabled={loading}
              />
            </div>
            <p className="text-[10px] text-slate-600 mt-1 text-right">
              {form.description.length} / 2000
            </p>
          </div>
        </form>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-slate-800 px-6 py-4 space-y-3">

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success flash */}
          {saved && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Product created successfully! Refreshing…</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            {/* Cancel */}
            <button
              type="button"
              id="add-product-modal-cancel"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save Product */}
            <button
              type="submit"
              id="add-product-modal-submit"
              form="add-product-form"
              disabled={loading || saved}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:opacity-70 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
