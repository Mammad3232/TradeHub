import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import { ProductGrid } from '../components/ProductGrid';
import { ShopByCategory } from '../components/ShopByCategory';

export const MarketplaceCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
  };

  const handleSelectSubcategory = (sub: string | null) => {
    setSelectedSubcategory(sub);
  };

  const handleSelectBrand = (brand: string | null) => {
    setSelectedBrand(brand);
  };

  const handleResetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedBrand(null);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 pb-16">
      {/* ── Category Showcase Header Row ──────────────────────────────────── */}
      <ShopByCategory
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* ── Main Catalog & Sidebar Grid ───────────────────────────────────── */}
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
  );
};
