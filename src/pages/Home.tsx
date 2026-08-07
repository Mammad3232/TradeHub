import React from "react";
import { useSearchParams } from "react-router-dom";
import { ShopByCategory } from "../components/ShopByCategory";
import { ProductGrid } from "../components/ProductGrid";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";
import { useTranslation } from "react-i18next";

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const selectedSubcategory = searchParams.get("subcategory");
  const selectedBrand = searchParams.get("brand");

  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const handleSelectCategory = (catNameOrId: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (catNameOrId) {
          next.set("category", catNameOrId.toLowerCase());
          next.delete("subcategory");
          next.delete("brand");
        } else {
          next.delete("category");
          next.delete("subcategory");
          next.delete("brand");
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleSelectSubcategory = (subSlug: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (subSlug) {
          next.set("subcategory", subSlug.toLowerCase());
          next.delete("brand");
        } else {
          next.delete("subcategory");
          next.delete("brand");
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleSelectBrand = (brandName: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (brandName) {
          next.set("brand", brandName);
        } else {
          next.delete("brand");
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleResetAllFilters = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("category");
        next.delete("subcategory");
        next.delete("brand");
        return next;
      },
      { replace: true }
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1120] to-[#151C2C] border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 lg:px-12 py-16 relative z-10">
          <div className="text-left space-y-6 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/25 rounded-full px-4 py-1.5 text-xs text-purple-400 font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>{t('hero.saleBadge')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('hero.titlePrefix')}{" "}
              <span className="bg-gradient-to-r from-purple-500 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("marketplace-grid");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{t('hero.shopNow')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center items-center relative">
            <div className="w-full max-w-md bg-[#0F172A]/80 border border-slate-800/60 p-6 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] hover:shadow-[0_0_50px_rgba(99,102,241,0.25)] hover:border-slate-700/60 transition-all duration-500 group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden relative border border-slate-800/80 bg-gradient-to-br from-amber-400 to-amber-500">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60"
                  alt="Aether Sound Wave Pro"
                  className="w-full h-full object-cover opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-bold bg-purple-600 text-white px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg shadow-purple-600/40">
                    Premium Sound
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-left">
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Aether Sound Wave Pro</h3>
                  <p className="text-sm mt-1 font-semibold text-slate-300">{formatPrice(299.99)} - {t('hero.freeShipping')}</p>
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl pointer-events-none -z-10" />
          </div>
        </div>
      </section>

      {/* Level 1 Category Cards Header */}
      <ShopByCategory
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Unified Marketplace Feed (Departments Sidebar + Brands Bar + Product Grid) */}
      <div id="marketplace-grid">
        <ProductGrid
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          selectedBrand={selectedBrand}
          onSelectCategory={handleSelectCategory}
          onSelectSubcategory={handleSelectSubcategory}
          onSelectBrand={handleSelectBrand}
          onResetAllFilters={handleResetAllFilters}
        />
      </div>
    </div>
  );
};