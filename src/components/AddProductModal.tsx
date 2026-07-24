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
  Upload,
  Trash2,
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
  categoryId: 0,
  imageFile: null,
});

// ── Component ─────────────────────────────────────────────────────────────────

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<CreateProductInput>(blankForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  // Clean up image preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setForm(blankForm());
      setSelectedFile(null);
      setImagePreview(null);
      setError(null);
      setSaved(false);
      setDragActive(false);
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

  // Process selected file
  const handleFileSelect = (file: File) => {
    const allowedExtensions = ['image/jpeg', 'image/png', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedExtensions.includes(file.type) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      return setError('Invalid file format. Please select a JPG, PNG, or WEBP image.');
    }

    if (file.size > maxFileSize) {
      return setError('File size exceeds the maximum limit of 5MB.');
    }

    setError(null);
    setSelectedFile(file);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null);
    setImagePreview(null);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side guard
    if (!form.name.trim()) return setError('Product name is required.');
    if (form.categoryId < 1) return setError('Please select a category.');
    if (form.price <= 0) return setError('Price must be greater than zero.');
    if (form.stockQuantity < 0) return setError('Stock quantity cannot be negative.');

    setError(null);
    setLoading(true);

    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        categoryId: Number(form.categoryId),
        imageFile: selectedFile,
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
    'w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 hover:border-slate-700 transition-all font-medium';

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
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-indigo-400" />
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

          {/* Category — full width */}
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

          {/* Price + Stock — side by side, 50 / 50 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
          </div>

          {/* Product Image Drag & Drop / File Picker */}
          <div>
            <label className={labelClass}>Product Image</label>
            {imagePreview ? (
              <div className="relative w-full h-44 rounded-xl border border-slate-800 bg-[#0E1524] overflow-hidden flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Product Showcase Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={loading}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Image</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-[#0E1524]'
                }`}
              >
                <input
                  type="file"
                  id="ap-file-upload"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="ap-file-upload"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </span>
                </label>
              </div>
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-70 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
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

