'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useCurrency } from './CurrencyContext';
import { useCart } from './CartContext';
import { useRole } from './RoleContext';
import { ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();
  const { role } = useRole();

  const isReseller = role === 'revendedor';
  const effectivePrice = isReseller && product.reseller_price ? product.reseller_price : product.price;

  const imageSrc =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

  const defaultSize = product.attributes?.tallas?.[0];
  const defaultColor = product.attributes?.colores?.[0]?.label;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, defaultSize, defaultColor);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <Link href={`/producto/${product.slug}`} className="block w-full h-full">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-black text-white rounded-md shadow-sm">
              {product.badge}
            </span>
          )}
          {isReseller && product.reseller_price && (
            <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase bg-emerald-600 text-white rounded-md shadow-sm">
              Mayorista
            </span>
          )}
        </div>

        {/* Quick actions hover overlay */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            onClick={handleQuickAdd}
            className="flex-1 py-2.5 px-3 bg-white/95 hover:bg-white text-gray-900 rounded-button shadow-lg font-medium text-xs flex items-center justify-center gap-1.5 backdrop-blur-sm transition-transform active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Añadir rápido</span>
          </button>
          <Link
            href={`/producto/${product.slug}`}
            className="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-button shadow-lg font-medium text-xs flex items-center justify-center backdrop-blur-sm transition-transform active:scale-95"
            title="Ver detalles"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Content info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category_name && (
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider block mb-1">
              {product.category_name}
            </span>
          )}
          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1 hover:text-secondary transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Colors or sizes teaser */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {product.attributes?.colores?.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: c.hex }}
                title={c.label}
              />
            ))}
            {(product.attributes?.colores?.length || 0) > 4 && (
              <span className="text-[10px] text-gray-400 ml-1 font-medium">
                +{product.attributes!.colores!.length - 4}
              </span>
            )}
          </div>

          {product.attributes?.tallas && product.attributes.tallas.length > 0 && (
            <span className="text-[11px] text-gray-400 font-medium">
              {product.attributes.tallas.slice(0, 3).join(', ')}
              {product.attributes.tallas.length > 3 ? '...' : ''}
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base text-gray-900">
              {formatPrice(effectivePrice)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {isReseller && product.reseller_price && (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              PVP: {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

