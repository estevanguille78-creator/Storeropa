'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '@/components/CurrencyContext';
import { useTheme } from '@/components/ThemeProvider';
import { Order, Product, Category } from '@/lib/types';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Layers,
  ArrowRight,
  Palette,
  Wallet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { formatPrice } = useCurrency();
  const { settings } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [ordRes, prodRes, catRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products?include_inactive=true'),
          fetch('/api/categories'),
        ]);

        if (ordRes.ok) setOrders(await ordRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const totalSalesUSD = orders
    .filter((o) => o.status !== 'rechazado')
    .reduce((acc, o) => acc + Number(o.total || 0), 0);

  const newOrders = orders.filter((o) => o.status === 'nuevo');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmado');

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Panel de Control Central
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bienvenido a la Sala de Control
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Personaliza tienda, administra inventario de prendas y calzado, y verifica pagos en tiempo real.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors self-start"
        >
          <ExternalLink className="w-4 h-4 text-amber-400" />
          <span>Ver Tienda en Vivo</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ventas Totales
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block mt-3">
            {formatPrice(totalSalesUSD)}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            {orders.length} pedidos registrados
          </span>
        </div>

        {/* New Orders Pending */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pedidos Nuevos
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block mt-3">
            {newOrders.length}
          </span>
          <span className="text-xs text-amber-400 font-medium mt-1 block">
            {newOrders.length > 0 ? 'Requieren verificar pago' : 'Al día, sin pendientes'}
          </span>
        </div>

        {/* Confirmed Orders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Confirmados / Listos
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block mt-3">
            {confirmedOrders.length}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Pagos verificados</span>
        </div>

        {/* Active Products & Categories */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Catálogo Activo
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white block mt-3">
            {products.length}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">
            En {categories.length} categorías creadas
          </span>
        </div>
      </div>

      {/* Quick Access Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/sala-de-control/apariencia"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/70 hover:border-amber-500/50 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-4 shadow-md group-hover:scale-105 transition-transform">
            <Palette className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
            Módulo de Apariencia
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Cambia el Logo, Favicon de pestaña, colores primarios, tipografías y datos de marca personal.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>Configurar estilo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/sala-de-control/catalogo"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/70 hover:border-amber-500/50 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold mb-4 shadow-md group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
            Catálogo & Estructura
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Crea categorías (generador de rutas seguras), atributos (tallas y colores) y ficha de productos.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>Gestionar prendas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/sala-de-control/billetera"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/70 hover:border-amber-500/50 transition-all group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold mb-4 shadow-md group-hover:scale-105 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
            Billetera & Pagos
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Configura Pago Móvil, Zelle, Transferencias, Cripto y tasas de cambio para tus clientes.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-4 group-hover:translate-x-1 transition-transform">
            <span>Ajustar métodos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Orders Table Preview */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Últimos Pedidos Registrados</h3>
            <span className="text-xs text-slate-400">Embudo de ventas actualizado</span>
          </div>
          <Link
            href="/sala-de-control/pedidos"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>Ver todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-sm">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">No hay pedidos registrados todavía.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="pb-3">ID Pedido</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Teléfono / WhatsApp</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Método / Ref</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-white">{o.id}</td>
                    <td className="py-3 font-medium text-slate-200">{o.customer_name}</td>
                    <td className="py-3">{o.customer_phone}</td>
                    <td className="py-3 font-bold text-white">
                      {o.currency} {o.total_in_currency}
                    </td>
                    <td className="py-3">
                      <span className="capitalize">{o.payment_method_id.replace(/_/g, ' ')}</span>
                      {o.payment_reference && (
                        <span className="text-slate-500 block text-[10px]">
                          Ref: {o.payment_reference}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'nuevo'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : o.status === 'confirmado'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/sala-de-control/pedidos"
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

