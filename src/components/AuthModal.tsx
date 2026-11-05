'use client';

import React, { useState } from 'react';
import { useRole } from './RoleContext';
import { X, Lock, Mail, User, Phone, Globe, Calendar, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authTab, openAuthModal, login, register, switchQuickRole } =
    useRole();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: 'Venezuela',
    age: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas');
    } else {
      setSuccessMessage('¡Sesión iniciada con éxito!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 800);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regData.name || !regData.email || !regData.password || !regData.phone || !regData.country || !regData.age) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    const parsedAge = parseInt(regData.age, 10);
    if (isNaN(parsedAge) || parsedAge < 12) {
      setErrorMessage('Por favor ingresa una edad válida (mayor a 12 años).');
      return;
    }

    setLoading(true);
    const res = await register({
      name: regData.name,
      email: regData.email,
      password: regData.password,
      phone: regData.phone,
      country: regData.country,
      age: parsedAge,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Error al crear la cuenta');
    } else {
      setSuccessMessage('¡Cuenta creada e iniciada con éxito!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 800);
    }
  };

  const countriesList = [
    'Venezuela',
    'Colombia',
    'México',
    'España',
    'Estados Unidos',
    'Chile',
    'Argentina',
    'Perú',
    'Ecuador',
    'Panamá',
    'Otro',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-gray-900 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden border border-gray-100 flex flex-col">
        {/* Header with Close */}
        <div className="relative bg-slate-900 text-white p-6 pb-5">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Acceso a la Tienda
          </span>
          <h3 className="text-2xl font-black tracking-tight">
            {authTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {authTab === 'login'
              ? 'Ingresa con tu correo y contraseña para gestionar tus compras.'
              : 'Regístrate para comprar, guardar tu carrito y recibir ofertas.'}
          </p>

          {/* Tabs Pill */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mt-4 text-xs font-bold border border-slate-700/60">
            <button
              onClick={() => {
                setErrorMessage('');
                openAuthModal('login');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={() => {
                setErrorMessage('');
                openAuthModal('register');
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                authTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Error & Success alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB: INICIAR SESIÓN */}
          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar a mi Cuenta</span>
                  </>
                )}
              </button>

              {/* Quick demo switch helper */}
              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
                <span>¿Quieres probar cuentas de demostración?</span>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      switchQuickRole('programador');
                      setIsAuthModalOpen(false);
                    }}
                    className="px-2 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded font-semibold hover:bg-amber-100"
                  >
                    Programador
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchQuickRole('admin');
                      setIsAuthModalOpen(false);
                    }}
                    className="px-2 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold hover:bg-blue-100"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchQuickRole('revendedor');
                      setIsAuthModalOpen(false);
                    }}
                    className="px-2 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded font-semibold hover:bg-emerald-100"
                  >
                    Revendedor
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB: REGISTRARSE */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Valeria Rivas"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Correo Electrónico *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="valeria@correo.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contraseña *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Crea una contraseña segura"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Número de WhatsApp *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. +58 412 1234567"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">País *</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={regData.country}
                      onChange={(e) => setRegData({ ...regData, country: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900 bg-white cursor-pointer"
                    >
                      {countriesList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Edad *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min="12"
                      max="120"
                      placeholder="Ej. 24"
                      value={regData.age}
                      onChange={(e) => setRegData({ ...regData, age: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-slate-950 font-bold rounded-button text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Completar Registro</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

