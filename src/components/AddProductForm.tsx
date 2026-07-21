import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Tag,
  DollarSign,
  Layers,
  FileText,
  AlertCircle,
  Sparkles,
  Info,
} from 'lucide-react';

interface ProductFormInput {
  title: string;
  category: string;
  tags: string;
  description: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  sku: string;
  lowStockAlert: boolean;
}

export const AddProductForm: React.FC = () => {
  const [productForm, setProductForm] = useState<ProductFormInput>({
    title: '',
    category: 'Electronics',
    tags: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    sku: '',
    lowStockAlert: true,
  });

  const [dragActive, setDragActive] = useState(false);
  const [_uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const file = e.dataTransfer.files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleSaveDraft = () => {
    alert(`Draft saved successfully!\nTitle: ${productForm.title || 'Untitled Product'}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API Call
    setTimeout(() => {
      alert(`Product Published Successfully! 🎉\n\nTitle: ${productForm.title}\nPrice: $${productForm.price}\nStock: ${productForm.stock} units`);
      setProductForm({
        title: '',
        category: 'Electronics',
        tags: '',
        description: '',
        price: '',
        compareAtPrice: '',
        stock: '',
        sku: '',
        lowStockAlert: true,
      });
      removeUploadedImage();
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left max-w-7xl mx-auto">
      {/* Form Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Basic Details & Pricing & Inventory */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* ─── Card 1: Basic Details ─── */}
          <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
            {/* Ambient accent background glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/10 transition-colors duration-500" />
            
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Basic Details</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define core identifiers, categorization, and keywords.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Product Title */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Product Title
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">Required</span>
                </div>
                <input
                  id="title"
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Aether Sound Wave Pro Wireless"
                  className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium"
                />
              </div>

              {/* Category & Tags Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Category Dropdown */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="category" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      id="category"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all cursor-pointer font-medium appearance-none"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home Decor">Home Decor</option>
                      <option value="Books">Books</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Kitchenware">Kitchenware</option>
                    </select>
                    {/* Custom Select Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Tags Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="tags" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Search Tags</span>
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="e.g. wireless, premium, headwear"
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Description Textarea */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Description
                  </label>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3 text-purple-400" /> AI writer helper available
                  </span>
                </div>
                <textarea
                  id="description"
                  rows={5}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Provide an engaging and detailed specification of the item..."
                  className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-medium resize-y min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* ─── Card 2: Pricing & Inventory ─── */}
          <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
            {/* Ambient accent background glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-600/10 transition-colors duration-500" />

            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Pricing & Inventory</h3>
                <p className="text-xs text-slate-400 mt-0.5">Define your margin parameters and initial inventory volumes.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Price Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Price Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="price" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Retail Price ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-[#0E1524] border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>

                {/* Compare-at Price Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="compareAtPrice" className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>Compare-at Price ($)</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-normal uppercase">Discount Indicator</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                    <input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      value={productForm.compareAtPrice}
                      onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-[#0E1524] border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-semibold font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Stock Quantity */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="stock" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Stock Quantity
                  </label>
                  <input
                    id="stock"
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-semibold font-mono"
                  />
                </div>

                {/* SKU Code */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="sku" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    id="sku"
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. TS-PTH-BLK-01"
                    className="w-full bg-[#0E1524] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 hover:border-slate-700/80 transition-all font-semibold font-mono"
                  />
                </div>
              </div>

              {/* Low Stock Alert Option */}
              <div className="flex items-center gap-3 bg-[#0E1524] p-4 rounded-xl border border-slate-800/80">
                <input
                  id="lowStockAlert"
                  type="checkbox"
                  checked={productForm.lowStockAlert}
                  onChange={(e) => setProductForm({ ...productForm, lowStockAlert: e.target.checked })}
                  className="w-4.5 h-4.5 rounded border-slate-800 text-purple-600 bg-slate-900 focus:ring-purple-500 focus:ring-offset-[#111827] cursor-pointer"
                />
                <div className="flex flex-col">
                  <label htmlFor="lowStockAlert" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Enable automatic low inventory notifications
                  </label>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    We will trigger alerts when stock values fall below a threshold of 5 units.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media Drag & Drop and Preview */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* ─── Card 3: Media Upload Panel ─── */}
          <div className="bg-[#111827] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden group flex flex-col h-full">
            
            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">Media</h3>
                <p className="text-xs text-slate-400 mt-0.5">Upload product showcase image.</p>
              </div>
            </div>

            <div className="flex-grow flex flex-col gap-5 justify-between">
              {imagePreview ? (
                /* Showcase Image Preview State */
                <div className="relative w-full aspect-square rounded-2xl border border-slate-800 bg-[#0E1524] overflow-hidden flex items-center justify-center group/preview">
                  <img src={imagePreview} alt="Showcase Preview" className="w-full h-full object-cover" />
                  
                  {/* Action overlays on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/preview:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm gap-2">
                    <button
                      type="button"
                      onClick={removeUploadedImage}
                      className="bg-rose-600 hover:bg-rose-500 p-3.5 rounded-2xl text-white shadow-xl transition-all hover:scale-105 cursor-pointer flex items-center gap-2 text-xs font-bold"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-slate-800 hover:border-slate-700 bg-[#0E1524]'
                  }`}
                >
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="product-image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer select-none">
                    <div className="w-14 h-14 rounded-2xl bg-[#111827] border border-slate-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-4">
                      <Upload className="w-7 h-7 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">Drag & Drop image here</span>
                    <span className="text-[10px] text-slate-550 mt-1">or click to browse local files</span>
                    
                    <div className="mt-6 flex flex-col gap-1 items-center bg-[#111827]/60 px-4 py-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                        <Info className="w-3 h-3 text-purple-400" /> Specifications
                      </span>
                      <span className="text-[9px] text-slate-550">Supports PNG, JPG, WEBP (Max 5MB)</span>
                    </div>
                  </label>
                </div>
              )}

              {/* Status Helper Card */}
              <div className="bg-[#0E1524] p-4 border border-slate-800/80 rounded-xl flex items-start gap-3 mt-auto">
                <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Publishing note</span>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Make sure to specify an attractive showcase photo. Clear product shots increase conversion rates by up to 45%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Sticky Form Action Buttons Footer ─── */}
      <div className="border-t border-slate-800/85 pt-6 flex flex-col sm:flex-row sm:justify-end gap-3.5">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="px-6 py-3.5 bg-[#111827] hover:bg-[#1C2434] text-slate-300 hover:text-white border border-slate-800/80 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[.98] cursor-pointer disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-550/30 active:scale-[.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
        >
          {isSubmitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4.5 h-4.5" />
          )}
          <span>{isSubmitting ? 'Publishing...' : 'Publish Product'}</span>
        </button>
      </div>
    </form>
  );
};
