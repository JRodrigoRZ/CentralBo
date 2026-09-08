import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  Mail,
  Calendar,
  Clock,
  Search,
  Globe,
  Copy,
  Check,
  ShieldAlert,
  Phone,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSuperAdminStores, SUPERADMIN_USERS } from '../../lib/superadminService';
import { CentralBoProfile } from '../../types';

interface DisplayUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  profile: CentralBoProfile;
  tenantId: string | null;
  storeName: string | null;
  storeSlug?: string | null;
  createdAt: string;
  lastActive: string;
}

/**
 * Carga y unifica de manera segura los usuarios de CentralBo:
 * 1. Usuarios con perfil SuperAdmin (Acceso Global).
 * 2. Administradores de Comercio (store_admin) asociados exclusivamente a su tenantId.
 * 3. Clientes públicos (public_client) con su comercio relacionado o general.
 */
function loadAllUsers(): DisplayUser[] {
  const users: DisplayUser[] = [];
  const registeredEmails = new Set<string>();

  // 1. Cargar el conjunto base de usuarios (Mock data con los 3 perfiles oficiales)
  SUPERADMIN_USERS.forEach((rec) => {
    users.push({
      id: rec.id,
      fullName: rec.fullName,
      email: rec.email,
      phone: rec.phone,
      profile: rec.profile,
      tenantId: rec.tenantId,
      storeName: rec.storeName,
      storeSlug: rec.storeSlug || null,
      createdAt: rec.createdAt,
      lastActive: rec.lastActive,
    });
    registeredEmails.add(rec.email.toLowerCase());
  });

  // 2. Administradores de Comercio creados dinámicamente en sesión desde getSuperAdminStores()
  const stores = getSuperAdminStores();
  stores.forEach((st) => {
    if (st.owner && st.owner.email && !registeredEmails.has(st.owner.email.toLowerCase())) {
      users.push({
        id: `usr-adm-${st.id}`,
        fullName: st.owner.name || 'Administrador de Comercio',
        email: st.owner.email,
        phone: st.owner.phone,
        profile: 'store_admin',
        tenantId: st.id,
        storeName: st.name,
        storeSlug: st.slug || null,
        createdAt: st.created_at ? st.created_at.slice(0, 10) : '2026-08-01',
        lastActive: st.activity?.ultimaActividad || 'Reciente',
      });
      registeredEmails.add(st.owner.email.toLowerCase());
    }
  });

  return users;
}

