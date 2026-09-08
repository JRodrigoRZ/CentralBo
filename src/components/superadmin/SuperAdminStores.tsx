import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Utensils,
  Shirt,
  Briefcase,
  ShoppingBag,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Pause,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  getSuperAdminStores,
  createSuperAdminStore,
  updateSuperAdminStore,
  activateStore,
  deactivateStore,
  suspendStore,
  deleteSuperAdminStorePermanently,
  CreateStoreInput,
  UpdateStoreInput,
} from '../../lib/superadminService';
import {
  SuperAdminStoreRecord,
  StoreType,
  StoreStatus,
  SubscriptionStatus,
  PlanId,
  StoreOwnerInvitation,
} from '../../types';
import {
  getStoreOwnerInvitations,
  getOrCreateStoreOwnerInvitation,
  registerDirectStoreOwnerAccess,
  DirectStoreOwnerCredentials,
} from '../../lib/storeOwnerActivationService';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';

const typeLabels: Record<StoreType, string> = {
  restaurante: 'Restaurante / Gastronomía',
  moda: 'Moda & Tendencias',
  servicios: 'Servicios Profesionales',
  general: 'Comercio General',
};

const typeIcons: Record<StoreType, React.ElementType> = {
  restaurante: Utensils,
  moda: Shirt,
  servicios: Briefcase,
  general: ShoppingBag,
};

const statusBadges: Record<
  StoreStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  activo: {
    label: 'Activo',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
  },
  prueba: {
    label: 'En Prueba',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    icon: Clock,
  },
  inactivo: {
    label: 'Inactivo',
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    border: 'border-slate-700',
    icon: Pause,
  },
  suspendido: {
    label: 'Suspendido',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: Ban,
  },
};

