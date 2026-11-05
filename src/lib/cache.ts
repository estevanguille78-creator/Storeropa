/**
 * Client-side memory cache for ultra-fast page transitions.
 * Eliminates redundant network round-trips to Supabase when browsing categories and products.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function fetchWithCache<T>(url: string, ttlMs: number = 60000): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(url);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al consultar ${url}`);
  }

  const data = await res.json();
  memoryCache.set(url, { data, timestamp: now });
  return data as T;
}

/**
 * Invalidate cache when changes occur (e.g., from Sala de Control)
 */
export function invalidateCache(urlPattern?: string) {
  if (!urlPattern) {
    memoryCache.clear();
  } else {
    Array.from(memoryCache.keys()).forEach((key) => {
      if (key.includes(urlPattern)) {
        memoryCache.delete(key);
      }
    });
  }
}
