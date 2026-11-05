'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency } from '@/lib/types';

interface CurrencyContextType {
  currencies: Currency[];
  currentCurrency: Currency;
  setCurrency: (code: string) => void;
  formatPrice: (amountUSD: number) => string;
  convertPrice: (amountUSD: number) => number;
  loading: boolean;
  refreshCurrencies: () => Promise<void>;
}

const defaultUSD: Currency = {
  id: 'USD',
  symbol: '$',
  name: 'Dólar Estadounidense',
  rate: 1.0,
  is_default: true,
  is_active: true,
};

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [defaultUSD],
  currentCurrency: defaultUSD,
  setCurrency: () => {},
  formatPrice: (amount: number) => `$${amount.toFixed(2)}`,
  convertPrice: (amount: number) => amount,
  loading: true,
  refreshCurrencies: async () => {},
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencies, setCurrencies] = useState<Currency[]>([defaultUSD]);
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultUSD);
  const [loading, setLoading] = useState(true);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/currencies');
      if (res.ok) {
        const data: Currency[] = await res.json();
        const activeList = data.filter((c) => c.is_active);
        setCurrencies(activeList);

        const savedCode = typeof window !== 'undefined' ? localStorage.getItem('selected_currency') : null;
        const matched = activeList.find((c) => c.id === savedCode);
        const defaultOne = activeList.find((c) => c.is_default) || activeList[0] || defaultUSD;

        setCurrentCurrency(matched || defaultOne);
      }
    } catch (e) {
      console.error('Failed to load currencies:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const setCurrency = (code: string) => {
    const found = currencies.find((c) => c.id === code);
    if (found) {
      setCurrentCurrency(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected_currency', code);
      }
    }
  };

  const convertPrice = (amountUSD: number) => {
    const rate = Number(currentCurrency.rate) || 1.0;
    return Number((amountUSD * rate).toFixed(2));
  };

  const formatPrice = (amountUSD: number) => {
    const rate = Number(currentCurrency.rate) || 1.0;
    const converted = amountUSD * rate;
    const formattedNum = new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);

    if (currentCurrency.id === 'USD') {
      return `$${formattedNum}`;
    }
    if (currentCurrency.id === 'EUR') {
      return `€${formattedNum}`;
    }
    return `${currentCurrency.symbol} ${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        currentCurrency,
        setCurrency,
        formatPrice,
        convertPrice,
        loading,
        refreshCurrencies: fetchCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