const subStatusBadges: Record<SubscriptionStatus, { label: string; text: string }> = {
  activa: { label: 'Al Día', text: 'text-emerald-400' },
  prueba: { label: 'Trial 14d', text: 'text-cyan-400' },
  vencida: { label: 'Vencida', text: 'text-amber-400' },
  cancelada: { label: 'Cancelada', text: 'text-rose-400' },
};

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export const SuperAdminStores: React.FC = () => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  // Lista de comercios cargados
  const [stores, setStores] = useState<SuperAdminStoreRecord[]>(() => getSuperAdminStores());

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modales y estados de interacción
  const [selectedStore, setSelectedStore] = useState<SuperAdminStoreRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<SuperAdminStoreRecord | null>(null);

  // Estados del flujo de Credenciales Iniciales del Dueño de Comercio
  const [invitations, setInvitations] = useState<StoreOwnerInvitation[]>(() => getStoreOwnerInvitations());
  const [createdCredentials, setCreatedCredentials] = useState<DirectStoreOwnerCredentials | null>(null);
  const [copiedEmailFeedback, setCopiedEmailFeedback] = useState<boolean>(false);
  const [copiedPasswordFeedback, setCopiedPasswordFeedback] = useState<boolean>(false);
  const [copiedAllFeedback, setCopiedAllFeedback] = useState<boolean>(false);

  // Modales de confirmación de ciclo de vida
  const [deactivatingStore, setDeactivatingStore] = useState<SuperAdminStoreRecord | null>(null);
  const [suspendingStore, setSuspendingStore] = useState<SuperAdminStoreRecord | null>(null);
  const [deletingStore, setDeletingStore] = useState<SuperAdminStoreRecord | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState<string>('');

  // Notificaciones visuales (Toasts)
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Formulario de creación
  const [newStoreForm, setNewStoreForm] = useState<CreateStoreInput>({
    name: '',
    store_type: 'general',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    planId: 'basic',
    status: 'activo',
    slug: '',
  });
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({});

  // Formulario de edición
  const [editForm, setEditForm] = useState<UpdateStoreInput>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  // Sincronización reactiva con almacenamiento y cambios globales
  const refreshStores = () => {
    const updated = getSuperAdminStores();
    setStores(updated);
    // Si la tienda seleccionada cambió de estado o fue eliminada, sincronizar detalle
    if (selectedStore) {
      const refreshed = updated.find((s) => s.id === selectedStore.id);
      setSelectedStore(refreshed || null);
    }
  };

  useEffect(() => {
    const handleStoresChanged = () => {
      refreshStores();
      setInvitations(getStoreOwnerInvitations());
    };

    const handleInvitationsChanged = () => {
      setInvitations(getStoreOwnerInvitations());
    };

    window.addEventListener('centralbo:superadmin_stores_changed', handleStoresChanged);
    window.addEventListener('centralbo:store_owner_invitation_changed', handleInvitationsChanged);
    return () => {
      window.removeEventListener('centralbo:superadmin_stores_changed', handleStoresChanged);
      window.removeEventListener('centralbo:store_owner_invitation_changed', handleInvitationsChanged);
    };
  }, [selectedStore]);

  // Limpieza automática del Toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: ToastNotification['type'] = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  // Guardia de Seguridad: Accesible ÚNICAMENTE para SuperAdmin Global
  if (!user || user.profile !== 'superadmin') {
    return (
      <div
        id="superadmin-stores-restricted"
        className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-4 shadow-2xl"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white">
          Acceso Restringido — SuperAdmin Global
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Esta sección de gestión de comercios está reservada exclusivamente para usuarios con el
          perfil de <strong>SuperAdmin Global</strong>. Los administradores de comercios regulares no
          tienen autorización para modificar ni gestionar otros comercios.
        </p>
      </div>
    );
  }

  // Filtrado de comercios
  const filteredStores = stores.filter((store) => {
    if (filterType !== 'todos' && store.store_type !== filterType) return false;
    if (filterStatus !== 'todos' && store.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = store.name.toLowerCase().includes(term);
      const matchSlug = (store.slug || '').toLowerCase().includes(term);
      const matchOwner = store.owner.name.toLowerCase().includes(term);
      const matchEmail = store.owner.email.toLowerCase().includes(term);
      if (!matchName && !matchSlug && !matchOwner && !matchEmail) return false;
    }
    return true;
  });

  // Manejo de Creación de Comercio
  const handleOpenCreateModal = () => {
    setNewStoreForm({
      name: '',
      store_type: 'general',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      planId: 'basic',
      status: 'activo',
      slug: '',
    });
    setCreateFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!newStoreForm.name.trim()) {
      errors.name = 'El nombre del comercio es requerido';
    }
    if (!newStoreForm.ownerName.trim()) {
      errors.ownerName = 'El nombre del propietario es requerido';
    }
    if (!newStoreForm.ownerEmail.trim()) {
      errors.ownerEmail = 'El correo electrónico es requerido';
    } else if (!newStoreForm.ownerEmail.includes('@')) {
      errors.ownerEmail = 'Ingresa un correo electrónico válido';
    }
    if (!newStoreForm.ownerPhone.trim()) {
      errors.ownerPhone = 'El teléfono o WhatsApp de contacto es requerido';
    }

    if (Object.keys(errors).length > 0) {
      setCreateFormErrors(errors);
      return;
    }

    try {
      const created = createSuperAdminStore(newStoreForm);

      // Flujo de Registro Directo: Crear acceso del dueño con credenciales iniciales automáticas
      const credentials = registerDirectStoreOwnerAccess({
        storeId: created.id,
        storeName: created.name,
        storeSlug: created.slug || '',
        ownerName: created.owner.name,
        ownerEmail: created.owner.email,
        ownerPhone: created.owner.phone,
      });

      refreshStores();
      setInvitations(getStoreOwnerInvitations());
      setIsCreateModalOpen(false);
      showToast(`Comercio "${created.name}" y dueño registrados con éxito`, 'success');
      // Abrir modal de confirmación con credenciales iniciales generadas
      setCreatedCredentials(credentials);
    } catch (err) {
      console.error('[CentralBo] Error al crear comercio:', err);
      showToast('Ocurrió un error al registrar el comercio', 'error');
    }
  };

  // Manejo de Edición de Comercio
  const handleOpenEditModal = (store: SuperAdminStoreRecord) => {
    setEditingStore(store);
    setEditForm({
      name: store.name,
      store_type: store.store_type,
      planId: store.subscription.planId,
      ownerName: store.owner.name,
      ownerEmail: store.owner.email,
      ownerPhone: store.owner.phone,
      socials: {
        whatsapp: store.owner.socials?.whatsapp || '',
        instagram: store.owner.socials?.instagram || '',
        facebook: store.owner.socials?.facebook || '',
      },
    });
    setEditFormErrors({});
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const errors: Record<string, string> = {};
    if (!editForm.name?.trim()) {
      errors.name = 'El nombre del comercio es requerido';
    }
    if (!editForm.ownerName?.trim()) {
      errors.ownerName = 'El nombre del propietario es requerido';
    }
    if (!editForm.ownerEmail?.trim()) {
      errors.ownerEmail = 'El correo electrónico es requerido';
    } else if (!editForm.ownerEmail.includes('@')) {
      errors.ownerEmail = 'Ingresa un correo electrónico válido';
    }
    if (!editForm.ownerPhone?.trim()) {
      errors.ownerPhone = 'El teléfono de contacto es requerido';
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      const updated = updateSuperAdminStore(editingStore.id, editForm);
      refreshStores();
      setEditingStore(null);
      if (selectedStore && selectedStore.id === updated.id) {
        setSelectedStore(updated);
      }
      showToast(`Información de "${updated.name}" actualizada con éxito`, 'success');
    } catch (err) {
      console.error('[CentralBo] Error al actualizar comercio:', err);
      showToast('Ocurrió un error al actualizar el comercio', 'error');
    }
  };

  // Manejo de Activación
  const handleActivate = (store: SuperAdminStoreRecord) => {
    try {
      const updated = activateStore(store.id);
      refreshStores();
      showToast(`Comercio "${updated.name}" activado exitosamente. Ahora está operativo.`, 'success');
    } catch (err) {
      console.error('[CentralBo] Error al activar comercio:', err);
      showToast('No se pudo activar el comercio', 'error');
    }
  };

  // Manejo de Desactivación
  const handleConfirmDeactivate = () => {
    if (!deactivatingStore) return;
    try {
      const updated = deactivateStore(deactivatingStore.id);
      refreshStores();
      setDeactivatingStore(null);
      showToast(
        `Comercio "${updated.name}" desactivado. Ha dejado de estar operativo para clientes.`,
        'warning'
      );
    } catch (err) {
      console.error('[CentralBo] Error al desactivar comercio:', err);
      showToast('No se pudo desactivar el comercio', 'error');
    }
  };

  // Manejo de Suspensión
  const handleConfirmSuspend = () => {
    if (!suspendingStore) return;
    try {
      const updated = suspendStore(suspendingStore.id);
      refreshStores();
      setSuspendingStore(null);
      showToast(
        `Comercio "${updated.name}" suspendido. El acceso está bloqueado para clientes.`,
        'error'
      );
    } catch (err) {
      console.error('[CentralBo] Error al suspender comercio:', err);
      showToast('No se pudo suspender el comercio', 'error');
    }
  };

  // Manejo de Eliminación Definitiva
  const handleOpenDeleteModal = (store: SuperAdminStoreRecord) => {
    setDeletingStore(store);
    setDeleteConfirmationText('');
  };

  const handleConfirmDelete = () => {
    if (!deletingStore) return;
    if (deleteConfirmationText.trim() !== deletingStore.name.trim()) return;

    try {
      const storeName = deletingStore.name;
      const storeId = deletingStore.id;
      const success = deleteSuperAdminStorePermanently(storeId);
      if (success) {
        if (selectedStore?.id === storeId) {
          setSelectedStore(null);
        }
        refreshStores();
        setDeletingStore(null);
        showToast(
          `El comercio "${storeName}" ha sido eliminado definitivamente de CentralBo.`,
          'error'
        );
      } else {
        showToast('No se pudo encontrar el comercio para eliminar', 'error');
      }
    } catch (err) {
      console.error('[CentralBo] Error al eliminar comercio:', err);
      showToast('Ocurrió un error al eliminar el comercio', 'error');
    }
  };

  return (
    <div id="superadmin-stores-module" className="space-y-6">
      {/* Notificación flotante (Toast) */}
      {toast && (
        <div
          id="superadmin-stores-toast"
          className="fixed top-5 right-5 z-50 max-w-md w-full animate-fade-in pointer-events-auto"
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
            <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => setToast(null)}
              aria-label="Cerrar notificación"
              className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Encabezado Principal y Acción 'Crear Comercio' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Gestión de Comercios
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              {filteredStores.length} de {stores.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ciclo de vida completo: creación, consulta, edición, activación, desactivación, suspensión y eliminación.
          </p>
        </div>

        {/* Botón Destacado: Crear comercio */}
        <button
          id="btn-crear-comercio"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear comercio</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        {/* Campo de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-buscar-comercio"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por comercio, slug, propietario o correo..."
            aria-label="Buscar comercios"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selectores de Filtro */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs">
          <select
            id="filtro-vertical-comercio"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrar por vertical"
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="todos">Todas las verticales</option>
            <option value="restaurante">Restaurantes</option>
            <option value="moda">Moda</option>
            <option value="servicios">Servicios</option>
            <option value="general">Comercio General</option>
          </select>

          <select
            id="filtro-estado-comercio"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filtrar por estado del comercio"
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="prueba">En Prueba</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </div>
      </div>

      {/* Listado de Comercios (Tabla Desktop + Cards Mobile) */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        {filteredStores.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No se encontraron comercios</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No hay comercios que coincidan con los filtros seleccionados o la búsqueda realizada.
            </p>
            {(searchTerm || filterType !== 'todos' || filterStatus !== 'todos') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('todos');
                  setFilterStatus('todos');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-semibold transition cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Comercio</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Registro</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Propietario / Contacto</th>
                  <th className="py-3 px-4 text-right">Acciones de Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStores.map((st) => {
                  const Icon = typeIcons[st.store_type] || ShoppingBag;
                  const statusBadge = statusBadges[st.status] || statusBadges.activo;
                  const StatusIcon = statusBadge.icon;
                  const subBadge = subStatusBadges[st.subscription.status] || subStatusBadges.activa;

                  return (
                    <tr
                      key={st.id}
                      id={`store-row-${st.id}`}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Nombre y Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block truncate max-w-[190px]">
                              {st.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono block">
                              /{st.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-slate-300 font-medium">
                          {typeLabels[st.store_type]}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusBadge.label}</span>
                        </span>
                      </td>

                      {/* Fecha de Registro */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-400 text-[11px]">
                        {new Date(st.created_at).toLocaleDateString('es-BO', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">Plan {st.subscription.planName}</span>
                          <span className={`text-[10px] font-semibold ${subBadge.text}`}>
                            {subBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Administrador / Dueño y Estado de Acceso */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {(() => {
                          return (
                            <div className="space-y-1">
                              <div>
                                <span className="text-slate-200 block font-semibold leading-tight">{st.owner.name}</span>
                                <span className="text-[11px] text-slate-400 block font-mono">{st.owner.email}</span>
                                <span className="text-[10px] text-slate-500 block">{st.owner.phone}</span>
                              </div>

                              {/* Estado del Acceso del Dueño */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Acceso activado (store_admin)</span>
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Acciones de Gestión Directas */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Ver Detalle */}
                          <button
                            id={`btn-detalle-${st.id}`}
                            onClick={() => setSelectedStore(st)}
                            title="Ver detalle del comercio"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-medium transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detalle</span>
                          </button>

                          {/* Editar */}
                          <button
                            id={`btn-editar-${st.id}`}
                            onClick={() => handleOpenEditModal(st)}
                            title="Editar información del comercio"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Activar (si no está activo) */}
                          {st.status !== 'activo' && (
                            <button
                              id={`btn-activar-${st.id}`}
                              onClick={() => handleActivate(st)}
                              title="Activar comercio (dejar operativo)"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Desactivar (si está activo o en prueba) */}
                          {(st.status === 'activo' || st.status === 'prueba') && (
                            <button
                              id={`btn-desactivar-${st.id}`}
                              onClick={() => setDeactivatingStore(st)}
                              title="Desactivar comercio"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition cursor-pointer"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspender (si no está suspendido) */}
                          {st.status !== 'suspendido' && (
                            <button
                              id={`btn-suspender-${st.id}`}
                              onClick={() => setSuspendingStore(st)}
                              title="Suspender comercio"
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Eliminar Definitivamente */}
                          <button
                            id={`btn-eliminar-${st.id}`}
                            onClick={() => handleOpenDeleteModal(st)}
                            title="Eliminar definitivamente"
                            className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 hover:text-rose-100 border border-rose-800/60 transition cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MODAL: CREAR COMERCIO                                                  */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div
          id="modal-crear-comercio"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Crear Nuevo Comercio
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registra los datos básicos del comercio, vertical, plan y propietario.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Sección 1: Información del Comercio */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  1. Información del Comercio
                </span>

                <div>
                  <label htmlFor="create-store-name" className="block font-semibold text-slate-300 mb-1">
                    Nombre del Comercio *
                  </label>
                  <input
                    id="create-store-name"
                    type="text"
                    value={newStoreForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewStoreForm({
                        ...newStoreForm,
                        name,
                        slug: name
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, ''),
                      });
                      if (createFormErrors.name) {
                        setCreateFormErrors({ ...createFormErrors, name: '' });
                      }
                    }}
                    placeholder="Ej. Restaurante Pizzería Napoli"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 placeholder-slate-500 focus:outline-hidden ${
                      createFormErrors.name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {createFormErrors.name && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{createFormErrors.name}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="create-store-slug" className="block font-semibold text-slate-300 mb-1">
                      Slug URL (/tienda/slug)
                    </label>
                    <input
                      id="create-store-slug"
                      type="text"
                      value={newStoreForm.slug}
                      onChange={(e) => setNewStoreForm({ ...newStoreForm, slug: e.target.value })}
                      placeholder="pizzeria-napoli"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 font-mono focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="create-store-type" className="block font-semibold text-slate-300 mb-1">
                      Tipo de Comercio (Vertical) *
                    </label>
                    <select
                      id="create-store-type"
                      value={newStoreForm.store_type}
                      onChange={(e) =>
                        setNewStoreForm({ ...newStoreForm, store_type: e.target.value as StoreType })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="general">Comercio General</option>
                      <option value="restaurante">Restaurante / Gastronomía</option>
                      <option value="moda">Moda & Tendencias</option>
                      <option value="servicios">Servicios Profesionales</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="create-store-plan" className="block font-semibold text-slate-300 mb-1">
                      Plan de Suscripción *
                    </label>
                    <select
                      id="create-store-plan"
                      value={newStoreForm.planId}
                      onChange={(e) =>
                        setNewStoreForm({ ...newStoreForm, planId: e.target.value as PlanId })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="basic">Plan Basic (Bs 49/mes)</option>
                      <option value="pro">Plan Pro (Bs 99/mes)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="create-store-status" className="block font-semibold text-slate-300 mb-1">
                      Estado Inicial *
                    </label>
                    <select
                      id="create-store-status"
                      value={newStoreForm.status}
                      onChange={(e) =>
                        setNewStoreForm({ ...newStoreForm, status: e.target.value as StoreStatus })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="activo">Activo (Operativo)</option>
                      <option value="prueba">En Prueba (Trial 14 días)</option>
                      <option value="inactivo">Inactivo (Pendiente)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección 2: Registro del Dueño del Comercio */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                    2. Registro del Dueño del Comercio (Administrador)
                  </span>
                  <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/50 w-fit">
                    Perfil: Administrador de Comercio
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El dueño quedará asociado exclusivamente a este comercio. Se generará su acceso con estado{' '}
                  <strong className="text-amber-300 font-semibold">Invitación pendiente</strong> y un enlace único de activación para enviárselo por WhatsApp. El SuperAdmin no establece contraseñas.
                </p>

                <div>
                  <label htmlFor="create-owner-name" className="block font-semibold text-slate-300 mb-1">
                    Nombre del Dueño *
                  </label>
                  <input
                    id="create-owner-name"
                    type="text"
                    value={newStoreForm.ownerName}
                    onChange={(e) => {
                      setNewStoreForm({ ...newStoreForm, ownerName: e.target.value });
                      if (createFormErrors.ownerName) {
                        setCreateFormErrors({ ...createFormErrors, ownerName: '' });
                      }
                    }}
                    placeholder="Ej. Roberto Arce"
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 placeholder-slate-500 focus:outline-hidden ${
                      createFormErrors.ownerName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {createFormErrors.ownerName && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{createFormErrors.ownerName}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="create-owner-email" className="block font-semibold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      id="create-owner-email"
                      type="email"
                      value={newStoreForm.ownerEmail}
                      onChange={(e) => {
                        setNewStoreForm({ ...newStoreForm, ownerEmail: e.target.value });
                        if (createFormErrors.ownerEmail) {
                          setCreateFormErrors({ ...createFormErrors, ownerEmail: '' });
                        }
                      }}
                      placeholder="admin@comercio.bo"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 placeholder-slate-500 focus:outline-hidden ${
                        createFormErrors.ownerEmail ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {createFormErrors.ownerEmail && (
                      <span className="text-rose-400 text-[11px] mt-1 block">{createFormErrors.ownerEmail}</span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="create-owner-phone" className="block font-semibold text-slate-300 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="create-owner-phone"
                      type="text"
                      value={newStoreForm.ownerPhone}
                      onChange={(e) => {
                        setNewStoreForm({ ...newStoreForm, ownerPhone: e.target.value });
                        if (createFormErrors.ownerPhone) {
                          setCreateFormErrors({ ...createFormErrors, ownerPhone: '' });
                        }
                      }}
                      placeholder="+591 70000000"
                      className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 placeholder-slate-500 focus:outline-hidden ${
                        createFormErrors.ownerPhone ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {createFormErrors.ownerPhone && (
                      <span className="text-rose-400 text-[11px] mt-1 block">{createFormErrors.ownerPhone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de acción del formulario */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="submit-crear-comercio"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  Crear comercio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: DETALLE DEL COMERCIO (CON ACCIONES INTEGRADAS)                   */}
      {/* ========================================================================= */}
      {selectedStore && (
        <div
          id="modal-detalle-comercio"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedStore(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del detalle */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedStore.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        statusBadges[selectedStore.status].bg
                      } ${statusBadges[selectedStore.status].text} ${
                        statusBadges[selectedStore.status].border
                      }`}
                    >
                      {statusBadges[selectedStore.status].label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Slug público: /tienda/{selectedStore.slug}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedStore(null)}
                aria-label="Cerrar modal de detalle"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Información del Comercio */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span>1. Información del Comercio</span>
                </h4>
                <button
                  onClick={() => {
                    handleOpenEditModal(selectedStore);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
                >
                  <Edit2 className="w-3 h-3 text-indigo-400" />
                  <span>Editar Datos</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Nombre</span>
                  <span className="font-semibold text-white truncate block">{selectedStore.name}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Tipo / Vertical</span>
                  <span className="font-semibold text-slate-200">{typeLabels[selectedStore.store_type]}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Estado Operativo</span>
                  <span className="font-bold text-emerald-400 capitalize">{selectedStore.status}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Fecha de Registro</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {new Date(selectedStore.created_at).toLocaleDateString('es-BO')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Plan Asignado</span>
                  <span className="font-semibold text-cyan-300">{selectedStore.subscription.planName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-500 block">Tenant ID</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate block">
                    {selectedStore.id}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Información del Administrador (Dueño) y Estado de Acceso */}
            {(() => {
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>2. Administrador del Comercio (Dueño)</span>
                    </h4>
                    <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-700/50">
                      Perfil: Administrador de Comercio (store_admin)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Nombre Completo</span>
                      <span className="font-semibold text-white">{selectedStore.owner.name}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Correo de Acceso</span>
                      <a
                        href={`mailto:${selectedStore.owner.email}`}
                        className="font-medium text-slate-300 font-mono text-[11px] hover:text-cyan-400 transition"
                      >
                        {selectedStore.owner.email}
                      </a>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Teléfono / WhatsApp</span>
                      <span className="font-medium text-emerald-400 font-mono text-[11px]">{selectedStore.owner.phone}</span>
                    </div>
                  </div>

                  {/* Estado del Acceso */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">Estado de Acceso:</span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          Acceso activado
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-300 font-mono">
                        Tenant ID: {selectedStore.id.slice(0, 8)}...
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      El dueño cuenta con acceso registrado exclusivo para su comercio (perfil: <strong className="text-slate-300">store_admin</strong>). Puede iniciar sesión directamente desde <strong>/login</strong> con su correo electrónico y su contraseña inicial asignada.
                    </p>
                  </div>

                  {/* Redes sociales */}
                  {selectedStore.owner.socials && (
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs flex flex-wrap items-center gap-4">
                      <span className="text-slate-400 text-[11px]">Redes sociales registradas:</span>
                      {selectedStore.owner.socials.instagram && (
                        <span className="text-indigo-400">Instagram: {selectedStore.owner.socials.instagram}</span>
                      )}
                      {selectedStore.owner.socials.facebook && (
                        <span className="text-cyan-400">Facebook: {selectedStore.owner.socials.facebook}</span>
                      )}
                      {selectedStore.owner.socials.whatsapp && (
                        <span className="text-emerald-400">WhatsApp: {selectedStore.owner.socials.whatsapp}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. Actividad Resumida del Comercio */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>3. Actividad Resumida del Comercio</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Visitas</span>
                  <span className="font-bold text-white text-sm">
                    {selectedStore.activity.visitas.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Pedidos</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    {selectedStore.activity.pedidos}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Productos</span>
                  <span className="font-bold text-indigo-400 text-sm">
                    {selectedStore.activity.productos}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Ventas</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono">
                    Bs {selectedStore.activity.ventas.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block">Última Actividad</span>
                  <span className="font-medium text-slate-300 text-[11px] block truncate">
                    {selectedStore.activity.ultimaActividad}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Suscripción y Pagos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>4. Información de Suscripción</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Plan</span>
                  <span className="font-semibold text-white">{selectedStore.subscription.planName}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Estado</span>
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">
                    {selectedStore.subscription.status}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Inicio</span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {selectedStore.subscription.startDate}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Renovación</span>
                  <span className="font-mono text-cyan-300 text-[11px]">
                    {selectedStore.subscription.renewalDate}
                  </span>
                </div>
              </div>

              {/* Historial de Pagos Registrados */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  Historial de Pagos Registrados:
                </span>
                <div className="space-y-1.5">
                  {selectedStore.subscription.paymentHistory.map((pay) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-white font-medium">{pay.period}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            Ref: {pay.reference}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold">
                          {pay.currency} {pay.amount}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{pay.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barra de Acciones de Ciclo de Vida dentro del Detalle */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Acciones de Ciclo de Vida:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* Abrir Tienda Pública (si está operativa) */}
                {selectedStore.slug && (
                  <button
                    onClick={() => {
                      setSelectedStore(null);
                      navigate(`/tienda/${selectedStore.slug}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir Tienda Pública</span>
                  </button>
                )}

                {/* Editar */}
                <button
                  onClick={() => handleOpenEditModal(selectedStore)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Editar</span>
                </button>

                {/* Activar */}
                {selectedStore.status !== 'activo' && (
                  <button
                    onClick={() => handleActivate(selectedStore)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activar comercio</span>
                  </button>
                )}

                {/* Desactivar */}
                {(selectedStore.status === 'activo' || selectedStore.status === 'prueba') && (
                  <button
                    onClick={() => setDeactivatingStore(selectedStore)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-medium transition cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Desactivar comercio</span>
                  </button>
                )}

                {/* Suspender */}
                {selectedStore.status !== 'suspendido' && (
                  <button
                    onClick={() => setSuspendingStore(selectedStore)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-medium transition cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Suspender comercio</span>
                  </button>
                )}

                {/* Eliminar Definitivamente */}
                <button
                  onClick={() => handleOpenDeleteModal(selectedStore)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-bold transition cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Eliminar definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: EDITAR INFORMACIÓN DEL COMERCIO                                 */}
      {/* ========================================================================= */}
      {editingStore && (
        <div
          id="modal-editar-comercio"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditingStore(null)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Editar Comercio: {editingStore.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifica los datos del comercio, plan y datos del propietario.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingStore(null)}
                aria-label="Cerrar modal de edición"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Datos del Comercio */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                  1. Información del Comercio
                </span>

                <div>
                  <label htmlFor="edit-store-name" className="block font-semibold text-slate-300 mb-1">
                    Nombre del Comercio *
                  </label>
                  <input
                    id="edit-store-name"
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 focus:outline-hidden ${
                      editFormErrors.name ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {editFormErrors.name && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{editFormErrors.name}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-store-type" className="block font-semibold text-slate-300 mb-1">
                      Vertical / Tipo de Comercio *
                    </label>
                    <select
                      id="edit-store-type"
                      value={editForm.store_type || 'general'}
                      onChange={(e) =>
                        setEditForm({ ...editForm, store_type: e.target.value as StoreType })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="general">Comercio General</option>
                      <option value="restaurante">Restaurante / Gastronomía</option>
                      <option value="moda">Moda & Tendencias</option>
                      <option value="servicios">Servicios Profesionales</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-store-plan" className="block font-semibold text-slate-300 mb-1">
                      Plan Asignado *
                    </label>
                    <select
                      id="edit-store-plan"
                      value={editForm.planId || 'basic'}
                      onChange={(e) =>
                        setEditForm({ ...editForm, planId: e.target.value as PlanId })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="basic">Plan Basic (Bs 49/mes)</option>
                      <option value="pro">Plan Pro (Bs 99/mes)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos del Propietario */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  2. Datos del Propietario
                </span>

                <div>
                  <label htmlFor="edit-owner-name" className="block font-semibold text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    id="edit-owner-name"
                    type="text"
                    value={editForm.ownerName || ''}
                    onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 focus:outline-hidden ${
                      editFormErrors.ownerName ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                  {editFormErrors.ownerName && (
                    <span className="text-rose-400 text-[11px] mt-1 block">{editFormErrors.ownerName}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-owner-email" className="block font-semibold text-slate-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      id="edit-owner-email"
                      type="email"
                      value={editForm.ownerEmail || ''}
                      onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 focus:outline-hidden ${
                        editFormErrors.ownerEmail ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {editFormErrors.ownerEmail && (
                      <span className="text-rose-400 text-[11px] mt-1 block">{editFormErrors.ownerEmail}</span>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edit-owner-phone" className="block font-semibold text-slate-300 mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      id="edit-owner-phone"
                      type="text"
                      value={editForm.ownerPhone || ''}
                      onChange={(e) => setEditForm({ ...editForm, ownerPhone: e.target.value })}
                      className={`w-full px-3 py-2 rounded-xl bg-slate-950/90 border text-slate-200 focus:outline-hidden ${
                        editFormErrors.ownerPhone ? 'border-rose-500' : 'border-slate-800 focus:border-indigo-500'
                      }`}
                    />
                    {editFormErrors.ownerPhone && (
                      <span className="text-rose-400 text-[11px] mt-1 block">{editFormErrors.ownerPhone}</span>
                    )}
                  </div>
                </div>

                {/* Redes Sociales */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Redes Sociales (opcional):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Instagram (ej. @roma_bo)"
                      value={editForm.socials?.instagram || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socials: { ...editForm.socials, instagram: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Facebook (ej. RomaGourmetBO)"
                      value={editForm.socials?.facebook || ''}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          socials: { ...editForm.socials, facebook: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-300 text-xs focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botones del formulario de edición */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE CONFIRMACIÓN: DESACTIVAR COMERCIO                             */}
      {/* ========================================================================= */}
      {deactivatingStore && (
        <div
          id="modal-confirm-desactivar"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setDeactivatingStore(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Pause className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">
                ¿Desactivar comercio "{deactivatingStore.name}"?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Al desactivarlo, el estado del comercio pasará a <strong>Inactivo</strong> y dejará de estar operativo para los clientes públicos.
                Podrás volver a activarlo en cualquier momento.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeactivatingStore(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-desactivar"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Confirmar Desactivación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL DE CONFIRMACIÓN: SUSPENDER COMERCIO                              */}
      {/* ========================================================================= */}
      {suspendingStore && (
        <div
          id="modal-confirm-suspender"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSuspendingStore(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <Ban className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-white">
                ¿Suspender comercio "{suspendingStore.name}"?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Al suspenderlo, el estado pasará a <strong>Suspendido</strong> y el comercio quedará completamente bloqueado para los clientes.
                Podrás levantar la suspensión y reactivarlo posteriormente desde este panel.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setSuspendingStore(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirmar-suspender"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                Confirmar Suspensión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL DE ADVERTENCIA: ELIMINAR DEFINITIVAMENTE (CONFIRMACIÓN EXPLÍCITA) */}
      {/* ========================================================================= */}
      {deletingStore && (
        <div
          id="modal-confirm-eliminar"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setDeletingStore(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-rose-600 p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícono de Advertencia Crítica */}
            <div className="w-14 h-14 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-7 h-7 animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[11px] font-extrabold uppercase tracking-wider">
                ¡Advertencia Crítica e Irreversible!
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Eliminar Definitivamente el Comercio
              </h3>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                Estás a punto de eliminar de manera permanente el comercio{' '}
                <strong className="text-white underline">{deletingStore.name}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-left text-xs text-slate-300 space-y-1.5">
                <p className="text-rose-300 font-semibold">• Esta acción NO se puede deshacer.</p>
                <p className="text-slate-400">• El comercio dejará de aparecer en CentralBo de forma definitiva.</p>
                <p className="text-slate-400">• Se eliminarán sus registros y configuraciones asociadas.</p>
                <p className="text-slate-400">• No se trata de una suspensión temporal.</p>
              </div>
            </div>

            {/* Confirmación explícita escribiendo el nombre exacto */}
            <div className="space-y-2">
              <label htmlFor="confirm-delete-input" className="block text-xs font-semibold text-slate-300 text-center">
                Para confirmar, escribe exactamente el nombre del comercio:{' '}
                <span className="text-rose-400 font-bold select-all">"{deletingStore.name}"</span>
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder={deletingStore.name}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-rose-500/50 text-white text-xs font-bold text-center focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Botones */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingStore(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar y Volver
              </button>
              <button
                id="btn-confirmar-eliminar-definitivo"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.trim() !== deletingStore.name.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  deleteConfirmationText.trim() === deletingStore.name.trim()
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 cursor-pointer active:scale-98'
                    : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar definitivamente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN: CREDENCIALES INICIALES DEL DUEÑO                    */}
      {/* ========================================================================= */}
      {createdCredentials && (
        <div
          id="modal-credenciales-iniciales"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setCreatedCredentials(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    Comercio Creado y Acceso Registrado
                  </h3>
                  <p className="text-xs text-slate-400">
                    Credenciales iniciales generadas para el dueño
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentials(null)}
                aria-label="Cerrar modal"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Datos del Comercio Creado y Dueño */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Comercio creado:</span>
                <span className="font-bold text-white text-sm">{createdCredentials.storeName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Slug del comercio:</span>
                <span className="font-mono text-indigo-300 font-semibold">/{createdCredentials.storeSlug}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2">
                <span className="text-slate-400 font-medium">Nombre del dueño:</span>
                <span className="font-bold text-cyan-300">{createdCredentials.ownerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">WhatsApp / Teléfono:</span>
                <span className="font-mono text-emerald-400">{createdCredentials.ownerPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Perfil asignado:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 font-semibold text-[10px]">
                  Administrador de Comercio (store_admin)
                </span>
              </div>
            </div>

            {/* Credenciales Iniciales */}
            <div className="space-y-3.5">
              {/* Correo de Acceso */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Correo de acceso:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdCredentials.ownerEmail}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs select-all focus:outline-hidden"
                  />
                  <button
                    id="btn-copiar-correo-credenciales"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createdCredentials.ownerEmail);
                        setCopiedEmailFeedback(true);
                        setTimeout(() => setCopiedEmailFeedback(false), 2000);
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
                  >
                    {copiedEmailFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Copiar correo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Contraseña Inicial Generada */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Contraseña inicial generada:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdCredentials.initialPassword}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs select-all focus:outline-hidden font-bold tracking-wider"
                  />
                  <button
                    id="btn-copiar-password-credenciales"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(createdCredentials.initialPassword);
                        setCopiedPasswordFeedback(true);
                        setTimeout(() => setCopiedPasswordFeedback(false), 2000);
                      } catch (e) {
                        console.warn(e);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
                  >
                    {copiedPasswordFeedback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Copiar contraseña</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón para Copiar Todas las Credenciales */}
              <button
                id="btn-copiar-todas-credenciales"
                onClick={async () => {
                  try {
                    const text = `Credenciales de Acceso a CentralBo\n\n` +
                      `Comercio: ${createdCredentials.storeName}\n` +
                      `Dueño: ${createdCredentials.ownerName}\n` +
                      `Correo de acceso: ${createdCredentials.ownerEmail}\n` +
                      `Contraseña inicial: ${createdCredentials.initialPassword}\n` +
                      `Ingreso: ${window.location.origin}/login\n\n` +
                      `Nota: Podrás ingresar directamente a administrar tu comercio.`;
                    await navigator.clipboard.writeText(text);
                    setCopiedAllFeedback(true);
                    setTimeout(() => setCopiedAllFeedback(false), 2000);
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedAllFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">¡Todas las credenciales copiadas al portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-indigo-400" />
                    <span>Copiar todas las credenciales</span>
                  </>
                )}
              </button>
            </div>

            {/* Aviso Obligatorio de Entrega Manual */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-amber-300 block">
                  Aviso para el SuperAdmin — Entrega manual requerida:
                </span>
                <p className="text-[11px] text-amber-200/90">
                  Estas credenciales deben ser entregadas manualmente al dueño (por WhatsApp, mensaje personal o en persona). El dueño podrá ingresar directamente desde <strong>/login</strong> con este correo y contraseña para administrar exclusivamente su propio comercio.
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
              <button
                id="btn-cerrar-modal-credenciales"
                onClick={() => setCreatedCredentials(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Entendido, Ver Lista de Comercios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
