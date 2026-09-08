import React, { useState } from 'react';
import {
  ShieldCheck,
  Store as StoreIcon,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { BASELINE_STORES } from '../lib/multiTenantService';
import { SystemReadinessCard } from './SystemReadinessCard';
import { PhaseTracker } from './PhaseTracker';

export const PortalHome: React.FC = () => {
  const { user, profile, switchDemoProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const [testLog, setTestLog] = useState<string | null>(null);

  const handleCrossTenantTest = () => {
    // Si el usuario es admin de Roma, intenta navegar a Milano
    const targetTenant = BASELINE_STORES[1].id; // Milano
    setTestLog(
      `Ejecutando test de frontera: Intentando forzar acceso administrativo a ${BASELINE_STORES[1].name} (ID: ${targetTenant.slice(0, 8)})...`
    );
    navigate(`/admin/${targetTenant}`);
  };

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* Banner Principal del Módulo 2 */}
      <section
        id="module2-hero-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 border border-indigo-900/50 p-6 sm:p-8 lg:p-10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Módulo 2 — Autenticación y Router Multi-Tenant</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            CentralBo <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">Router Multi-Tenant</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Implementación del acceso de usuarios y enrutamiento multi-tenant. Identifica con precisión al usuario, su comercio y su perfil, asegurando el aislamiento estricto y el acceso público sin registro a las tiendas por slug.
          </p>

          {/* Tarjetas rápidas de estado de identidad actual */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400">Sesión Actual:</span>
              <span className="font-semibold text-white">
                {user ? user.email : 'Cliente Público (Anónimo)'}
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex items-center gap-2">
              <span className="text-slate-400">Perfil:</span>
              <span className="font-semibold text-indigo-400">
                {profile === 'superadmin'
                  ? 'SuperAdmin Global'
                  : profile === 'store_admin'
                  ? `Admin (${user?.store?.name || 'Comercio'})`
                  : 'Cliente Público'}
              </span>
            </div>

            {profile === 'superadmin' && (
              <button
                onClick={() => navigate('/superadmin')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Abrir Panel SuperAdmin Global</span>
              </button>
            )}

            {user ? (
              <button
                onClick={() => signOut()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => {
                    switchDemoProfile('superadmin');
                    navigate('/superadmin');
                  }}
                  className="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Acceso SuperAdmin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tarjeta de Verificación Interactiva de los 6 Puntos Obligatorios */}
      <section
        id="module2-verification-checklist"
        className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 backdrop-blur-sm space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Verificación de Requisitos del Módulo 2
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                6 / 6 Operativos
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pruebas en tiempo real de los criterios de aceptación especificados en el Módulo 2.
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
          >
            <span>Alternar Perfiles en Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Criterio 1 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Criterio 1
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Iniciar y Cerrar Sesión
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supabase Auth integrado con sesión persistente y cierre limpio.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition cursor-pointer"
            >
              {user ? 'Gestionar Sesión Actual' : 'Probar Iniciar Sesión'}
            </button>
          </div>

          {/* Criterio 2 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Criterio 2
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Identificación de Perfiles
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reconoce exactamente: SuperAdmin, Administrador de Comercio y Cliente Público.
              </p>
            </div>
            <div className="text-[11px] text-indigo-400 font-mono bg-indigo-950/30 p-2 rounded-lg border border-indigo-900/30">
              Activo: {profile}
            </div>
          </div>

          {/* Criterio 3 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Criterio 3
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Asociación Única a Comercio
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El admin de tienda queda estrictamente anclado a su propio <code>tenant_id</code>.
              </p>
            </div>
            <button
              onClick={() => {
                switchDemoProfile('adminRoma');
                navigate('/admin/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
              }}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 transition cursor-pointer"
            >
              Verificar Admin Roma (Tenant A)
            </button>
          </div>

          {/* Criterio 4 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Criterio 4 (Seguridad)
                </span>
                <Lock className="w-4 h-4 text-rose-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Bloqueo de Comercio Ajeno
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Un admin NO puede acceder a la ruta de administración de otro comercio.
              </p>
            </div>
            <button
              onClick={() => {
                switchDemoProfile('adminRoma');
                // Intentar entrar a Milano
                navigate('/admin/b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');
              }}
              className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[11px] text-rose-300 font-semibold transition cursor-pointer"
            >
              Probar Violación de Ruta Ajena
            </button>
          </div>

          {/* Criterio 5 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Criterio 5
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Tienda Pública por Slug
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Acceso público directo por slug sin exigir registro ni autenticación.
              </p>
            </div>
            <button
              onClick={() => navigate('/tienda/restaurante-roma')}
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition cursor-pointer"
            >
              Abrir /tienda/restaurante-roma
            </button>
          </div>

          {/* Criterio 6 */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Criterio 6
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold text-white mb-1">
                Responsive Multi-Dispositivo
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fluidez y adaptabilidad en smartphones, tablets y pantallas de escritorio.
              </p>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> PWA Móvil / Tablet / PC
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Tiendas Públicas Resueltas por Slug */}
      <section
        id="public-stores-catalog-section"
        className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 backdrop-blur-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Tiendas Públicas Resueltas por Slug
            </h2>
            <p className="text-xs text-slate-400">
              Haz clic en cualquier comercio para probar el acceso público sin iniciar sesión:
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Ruta: /tienda/:slug
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BASELINE_STORES.map((store) => (
            <div
              key={store.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-white">{store.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {store.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                  <span>Vertical: <strong>{store.store_type}</strong></span>
                </div>
                <div className="text-[11px] font-mono text-indigo-300 bg-indigo-950/30 px-2 py-1 rounded border border-indigo-900/30">
                  /tienda/{store.slug}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Visitar Tienda</span>
                </button>
                {user?.profile === 'superadmin' && (
                  <button
                    onClick={() => navigate(`/admin/${store.id}`)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                    title="Supervisar como SuperAdmin"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estado del Sistema y Fases */}
      <SystemReadinessCard />
      <PhaseTracker />
    </div>
  );
};
