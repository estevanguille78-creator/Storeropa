'use client';

import React, { useState, useEffect } from 'react';
import { useCurrency } from '@/components/CurrencyContext';
import { Currency, PaymentMethod } from '@/lib/types';
import {
  Wallet,
  DollarSign,
  Smartphone,
  Building2,
  Coins,
  CreditCard,
  Save,
  Check,
  Plus,
  RefreshCw,
  Key,
} from 'lucide-react';

export default function BilleteraPage() {
  const { refreshCurrencies } = useCurrency();

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null);

  // New currency modal/form
  const [newCurrency, setNewCurrency] = useState({ id: '', symbol: '', name: '', rate: 1.0 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [curRes, payRes] = await Promise.all([
        fetch('/api/currencies'),
        fetch('/api/payments'),
      ]);
      if (curRes.ok) setCurrencies(await curRes.json());
      if (payRes.ok) setPaymentMethods(await payRes.json());
    } catch (e) {
      console.error('Error loading wallet data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update exchange rate in state
  const handleRateChange = (id: string, newRate: number) => {
    setCurrencies(currencies.map((c) => (c.id === id ? { ...c, rate: newRate } : c)));
  };

  // Toggle active currency
  const handleCurrencyActiveToggle = (id: string) => {
    setCurrencies(currencies.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c)));
  };

  // Save all currencies
  const handleSaveCurrencies = async () => {
    try {
      setSavingCurrency(true);
      await fetch('/api/currencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currencies),
      });
      await refreshCurrencies();
      alert('¡Tasas de cambio actualizadas correctamente!');
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCurrency(false);
    }
  };

  // Create new currency
  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrency.id || !newCurrency.symbol) return;
    try {
      await fetch('/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newCurrency, is_active: true }),
      });
      setNewCurrency({ id: '', symbol: '', name: '', rate: 1.0 });
      loadData();
      await refreshCurrencies();
    } catch (err) {
      console.error(err);
    }
  };

  // Update single payment method
  const handleUpdatePayment = async (method: PaymentMethod) => {
    try {
      setSavingPaymentId(method.id);
      await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      alert(`¡Método "${method.title}" actualizado con éxito!`);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPaymentId(null);
    }
  };

  // Update nested details of a payment method
  const handleDetailChange = (methodId: string, key: string, value: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => {
        if (m.id === methodId) {
          return {
            ...m,
            details: { ...m.details, [key]: value },
          };
        }
        return m;
      })
    );
  };

  // Update instruction text
  const handleInstructionChange = (methodId: string, instructions: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => (m.id === methodId ? { ...m, instructions } : m))
    );
  };

  // Update active status
  const handlePaymentActiveToggle = (methodId: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => (m.id === methodId ? { ...m, is_active: !m.is_active } : m))
    );
  };

  const manualMethods = paymentMethods.filter((m) => m.type === 'manual');
  const gatewayMethods = paymentMethods.filter((m) => m.type === 'gateway');

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Finanzas & Pasarelas
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Billetera & Métodos de Pago
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Define las monedas recibidas (USD, EUR, VES), tasas de cambio en vivo, y personaliza tus cuentas de Pago Móvil, Zelle, Transferencias y Cripto.
        </p>
      </div>

      {/* SECTION 1: GESTOR DE MONEDAS & TASAS */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span>Gestor de Monedas & Tasas de Cambio</span>
            </h3>
            <span className="text-xs text-slate-400">
              Todos los precios de las prendas se calculan a partir de la moneda base (USD).
            </span>
          </div>

          <button
            onClick={handleSaveCurrencies}
            disabled={savingCurrency}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all self-start active:scale-95 cursor-pointer"
          >
            {savingCurrency ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Guardar Tasas</span>
          </button>
        </div>

        {/* Currency list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currencies.map((cur) => (
            <div
              key={cur.id}
              className={`p-4 rounded-2xl border transition-all ${
                cur.is_active
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                    {cur.symbol}
                  </span>
                  <span>{cur.id}</span>
                </span>

                <button
                  onClick={() => handleCurrencyActiveToggle(cur.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    cur.is_active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cur.is_active ? 'Habilitada' : 'Inactiva'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-slate-400">{cur.name}</span>

                <div className="pt-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Tasa de cambio (por 1 USD):
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    disabled={cur.id === 'USD'}
                    value={cur.rate}
                    onChange={(e) => handleRateChange(cur.id, parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add custom currency form */}
        <div className="pt-4 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-300 block mb-3 uppercase tracking-wider">
            Agregar Nueva Moneda
          </span>
          <form onSubmit={handleCreateCurrency} className="flex flex-wrap items-center gap-3 text-xs">
            <input
              type="text"
              placeholder="Código (Ej: COP)"
              value={newCurrency.id}
              onChange={(e) => setNewCurrency({ ...newCurrency, id: e.target.value.toUpperCase() })}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white w-28 uppercase"
            />
            <input
              type="text"
              placeholder="Símbolo ($)"
              value={newCurrency.symbol}
              onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white w-20"
            />
            <input
              type="text"
              placeholder="Nombre (Peso Colombiano)"
              value={newCurrency.name}
              onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white flex-1 min-w-[160px]"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Tasa (ej. 4200)"
              value={newCurrency.rate}
              onChange={(e) => setNewCurrency({ ...newCurrency, rate: parseFloat(e.target.value) || 1.0 })}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white w-28 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
            >
              + Agregar
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2: MÉTODOS DE PAGO MANUALES */}
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Métodos de Pago Manuales (Pago Móvil, Zelle, Transferencias, Cripto)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza los datos bancarios y las instrucciones que verá el cliente al finalizar la compra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {manualMethods.map((method) => {
            const isSaving = savingPaymentId === method.id;
            return (
              <div
                key={method.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-base text-white">{method.title}</h4>
                    <span className="text-[11px] text-amber-400 font-mono">ID: {method.id}</span>
                  </div>

                  <button
                    onClick={() => handlePaymentActiveToggle(method.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${
                      method.is_active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {method.is_active ? 'Activo en Tienda' : 'Desactivado'}
                  </button>
                </div>

                {/* Editable Details Fields */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                    Datos Bancarios / Billetera:
                  </span>
                  {method.details &&
                    Object.entries(method.details).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-24 font-semibold text-slate-400 capitalize truncate">
                          {key}:
                        </span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleDetailChange(method.id, key, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    ))}
                </div>

                {/* Editable Instructions */}
                <div className="pt-2 text-xs">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Instrucciones de Pago al Cliente:
                  </label>
                  <textarea
                    rows={2}
                    value={method.instructions || ''}
                    onChange={(e) => handleInstructionChange(method.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* Save button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleUpdatePayment(method)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: PASARELAS AUTOMÁTICAS (STRIPE, PAYPAL, MERCADOPAGO) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" />
            <span>Pasarelas Automáticas (Stripe, PayPal, MercadoPago)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Espacio para integrar tus claves API para cobros con tarjetas internacionales y billeteras electrónicas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gatewayMethods.map((gw) => (
            <div key={gw.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>{gw.title}</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold uppercase">
                  Gateway
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Public Key / Client ID</label>
                  <input
                    type="text"
                    placeholder="pk_live_... o client_id"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Secret Key / Token</label>
                  <input
                    type="password"
                    placeholder="sk_live_... o access_token"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <button
                onClick={() => alert(`API Keys guardadas para ${gw.title}`)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Actualizar Credenciales
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

