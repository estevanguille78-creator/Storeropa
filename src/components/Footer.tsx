'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { SocialLink } from '@/lib/types';
import { fetchWithCache, getCachedData } from '@/lib/cache';
import {
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Shield,
  FileText,
  Truck,
  X,
  Heart,
} from 'lucide-react';

export default function Footer() {
  const { settings } = useTheme();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    return getCachedData<SocialLink[]>('/api/social') || [];
  });
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'shipping' | null>(null);

  useEffect(() => {
    fetchWithCache<SocialLink[]>('/api/social')
      .then((data) => {
        if (Array.isArray(data)) {
          setSocialLinks(data.filter((s) => s.is_active));
        }
      })
      .catch((err) => console.error('Failed to load social links', err));
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'message-circle':
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const storeName = settings?.store_name || 'Demo Store';

  return (
    <>
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Store & Personal Brand */}
            <div className="space-y-4">
              <span className="text-2xl font-black text-white tracking-tight block">
                {storeName}
              </span>
              <p className="text-sm text-slate-400 leading-relaxed">
                {settings?.brand_bio ||
                  'Marca personal de ropa y calzado con cortes contemporáneos, tejidos premium y atención al detalle para destacar.'}
              </p>

              {/* Social links */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Síguenos en redes
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 transition-colors shadow-sm"
                      title={item.platform}
                    >
                      {renderIcon(item.icon)}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Explorar Tienda
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Colección Principal
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/caballeros" className="hover:text-white transition-colors">
                    Caballeros & Streetwear
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/damas" className="hover:text-white transition-colors">
                    Damas & Siluetas
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/calzado" className="hover:text-white transition-colors">
                    Calzado & Sneakers
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/accesorios" className="hover:text-white transition-colors">
                    Accesorios & Complementos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact Details */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Atención al Cliente
              </h3>
              <ul className="space-y-3 text-sm text-slate-400">
                {settings?.contact_phone && (
                  <li className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>{settings.contact_phone}</span>
                  </li>
                )}
                {settings?.contact_email && (
                  <li className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>{settings.contact_email}</span>
                  </li>
                )}
                {settings?.contact_address && (
                  <li className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>{settings.contact_address}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Column 4: Legal & Policies */}
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                Seguridad & Políticas
              </h3>
              <div className="space-y-2.5 text-sm text-slate-400">
                <button
                  onClick={() => setActiveModal('terms')}
                  className="flex items-center gap-2 hover:text-white transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Términos y Condiciones</span>
                </button>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center gap-2 hover:text-white transition-colors text-left"
                >
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>Política de Privacidad</span>
                </button>
                <button
                  onClick={() => setActiveModal('shipping')}
                  className="flex items-center gap-2 hover:text-white transition-colors text-left"
                >
                  <Truck className="w-4 h-4 text-slate-500" />
                  <span>Políticas de Envío y Entrega</span>
                </button>
              </div>

              <div className="mt-6 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-amber-400 font-semibold block mb-1">
                  100% Personalizable
                </span>
                <p className="text-[11px] text-slate-400">
                  Todo este contenido, colores, logos y políticas se configuran desde la Sala de Control.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{settings?.copyright_text || `© 2026 ${storeName}. Todos los derechos reservados.`}</p>
            <p className="flex items-center gap-1">
              Desarrollado para venta de ropa & marca personal
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Modal for Legal Policies */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white text-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-primary" />}
                {activeModal === 'privacy' && <Shield className="w-5 h-5 text-primary" />}
                {activeModal === 'shipping' && <Truck className="w-5 h-5 text-primary" />}
                {activeModal === 'terms' && 'Términos y Condiciones'}
                {activeModal === 'privacy' && 'Política de Privacidad'}
                {activeModal === 'shipping' && 'Políticas de Envío'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto text-sm text-gray-600 leading-relaxed whitespace-pre-line flex-1">
              {activeModal === 'terms' &&
                (settings?.terms_content || 'Términos y condiciones configurados en Sala de Control.')}
              {activeModal === 'privacy' &&
                (settings?.privacy_content || 'Políticas de privacidad configuradas en Sala de Control.')}
              {activeModal === 'shipping' &&
                (settings?.shipping_content || 'Políticas de envío configuradas en Sala de Control.')}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 bg-gray-900 text-white rounded-button font-medium text-xs hover:bg-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

