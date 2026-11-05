/**
 * Client-side memory & session cache for instant page transitions.
 * Eliminates navbar collapsing, skeleton flashing, and redundant round-trips.
 */

import { Category } from './types';

export const initialCategories: Category[] = [
  {
    id: 1,
    name: 'Caballeros',
    slug: 'caballeros',
    description: 'Prendas masculinas con cortes oversize, minimalismo y acabados de lujo.',
    image_url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 1,
  },
  {
    id: 2,
    name: 'Damas',
    slug: 'damas',
    description: 'Moda femenina sofisticada, vestidos versátiles y siluetas contemporáneas.',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 2,
  },
  {
    id: 3,
    name: 'Calzado',
    slug: 'calzado',
    description: 'Sneakers urbanos y botines hechos con materiales resistentes y diseño premium.',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 3,
  },
  {
    id: 4,
    name: 'Accesorios',
    slug: 'accesorios',
    description: 'Gorras bordadas, joyería discreta y complementos con el sello de la marca.',
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 4,
  },
];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCachedData<T>(url: string, ttlMs: number = 180000): T | null {
  const now = Date.now();
  const cached = memoryCache.get(url);
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('app_cache_' + url);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        if (now - parsed.timestamp < ttlMs) {
          memoryCache.set(url, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignorar errores de cuota o parseo
    }
  }

  return null;
}

export async function fetchWithCache<T>(url: string, ttlMs: number = 60000): Promise<T> {
  const now = Date.now();
  const existing = getCachedData<T>(url, ttlMs);
  if (existing) {
    return existing;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${url}`);
  }

  const data = await res.json();
  const entry: CacheEntry<T> = { data, timestamp: now };
  memoryCache.set(url, entry);

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('app_cache_' + url, JSON.stringify(entry));
    } catch {
      // Ignorar errores
    }
  }

  return data as T;
}

/**
 * Invalidate cache when changes occur (e.g., from Sala de Control)
 */
export function invalidateCache(urlPattern?: string) {
  if (!urlPattern) {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach((k) => {
          if (k.startsWith('app_cache_')) {
            sessionStorage.removeItem(k);
          }
        });
      } catch {
        // Ignorar
      }
    }
  } else {
    Array.from(memoryCache.keys()).forEach((key) => {
      if (key.includes(urlPattern)) {
        memoryCache.delete(key);
      }
    });
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach((k) => {
          if (k.startsWith('app_cache_') && k.includes(urlPattern)) {
            sessionStorage.removeItem(k);
          }
        });
      } catch {
        // Ignorar
      }
    }
  }
}
