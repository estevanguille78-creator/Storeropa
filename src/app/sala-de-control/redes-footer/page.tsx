'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { SocialLink, StoreSettings } from '@/lib/types';
import {
  Share2,
  Plus,
  Trash2,
  Save,
  Check,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Truck,
  Globe,
  RefreshCw,
} from 'lucide-react';

export default function RedesFooterPage() {
  const { settings, refreshSettings } = useTheme();

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [footerForm, setFooterForm] = useState({
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    copyright_text: '',
    terms_content: '',
    privacy_content: '',
    shipping_content: '',
  });

  const [newSocial, setNewSocial] = useState({
    platform: 'Instagram',
    url: '',
    icon: 'instagram',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/social');
      if (res.ok) {
        setSocialLinks(await res.json());
      }
    } catch (err) {
      console.error('Failed to load social links', err);
    }
  };

  useEffect(() => {
    loadData();
    if (settings) {
      setFooterForm({
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        copyright_text: settings.copyright_text || '',
        terms_content: settings.terms_content || '',
        privacy_content: settings.privacy_content || '',
        shipping_content: settings.shipping_content || '',
      });
    }
  }, [settings]);

  // Social Links actions
  const handleAddSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocial.url) return;
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSocial, is_active: true }),
      });
      if (res.ok) {
        setNewSocial({ platform: 'Instagram', url: '', icon: 'instagram' });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSocial = async (id: number) => {
    try {
      await fetch(`/api/social?id=${id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save footer settings
  const handleSaveFooter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerForm),
      });

      if (!res.ok) {
        throw new Error('Error al actualizar footer');
      }

      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Canales de Contacto & Legal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Redes Sociales & Pie de Página
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gestiona tus enlaces a Instagram, TikTok, WhatsApp, datos de contacto oficiales y redacción de políticas legales.
          </p>
        </div>

        <button
          onClick={handleSaveFooter}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all self-start active:scale-95 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? '¡Guardado con Éxito!' : 'Guardar Información'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Social Links Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <Share2 className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-base text-white">Gestor de Redes Sociales</h3>
            </div>

            {/* Existing Social Links list */}
            <div className="space-y-2.5">
              {socialLinks.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <strong className="text-white block">{s.platform}</strong>
                      <span className="text-[11px] text-slate-400 font-mono truncate block">
                        {s.url}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteSocial(s.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400"
                    title="Eliminar enlace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new social form */}
            <form onSubmit={handleAddSocial} className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">
                Añadir Plataforma:
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Plataforma</label>
                  <select
                    value={newSocial.platform}
                    onChange={(e) => {
                      const plat = e.target.value;
                      let icon = 'globe';
                      if (plat.includes('Instagram')) icon = 'instagram';
                      if (plat.includes('TikTok')) icon = 'tiktok';
                      if (plat.includes('WhatsApp')) icon = 'message-circle';
                      if (plat.includes('Facebook')) icon = 'facebook';
                      if (plat.includes('X')) icon = 'twitter';
                      setNewSocial({ ...newSocial, platform: plat, icon });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Facebook">Facebook</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="YouTube">YouTube</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ícono</label>
                  <input
                    type="text"
                    value={newSocial.icon}
                    onChange={(e) => setNewSocial({ ...newSocial, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Enlace Directo (URL)</label>
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/tuperfil"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Agregar Red Social</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Footer Contact & Legal Policies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Datos de Contacto del Pie de Página</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  value={footerForm.contact_phone}
                  onChange={(e) => setFooterForm({ ...footerForm, contact_phone: e.target.value })}
                  placeholder="+58 412 1234567"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={footerForm.contact_email}
                  onChange={(e) => setFooterForm({ ...footerForm, contact_email: e.target.value })}
                  placeholder="contacto@tienda.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Dirección Física / Showroom / Cobertura
                </label>
                <input
                  type="text"
                  value={footerForm.contact_address}
                  onChange={(e) => setFooterForm({ ...footerForm, contact_address: e.target.value })}
                  placeholder="Caracas, Venezuela / Envíos a todo el país"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Mensaje de Copyright</label>
                <input
                  type="text"
                  value={footerForm.copyright_text}
                  onChange={(e) => setFooterForm({ ...footerForm, copyright_text: e.target.value })}
                  placeholder="© 2026 Demo Store. Todos los derechos reservados."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Legal Policies Editor */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Políticas Legales (Mostradas en Ventana Modal)</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Términos y Condiciones</span>
                </label>
                <textarea
                  rows={3}
                  value={footerForm.terms_content}
                  onChange={(e) => setFooterForm({ ...footerForm, terms_content: e.target.value })}
                  placeholder="Términos de compra, tiempos de pago..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Política de Privacidad</span>
                </label>
                <textarea
                  rows={3}
                  value={footerForm.privacy_content}
                  onChange={(e) => setFooterForm({ ...footerForm, privacy_content: e.target.value })}
                  placeholder="Tratamiento de datos personales..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Políticas de Envío y Entregas</span>
                </label>
                <textarea
                  rows={3}
                  value={footerForm.shipping_content}
                  onChange={(e) => setFooterForm({ ...footerForm, shipping_content: e.target.value })}
                  placeholder="Agencias de encomienda, tiempos de despacho..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

