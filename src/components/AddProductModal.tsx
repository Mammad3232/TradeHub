import React, { useState, useEffect, useCallback } from "react";
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
  FolderTree,
  Tag,
} from "lucide-react";
import { createProduct, getBrands, type CreateProductInput, type Brand } from "../services/productService";
import apiClient from "../services/apiClient";

// ── Types ────────────────────────────────────────────────────────────────────

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
  productCount: number;
  subcategories?: Subcategory[];
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const blankForm = (): CreateProductInput => ({
  name: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  lowStockThreshold: undefined,
  categoryId: 0,
  subcategoryId: null,
  brandId: null,
  imageFile: null,
});

// Fallback category tree if backend is unreachable
const fallbackCategories: Category[] = [
  {
    id: 1, name: "Electronics", productCount: 0,
    subcategories: [
      { id: 1, categoryId: 1, name: "Phones & Tablets", slug: "phones" },
      { id: 2, categoryId: 1, name: "Computers & Laptops", slug: "laptops" },
      { id: 3, categoryId: 1, name: "Home Appliances", slug: "appliances" },
      { id: 4, categoryId: 1, name: "Audio & Gadgets", slug: "audio" },
    ],
  },
  {
    id: 2, name: "Fashion", productCount: 0,
    subcategories: [
      { id: 5, categoryId: 2, name: "Men's Clothing", slug: "men" },
      { id: 6, categoryId: 2, name: "Women's Clothing", slug: "women" },
      { id: 7, categoryId: 2, name: "Shoes & Sneakers", slug: "shoes" },
      { id: 8, categoryId: 2, name: "Accessories", slug: "accessories" },
    ],
  },
  {
    id: 3, name: "Home Decor", productCount: 0,
    subcategories: [
      { id: 9, categoryId: 3, name: "Furniture", slug: "furniture" },
      { id: 10, categoryId: 3, name: "Lighting", slug: "lighting" },
      { id: 11, categoryId: 3, name: "Kitchenware", slug: "kitchen" },
      { id: 12, categoryId: 3, name: "Textiles & Bedding", slug: "textiles" },
    ],
  },
  {
    id: 4, name: "Books", productCount: 0,
    subcategories: [
      { id: 13, categoryId: 4, name: "Fiction & Novels", slug: "fiction" },
      { id: 14, categoryId: 4, name: "Sci-Fi & Fantasy", slug: "scifi" },
      { id: 15, categoryId: 4, name: "Personal Dev.", slug: "personal" },
      { id: 16, categoryId: 4, name: "Kids Books", slug: "kids" },
    ],
  },
  {
    id: 5, name: "Fitness", productCount: 0,
    subcategories: [
      { id: 17, categoryId: 5, name: "Gym Equipment", slug: "gym" },
      { id: 18, categoryId: 5, name: "Sportswear", slug: "sportswear" },
      { id: 19, categoryId: 5, name: "Supplements", slug: "supplements" },
      { id: 20, categoryId: 5, name: "Smart Wearables", slug: "wearables" },
    ],
  },
  {
    id: 6, name: "Beverages", productCount: 0,
    subcategories: [
      { id: 21, categoryId: 6, name: "Hot Drinks", slug: "hot" },
      { id: 22, categoryId: 6, name: "Cold Drinks", slug: "cold" },
      { id: 23, categoryId: 6, name: "Energy Drinks", slug: "energy" },
      { id: 24, categoryId: 6, name: "Organic Juices", slug: "organic" },
    ],
  },
];

