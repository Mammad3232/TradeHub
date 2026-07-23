import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, X, DollarSign, Tag, Archive, Loader2, AlertCircle } from 'lucide-react';
import { getProducts, createProduct, deleteProduct, type Product } from '../services/productService';
import apiClient from '../services/apiClient';

interface VendorProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

const CATEGORY_LIST = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Books',
  'Sports & Fitness',
  'Food & Beverage',
];

export const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch categories to get ID by name
  const [categoryMap, setCategoryMap] = useState<Record<string, number>>({});

  // Load products from backend on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data.map((p: Product) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        stock: p.stockQuantity,
        image: p.image,
      })));
    } catch {
      setError('Failed to load products from server.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await apiClient.get<never, { id: number; name: string; productCount: number }[]>('/categories');
      const map: Record<string, number> = {};
      cats.forEach((c) => { map[c.name] = c.id; });
      setCategoryMap(map);
    } catch {
      // default IDs for seeded categories if API call fails
      setCategoryMap({
        'Electronics': 1,
        'Fashion': 2,
        'Home & Living': 3,
        'Books': 4,
        'Sports & Fitness': 5,
        'Food & Beverage': 6,
      });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stock) return;

    setSubmitting(true);
    setError(null);

    try {
      const categoryId = categoryMap[category] ?? 1;
      const created = await createProduct({
        name: title,
        description: description || `${title} — quality product.`,
        price: parseFloat(price),
        stockQuantity: parseInt(stock, 10),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60',
        categoryId,
      });

      setProducts((prev) => [
        {
          id: created.id,
          title: created.title,
          category: created.category,
          price: created.price,
          stock: created.stockQuantity,
          image: created.image,
        },
        ...prev,
      ]);

      // Reset form
      setIsModalOpen(false);
      setTitle('');
      setCategory('Electronics');
      setPrice('');
      setStock('');
      setDescription('');
      setImageUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to create product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 text-left relative">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/25">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Products Catalog</h1>
            <p className="text-sm text-slate-400 mt-1">Manage and edit your active marketplace listings.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-purple-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/40 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-350">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                      <Archive className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>No products yet. Click <strong>Add Product</strong> to get started.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-950/20 transition-colors">
                      <td className="px-6 py-4 flex items-center space-x-3.5">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-10 w-10 rounded-lg object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                        />
                        <span className="font-semibold text-white block truncate max-w-xs">{p.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full border border-indigo-500/10">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">${p.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-medium">{p.stock} units</td>
                      <td className="px-6 py-4">
                        {p.stock > 0 ? (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          className="inline-flex items-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                          onClick={() => alert(`Edit product #${p.id} — full edit modal coming in next iteration.`)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="inline-flex items-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Add Product Modal ─────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#111827] border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">New Product</h2>
                <p className="text-xs text-slate-400 mt-0.5">Saved directly to the marketplace database.</p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setError(null); }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-xs mb-4">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief product description..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    <Tag className="inline h-3 w-3 mr-1" />Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CATEGORY_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    <DollarSign className="inline h-3 w-3 mr-1" />Price (USD) *
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Stock + Image URL row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    <Archive className="inline h-3 w-3 mr-1" />Stock Qty *
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(null); }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
