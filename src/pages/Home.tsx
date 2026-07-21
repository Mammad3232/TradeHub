import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShopByCategory } from '../components/ShopByCategory';
import { ProductGrid } from '../components/ProductGrid';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="space-y-16 pb-16">
      {/* ── Hero Banner Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1120] to-[#151C2C] border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-12 py-16 relative z-10">
          {/* Left Column: Content */}
          <div className="text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 text-xs text-purple-400 font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>SUMMER SALE — GET UP TO 50% OFF</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              A Premium Space For{' '}
              <span className="bg-gradient-to-r from-purple-500 via-indigo-400 to-sky-400 bg-clip-text text-transparent bg-size-200">
                Modern Shopping
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Explore hundreds of handpicked items from verified independent creators and global vendors. Enjoy flat shipping fees and real-time tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('marketplace-grid');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
              <Link 
                to="/vendor-register"
                className="w-full sm:w-auto bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white font-medium py-3.5 px-8 rounded-xl border border-slate-700 hover:border-slate-650 transition-all duration-200 text-center"
              >
                Become a Vendor
              </Link>
            </div>
          </div>

          {/* Right Column: Feature Card */}
          <div className="w-full flex justify-center items-center relative">
            <div className="w-full max-w-md bg-[#0F172A]/80 border border-slate-800/60 p-6 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] hover:shadow-[0_0_50px_rgba(99,102,241,0.25)] hover:border-slate-700/60 transition-all duration-500 group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-slate-800/80 bg-gradient-to-br from-amber-400 to-amber-500">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60"
                  alt="Aether Sound Wave Pro"
                  className="w-full h-full object-cover opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Visual Glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold bg-purple-600 text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-purple-600/40">
                    Premium Sound
                  </span>
                </div>

                {/* Text Description Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Aether Sound Wave Pro</h3>
                  <p className="text-sm text-slate-350 mt-1 font-semibold">$299.99 — Free Shipping</p>
                </div>
              </div>
            </div>

            {/* Custom 3D Glowing ring element behind */}
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl pointer-events-none -z-10 group-hover:bg-indigo-500/10 transition-all duration-500" />
          </div>
        </div>
      </section>

      {/* ── Shop by Category Section ─────────────────────────────── */}
      <ShopByCategory selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* ── Product Grid Section ──────────────────────────────────── */}
      <div id="marketplace-grid">
        <ProductGrid />
      </div>
    </div>
  );
};