// Fallback brands if backend is unreachable
const fallbackBrands: Brand[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Samsung" },
  { id: 3, name: "Sony" },
  { id: 4, name: "Bose" },
  { id: 5, name: "Dyson" },
  { id: 6, name: "Logitech" },
  { id: 7, name: "LG" },
  { id: 8, name: "Nike" },
  { id: 9, name: "Adidas" },
  { id: 10, name: "Zara" },
  { id: 11, name: "H&M" },
  { id: 12, name: "Casio" },
  { id: 13, name: "IKEA" },
  { id: 14, name: "Philips" },
  { id: 15, name: "Penguin Books" },
  { id: 16, name: "O'Reilly Media" },
  { id: 17, name: "Gymshark" },
  { id: 18, name: "Garmin" },
  { id: 19, name: "Decathlon" },
  { id: 20, name: "Starbucks" },
];

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fetch categories and brands from the live API; fall back to structured list on failure
  useEffect(() => {
    if (!isOpen) return;
    apiClient
      .get<never, Category[]>("/categories")
      .then((data) => {
        if (data && data.length > 0) {
          setCategories(data);
        } else {
          setCategories(fallbackCategories);
        }
      })
      .catch(() => setCategories(fallbackCategories));

    getBrands()
      .then((data) => {
        if (data && data.length > 0) {
          setBrands(data);
        } else {
          setBrands(fallbackBrands);
        }
      })
      .catch(() => setBrands(fallbackBrands));
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Derive available subcategories for selected parent category
  const activeCategory = categories.find((c) => c.id === form.categoryId);
  const availableSubcategories = activeCategory?.subcategories ?? [];

  const resetState = useCallback(() => {
    setForm(blankForm());
    setSelectedFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setDragActive(false);
    setError(null);
    setLoading(false);
    setSaved(false);
  }, [imagePreview]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const set = <K extends keyof CreateProductInput>(field: K, val: CreateProductInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (error) setError(null);
  };

  const handleCategoryChange = (catId: number) => {
    setForm((prev) => ({
      ...prev,
      categoryId: catId,
      subcategoryId: null, // Reset subcategory when parent category changes
    }));
    if (error) setError(null);
  };

  const processFile = (file: File) => {
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      return setError("Invalid file format. Please upload a .jpg, .png, or .webp image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return setError("File is too large. Maximum allowed size is 5 MB.");
    }
    setError(null);
    setSelectedFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return setError("Product name is required.");
    if (form.categoryId < 1) return setError("Please select a parent Category.");
    if (availableSubcategories.length > 0 && !form.subcategoryId) {
      return setError("Please select a Department / Subcategory.");
    }
    if (!form.brandId) return setError("Please select a Brand.");
    if (form.price <= 0) return setError("Price must be greater than zero.");
    if (form.stockQuantity < 0) return setError("Stock quantity cannot be negative.");

    setError(null);
    setLoading(true);

    try {
      await createProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: form.lowStockThreshold != null && form.lowStockThreshold > 0 ? Number(form.lowStockThreshold) : null,
        categoryId: Number(form.categoryId),
        subcategoryId: form.subcategoryId ? Number(form.subcategoryId) : null,
        brandId: form.brandId ? Number(form.brandId) : null,
        imageFile: selectedFile,
      });

      setSaved(true);
      setTimeout(() => {
        resetState();
        onSuccess();
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-[#151C2C] border border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const labelClass = "block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#0B1120] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-[#0F172A]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Add New Product</h2>
              <p className="text-xs text-slate-400">Create a listing for your store catalog</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Product created successfully! Refreshing...</span>
            </div>
          )}

          {/* Product Name */}
          <div>
            <label htmlFor="ap-name" className={labelClass}>
              Product Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                id="ap-name"
                type="text"
                required
                placeholder="e.g. Aether Sound Wave Wireless Headphones"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={`${inputClass} pl-9`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Parent Category, Department (Subcategory) & Brand — 3 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label htmlFor="ap-category" className={labelClass}>
                Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <select
                  id="ap-category"
                  required
                  value={form.categoryId === 0 ? "" : form.categoryId}
                  onChange={(e) => handleCategoryChange(Number(e.target.value))}
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

            {/* Dependent Department / Subcategory */}
            <div>
              <label htmlFor="ap-subcategory" className={labelClass}>
                Department / Subcategory <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <select
                  id="ap-subcategory"
                  required
                  value={form.subcategoryId ?? ""}
                  onChange={(e) => set("subcategoryId", Number(e.target.value))}
                  className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                  disabled={loading || !form.categoryId || form.categoryId === 0}
                >
                  <option value="" disabled>
                    {!form.categoryId || form.categoryId === 0
                      ? "Select parent Category first…"
                      : "Select a department…"}
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand Dropdown */}
            <div>
              <label htmlFor="ap-brand" className={labelClass}>
                Brand <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <select
                  id="ap-brand"
                  required
                  value={form.brandId ?? ""}
                  onChange={(e) => set("brandId", Number(e.target.value))}
                  className={`${inputClass} pl-9 appearance-none cursor-pointer`}
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select a brand…
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Price + Stock + Low Stock Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label htmlFor="ap-price" className={labelClass}>
                Price ($) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ap-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="299.99"
                  value={form.price || ""}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className={`${inputClass} pl-9`}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ap-stock" className={labelClass}>
                Stock Quantity <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ap-stock"
                  type="number"
                  min="0"
                  required
                  placeholder="50"
                  value={form.stockQuantity || ""}
                  onChange={(e) => set("stockQuantity", Number(e.target.value))}
                  className={`${inputClass} pl-9`}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ap-low-stock" className={labelClass}>
                Low Stock Alert
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  id="ap-low-stock"
                  type="number"
                  min="0"
                  placeholder="e.g. 5 (0 = Off)"
                  value={form.lowStockThreshold ?? ""}
                  onChange={(e) => set("lowStockThreshold", e.target.value === "" ? undefined : Number(e.target.value))}
                  className={`${inputClass} pl-9`}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ap-description" className={labelClass}>
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <textarea
                id="ap-description"
                rows={3}
                placeholder="Describe key features, specs, materials..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className={`${inputClass} pl-9 resize-none`}
                disabled={loading}
              />
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className={labelClass}>Product Image</label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group h-44">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-800 hover:border-slate-700 bg-[#151C2C]/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-300 font-medium mb-1">
                  Drag and drop image here, or{" "}
                  <label htmlFor="ap-file" className="text-indigo-400 hover:underline cursor-pointer font-bold">
                    browse
                  </label>
                </p>
                <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
                <input
                  id="ap-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-semibold transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || saved}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};