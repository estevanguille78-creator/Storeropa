'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { useCurrency } from './CurrencyContext';
import { useCart } from './CartContext';
import { useRole } from './RoleContext';
import { Category } from '@/lib/types';
import {
  ShoppingBag,
  Menu,
  X,
  Sliders,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  Globe,
  Phone,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { settings } = useTheme();
  const { currencies, currentCurrency, setCurrency } = useCurrency();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, role, canAccessAdmin, openAuthModal, logout } = useRole();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
      {/* Top Banner: Slogan & Currency Selector ONLY (Sin roles públicos) */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-medium tracking-wide">
              {settings?.tagline || 'Moda Exclusiva & Marca Personal'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
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

          {/* Actions: Auth, Sala de Control (Solo Admin/Dev), Cart */}
          <div className="flex items-center gap-2.5">
            {/* Si NO ha iniciado sesión: Mostrar Iniciar Sesión y Registrarse */}
            {!user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-button transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-button shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Registrarse</span>
                </button>
              </div>
            ) : (
              /* Si YA inició sesión: Mostrar Perfil */
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-button bg-gray-100 hover:bg-gray-200/80 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold truncate max-w-[110px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 text-xs text-gray-700 animate-in fade-in slide-in-from-top-2">
                    <div className="pb-3 border-b border-gray-100">
                      <strong className="block text-gray-900 font-bold text-sm">{user.name}</strong>
                      <span className="text-[11px] text-gray-500 block truncate">{user.email}</span>
                      <div className="flex items-center gap-2 mt-2">
                        {canAccessAdmin ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{role}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                            Cliente
                          </span>
                        )}
                        {user.country && (
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-400" />
                            {user.country}
                          </span>
                        )}
                        {user.age && (
                          <span className="text-[11px] text-gray-500">
                            • {user.age} años
                          </span>
                        )}
                      </div>
                      {user.phone && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1 font-mono">
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Enlace a Sala de Control SOLO para Admin o Programador */}
                    {canAccessAdmin && (
                      <div className="py-2 border-b border-gray-100">
                        <Link
                          href="/sala-de-control"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-slate-900 bg-amber-500/10 hover:bg-amber-500/20 font-bold text-xs transition-colors"
                        >
                          <Sliders className="w-4 h-4 text-amber-600" />
                          <span>Panel: Sala de Control</span>
                        </Link>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BOTÓN SALA DE CONTROL: EXCLUSIVO Y VISIBLE SOLO SI EL USUARIO ES ADMIN O PROGRAMADOR */}
            {canAccessAdmin && (
              <Link
                href="/sala-de-control"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-button text-xs font-bold transition-all shadow-sm"
                title="Panel de Administración Exclusivo"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Sala de Control</span>
              </Link>
            )}

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-button text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
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
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
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

            {/* Mobile auth buttons */}
            {!user ? (
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="py-2.5 px-3 rounded-button text-xs font-semibold text-gray-800 bg-gray-100 text-center"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="py-2.5 px-3 rounded-button text-xs font-bold text-slate-950 bg-amber-500 text-center"
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <div className="px-3 py-2 bg-gray-50 rounded-xl text-xs">
                  <strong className="block text-gray-900">{user.name}</strong>
                  <span className="text-gray-500">{user.email}</span>
                </div>

                {canAccessAdmin && (
                  <Link
                    href="/sala-de-control"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 bg-slate-900 text-white rounded-button font-medium text-sm"
                  >
                    Acceder a Sala de Control
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
