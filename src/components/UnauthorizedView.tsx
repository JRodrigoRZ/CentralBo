import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock, RefreshCw } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { BASELINE_STORES } from '../lib/multiTenantService';

interface UnauthorizedViewProps {
  reason: string;
  attemptedPath: string;
  requiredRole?: string;
  userTenantId?: string | null;
  targetTenantId?: string | null;
}

export const UnauthorizedView: React.FC<UnauthorizedViewProps> = ({
  reason,
  attemptedPath,
  requiredRole,
  userTenantId,
  targetTenantId,
}) => {
  const { navigate } = useRouter();
  const { user, profile, switchDemoProfile } = useAuth();

  const userStore = BASELINE_STORES.find((s) => s.id === userTenantId);
  const targetStore = BASELINE_STORES.find((s) => s.id === targetTenantId);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
      <div className="rounded-2xl bg-rose-950/30 border border-rose-800/50 p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Acceso Denegado por Política de Seguridad
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Frontera Multi-Tenant Protegida</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-lg mx-auto">
          {reason}
        </p>

        {/* Diagnóstico técnico de la violación de aislamiento */}
        {(userTenantId || targetTenantId) && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2 mb-6">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Diagnóstico de Aislamiento Multi-Tenant:
            </div>
            {userTenantId && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-slate-900 gap-1">
                <span className="text-slate-400">Su Comercio Autorizado:</span>
                <span className="font-semibold text-emerald-400 font-mono">
                  {userStore?.name || userTenantId}
                </span>
              </div>
            )}
            {targetTenantId && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-slate-900 gap-1">
                <span className="text-slate-400">Comercio Solicitado en Ruta:</span>
                <span className="font-semibold text-rose-400 font-mono">
                  {targetStore?.name || targetTenantId}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 gap-1">
              <span className="text-slate-400">Ruta Intentada:</span>
              <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded">
                #{attemptedPath}
              </span>
            </div>
          </div>
        )}

        {/* Acciones de recuperación */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {user?.tenantId && (
            <button
              onClick={() => navigate(`/admin/${user.tenantId}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mi Comercio ({user.store?.name || 'Mi Tienda'})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio de CentralBo</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Cambiar de Cuenta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
