'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { StoreSettings } from '@/lib/types';
import { fetchWithCache, invalidateCache, getCachedData } from '@/lib/cache';

interface ThemeContextType {
  settings: StoreSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(() => {
    return getCachedData<StoreSettings>('/api/settings');
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !getCachedData<StoreSettings>('/api/settings');
  });

  const fetchSettings = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        invalidateCache('/api/settings');
      }
      const data = await fetchWithCache<StoreSettings>('/api/settings', 60000);
      if (data) {
        setSettings(data);
        applyTheme(data);
      }
    } catch (e) {
      console.error('Failed to load store settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (s: StoreSettings) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply Colors
    if (s.color_primary) {
      root.style.setProperty('--color-primary', s.color_primary);
    }
    if (s.color_secondary) {
      root.style.setProperty('--color-secondary', s.color_secondary);
    }
    if (s.color_bg) {
      root.style.setProperty('--color-bg', s.color_bg);
    }
    if (s.color_text) {
      root.style.setProperty('--color-text', s.color_text);
    }
    if (s.button_radius) {
      root.style.setProperty('--btn-radius', s.button_radius);
    }

    // Apply Font
    if (s.font_family) {
      root.style.setProperty('--font-custom', `"${s.font_family}", sans-serif`);

      // Dynamically load Google Font if not Inter
      const fontName = s.font_family.replace(/ /g, '+');
      const fontId = `google-font-${fontName}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement('link');
        link.id = fontId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    }

    // Apply Favicon
    if (s.favicon_url) {
      let faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = s.favicon_url;
    }

    // Apply Document Title
    if (s.store_name) {
      document.title = `${s.store_name} | ${s.tagline || 'Tienda Oficial'}`;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, loading, refreshSettings: () => fetchSettings(true) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

