import React from 'react';
import {
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { BASELINE_STORES } from '../lib/multiTenantService';

const STORE_TYPE_LABELS: Record<string, string> = {
  restaurante: 'Gastronomía & Restaurante',
  moda: 'Moda & Boutique',
  servicios: 'Servicios Profesionales',
  general: 'Comercio General',
};

export const PortalHome: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* Banner Principal Comercial */}
      <section
        id="centralbo-hero-banner"
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm transition-colors"
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Comercio Digital en Bolivia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            CentralBo — Plataforma Integral de Comercio
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            Crea tu tienda online, gestiona tu catálogo de productos y servicios, atiende a tus clientes y administra pedidos de forma ágil y moderna.
          </p>

          {/* Tarjetas rápidas de sesión */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-slate-500 dark:text-slate-400">Sesión:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>
                </div>

                {profile === 'superadmin' && (
                  <button
                    onClick={() => navigate('/superadmin')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Panel SuperAdmin</span>
                  </button>
                )}

                {profile === 'store_admin' && user.tenantId && (
                  <button
                    onClick={() => navigate(`/admin/${user.tenantId}`)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <StoreIcon className="w-4 h-4" />
                    <span>Panel de Mi Tienda</span>
                  </button>
                )}

                <button
                  onClick={() => signOut()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Catálogo de Tiendas Activas */}
      <section
        id="public-stores-catalog-section"
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Comercios en CentralBo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Explora las tiendas disponibles en la plataforma y descubre sus productos y servicios:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BASELINE_STORES.map((store) => (
            <div
              key={store.id}
              className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-base font-bold text-slate-900 dark:text-white">{store.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 capitalize">
                    {store.status === 'activo' ? 'Activo' : store.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {STORE_TYPE_LABELS[store.store_type] || store.store_type}
                </p>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  centralbo.com/{store.slug}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Tienda</span>
                </button>
                {user?.profile === 'superadmin' && (
                  <button
                    onClick={() => navigate(`/admin/${store.id}`)}
                    className="px-3.5 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                    title="Administrar como SuperAdmin"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
