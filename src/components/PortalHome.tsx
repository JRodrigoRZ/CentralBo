import React from 'react';
import {
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  Utensils,
  Sparkles,
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

const STORE_TYPE_ICONS: Record<string, React.ElementType> = {
  restaurante: Utensils,
  moda: ShoppingBag,
  servicios: Sparkles,
  general: StoreIcon,
};

export const PortalHome: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { navigate } = useRouter();

  return (
    <div className="w-full space-y-12 sm:space-y-16">
      {/* 2. HERO — Integrado directamente en el canvas, sin macro-card */}
      <section
        id="centralbo-hero-banner"
        className="pt-6 pb-4 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 text-center max-w-3xl mx-auto px-4"
      >
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium mb-6 transition-colors">
          <StoreIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Comercio Digital en Bolivia</span>
        </div>

        {/* Título de alto impacto tipográfico */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.16] mb-5">
          CentralBo — Plataforma Integral de Comercio
        </h1>

        {/* Descripción con balance de lectura */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          Crea tu tienda online, gestiona tu catálogo de productos y servicios, atiende a tus clientes y administra pedidos de forma ágil y moderna.
        </p>

        {/* CTA / Acciones de sesión centradas */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <>
              <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2 shadow-xs">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-500 dark:text-slate-400">Sesión:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.email}</span>
              </div>

              {profile === 'superadmin' && (
                <button
                  onClick={() => navigate('/superadmin')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel SuperAdmin</span>
                </button>
              )}

              {profile === 'store_admin' && user.tenantId && (
                <button
                  onClick={() => navigate(`/admin/${user.tenantId}`)}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <StoreIcon className="w-4 h-4" />
                  <span>Panel de Mi Tienda</span>
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow transition cursor-pointer flex items-center gap-2 active:scale-[0.98]"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* Divisor sutil entre Hero y Sección de Comercios */}
      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800/80" />

      {/* 3. SECCIÓN DE COMERCIOS — Directamente en el canvas sin macro-card exterior */}
      <section
        id="public-stores-catalog-section"
        className="w-full space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Comercios en CentralBo
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explora las tiendas disponibles en la plataforma y descubre sus productos y servicios:
            </p>
          </div>
        </div>

        {/* Grid equilibrada: 1 col (móvil), 2 cols (intermedio), 4 cols (escritorio amplio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {BASELINE_STORES.map((store) => {
            const Icon = STORE_TYPE_ICONS[store.store_type] || StoreIcon;

            return (
              <div
                key={store.id}
                className="group rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  {/* Icono de categoría comercial refinado */}
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-4 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Categoría comercial */}
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide block mb-1">
                    {STORE_TYPE_LABELS[store.store_type] || store.store_type}
                  </span>

                  {/* Nombre del comercio */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                    {store.name}
                  </h3>
                </div>

                {/* Acciones de la tarjeta */}
                <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/tienda/${store.slug}`)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer group/btn"
                  >
                    <span>Ver Tienda</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover/btn:text-slate-600 dark:group-hover/btn:text-slate-200 transition-colors" />
                  </button>

                  {user?.profile === 'superadmin' && (
                    <button
                      onClick={() => navigate(`/admin/${store.id}`)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                      title="Administrar como SuperAdmin"
                    >
                      Admin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
