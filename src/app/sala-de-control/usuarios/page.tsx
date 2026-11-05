'use client';

import React, { useState, useEffect } from 'react';
import { useRole } from '@/components/RoleContext';
import { User, UserRole } from '@/lib/types';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

export default function UsuariosPage() {
  const { role, realRole, impersonatedRole, setImpersonatedRole, isSuperAdmin, switchQuickRole } =
    useRole();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewPerspective, setViewPerspective] = useState<'programador' | 'admin'>('programador');

  // New user form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente' as UserRole,
    phone: '',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?viewer_role=${viewPerspective}`, {
        headers: {
          'x-user-role': viewPerspective,
        },
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [viewPerspective]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'cliente', phone: '' });
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al crear usuario');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': viewPerspective },
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'No se puede eliminar');
        return;
      }
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Seguridad, Jerarquías & RLS
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Gestor de Usuarios & Roles
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Estructura de 4 jerarquías con regla de seguridad "Caballo de Troya" y switch "Ver como..." para auditoría en vivo.
        </p>
      </div>

      {/* 4 Hierarchies Explanation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Programador */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>1. Programador</span>
          </div>
          <strong className="text-white text-sm block">Super Admin Oculto</strong>
          <p className="text-xs text-slate-300 leading-relaxed">
            Control absoluto del código, base de datos y panel. Tiene la función "Ver como..." para auditar la tienda desde cualquier rango.
          </p>
        </div>

        {/* 2. Admin */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>2. Administrador</span>
          </div>
          <strong className="text-white text-sm block">Dueño del Negocio</strong>
          <p className="text-xs text-slate-300 leading-relaxed">
            Control total sobre el catálogo de prendas, verificación de pagos en la billetera y embudo de pedidos.
          </p>
        </div>

        {/* 3. Revendedor */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>3. Revendedor</span>
          </div>
          <strong className="text-white text-sm block">Precios Mayoristas</strong>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acceso a tarifas especiales con descuento en el catálogo para reventa comercial de las prendas.
          </p>
        </div>

        {/* 4. Cliente */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>4. Cliente</span>
          </div>
          <strong className="text-white text-sm block">Comprador Final</strong>
          <p className="text-xs text-slate-300 leading-relaxed">
            Usuario final que agrega prendas al carrito flotante y realiza compras por los métodos de pago configurados.
          </p>
        </div>
      </div>

      {/* CABALLO DE TROYA DEMONSTRATION BOX */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Simulador de Seguridad "Caballo de Troya"
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Regla activa: cuando un <strong>Admin</strong> consulta la tabla de usuarios, la cuenta del <strong>Programador</strong> se camufla como un "Cliente" común, impidiendo manipulaciones o que sepa de un rango superior.
              </p>
            </div>
          </div>

          {/* Perspective switch button */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start">
            <button
              onClick={() => setViewPerspective('programador')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewPerspective === 'programador'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              👁️ Ver como Programador
            </button>
            <button
              onClick={() => setViewPerspective('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewPerspective === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎭 Ver como Admin (Troya)
            </button>
          </div>
        </div>

        {viewPerspective === 'admin' ? (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Modo Admin activo:</strong> Observa en la tabla inferior cómo la cuenta del Programador (Carlos Dev) aparece listada con el rol <strong>"cliente"</strong>. El Administrador nunca sabrá que es el Super Admin.
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Modo Programador activo:</strong> Tienes visión completa de todas las jerarquías auténticas de la base de datos Supabase.
            </span>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Listado de Cuentas de Usuario</h3>
            <span className="text-xs text-slate-400">Total: {users.length} cuentas registradas</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Usuario</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3.5">Nombre</th>
                <th className="pb-3.5">Correo Electrónico</th>
                <th className="pb-3.5">Teléfono</th>
                <th className="pb-3.5">Rol / Jerarquía</th>
                <th className="pb-3.5">Fecha Registro</th>
                <th className="pb-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2">
                    <span>{u.name}</span>
                    {u.role === 'programador' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-black">
                        Super
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-300 font-mono">{u.email}</td>
                  <td className="py-3.5 text-slate-400">{u.phone || 'N/A'}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'programador'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : u.role === 'admin'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : u.role === 'revendedor'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('es-VE') : 'Reciente'}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AGREGAR USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="roberto@correo.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contraseña *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Rol / Jerarquía *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="cliente">Cliente (Comprador final)</option>
                  <option value="revendedor">Revendedor (Mayorista con descuento)</option>
                  <option value="admin">Administrador (Control de tienda)</option>
                  <option value="programador">Programador (Super Admin Oculto)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp / Teléfono</label>
                <input
                  type="tel"
                  placeholder="+58 412 1234567"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

