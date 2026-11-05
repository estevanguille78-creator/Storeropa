'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/components/RoleContext';
import { useTheme } from '@/components/ThemeProvider';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  Palette,
  Layers,
  Wallet,
  ShoppingBag,
  Users,
  Share2,
  ExternalLink,
  Shield,
  Eye,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function SalaDeControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, realRole, impersonatedRole, setImpersonatedRole, isSuperAdmin, switchQuickRole } =
    useRole();
  const { settings } = useTheme();

  const navItems = [
    { label: 'Resumen', href: '/sala-de-control', icon: LayoutDashboard },
    { label: 'Apariencia', href: '/sala-de-control/apariencia', icon: Palette },
    { label: 'Catálogo & Rutas', href: '/sala-de-control/catalogo', icon: Layers },
    { label: 'Billetera & Pagos', href: '/sala-de-control/billetera', icon: Wallet },
    { label: 'Gestor de Pedidos', href: '/sala-de-control/pedidos', icon: ShoppingBag },
    { label: 'Usuarios & Seguridad', href: '/sala-de-control/usuarios', icon: Users },
    { label: 'Redes & Footer', href: '/sala-de-control/redes-footer', icon: Share2 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                SC
              </span>
              <h1 className="font-black text-lg text-white tracking-tight">Sala de Control</h1>
            </div>
            <span className="text-[11px] text-amber-400 font-medium block mt-1">
              {settings?.store_name || 'Demo Store'} • Panel Maestro
            </span>
          </div>
        </div>

        {/* Role & Impersonation Badge */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Jerarquía Activa
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                role === 'programador'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : role === 'admin'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {role}
            </span>
          </div>

          {/* Super Admin "Ver como..." Switcher */}
          {isSuperAdmin && (
            <div className="mt-2 pt-2 border-t border-slate-700">
              <label htmlFor="impersonate-role-select" className="text-[11px] text-slate-400 flex items-center gap-1 mb-1 font-semibold">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Función "Ver como...":</span>
              </label>
              <select
                id="impersonate-role-select"
                aria-label="Función Ver como para cambiar jerarquía"
                value={impersonatedRole || ''}
                onChange={(e) =>
                  setImpersonatedRole((e.target.value as UserRole) || null)
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs px-2 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">Vista Real: Programador</option>
                <option value="admin">Ver como: Administrador</option>
                <option value="revendedor">Ver como: Revendedor (Mayorista)</option>
                <option value="cliente">Ver como: Cliente Común</option>
              </select>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions in Sidebar */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Tienda Pública</span>
            </span>
            <span className="text-[10px] text-slate-400">Ir</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}

