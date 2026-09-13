import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store as StoreIcon,
  Search,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Utensils,
  Shirt,
  Briefcase,
  ShoppingBag,
} from 'lucide-react';
import {
  getSuperAdminStores,
  fetchSuperAdminStores,
} from '../../lib/superadminService';
import { SuperAdminStoreRecord, Store, StoreType, StoreStatus } from '../../types';
import { StoreAdminArea } from '../StoreAdminArea';
import { useRouter } from '../../context/RouterContext';

export const SuperAdminGestionTiendas: React.FC = () => {
  const [stores, setStores] = useState<SuperAdminStoreRecord[]>(getSuperAdminStores());
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { navigate } = useRouter();

  useEffect(() => {
    let mounted = true;
    fetchSuperAdminStores().then((loaded) => {
      if (mounted) {
        setStores(loaded);
        setLoading(false);
      }
    });

    const handleStoresChanged = () => {
      setStores(getSuperAdminStores());
    };

    window.addEventListener('centralbo:superadmin_stores_changed', handleStoresChanged);
    return () => {
      mounted = false;
      window.removeEventListener('centralbo:superadmin_stores_changed', handleStoresChanged);
    };
  }, []);

  const selectedStore = stores.find((s) => s.id === selectedStoreId);

  // Si se ha seleccionado una tienda, se monta la Administración de Tienda existente
  if (selectedStoreId && selectedStore) {
    const adaptedStore: Store = {
      id: selectedStore.id,
      name: selectedStore.name,
      slug: selectedStore.slug,
      store_type: selectedStore.store_type,
      status: selectedStore.status,
      logo_url: selectedStore.logo_url,
      created_at: selectedStore.created_at,
      updated_at: selectedStore.updated_at,
    };

    return (
      <div className="w-full space-y-4">
        <StoreAdminArea
          tenantId={selectedStore.id}
          initialStore={adaptedStore}
          onBack={() => setSelectedStoreId(null)}
        />
      </div>
    );
  }

  // Filtrado de tiendas por búsqueda
  const filteredStores = stores.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.store_type.toLowerCase().includes(q) ||
      (s.owner?.email || '').toLowerCase().includes(q)
    );
  });

  const getVerticalIcon = (type: StoreType) => {
    switch (type) {
      case 'restaurante':
        return <Utensils className="w-3.5 h-3.5" />;
      case 'moda':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'servicios':
        return <Briefcase className="w-3.5 h-3.5" />;
      default:
        return <ShoppingBag className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status: StoreStatus) => {
    switch (status) {
      case 'activo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Activo</span>
          </span>
        );
      case 'prueba':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
            <Clock className="w-3 h-3" />
            <span>Prueba</span>
          </span>
        );
      case 'suspendido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
            <Ban className="w-3 h-3" />
            <span>Suspendido</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <AlertCircle className="w-3 h-3" />
            <span>Inactivo</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado de la 8.ª Sección: Gestión de Tiendas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Gestión de Tiendas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
              {stores.length} {stores.length === 1 ? 'tienda' : 'tiendas'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Selecciona cualquier tienda existente para ingresar a su panel de administración y gestionar su catálogo, perfil, pedidos y operaciones.
          </p>
        </div>

        {/* Buscador de Comercios */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tienda por nombre, slug o rubro..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Lista de Tiendas Existentes */}
      {loading && stores.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Cargando tiendas registradas...</p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
          <StoreIcon className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No se encontraron tiendas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No hay ninguna tienda que coincida con el criterio de búsqueda.'
              : 'Aún no hay tiendas creadas en la plataforma.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition flex flex-col justify-between gap-4 shadow-xs"
            >
              {/* Información de la Tienda */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                      {store.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {store.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        /{store.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(store.status)}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase ${
                        store.subscription.planId === 'pro'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Plan {store.subscription.planId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium capitalize bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {getVerticalIcon(store.store_type)}
                    <span>{store.store_type}</span>
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-[200px]">
                    {store.owner?.name || 'Dueño de comercio'}
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedStoreId(store.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <StoreIcon className="w-3.5 h-3.5" />
                  <span>Administrar Tienda</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {store.slug && (
                  <button
                    type="button"
                    onClick={() => navigate(`/tienda/${store.slug}`)}
                    title="Ver vitrina pública de esta tienda"
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
