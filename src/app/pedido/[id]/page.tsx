'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCurrency } from '@/components/CurrencyContext';
import { useTheme } from '@/components/ThemeProvider';
import { Order } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  Truck,
  ArrowRight,
  Receipt,
  FileCheck,
} from 'lucide-react';

export default function OrderSuccessPage() {
  const params = useParams();
  const id = params?.id as string;
  const { formatPrice } = useCurrency();
  const { settings } = useTheme();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data: Order = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando recibo del pedido...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pedido no encontrado</h2>
          <p className="text-gray-500 text-sm mb-6">El pedido #{id} no existe en nuestro sistema.</p>
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

  const storePhone = settings?.contact_phone || '+584121234567';
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');

  const itemsSummary = order.items
    ?.map((i) => `• ${i.name} (Cant: ${i.quantity}, Talla: ${i.talla || 'N/A'}) - $${i.price}`)
    .join('\n');

  const whatsappMessage = `¡Hola! Acabo de realizar el pedido *#${order.id}* en la tienda.\n\n*Cliente:* ${order.customer_name}\n*Teléfono:* ${order.customer_phone}\n*Dirección:* ${order.shipping_address}\n*Total:* ${order.currency} ${order.total_in_currency}\n*Método:* ${order.payment_method_title || order.payment_method_id}\n*Referencia de pago:* ${order.payment_reference || 'Por adjuntar captura'}\n\n*Prendas:*\n${itemsSummary}\n\n¿Me confirman la recepción y despacho? ¡Gracias!`;

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/70 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
              ¡Pedido Registrado con Éxito!
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Número de Orden: #{order.id}
            </h1>
            <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
              Tu pedido ha ingresado en la Sala de Control. A continuación tienes el comprobante detallado y el enlace directo para reportarlo por WhatsApp.
            </p>

            {/* Direct WhatsApp Call to Action Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Enviar Comprobante por WhatsApp</span>
              </a>

              <Link
                href="/sala-de-control/pedidos"
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-button text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Ver en Sala de Control</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-lg text-gray-900">Detalles del Comprobante</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Estado: {order.status}</span>
              </span>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="font-bold text-gray-500 block mb-1">DATOS DEL CLIENTE:</span>
                <strong className="text-gray-900 block text-sm">{order.customer_name}</strong>
                <span className="text-gray-600 block">{order.customer_phone}</span>
                <span className="text-gray-600 block">{order.customer_email}</span>
              </div>

              <div>
                <span className="font-bold text-gray-500 block mb-1">DIRECCIÓN DE ENTREGA:</span>
                <p className="text-gray-900 font-medium">{order.shipping_address}</p>
                {order.city && <span className="text-gray-500 block">Ciudad: {order.city}</span>}
              </div>
            </div>

            {/* Payment Method & Reference */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-xs space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-gray-900">Método de Pago Seleccionado:</span>
                <span className="font-semibold text-amber-900">
                  {order.payment_method_title || order.payment_method_id}
                </span>
              </div>
              {order.payment_reference && (
                <div className="pt-1">
                  <span className="text-gray-600">Referencia reportada: </span>
                  <span className="font-mono font-bold text-slate-900">
                    {order.payment_reference}
                  </span>
                </div>
              )}
            </div>

            {/* Items table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
                Prendas en la orden:
              </h4>
              <div className="divide-y divide-gray-100">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <strong className="text-gray-900 block">{item.name}</strong>
                      <span className="text-xs text-gray-500">
                        Cantidad: {item.quantity} {item.talla && `• Talla: ${item.talla}`}{' '}
                        {item.color && `• Color: ${item.color}`}
                      </span>
                    </div>
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline text-base">
              <span className="font-bold text-gray-900">Total Liquidado:</span>
              <span className="font-black text-2xl text-gray-900">
                {order.currency} {order.total_in_currency}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

