'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  age: number;
}

interface RoleContextType {
  user: User | null;
  role: UserRole;
  realRole: UserRole;
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  switchQuickRole: (role: UserRole) => void;
  canAccessAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
}

const RoleContext = createContext<RoleContextType>({
  user: null,
  role: 'cliente',
  realRole: 'cliente',
  impersonatedRole: null,
  setImpersonatedRole: () => {},
  setUser: () => {},
  logout: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  switchQuickRole: () => {},
  canAccessAdmin: false,
  isSuperAdmin: false,
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
  authTab: 'login',
  openAuthModal: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [impersonatedRole, setImpersonatedRoleState] = useState<UserRole | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Función de sincronización en tiempo real contra Supabase
  const syncUserFromDatabase = async (email: string) => {
    if (!email) return;
    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(email)}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const fresh = await res.json();
        if (fresh && fresh.role) {
          setUser((prev) => {
            if (!prev) return fresh;
            if (prev.role !== fresh.role || prev.name !== fresh.name) {
              const updated = { ...prev, ...fresh };
              if (typeof window !== 'undefined') {
                localStorage.setItem('demo_user', JSON.stringify(updated));
                localStorage.setItem('user_explicitly_logged_in', 'true');
              }
              return updated;
            }
            return prev;
          });
        }
      }
    } catch {
      // Ignorar errores de red temporales
    }
  };

  // 1. Carga inicial e instantánea al recargar la página (F5)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('demo_user');
      const isExplicit = localStorage.getItem('user_explicitly_logged_in');

      // Limpiar usuarios de prueba antiguos
      if (savedUser && (!isExplicit || savedUser.includes('usr_super_01'))) {
        localStorage.removeItem('demo_user');
        localStorage.removeItem('demo_impersonate');
        localStorage.removeItem('user_explicitly_logged_in');
        setUser(null);
      } else if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          // Consulta directa al backend para verificar rol en vivo
          if (parsed && parsed.email) {
            syncUserFromDatabase(parsed.email);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      const savedImpersonation = localStorage.getItem('demo_impersonate');
      if (savedImpersonation) {
        setImpersonatedRoleState(savedImpersonation as UserRole);
      }
    }
  }, []);

  // 2. Sincronización en segundo plano: cada 4 segundos y al volver a la pestaña
  useEffect(() => {
    if (!user?.email || typeof window === 'undefined') return;

    const email = user.email;

    // Intervalo periódico en segundo plano (cada 4s)
    const interval = setInterval(() => {
      syncUserFromDatabase(email);
    }, 4000);

    // Al enfocar la ventana o volver a la pestaña
    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncUserFromDatabase(email);
      }
    };

    window.addEventListener('focus', onVisibilityChange);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onVisibilityChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [user?.email]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al iniciar sesión' };
      }

      setUser(data);
      setImpersonatedRole(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(data));
        localStorage.setItem('user_explicitly_logged_in', 'true');
        localStorage.removeItem('demo_impersonate');
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (formData: RegisterData) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al registrarse' };
      }

      const newUser = data.user;
      setUser(newUser);
      setImpersonatedRole(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_user', JSON.stringify(newUser));
        localStorage.setItem('user_explicitly_logged_in', 'true');
        localStorage.removeItem('demo_impersonate');
      }
      setIsAuthModalOpen(false);
      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const setImpersonatedRole = (r: UserRole | null) => {
    setImpersonatedRoleState(r);
    if (typeof window !== 'undefined') {
      if (r) {
        localStorage.setItem('demo_impersonate', r);
      } else {
        localStorage.removeItem('demo_impersonate');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setImpersonatedRole(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('demo_impersonate');
      localStorage.removeItem('user_explicitly_logged_in');
    }
  };

  const switchQuickRole = (r: UserRole) => {
    let mockUser: User;
    if (r === 'programador') {
      mockUser = {
        id: 'usr_super_01',
        name: 'Carlos La Rosa (Programador)',
        email: 'larosagranado1111@gmail.com',
        role: 'programador',
        phone: '04248901572',
        country: 'Venezuela',
        age: 24,
      };
    } else if (r === 'admin') {
      mockUser = {
        id: 'usr_admin_01',
        name: 'Administrador Tienda',
        email: 'admin@demo.com',
        role: 'admin',
        phone: '+58 412 1111111',
        country: 'Venezuela',
        age: 32,
      };
    } else if (r === 'revendedor') {
      mockUser = {
        id: 'usr_resell_01',
        name: 'Boutique Aliada (Revendedor)',
        email: 'revendedor@demo.com',
        role: 'revendedor',
        phone: '+58 414 2222222',
        country: 'Colombia',
        age: 29,
      };
    } else {
      mockUser = {
        id: 'usr_client_01',
        name: 'María González (Cliente)',
        email: 'maria@gmail.com',
        role: 'cliente',
        phone: '+58 416 3333333',
        country: 'Venezuela',
        age: 24,
      };
    }

    setUser(mockUser);
    setImpersonatedRole(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      localStorage.setItem('user_explicitly_logged_in', 'true');
      localStorage.removeItem('demo_impersonate');
    }
  };

  const realRole: UserRole = user?.role || 'cliente';
  const effectiveRole: UserRole = impersonatedRole || realRole;
  // STRICT CHECK: canAccessAdmin is TRUE only if an authenticated user exists AND is 'admin' or 'programador'
  const canAccessAdmin = !!user && (effectiveRole === 'programador' || effectiveRole === 'admin');
  const isSuperAdmin = !!user && realRole === 'programador';

  return (
    <RoleContext.Provider
      value={{
        user,
        role: effectiveRole,
        realRole,
        impersonatedRole,
        setImpersonatedRole,
        setUser,
        logout,
        login,
        register,
        switchQuickRole,
        canAccessAdmin,
        isSuperAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authTab,
        openAuthModal,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
