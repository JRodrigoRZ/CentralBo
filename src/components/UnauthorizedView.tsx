import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock, RefreshCw } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';

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
}) => {
  const { navigate } = useRouter();
  const { user } = useAuth();

  return (
    <div className="w-full max-w-lg mx-auto my-12 space-y-6">
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-lg sm:text-xl font-bold text-white mb-2">
          Acceso No Autorizado
        </h1>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Área Restringida</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {reason || 'No cuentas con los permisos necesarios para acceder a esta sección de la plataforma.'}
        </p>

        {/* Acciones de navegación */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user?.tenantId && (
            <button
              onClick={() => navigate(`/admin/${user.tenantId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mi Comercio</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>Cambiar Cuenta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
