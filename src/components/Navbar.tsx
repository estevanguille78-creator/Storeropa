'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useCurrency } from './CurrencyContext';
import { useCart } from './CartContext';
import { useRole } from './RoleContext';
import { Category, UserRole } from '@/lib/types';
import {
  ShoppingBag,
  Menu,
  X,
  Sliders,
  ChevronDown,
  UserCheck,
  Sparkles,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { settings } = useTheme();
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  const { totalItems, setIsCartOpen } = useCart();
  const { role, realRole, impersonatedRole, setImpersonatedRole, switchQuickRole, isSuperAdmin } =
    useRole();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.filter((c) => c.is_active));
        }
      })
      .catch((err) => console.error('Failed to load nav categories', err));
  }, []);

  const storeName = settings?.store_name || 'Demo Store';
  const logoUrl = settings?.logo_url;

  return (
    <>
      {/* Top Banner: Role Simulator & Currency Notice */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings?.tagline || 'E-commerce & Marca Personal'}</span>
            </span>

            {/* Impersonation Indicator if active */}
            {impersonatedRole && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <Eye className="w-3 h-3" />
                Viendo como: {impersonatedRole.toUpperCase()}
                <button
                  onClick={() => setImpersonatedRole(null)}
                  className="ml-1 text-white hover:underline text-[10px]"
                >
                  (Volver)
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Currency selector */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Moneda:</span>
              <select
                value={currentCurrency.id}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-slate-800 text-slate-200 text-xs rounded px-2 py-0.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Role Switcher (For Demo & Trojan Testing) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 text-slate-300 transition-colors"
              >
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>Rol: <strong className="capitalize">{role}</strong></span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-2 z-50 text-xs">
                  <div className="px-2 py-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    Cambiar Jerarquía (Demo)
                  </div>
                  <button
                    onClick={() => {
                      switchQuickRole('programador');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                      realRole === 'programador' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>Programador (Super Admin)</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <button
                    onClick={() => {
                      switchQuickRole('admin');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                      realRole === 'admin' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>Admin (Dueño Negocio)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchQuickRole('revendedor');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                      realRole === 'revendedor' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>Revendedor (Mayorista)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchQuickRole('cliente');
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                      realRole === 'cliente' ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span>Cliente (Usuario Final)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Store Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {logoUrl ? (
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-gray-200">
                <Image src={logoUrl} alt={storeName} fill className="object-cover" sizes="40px" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-sm">
                {storeName.charAt(0)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-gray-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                {storeName}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
                Official Store
              </span>
            </div>
          </Link>

          {/* Desktop Categories Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-primary font-bold bg-gray-100/80' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Inicio
            </Link>

            {categories.map((cat) => {
              const active = pathname === `/categoria/${cat.slug}`;
              return (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.slug}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'text-primary font-bold bg-gray-100/80' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Admin Button & Cart */}
          <div className="flex items-center gap-3">
            {/* Sala de Control Link */}
            <Link
              href="/sala-de-control"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-button text-xs font-semibold transition-colors"
              title="Panel de Administración y Personalización"
            >
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Sala de Control</span>
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-button text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Abrir bolsa de compras"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Inicio
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                {cat.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/sala-de-control"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 bg-slate-900 text-white rounded-button font-medium text-sm"
              >
                Acceder a Sala de Control
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

