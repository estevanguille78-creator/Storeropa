'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '@/lib/types';

interface RoleContextType {
  user: User | null;
  role: UserRole;
  realRole: UserRole;
  impersonatedRole: UserRole | null;
  setImpersonatedRole: (role: UserRole | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  switchQuickRole: (role: UserRole) => void;
  canAccessAdmin: boolean;
  isSuperAdmin: boolean;
}

const defaultDevUser: User = {
  id: 'usr_super_01',
  name: 'Carlos Dev (Programador)',
  email: 'carlos@demo.com',
  role: 'programador',
  phone: '+58 412 0000000',
};

const RoleContext = createContext<RoleContextType>({
  user: defaultDevUser,
  role: 'programador',
  realRole: 'programador',
  impersonatedRole: null,
  setImpersonatedRole: () => {},
  setUser: () => {},
  logout: () => {},
  switchQuickRole: () => {},
  canAccessAdmin: true,
  isSuperAdmin: true,
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultDevUser);
  const [impersonatedRole, setImpersonatedRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('demo_user');
      const savedImpersonation = localStorage.getItem('demo_impersonate');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(defaultDevUser);
        }
      } else {
        localStorage.setItem('demo_user', JSON.stringify(defaultDevUser));
      }

      if (savedImpersonation) {
        setImpersonatedRoleState(savedImpersonation as UserRole);
      }
    }
  }, []);

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
    }
  };

  const switchQuickRole = (r: UserRole) => {
    let mockUser: User;
    if (r === 'programador') {
      mockUser = defaultDevUser;
    } else if (r === 'admin') {
      mockUser = {
        id: 'usr_admin_01',
        name: 'Administrador Tienda',
        email: 'admin@demo.com',
        role: 'admin',
        phone: '+58 412 1111111',
      };
    } else if (r === 'revendedor') {
      mockUser = {
        id: 'usr_resell_01',
        name: 'Boutique Aliada (Revendedor)',
        email: 'revendedor@demo.com',
        role: 'revendedor',
        phone: '+58 414 2222222',
      };
    } else {
      mockUser = {
        id: 'usr_client_01',
        name: 'María González (Cliente)',
        email: 'maria@gmail.com',
        role: 'cliente',
        phone: '+58 416 3333333',
      };
    }

    setUser(mockUser);
    setImpersonatedRole(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      localStorage.removeItem('demo_impersonate');
    }
  };

  const realRole: UserRole = user?.role || 'cliente';
  const effectiveRole: UserRole = impersonatedRole || realRole;
  const canAccessAdmin = effectiveRole === 'programador' || effectiveRole === 'admin';
  const isSuperAdmin = realRole === 'programador';

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
        switchQuickRole,
        canAccessAdmin,
        isSuperAdmin,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

