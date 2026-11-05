'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/components/CurrencyContext';
import { useTheme } from '@/components/ThemeProvider';
import { Order, OrderStatus } from '@/lib/types';
import {
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Truck,
  ExternalLink,
  Receipt,
  FileCheck,
  X,
  RefreshCw,
} from 'lucide-react';

export default function GestorPedidosPage() {
  const { formatPrice } = useCurrency();
  const { settings } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Selected Order Detail Modal
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/api/orders?status=${selectedStatusTab}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        setOrders(await res.json());
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatusTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        if (activeOrder && activeOrder.id === orderId) {
          setActiveOrder({ ...activeOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const storePhone = settings?.contact_phone || '+584121234567';

  // Counts for each tab
  const countNew = orders.filter((o) => o.status === 'nuevo').length;
  const countConfirmed = orders.filter((o) => o.status === 'confirmado').length;
  const countRejected = orders.filter((o) => o.status === 'rechazado').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Embudo de Ventas & Despachos
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Gestor de Pedidos
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Supervisa pedidos nuevos, verifica referencias de pago (Pago Móvil, Zelle, Transferencias) y actualiza el estado de entrega.
        </p>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl self-start">
          <button
            onClick={() => setSelectedStatusTab('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatusTab === 'todos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setSelectedStatusTab('nuevo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedStatusTab === 'nuevo'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Nuevos</span>
          </button>
          <button
            onClick={() => setSelectedStatusTab('confirmado')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedStatusTab === 'confirmado'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Confirmados (Listos)</span>
          </button>
          <button
            onClick={() => setSelectedStatusTab('rechazado')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedStatusTab === 'rechazado'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Rechazados</span>
          </button>
        </div>

        {/* Search Input (Customer Name, Email, WhatsApp Phone) */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, correo o WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
            <span>Consultando pedidos en la base de datos...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            No se encontraron pedidos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3.5">ID Pedido</th>
                  <th className="pb-3.5">Fecha</th>
                  <th className="pb-3.5">Cliente</th>
                  <th className="pb-3.5">Teléfono / WhatsApp</th>
                  <th className="pb-3.5">Total Liquidado</th>
                  <th className="pb-3.5">Método / Referencia</th>
                  <th className="pb-3.5">Estado</th>
                  <th className="pb-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {orders.map((order) => {
                  const cleanClientPhone = order.customer_phone.replace(/[^0-9]/g, '');
                  const clientWhatsAppUrl = `https://wa.me/${cleanClientPhone}?text=${encodeURIComponent(
                    `Hola ${order.customer_name}! Te escribimos de ${settings?.store_name || 'Demo Store'} sobre tu pedido #${order.id}.`
                  )}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-white">#{order.id}</td>
                      <td className="py-3.5 text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('es-VE')}
                      </td>
                      <td className="py-3.5 font-semibold text-white">
                        {order.customer_name}
                        <span className="text-[10px] text-slate-500 block font-normal">
                          {order.customer_email}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <a
                          href={clientWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline font-mono"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{order.customer_phone}</span>
                        </a>
                      </td>
                      <td className="py-3.5 font-black text-white">
                        {order.currency} {order.total_in_currency}
                      </td>
                      <td className="py-3.5">
                        <span className="capitalize text-slate-200 block">
                          {order.payment_method_title || order.payment_method_id.replace(/_/g, ' ')}
                        </span>
                        {order.payment_reference ? (
                          <span className="text-amber-400 font-mono text-[10px] block font-semibold">
                            Ref: {order.payment_reference}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] block">Sin referencia</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'nuevo'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : order.status === 'confirmado'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setActiveOrder(order)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-[11px]"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL FOR ORDER */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">Detalle de Orden #{activeOrder.id}</h3>
                <span className="text-xs text-slate-400">
                  {new Date(activeOrder.created_at).toLocaleString('es-VE')}
                </span>
              </div>
              <button
                onClick={() => setActiveOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
                Datos del Comprador:
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Nombre:</span>
                  <strong className="text-white text-sm">{activeOrder.customer_name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">WhatsApp:</span>
                  <strong className="text-white text-sm">{activeOrder.customer_phone}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Dirección de Entrega:</span>
                  <p className="text-white font-medium">{activeOrder.shipping_address}</p>
                </div>
                {activeOrder.notes && (
                  <div className="col-span-2 text-amber-300">
                    <span className="text-slate-500 block">Notas:</span>
                    <p>{activeOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Report Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                Datos de Pago:
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Método:</span>
                  <strong className="text-white capitalize">
                    {activeOrder.payment_method_title || activeOrder.payment_method_id}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Referencia reportada:</span>
                  <strong className="text-amber-400 font-mono">
                    {activeOrder.payment_reference || 'Sin referencia'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                Prendas Compradas:
              </span>
              <div className="divide-y divide-slate-800/80 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                {activeOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block">{item.name}</strong>
                      <span className="text-[11px] text-slate-400">
                        Cant: {item.quantity} {item.talla && `• Talla: ${item.talla}`}{' '}
                        {item.color && `• Color: ${item.color}`}
                      </span>
                    </div>
                    <span className="font-bold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm">
              <span className="text-slate-400 font-bold">Total Liquidado:</span>
              <span className="text-xl font-black text-white">
                {activeOrder.currency} {activeOrder.total_in_currency}
              </span>
            </div>

            {/* State Management Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleUpdateStatus(activeOrder.id, 'confirmado')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pago (Listo)</span>
              </button>
              <button
                onClick={() => handleUpdateStatus(activeOrder.id, 'rechazado')}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>
              <a
                href={`https://wa.me/${activeOrder.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hola ${activeOrder.customer_name}! Te confirmamos que tu pedido #${activeOrder.id} está ${activeOrder.status}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

