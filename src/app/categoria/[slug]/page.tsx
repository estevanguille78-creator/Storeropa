'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';
import { fetchWithCache } from '@/lib/cache';
import { SlidersHorizontal, ChevronRight, X, ArrowUpDown } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadCategoryAndProducts() {
      try {
        const [cats, prods] = await Promise.all([
          fetchWithCache<Category[]>('/api/categories'),
          fetchWithCache<Product[]>(`/api/products?category=${slug}`),
        ]);

        if (Array.isArray(cats)) {
          const current = cats.find((c) => c.slug === slug);
          setCategory(current || null);
        }

        if (Array.isArray(prods)) {
          setProducts(prods);
        }
      } catch (err) {
        console.error('Error loading category data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadCategoryAndProducts();
    }
  }, [slug]);

  // Extract all available sizes, colors and badges dynamically from products
  const { availableSizes, availableColors, availableBadges } = useMemo(() => {
    const sizesSet = new Set<string>();
    const colorsMap = new Map<string, string>();
    const badgesSet = new Set<string>();

    products.forEach((p) => {
      p.attributes?.tallas?.forEach((s) => sizesSet.add(s));
      p.attributes?.colores?.forEach((c) => colorsMap.set(c.label, c.hex));
      if (p.badge) badgesSet.add(p.badge);
    });

    return {
      availableSizes: Array.from(sizesSet),
      availableColors: Array.from(colorsMap.entries()).map(([label, hex]) => ({ label, hex })),
      availableBadges: Array.from(badgesSet),
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedSize && !p.attributes?.tallas?.includes(selectedSize)) {
          return false;
        }
        if (selectedColor && !p.attributes?.colores?.some((c) => c.label === selectedColor)) {
          return false;
        }
        if (selectedBadge && p.badge !== selectedBadge) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedSize, selectedColor, selectedBadge, sortBy]);

  const hasActiveFilters = selectedSize || selectedColor || selectedBadge;

  const clearFilters = () => {
    setSelectedSize(null);
    setSelectedColor(null);
    setSelectedBadge(null);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/50 min-h-screen pb-20">
        {/* Category Header Banner */}
        <div className="relative bg-slate-900 text-white py-12 md:py-16 overflow-hidden">
          {category?.image_url && (
            <div className="absolute inset-0 opacity-20">
              <Image
                src={category.image_url}
                alt={category?.name || 'Categoría'}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                Inicio
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{category?.name || 'Colección'}</span>
            </nav>

            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              {category?.name || 'Colección'}
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-xl mt-2">
              {category?.description ||
                'Descubre nuestra selección con cortes exclusivos, materiales seleccionados y diseño de marca personal.'}
            </p>
          </div>
        </div>

        {/* Content Section with Filters & Products */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Top Bar for Sorting and Mobile Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-button text-xs font-semibold text-gray-800 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              <span className="text-xs text-gray-500 font-medium">
                Mostrando <strong className="text-gray-900">{filteredProducts.length}</strong> productos
              </span>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <label htmlFor="sort-by" className="text-xs text-gray-500 font-medium">Ordenar por:</label>
              <select
                id="sort-by"
                aria-label="Ordenar productos por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')}
                className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Grid Layout: Sidebar Filters + Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block space-y-6">
              {hasActiveFilters && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900">Filtros activos</span>
                  <button
                    onClick={clearFilters}
                    className="text-xs text-amber-700 hover:text-amber-900 underline font-medium"
                  >
                    Limpiar todo
                  </button>
                </div>
              )}

              {/* Tallas */}
              {availableSizes.length > 0 && (
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Tallas Disponibles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                        className={`min-w-[40px] px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedSize === size
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colores */}
              {availableColors.length > 0 && (
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Colores
                  </h4>
                  <div className="space-y-2">
                    {availableColors.map((col) => (
                      <button
                        key={col.label}
                        onClick={() => setSelectedColor(selectedColor === col.label ? null : col.label)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedColor === col.label
                            ? 'bg-slate-900 text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-gray-300"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.label}</span>
                        </span>
                        {selectedColor === col.label && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges / Colecciones */}
              {availableBadges.length > 0 && (
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                    Colección / Etiqueta
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {availableBadges.map((badge) => (
                      <button
                        key={badge}
                        onClick={() => setSelectedBadge(selectedBadge === badge ? null : badge)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          selectedBadge === badge
                            ? 'bg-slate-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                  <h3 className="font-bold text-gray-900 text-lg">No encontramos productos</h3>
                  <p className="text-gray-500 text-sm mt-1 mb-6">
                    Prueba ajustando los filtros seleccionados de talla o color.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-button text-xs font-semibold hover:bg-slate-800"
                  >
                    Restablecer filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-white shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h3 className="font-bold text-base text-gray-900">Filtros de Búsqueda</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tallas */}
                {availableSizes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Tallas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                            selectedSize === size
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colores */}
                {availableColors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                      Colores
                    </h4>
                    <div className="space-y-1.5">
                      {availableColors.map((col) => (
                        <button
                          key={col.label}
                          onClick={() =>
                            setSelectedColor(selectedColor === col.label ? null : col.label)
                          }
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                            selectedColor === col.label
                              ? 'bg-slate-900 text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-gray-300"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.label}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-2.5 border border-gray-200 rounded-button text-xs font-semibold text-gray-700"
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-2.5 bg-slate-900 text-white rounded-button text-xs font-semibold"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

