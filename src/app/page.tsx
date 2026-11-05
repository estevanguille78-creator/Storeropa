'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useTheme } from '@/components/ThemeProvider';
import { Product, Category } from '@/lib/types';
import { fetchWithCache } from '@/lib/cache';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const { settings } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchWithCache<Category[]>('/api/categories'),
          fetchWithCache<Product[]>('/api/products'),
        ]);

        if (Array.isArray(cats)) {
          setCategories(cats.filter((c) => c.is_active));
        }

        if (Array.isArray(prods)) {
          setAllProducts(prods);
          setFeaturedProducts(prods.filter((p) => p.is_featured));
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const storeName = settings?.store_name || 'Demo Store';
  const tagline = settings?.tagline || 'Moda Exclusiva & Marca Personal';
  const brandBio =
    settings?.brand_bio ||
    'Piezas diseñadas para transmitir carácter, elegancia urbana y confort premium en cada detalle.';
  const brandStory =
    settings?.brand_story ||
    'Nuestra marca nació de la pasión por transformar prendas cotidianas en declaraciones de estilo propio.';
  const profileImg =
    settings?.brand_profile_img ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  const filteredProducts =
    selectedCategoryTab === 'todos'
      ? allProducts
      : allProducts.filter((p) => p.category_slug === selectedCategoryTab);

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION: Marca Personal & Colección Híbrida */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 lg:py-24">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Brand Story & Call to Action */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Nueva Colección 2026 • Diseño de Autor</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                  {tagline}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                  {brandBio}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <a
                    href="#catalogo"
                    className="px-7 py-3.5 bg-white text-slate-950 font-bold rounded-button hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 text-sm"
                  >
                    <span>Ver Catálogo Completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#historia"
                    className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold rounded-button border border-slate-700 transition-all text-sm"
                  >
                    Conoce la Marca
                  </a>
                </div>

                {/* Key Highlights */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-md">
                  <div>
                    <span className="block text-2xl font-black text-white">100%</span>
                    <span className="text-xs text-slate-400">Diseño Original</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">Top</span>
                    <span className="text-xs text-slate-400">Calidad Textil</span>
                  </div>
                  <div>
                    <span className="block text-2xl font-black text-white">24/48h</span>
                    <span className="text-xs text-slate-400">Envíos Rápidos</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual with Creator & Signature Item */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md w-full">
                  {/* Outer Frame with glow */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 w-full h-[460px] sm:h-[500px] bg-slate-800">
                    <Image
                      src={profileImg}
                      alt={storeName}
                      fill
                      priority
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                    {/* Bottom Floating Badge inside image */}
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                          <Star className="w-5 h-5 fill-slate-950" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-amber-300 block">
                            Edición Exclusiva
                          </span>
                          <span className="text-sm font-bold text-white">
                            Prendas Limitadas & Calzado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION: Dynamic Subpages */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                  Categorías Exclusivas
                </span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  Explora por Colección
                </h2>
              </div>
              <p className="text-sm text-gray-500 max-w-sm mt-2 md:mt-0">
                Cada sección cuenta con su propia ruta aislada y filtros específicos para cada estilo.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Image
                    src={
                      category.image_url ||
                      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-extrabold text-lg group-hover:text-amber-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-1 mt-0.5">
                      {category.description || 'Ver productos'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/90 mt-2 group-hover:translate-x-1 transition-transform">
                      <span>Explorar</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCTS SHOWCASE: With Tab Filter */}
        <section id="catalogo" className="py-20 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                Catálogo Principal
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Piezas Destacadas & Calzado
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Confección de alta gama, tallas variadas y paleta de colores cuidadosamente seleccionada.
              </p>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setSelectedCategoryTab('todos')}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    selectedCategoryTab === 'todos'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Todos ({allProducts.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryTab(cat.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                      selectedCategoryTab === cat.slug
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 max-w-md mx-auto">
                <p className="text-gray-500 text-sm">No hay productos en esta categoría por ahora.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PERSONAL BRAND STORY SECTION */}
        <section id="historia" className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  <Image
                    src={profileImg}
                    alt="Historia de la marca"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
                  Nuestra Esencia
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                  La Historia Detrás de la Marca
                </h2>
                <div className="text-gray-600 text-base leading-relaxed space-y-4">
                  <p>{brandStory}</p>
                  <p>
                    Cada diseño pasa por un riguroso proceso de pruebas de ajuste, durabilidad del tejido y acabados, garantizando prendas con personalidad que resisten el paso de las temporadas.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Confección ética y control de calidad</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>Ediciones de tiraje limitado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="py-12 bg-slate-900 text-white border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Despachos Nacionales</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Envíos asegurados por MRW, Zoom y Tealca en 24-48h.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Billetera Multi-pago</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pago Móvil, Zelle, Transferencias y Cripto (USDT).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Garantía de Talla</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Cambios de talla y atención directa vía WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