export const SuperAdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<DisplayUser[]>(() => loadAllUsers());
  const [profileFilter, setProfileFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedTenantId, setCopiedTenantId] = useState<string | null>(null);

  // Sincronización reactiva si cambian los comercios en el almacenamiento local
  useEffect(() => {
    const handleUpdate = () => {
      setUsers(loadAllUsers());
    };
    window.addEventListener('centralbo:superadmin_stores_changed', handleUpdate);
    return () => {
      window.removeEventListener('centralbo:superadmin_stores_changed', handleUpdate);
    };
  }, []);

  // Seguridad: Disponible ÚNICAMENTE para SuperAdmin
  if (currentUser && currentUser.profile !== 'superadmin') {
    return (
      <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-center space-y-3 max-w-lg mx-auto">
        <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Acceso Restringido</h3>
        <p className="text-xs text-rose-300 leading-relaxed">
          Esta sección está reservada exclusivamente para el SuperAdmin Global.
        </p>
      </div>
    );
  }

  // Filtrado de usuarios según perfil y búsqueda opcional
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (profileFilter !== 'todos' && user.profile !== profileFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = user.fullName.toLowerCase().includes(query);
        const matchesEmail = user.email.toLowerCase().includes(query);
        const matchesStore = user.storeName?.toLowerCase().includes(query);
        const matchesTenant = user.tenantId?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesStore || matchesTenant;
      }
      return true;
    });
  }, [users, profileFilter, searchQuery]);

  // Contadores por categoría
  const totalCount = users.length;
  const superAdminCount = users.filter((u) => u.profile === 'superadmin').length;
  const storeAdminCount = users.filter((u) => u.profile === 'store_admin').length;
  const publicClientCount = users.filter((u) => u.profile === 'public_client').length;

  const handleCopyTenantId = async (tenantId: string) => {
    try {
      await navigator.clipboard.writeText(tenantId);
      setCopiedTenantId(tenantId);
      setTimeout(() => setCopiedTenantId(null), 2000);
    } catch (e) {
      console.warn('Error al copiar tenantId:', e);
    }
  };

  const getProfileBadge = (profile: CentralBoProfile) => {
    switch (profile) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 whitespace-nowrap">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>SuperAdmin Global</span>
          </span>
        );
      case 'store_admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 whitespace-nowrap">
            <StoreIcon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Administrador de Comercio (store_admin)</span>
          </span>
        );
      case 'public_client':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Cliente público (public_client)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Usuarios de la Plataforma</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  {filteredUsers.length} de {totalCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualización y control de identidad para SuperAdmin, administradores de comercio y clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Búsqueda rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, comercio o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Selector de Filtros por Perfil */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Filtro Todos */}
        <button
          id="btn-filtro-todos"
          onClick={() => setProfileFilter('todos')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            profileFilter === 'todos'
              ? 'bg-slate-800 border-indigo-500/80 shadow-md shadow-indigo-950/40'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Todos</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400">Total registros</span>
          </div>
        </button>

        {/* Filtro SuperAdmin */}
        <button
          id="btn-filtro-superadmin"
          onClick={() => setProfileFilter('superadmin')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            profileFilter === 'superadmin'
              ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/40'
              : 'bg-indigo-950/20 border-indigo-900/30 hover:border-indigo-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300">SuperAdmin</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-indigo-300">{superAdminCount}</span>
            <span className="text-[10px] text-indigo-400/80">Acceso Global</span>
          </div>
        </button>

        {/* Filtro store_admin */}
        <button
          id="btn-filtro-store-admin"
          onClick={() => setProfileFilter('store_admin')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            profileFilter === 'store_admin'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/40'
              : 'bg-cyan-950/20 border-cyan-900/30 hover:border-cyan-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300">Admin de Comercio</span>
            <StoreIcon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-cyan-300">{storeAdminCount}</span>
            <span className="text-[10px] text-cyan-400/80">store_admin</span>
          </div>
        </button>

        {/* Filtro public_client */}
        <button
          id="btn-filtro-public-client"
          onClick={() => setProfileFilter('public_client')}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
            profileFilter === 'public_client'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/40'
              : 'bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-700/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Cliente Público</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-400">{publicClientCount}</span>
            <span className="text-[10px] text-emerald-400/80">public_client</span>
          </div>
        </button>
      </div>

      {/* Control desplegable alternativo para accesibilidad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Mostrando <strong>{filteredUsers.length}</strong> {filteredUsers.length === 1 ? 'usuario' : 'usuarios'} en la vista actual
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="user-profile-filter" className="font-medium text-slate-400">
            Filtrar por perfil:
          </label>
          <select
            id="user-profile-filter"
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="todos">Todos los perfiles ({totalCount})</option>
            <option value="superadmin">SuperAdmin Global ({superAdminCount})</option>
            <option value="store_admin">Administrador de Comercio ({storeAdminCount})</option>
            <option value="public_client">Cliente público ({publicClientCount})</option>
          </select>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VISTA DE ESCRITORIO: TABLA COMPLETA                                   */}
      {/* ===================================================================== */}
      <div className="hidden md:block rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-3">Perfil</th>
                <th className="py-3 px-4">Comercio Asociado & Referencia de Tenant</th>
                <th className="py-3 px-3">Registro</th>
                <th className="py-3 px-4 text-right">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No se encontraron usuarios que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    {/* Usuario: Nombre, Correo y Teléfono */}
                    <td className="py-3.5 px-4 max-w-[240px] sm:max-w-[280px] lg:max-w-[340px]">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                            user.profile === 'superadmin'
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                              : user.profile === 'store_admin'
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-white block truncate" title={user.fullName}>
                            {user.fullName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate" title={user.email}>
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          {user.phone && (
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span className="truncate">{user.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Perfil Oficial */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {getProfileBadge(user.profile)}
                    </td>

                    {/* Comercio Asociado & Identificación de Tenant */}
                    <td className="py-3.5 px-4">
                      {user.profile === 'store_admin' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-xs block">{user.storeName}</span>
                            {user.storeSlug && (
                              <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                                /{user.storeSlug}
                              </span>
                            )}
                          </div>
                          {user.tenantId && (
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <span
                                className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-all"
                                title={`tenantId completo: ${user.tenantId}`}
                              >
                                tenantId: {user.tenantId}
                              </span>
                              <button
                                onClick={() => handleCopyTenantId(user.tenantId!)}
                                title="Copiar tenantId del comercio"
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                              >
                                {copiedTenantId === user.tenantId ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-indigo-400" />
                                )}
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] text-slate-500 block">
                            Asociado exclusivamente a este comercio
                          </span>
                        </div>
                      ) : user.profile === 'superadmin' ? (
                        <div className="space-y-0.5">
                          <span className="text-indigo-300 font-semibold text-xs flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>Acceso Global</span>
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            No asignado a un comercio específico
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            tenantId: N/A (Control maestro de la plataforma)
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {user.storeName ? (
                            <>
                              <span className="text-emerald-300 font-semibold text-xs block">
                                {user.storeName}
                              </span>
                              {user.tenantId && (
                                <div className="flex items-center gap-1.5 pt-0.5">
                                  <span
                                    className="text-[10px] font-mono text-emerald-400/90 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 select-all"
                                    title={`tenantId completo: ${user.tenantId}`}
                                  >
                                    tenantId: {user.tenantId}
                                  </span>
                                  <button
                                    onClick={() => handleCopyTenantId(user.tenantId!)}
                                    title="Copiar tenantId del comercio"
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer shrink-0"
                                  >
                                    {copiedTenantId === user.tenantId ? (
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-emerald-400" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-slate-400 font-medium text-xs block">
                                General / Sin comercio asociado
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono block">
                                tenantId: No asociado
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Fecha de Registro */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{user.createdAt}</span>
                      </div>
                    </td>

                    {/* Última Actividad */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{user.lastActive}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VISTA MÓVIL: TARJETAS RESPONSIVE                                      */}
      {/* ===================================================================== */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
            No se encontraron usuarios que coincidan con los filtros aplicados.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md"
            >
              {/* Encabezado de la tarjeta con nombre y badge de perfil */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      user.profile === 'superadmin'
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                        : user.profile === 'store_admin'
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white text-sm block truncate" title={user.fullName}>
                      {user.fullName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 truncate" title={user.email}>
                      <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    {user.phone && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 pt-0.5">
                        <Phone className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Perfil */}
              <div>{getProfileBadge(user.profile)}</div>

              {/* Comercio Asociado & tenantId */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Asociación de Comercio:
                </span>
                {user.profile === 'store_admin' ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{user.storeName}</span>
                      {user.storeSlug && (
                        <span className="text-[10px] text-indigo-300 font-mono">
                          /{user.storeSlug}
                        </span>
                      )}
                    </div>
                    {user.tenantId && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                        <span className="text-[10px] font-mono text-cyan-300 truncate" title={`tenantId: ${user.tenantId}`}>
                          tenantId: {user.tenantId}
                        </span>
                        <button
                          onClick={() => handleCopyTenantId(user.tenantId!)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                          title="Copiar tenantId"
                        >
                          {copiedTenantId === user.tenantId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-indigo-400" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : user.profile === 'superadmin' ? (
                  <div className="space-y-0.5">
                    <span className="text-indigo-300 font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-indigo-400" /> Acceso Global
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      No asignado a un comercio específico
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {user.storeName ? (
                      <>
                        <span className="text-emerald-300 font-medium block">{user.storeName}</span>
                        {user.tenantId && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                            <span className="text-[10px] font-mono text-emerald-400/90 truncate" title={`tenantId: ${user.tenantId}`}>
                              tenantId: {user.tenantId}
                            </span>
                            <button
                              onClick={() => handleCopyTenantId(user.tenantId!)}
                              className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                              title="Copiar tenantId"
                            >
                              {copiedTenantId === user.tenantId ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-emerald-400" />
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 block">General / Sin comercio asociado</span>
                    )}
                  </div>
                )}
              </div>

              {/* Registro y Última Actividad */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {user.createdAt}
                </span>
                <span className="flex items-center gap-1 text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {user.lastActive}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nota de Seguridad y Aislamiento por Tenant */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Aislamiento por Tenant y Seguridad CentralBo</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Esta vista es de auditoría y solo lectura para el SuperAdmin. Cada administrador de comercio (<strong className="text-slate-300">store_admin</strong>) permanece rigurosamente aislado a su respectivo <code className="text-cyan-300 font-mono">tenantId</code>, sin acceso a otros comercios ni a funciones globales de la plataforma.
        </p>
      </div>
    </div>
  );
};

