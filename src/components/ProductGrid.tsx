import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getProducts } from '../services/api';

interface MockProduct {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  badge?: 'Sale' | 'New' | 'Hot' | null;
  discount?: number;
}

const mockFeaturedProducts: MockProduct[] = [
  {
    id: 1,
    title: 'Aether Sound Wave Pro Wireless Headphones',
    brand: 'AETHER',
    category: 'Electronics',
    price: 299.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    badge: 'Hot',
  },
  {
    id: 2,
    title: 'Minimalist Leather Watch Chrono v2',
    brand: 'HOROLOGS',
    category: 'Fashion',
    price: 189.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    badge: 'New',
  },
  {
    id: 3,
    title: 'Ergonomic Walnut Desk Stand',
    brand: 'OAKWOOD',
    category: 'Home Decor',
    price: 124.50,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    badge: 'Sale',
    discount: 15,
  },
  {
    id: 4,
    title: 'Smart Fitness Ring 3rd Gen',
    brand: 'VITALIS',
    category: 'Electronics',
    price: 349.99,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Luxe Fleece Unisex Oversized Hoodie',
    brand: 'VENDORA ESSENTIALS',
    category: 'Fashion',
    price: 79.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Smart Ambiance LED Corner Light',
    brand: 'LUMINA',
    category: 'Home Decor',
    price: 89.00,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    badge: 'Sale',
    discount: 20,
  },
  {
    id: 7,
    title: 'Mechanical Hot-Swappable Keyboard (Linear)',
    brand: 'KTYPE',
    category: 'Electronics',
    price: 159.99,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    badge: 'New',
  },
  {
    id: 8,
    title: 'Minimalist Porcelain Drip Coffee Set',
    brand: 'BREW',
    category: 'Home Decor',
    price: 45.00,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
  },
];

// ── Image URL resolver (mirrors ProductCard logic) ───────────────────────────
const BACKEND_ORIGIN = 'http://localhost:5229';
const PLACEHOLDER = 'https://placehold.co/600x400/0f172a/1e293b?text=No+Image';

const resolveImage = (raw?: string): string => {
  if (!raw) return PLACEHOLDER;
  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('blob:') ||
    raw.startsWith('data:')
  ) return raw;
  return `${BACKEND_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
};

export const ProductGrid: React.FC = () => {
  const { addToCart, toggleWishlist, isWishlisted, pushToast, setMiniCartOpen } = useShop();

  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    getProducts()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped: MockProduct[] = data.map((p) => ({
            id: p.id,
            title: p.title,
            brand: p.category.toUpperCase(),
            category: p.category,
            price: p.price,
            rating: p.rating || 4.5,
            image: resolveImage(p.image),
          }));
          setProducts(mapped);
        } else {
          setProducts(mockFeaturedProducts);
        }
      })
      .catch(() => setProducts(mockFeaturedProducts))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: MockProduct) => {
    addToCart({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.image,
    });

    // Flash the check icon for 1.5 s
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(
      () => setAddedIds((prev) => ({ ...prev, [product.id]: false })),
      1500,
    );

    pushToast(`"${product.title.split(' ').slice(0, 3).join(' ')}…" added to cart!`, 'cart');
    setMiniCartOpen(true);
  };

  const handleToggleWishlist = (product: MockProduct) => {
    const wasInList = isWishlisted(product.id);
    toggleWishlist({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: product.image,
    });
    pushToast(
      wasInList ? 'Removed from wishlist' : `Added "${product.title.split(' ').slice(0, 3).join(' ')}…" to wishlist`,
      'wishlist',
    );
  };

  return (
    <section className="w-full bg-[#060913] py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Section Header */}
        <div className="flex items-end justify-between border-b border-slate-800/60 pb-5">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trending Now
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Discover the most popular products right now.
            </p>
          </div>
          <a
            href="/deals"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* ── Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
            const wishlisted = isWishlisted(product.id);
            const justAdded  = !!addedIds[product.id];

            return (
              <article
                key={product.id}
                className="group relative bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300"
              >
                {/* ── Product Image Box */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-950 rounded-t-2xl">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover object-center rounded-t-2xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
                  />

                  {/* Faded overlay on card hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg ${
                        product.badge === 'Sale'
                          ? 'bg-rose-500 text-white shadow-rose-500/20'
                          : product.badge === 'New'
                          ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                          : 'bg-amber-500 text-black shadow-amber-500/20'
                      }`}>
                        {product.badge} {product.discount && `-${product.discount}%`}
                      </span>
                    </div>
                  )}

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleWishlist(product)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer hover:scale-110 ${
                      wishlisted
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        : 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:text-rose-400'
                    }`}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className={`h-4 w-4 transition-all duration-200 ${
                        wishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* ── Product Info */}
                <div className="flex-1 p-5 flex flex-col gap-3">

                  {/* Brand & Category */}
                  <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-slate-500">
                    <span className="uppercase">{product.brand}</span>
                    <span className="text-purple-400/80">{product.category}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {product.title}
                  </h3>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= Math.round(product.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-800 text-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-400 ml-1">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Price & Add-to-Cart */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/80">
                    <div>
                      <span className="text-lg font-bold text-white">${product.price.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        justAdded
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 scale-110'
                          : 'border-slate-700 bg-slate-900/50 hover:bg-purple-600 hover:border-purple-500 hover:text-white text-slate-300'
                      }`}
                      aria-label="Add to cart"
                    >
                      {justAdded
                        ? <Check className="h-4 w-4" />
                        : <ShoppingCart className="h-4 w-4" />
                      }
                    </button>
                  </div>

                </div>
              </article>
            );
          })}
        </div>
        )}

      </div>
    </section>
  );
};
