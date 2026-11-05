'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/components/CartContext';
import { useCurrency } from '@/components/CurrencyContext';
import { useRole } from '@/components/RoleContext';
import { PaymentMethod } from '@/lib/types';
import {
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Coins,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { currentCurrency, convertPrice, formatPrice, currencies, setCurrency } = useCurrency();
  const { user } = useRole();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: 'Caracas',
    notes: '',
  });

  useEffect(() => {
    fetch('/api/payments')
      .then((res) => res.json())
      .then((data: PaymentMethod[]) => {
        if (Array.isArray(data)) {
          const active = data.filter((m) => m.is_active);
          setPaymentMethods(active);
          if (active.length > 0) {
            setSelectedMethodId(active[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load payment methods', err));
  }, []);

  const totalUSD = subtotal;
  const totalInSelectedCurrency = convertPrice(totalUSD);
  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const getPaymentIcon = (id: string) => {
    switch (id) {
      case 'pago_movil':
        return <Smartphone className="w-5 h-5 text-emerald-600" />;
      case 'zelle':
        return <DollarSign className="w-5 h-5 text-purple-600" />;
      case 'transferencia':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'binance':
        return <Coins className="w-5 h-5 text-amber-500" />;
      case 'efectivo':
        return <Wallet className="w-5 h-5 text-teal-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('No hay productos en la bolsa de compras.');
      return;
    }

    if (!formData.name || !formData.phone || !formData.address) {
      setErrorMessage('Por favor completa todos los campos requeridos (*).');
      return;
    }

    if (!selectedMethodId) {
      setErrorMessage('Por favor selecciona un método de pago.');
      return;
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customer_name: formData.name,
        customer_email: formData.email || 'sin-correo@cliente.com',
        customer_phone: formData.phone,
        shipping_address: formData.address,
        city: formData.city,
        notes: formData.notes,
        items: items.map((i) => ({
          name: i.product.name,
          slug: i.product.slug,
          quantity: i.quantity,
          price: i.product.price,
          talla: i.selectedSize || 'N/A',
          color: i.selectedColor || 'N/A',
          image: i.product.images?.[0] || '',
        })),
        subtotal: totalUSD,
        shipping_cost: 0,
        total: totalUSD,
        currency: currentCurrency.id,
        currency_rate: currentCurrency.rate,
        total_in_currency: totalInSelectedCurrency,
        payment_method_id: selectedMethodId,
        payment_reference: reference,
        user_id: user?.id || null,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) {
        throw new Error('Error al registrar la orden');
      }

      const createdOrder = await res.json();
      clearCart();
      router.push(`/pedido/${createdOrder.id}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Hubo un error al procesar tu pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu bolsa está vacía</h2>
          <p className="text-gray-500 text-sm mb-6">
            Agrega algunas prendas a tu bolsa antes de proceder al checkout.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-button text-sm"
          >
            Ir a comprar
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/60 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-900">
              Inicio
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-medium">Finalizar Pedido (Checkout)</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">
            Completar Orden & Pago
          </h1>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Contact, Shipping, Payment selection */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Contact & Shipping */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-bold text-base text-gray-900">Datos de Entrega & Contacto</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Nombre y Apellido *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ej. Valeria Rivas"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Ej. +58 412 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@correo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ciudad / Región
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Ej. Caracas, Valencia, etc."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Dirección de Envío Completa *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={2}
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle, edificio/casa, punto de referencia para el mensajero o agencia MRW/Zoom..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Instrucciones Especiales (Opcional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ej. Entregar en horario de oficina o llamar antes de salir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Step 2: Payment Method Selection */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-bold text-base text-gray-900">Método de Pago (Billetera)</h2>
                  </div>

                  {/* Switch currency on checkout */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-500">Pagar en:</span>
                    <select
                      value={currentCurrency.id}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded border border-gray-200 cursor-pointer"
                    >
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethodId(m.id)}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedMethodId === m.id
                          ? 'border-slate-900 bg-slate-50/80 ring-2 ring-slate-900/10 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white border border-gray-200 flex-shrink-0">
                        {getPaymentIcon(m.id)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-900 block leading-tight">
                          {m.title}
                        </span>
                        <span className="text-[11px] text-gray-500 capitalize block mt-0.5">
                          {m.type === 'manual' ? 'Reporte manual / transferencia' : 'Pasarela en línea'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Method Details Box */}
                {selectedPaymentMethod && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-950 uppercase tracking-wider">
                        Datos para transferir / cancelar:
                      </span>
                    </div>

                    {/* Render method details JSON */}
                    {selectedPaymentMethod.details &&
                      Object.keys(selectedPaymentMethod.details).length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white/80 p-3 rounded-lg border border-amber-100">
                          {Object.entries(selectedPaymentMethod.details).map(([key, val]) => (
                            <div key={key}>
                              <span className="font-semibold text-gray-600 capitalize">
                                {key.replace(/_/g, ' ')}:
                              </span>{' '}
                              <span className="font-bold text-gray-900 select-all">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                    {selectedPaymentMethod.instructions && (
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {selectedPaymentMethod.instructions}
                      </p>
                    )}

                    {/* Reference input for manual payments */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        Número de Referencia de Pago / Comprobante
                      </label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. 192837482 o REF-BANESCO"
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        Si aún no has transferido, puedes dejarlo en blanco y enviar la captura directamente por WhatsApp tras confirmar el pedido.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-28 space-y-5">
                <h3 className="font-bold text-base text-gray-900 pb-3 border-b border-gray-100">
                  Resumen del Pedido
                </h3>

                {/* Items preview list */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center text-xs">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <Image
                          src={
                            item.product.images?.[0] ||
                            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span>Cant: {item.quantity}</span>
                          {item.selectedSize && <span>• Talla: {item.selectedSize}</span>}
                          {item.selectedColor && <span>• {item.selectedColor}</span>}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totalUSD)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Envío:</span>
                    <span className="text-emerald-600 font-semibold">A acordar / Gratis</span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                    <span className="font-bold text-base text-gray-900">Total a pagar:</span>
                    <div className="text-right">
                      <span className="font-black text-2xl text-gray-900 block">
                        {formatPrice(totalUSD)}
                      </span>
                      {currentCurrency.id !== 'USD' && (
                        <span className="text-xs text-gray-400">
                          (Equivalente a ${totalUSD.toFixed(2)} USD)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 transition-all active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirmar y Enviar Pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Compra protegida y confirmada en Sala de Control</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

