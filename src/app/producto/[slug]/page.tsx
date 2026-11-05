'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useCurrency } from '@/components/CurrencyContext';
import { useCart } from '@/components/CartContext';
import { useRole } from '@/components/RoleContext';
import { useTheme } from '@/components/ThemeProvider';
import { Product } from '@/lib/types';
import { fetchWithCache } from '@/lib/cache';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { role } = useRole();
  const { settings } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchWithCache<Product>(`/api/products/${slug}`);
        if (data) {
          setProduct(data);

          // Default selected size and color
          if (data.attributes?.tallas?.length) {
            setSelectedSize(data.attributes.tallas[0]);
          }
          if (data.attributes?.colores?.length) {
            setSelectedColor(data.attributes.colores[0].label);
          }

          // Fetch related products
          if (data.category_slug) {
            const relData = await fetchWithCache<Product[]>(`/api/products?category=${data.category_slug}`);
            if (Array.isArray(relData)) {
              setRelatedProducts(relData.filter((p) => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando producto...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-500 text-sm mb-6">El producto solicitado no existe o ha sido descontinuado.</p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-button text-sm"
          >
            Volver a la tienda
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const isReseller = role === 'revendedor';
  const effectivePrice = isReseller && product.reseller_price ? product.reseller_price : product.price;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedSize, selectedColor);
    router.push('/checkout');
  };

  const storePhone = settings?.contact_phone || '+584121234567';
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola! Me interesa la prenda "${product.name}" (Talla: ${selectedSize || 'N/A'}, Color: ${selectedColor || 'N/A'}). ¿Tienen disponibilidad inmediata?`
  )}`;

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white min-h-screen py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {product.category_slug && (
              <>
                <Link
                  href={`/categoria/${product.category_slug}`}
                  className="hover:text-gray-900 transition-colors capitalize"
                >
                  {product.category_name || product.category_slug}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Main Product Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Gallery */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] sm:aspect-square w-full rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                <Image
                  src={images[selectedImageIndex] || images[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-lg shadow-sm">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-slate-900 shadow-md scale-95'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Details & Buying Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Brand */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest text-amber-600 uppercase">
                    {product.category_name || 'Colección Oficial'}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 font-medium">Diseño de Autor</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(effectivePrice)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                  {isReseller && product.reseller_price && (
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                      Tarifa Revendedor (PVP regular: {formatPrice(product.price)})
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Color Selector */}
                {product.attributes?.colores && product.attributes.colores.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      <span>Color: <strong className="text-slate-900">{selectedColor}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {product.attributes.colores.map((c) => (
                        <button
                          key={c.label}
                          onClick={() => setSelectedColor(c.label)}
                          className={`relative w-8 h-8 rounded-full border-2 transition-transform ${
                            selectedColor === c.label
                              ? 'border-slate-900 scale-110 shadow-md ring-2 ring-slate-900/20'
                              : 'border-gray-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        >
                          {selectedColor === c.label && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check
                                className={`w-3.5 h-3.5 ${
                                  c.hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'
                                }`}
                              />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.attributes?.tallas && product.attributes.tallas.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      <span>Talla seleccionada: <strong className="text-slate-900">{selectedSize}</strong></span>
                      <span className="text-[11px] text-gray-400 font-normal lowercase">Guía de tallas estándar</span>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {product.attributes.tallas.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-2.5 text-xs font-bold rounded-xl border text-center transition-all ${
                            selectedSize === size
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-4">
                    {/* Quantity counter */}
                    <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50/50 p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to cart */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{addedAnimation ? '¡Agregado a la bolsa! ✓' : 'Añadir a la Bolsa'}</span>
                    </button>
                  </div>

                  {/* Buy Now button */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <span>Comprar Ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* WhatsApp consultation */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-button text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-200"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Consultar por WhatsApp con asesor</span>
                  </a>
                </div>

                {/* Features & Guarantees */}
                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
                  <div className="flex items-start gap-2.5">
                    <Truck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900 block">Envíos Rápidos</strong>
                      <span>24-48 horas tras verificación</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-gray-900 block">Garantía de Calidad</strong>
                      <span>Cambios por talla sin costo extra</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 pt-12 border-t border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                    Recomendaciones
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                    También te puede interesar
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

