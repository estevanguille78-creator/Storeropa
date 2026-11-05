'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';
import { StoreSettings } from '@/lib/types';
import {
  Palette,
  Image as ImageIcon,
  Type,
  User,
  Sparkles,
  Save,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function AparienciaPage() {
  const { settings, refreshSettings } = useTheme();

  const [formData, setFormData] = useState<Partial<StoreSettings>>({
    store_name: 'Demo Store',
    tagline: 'Moda Exclusiva & Marca Personal',
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
    color_primary: '#0f172a',
    color_secondary: '#d97706',
    color_bg: '#f8fafc',
    color_text: '#0f172a',
    font_family: 'Inter',
    button_radius: '0.5rem',
    brand_bio: '',
    brand_story: '',
    brand_profile_img: '',
    brand_video_url: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleColorChange = (key: keyof StoreSettings, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar apariencia');
      }

      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const fontOptions = [
    { label: 'Inter (Moderno & Limpio)', value: 'Inter' },
    { label: 'Playfair Display (Elegante & Alta Costura)', value: 'Playfair Display' },
    { label: 'Outfit (Vanguardista & Streetwear)', value: 'Outfit' },
    { label: 'Cinzel (Lujoso & Clásico)', value: 'Cinzel' },
    { label: 'Poppins (Geométrico & Amigable)', value: 'Poppins' },
    { label: 'Montserrat (Urbano & Contemporáneo)', value: 'Montserrat' },
  ];

  const buttonStyleOptions = [
    { label: 'Redondeado Suave (0.5rem)', value: '0.5rem' },
    { label: 'Pill / Cápsula (9999px)', value: '9999px' },
    { label: 'Cuadrado / Sharp (0px)', value: '0px' },
    { label: 'Sutil (0.25rem)', value: '0.25rem' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Site Builder & Identidad
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Módulo de Apariencia
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Modifica nombre de la tienda, fotos de pestaña (favicon), logos, paleta de colores y marca personal sin tocar código.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/10 transition-all self-start active:scale-95 cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saveSuccess ? '¡Guardado con Éxito!' : 'Guardar y Publicar'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Store Name & Visual Identity */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Identidad Visual & Nombre</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre de la Tienda *
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name || ''}
                  onChange={handleChange}
                  placeholder="Demo Store"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Lema / Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline || ''}
                  onChange={handleChange}
                  placeholder="Moda Exclusiva & Marca Personal"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Main Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Logo Principal (URL)
                </label>
                <input
                  type="url"
                  name="logo_url"
                  value={formData.logo_url || ''}
                  onChange={handleChange}
                  placeholder="https://.../logo.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                {formData.logo_url && (
                  <div className="mt-2 relative w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
                    <Image src={formData.logo_url} alt="Logo Preview" fill className="object-cover" sizes="48px" />
                  </div>
                )}
              </div>

              {/* Dark Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Logo Alternativo (Oscuro)
                </label>
                <input
                  type="url"
                  name="logo_dark_url"
                  value={formData.logo_dark_url || ''}
                  onChange={handleChange}
                  placeholder="https://.../logo-dark.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Favicon (Pestaña del Navegador)
                </label>
                <input
                  type="url"
                  name="favicon_url"
                  value={formData.favicon_url || ''}
                  onChange={handleChange}
                  placeholder="https://.../favicon.png"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                {formData.favicon_url && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                    <div className="relative w-6 h-6 rounded bg-slate-800 border border-slate-700 overflow-hidden">
                      <Image src={formData.favicon_url} alt="Favicon" fill className="object-cover" sizes="24px" />
                    </div>
                    <span>Vista en pestaña</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Color Palette */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Palette className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Paleta de Colores (Color Pickers)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Color Primario */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Color Primario</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color_primary || '#0f172a'}
                    onChange={(e) => handleColorChange('color_primary', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.color_primary || '#0f172a'}
                    onChange={(e) => handleColorChange('color_primary', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Color Secundario */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Color Secundario / Acento</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color_secondary || '#d97706'}
                    onChange={(e) => handleColorChange('color_secondary', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.color_secondary || '#d97706'}
                    onChange={(e) => handleColorChange('color_secondary', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Color de Fondo */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Color de Fondo</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color_bg || '#f8fafc'}
                    onChange={(e) => handleColorChange('color_bg', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.color_bg || '#f8fafc'}
                    onChange={(e) => handleColorChange('color_bg', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Color de Texto */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Color de Texto</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color_text || '#0f172a'}
                    onChange={(e) => handleColorChange('color_text', e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={formData.color_text || '#0f172a'}
                    onChange={(e) => handleColorChange('color_text', e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: UI Elements (Tipografías y Botones) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Type className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Elementos UI (Tipografías & Botones)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipografía de Google Fonts
                </label>
                <select
                  name="font_family"
                  value={formData.font_family || 'Inter'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {fontOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Estilo de Botones (Bordes)
                </label>
                <select
                  name="button_radius"
                  value={formData.button_radius || '0.5rem'}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {buttonStyleOptions.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Marca Personal (Biografía, Historia, Foto de Perfil) */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <User className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Marca Personal (Storytelling & Perfil)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Foto de Perfil del Creador/Marca (URL)
                </label>
                <input
                  type="url"
                  name="brand_profile_img"
                  value={formData.brand_profile_img || ''}
                  onChange={handleChange}
                  placeholder="https://.../foto-perfil.jpg"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Video de Presentación (URL opcional)
                </label>
                <input
                  type="url"
                  name="brand_video_url"
                  value={formData.brand_video_url || ''}
                  onChange={handleChange}
                  placeholder="https://youtube.com/... o enlace de video"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Biografía Corta (Aparece en el Hero y Pie de Página)
              </label>
              <textarea
                name="brand_bio"
                rows={2}
                value={formData.brand_bio || ''}
                onChange={handleChange}
                placeholder="Breve reseña que define tu propuesta de valor y visión de moda..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Historia Completa de la Marca ("Sobre Mí")
              </label>
              <textarea
                name="brand_story"
                rows={4}
                value={formData.brand_story || ''}
                onChange={handleChange}
                placeholder="Cuenta cómo nació tu proyecto, tu inspiración en el diseño, la calidad textil..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Design Preview */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Eye className="w-4 h-4" />
                <span>Vista Previa en Vivo</span>
              </div>

              {/* Sample simulated UI */}
              <div
                className="p-4 rounded-2xl space-y-3 transition-colors"
                style={{
                  backgroundColor: formData.color_bg || '#f8fafc',
                  color: formData.color_text || '#0f172a',
                  fontFamily: formData.font_family || 'Inter',
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-black/10">
                  <span className="font-extrabold text-sm">{formData.store_name}</span>
                  <span className="text-[10px] opacity-70">Tienda</span>
                </div>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                  {formData.brand_profile_img ? (
                    <Image
                      src={formData.brand_profile_img}
                      alt="Profile Preview"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-white/50">
                      Sin foto
                    </div>
                  )}
                </div>

                <p className="text-xs line-clamp-2 leading-relaxed opacity-80">
                  {formData.brand_bio || 'Biografía de muestra...'}
                </p>

                {/* Simulated Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    className="w-full py-2 px-3 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                    style={{
                      backgroundColor: formData.color_primary || '#0f172a',
                      borderRadius: formData.button_radius || '0.5rem',
                    }}
                  >
                    Botón Primario
                  </button>

                  <button
                    type="button"
                    className="w-full py-2 px-3 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                    style={{
                      backgroundColor: formData.color_secondary || '#d97706',
                      borderRadius: formData.button_radius || '0.5rem',
                    }}
                  >
                    Botón Secundario (Acento)
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                Al hacer clic en <strong>"Guardar y Publicar"</strong>, estas variables de diseño se aplican inmediatamente a toda la tienda pública.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

