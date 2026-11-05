'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/components/CurrencyContext';
import { Product, Category, AttributeGroup, AttributeValue } from '@/lib/types';
import {
  Layers,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Tag,
  Check,
  X,
  Sparkles,
  Sliders,
  DollarSign,
  Package,
} from 'lucide-react';

export default function CatalogoPage() {
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveTab] = useState<'categorias' | 'atributos' | 'productos'>('productos');

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal / Form State
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image_url: '', sort_order: 0 });

  // Attribute Group & Value Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'text' | 'color'>('text');
  const [valForms, setValForms] = useState<{ [groupId: number]: { label: string; value: string } }>({});

  // Product Modal / Form State
  const [showProdModal, setShowProdModal] = useState(false);
  const [editingProdId, setEditingProdId] = useState<number | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: 0,
    price: 35.0,
    reseller_price: 25.0,
    compare_at_price: 45.0,
    badge: 'Nuevo',
    is_featured: true,
    is_active: true,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'],
    selectedTallas: [] as string[],
    selectedColores: [] as { label: string; hex: string }[],
  });

  const loadAll = async () => {
    try {
      setLoading(true);
      const [catRes, attrRes, prodRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/attributes'),
        fetch('/api/products?include_inactive=true'),
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (attrRes.ok) setAttributeGroups(await attrRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) {
      console.error('Error loading catalog data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Category actions
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      if (res.ok) {
        setShowCatModal(false);
        setCatForm({ name: '', slug: '', description: '', image_url: '', sort_order: 0 });
        loadAll();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al crear categoría');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Los productos asociados se mantendrán sin categoría.')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Attribute group & value actions
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_group', group_name: newGroupName, group_type: newGroupType }),
      });
      setNewGroupName('');
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddValue = async (groupId: number) => {
    const data = valForms[groupId];
    if (!data || !data.label.trim()) return;
    try {
      await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_value',
          group_id: groupId,
          label: data.label,
          value: data.value || data.label,
        }),
      });
      setValForms({ ...valForms, [groupId]: { label: '', value: '' } });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteValue = async (valueId: number) => {
    try {
      await fetch(`/api/attributes/${valueId}?type=value`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Product Actions
  const handleOpenProdModal = (p?: Product) => {
    if (p) {
      setEditingProdId(p.id);
      setProdForm({
        name: p.name,
        slug: p.slug,
        description: p.description,
        category_id: p.category_id,
        price: p.price,
        reseller_price: p.reseller_price || 0,
        compare_at_price: p.compare_at_price || 0,
        badge: p.badge || '',
        is_featured: p.is_featured,
        is_active: p.is_active,
        stock: p.stock,
        images: p.images || [],
        selectedTallas: p.attributes?.tallas || [],
        selectedColores: p.attributes?.colores || [],
      });
    } else {
      setEditingProdId(null);
      setProdForm({
        name: '',
        slug: '',
        description: '',
        category_id: categories[0]?.id || 0,
        price: 35.0,
        reseller_price: 25.0,
        compare_at_price: 45.0,
        badge: 'Nuevo',
        is_featured: true,
        is_active: true,
        stock: 20,
        images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80'],
        selectedTallas: ['S', 'M', 'L'],
        selectedColores: [{ label: 'Negro Onyx', hex: '#111827' }],
      });
    }
    setShowProdModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: prodForm.name,
        slug: prodForm.slug,
        description: prodForm.description,
        category_id: prodForm.category_id,
        price: Number(prodForm.price),
        reseller_price: Number(prodForm.reseller_price) || null,
        compare_at_price: Number(prodForm.compare_at_price) || null,
        badge: prodForm.badge || null,
        is_featured: prodForm.is_featured,
        is_active: prodForm.is_active,
        stock: Number(prodForm.stock),
        images: prodForm.images,
        attributes: {
          tallas: prodForm.selectedTallas,
          colores: prodForm.selectedColores,
        },
      };

      if (editingProdId) {
        await fetch(`/api/products/${editingProdId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      setShowProdModal(false);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Eliminar este producto permanentemente?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper toggle size
  const toggleSizeSelection = (size: string) => {
    if (prodForm.selectedTallas.includes(size)) {
      setProdForm({ ...prodForm, selectedTallas: prodForm.selectedTallas.filter((s) => s !== size) });
    } else {
      setProdForm({ ...prodForm, selectedTallas: [...prodForm.selectedTallas, size] });
    }
  };

  // Helper toggle color
  const toggleColorSelection = (colorObj: { label: string; hex: string }) => {
    const exists = prodForm.selectedColores.some((c) => c.label === colorObj.label);
    if (exists) {
      setProdForm({
        ...prodForm,
        selectedColores: prodForm.selectedColores.filter((c) => c.label !== colorObj.label),
      });
    } else {
      setProdForm({
        ...prodForm,
        selectedColores: [...prodForm.selectedColores, colorObj],
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            Gestión de Inventario & Estructura
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Catálogo & Estructura
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Crea categorías (con rutas independientes y seguras), gestiona atributos dinámicos (tallas y colores) y administra tus prendas y calzado.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl self-start">
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'productos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Prendas & Productos ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categorias'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Categorías / Rutas ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('atributos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'atributos'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Creador de Atributos ({attributeGroups.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PRODUCTOS */}
      {activeTab === 'productos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Listado total de prendas de vestir, calzado y accesorios.
            </span>
            <button
              onClick={() => handleOpenProdModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const img =
                p.images?.[0] ||
                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800">
                      <Image src={img} alt={p.name} fill className="object-cover" sizes="300px" />
                      {p.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                          {p.badge}
                        </span>
                      )}
                      {!p.is_active && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                          Inactivo
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        {p.category_name || 'Sin categoría'}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                    </div>

                    {/* Attributes preview */}
                    <div className="flex flex-wrap gap-1 text-[11px] text-slate-400">
                      {p.attributes?.tallas?.map((t) => (
                        <span key={t} className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {t}
                        </span>
                      ))}
                      {p.attributes?.colores?.map((c) => (
                        <span
                          key={c.label}
                          className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block self-center"
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-sm font-extrabold text-white">
                          {formatPrice(p.price)}
                        </span>
                        {p.reseller_price && (
                          <span className="text-[11px] text-emerald-400 block font-semibold">
                            Mayorista: {formatPrice(p.reseller_price)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenProdModal(p)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                      <span>Editar</span>
                    </button>
                    <Link
                      href={`/producto/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Ver en la tienda"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORÍAS (GENERADOR DE PÁGINAS) */}
      {activeTab === 'categorias' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-amber-200">
                Generador Automático de Subpáginas Aisladas:
              </strong>
              Al crear una categoría, el sistema genera automáticamente una ruta única (ej: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white">/categoria/caballeros</code>) protegida y con filtros dedicados para esa sección de la tienda.
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Categorías activas para navegación</span>
            <button
              onClick={() => setShowCatModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nueva Categoría</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-800">
                  <Image
                    src={cat.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80'}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="250px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="font-bold text-sm block">{cat.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">/categoria/{cat.slug}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{cat.description || 'Sin descripción'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <Link
                    href={`/categoria/${cat.slug}`}
                    target="_blank"
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Ver subpágina</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-slate-400 hover:text-red-400 p-1.5"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CREADOR DE ATRIBUTOS (TALLAS, COLORES) */}
      {activeTab === 'atributos' && (
        <div className="space-y-6">
          {/* New Group Creator */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-base text-white mb-2">Crear Nuevo Grupo de Atributos</h3>
            <p className="text-xs text-slate-400 mb-4">
              Ejemplos: "Tallas de Calzado", "Tallas de Ropa", "Colores", "Material", "Corte".
            </p>
            <form onSubmit={handleCreateGroup} className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Nombre del grupo (Ej: Materiales)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white flex-1 min-w-[200px] focus:outline-none focus:border-amber-500"
              />
              <select
                value={newGroupType}
                onChange={(e) => setNewGroupType(e.target.value as 'text' | 'color')}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="text">Texto / Badge (Tallas, Material)</option>
                <option value="color">Color Visual (Paleta Hex)</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                Agregar Grupo
              </button>
            </form>
          </div>

          {/* Group values editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attributeGroups.map((group) => {
              const currentVal = valForms[group.id] || { label: '', value: '' };
              return (
                <div
                  key={group.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-sm text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>{group.name}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded uppercase font-semibold">
                      {group.type}
                    </span>
                  </div>

                  {/* Values Chips */}
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {group.values?.map((val) => (
                      <span
                        key={val.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                      >
                        {group.type === 'color' && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-700"
                            style={{ backgroundColor: val.value }}
                          />
                        )}
                        <span>{val.label}</span>
                        <button
                          onClick={() => handleDeleteValue(val.id)}
                          className="text-slate-500 hover:text-red-400 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Value Input */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={group.type === 'color' ? 'Nombre (Azul Marino)' : 'Valor (Ej. XXL)'}
                      value={currentVal.label}
                      onChange={(e) =>
                        setValForms({
                          ...valForms,
                          [group.id]: { ...currentVal, label: e.target.value },
                        })
                      }
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />

                    {group.type === 'color' && (
                      <input
                        type="color"
                        value={currentVal.value || '#111827'}
                        onChange={(e) =>
                          setValForms({
                            ...valForms,
                            [group.id]: { ...currentVal, value: e.target.value },
                          })
                        }
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                      />
                    )}

                    <button
                      onClick={() => handleAddValue(group.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CATEGORÍA */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Nueva Categoría (Página Aislada)</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre de la Categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calzado Deportivo"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ruta Única / Slug (Opcional)</label>
                <input
                  type="text"
                  placeholder="calzado-deportivo (se auto-genera si está vacío)"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Descripción de la colección..."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Foto / Portada (URL)</label>
                <input
                  type="url"
                  placeholder="https://.../foto.jpg"
                  value={catForm.image_url}
                  onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO / EDITAR PRODUCTO */}
      {showProdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 text-white space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                {editingProdId ? 'Editar Producto' : 'Ficha de Producto (Prenda / Calzado)'}
              </h3>
              <button onClick={() => setShowProdModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre de la Prenda *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="Ej. Sudadera Signature Oversize"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción y Detalles de Tejido</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  placeholder="Detalles de confección, corte, gramaje..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Cliente ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Mayorista ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.reseller_price}
                    onChange={(e) => setProdForm({ ...prodForm, reseller_price: parseFloat(e.target.value) || 0 })}
                    placeholder="Revendedor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Precio Tachado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodForm.compare_at_price}
                    onChange={(e) => setProdForm({ ...prodForm, compare_at_price: parseFloat(e.target.value) || 0 })}
                    placeholder="Antes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Disponible</label>
                  <input
                    type="number"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Tallas Selector from Created Attributes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Vincular Tallas Disponibles (Desde el creador de atributos):
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {attributeGroups
                    .filter((g) => g.type === 'text')
                    .flatMap((g) => g.values || [])
                    .map((val) => {
                      const isSelected = prodForm.selectedTallas.includes(val.label);
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => toggleSizeSelection(val.label)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-500'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {val.label} {isSelected && '✓'}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Colores Selector from Created Attributes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Vincular Colores Disponibles:
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {attributeGroups
                    .filter((g) => g.type === 'color')
                    .flatMap((g) => g.values || [])
                    .map((val) => {
                      const isSelected = prodForm.selectedColores.some((c) => c.label === val.label);
                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => toggleColorSelection({ label: val.label, hex: val.value })}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-slate-600"
                            style={{ backgroundColor: val.value }}
                          />
                          <span>{val.label}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Foto URL & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Foto Principal (URL)</label>
                  <input
                    type="url"
                    value={prodForm.images[0] || ''}
                    onChange={(e) => setProdForm({ ...prodForm, images: [e.target.value] })}
                    placeholder="https://.../foto.jpg"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={prodForm.badge}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    placeholder="Nuevo, Más Vendido, Limitado..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProdModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Guardar Prenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

