import React, { useState } from 'react';
import { Package, Plus, Edit, Trash, X, DollarSign, Tag, Archive } from 'lucide-react';

interface VendorProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

const initialProducts: VendorProduct[] = [
  {
    id: 1,
    title: 'Aether Sound Wave Wireless Headphones',
    category: 'Electronics',
    price: 299.99,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 2,
    title: 'Chronos Classic Minimalist Watch',
    category: 'Accessories',
    price: 189.50,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60'
  },
  {
    id: 3,
    title: 'Vanguard Ergonomic Mechanical Keyboard',
    category: 'Electronics',
    price: 149.00,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=60'
  }
];

export const VendorProducts: React.FC = () => {
  const [products, setProducts] = useState<VendorProduct[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !stock) return;

    const newProduct: VendorProduct = {
      id: Date.now(),
      title,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60' // Default placeholder watch
    };

    setProducts((prev) => [newProduct, ...prev]);
    setIsModalOpen(false);

    // Reset fields
    setTitle('');
    setCategory('Electronics');
    setPrice('');
    setStock('');
  };

  const handleDeleteProduct = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
          <Plus className="h-4.5 w-4.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
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
              {products.map((p) => (
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
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
                        Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Product Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-850 flex justify-between items-center bg-slate-950/40">
              <h2 className="text-lg font-bold text-white">Add New Product Listing</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddProduct} className="p-6 space-y-5">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Product Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className="w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Archive className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Price ($)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="199.99"
                      className="w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <DollarSign className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>

                {/* Stock */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Stock (Units)</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="50"
                      className="w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Package className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                  </select>
                  <Tag className="absolute left-3 top-3.5 h-4.5 w-4.5 text-slate-500" />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-850 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
