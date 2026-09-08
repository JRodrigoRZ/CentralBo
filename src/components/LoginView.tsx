import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  UserCheck,
  Store as StoreIcon,
  ShoppingBag,
  ArrowRight,
  LogOut,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';

interface LoginViewProps {
  redirectPath?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ redirectPath }) => {
  const { user, profile, isLoading, error, signInWithPassword, switchDemoProfile, signOut, clearError } =
    useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Por favor ingresa correo y contraseña');
      return;
    }

    setSubmitting(true);
    setLocalError(null);
    clearError();

    const res = await signInWithPassword(email, password);
    setSubmitting(false);

    if (res.success) {
      try {
        const raw = localStorage.getItem('centralbo_auth_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.profile === 'store_admin' && parsed.tenantId) {
            navigate(`/admin/${parsed.tenantId}`);
            return;
          }
          if (parsed.profile === 'superadmin') {
            navigate(redirectPath && redirectPath !== '/login' ? redirectPath : '/superadmin');
            return;
          }
        }
      } catch (e) {}

      if (redirectPath && redirectPath !== '/login') {
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } else if (res.error) {
      setLocalError(res.error);
    }
  };

  const handleSelectDemo = (type: 'superadmin' | 'adminRoma' | 'adminMilano' | 'public') => {
    switchDemoProfile(type);
    if (type === 'superadmin') {
      navigate(redirectPath || '/superadmin');
    } else if (type === 'adminRoma') {
      navigate(redirectPath || '/admin/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
    } else if (type === 'adminMilano') {
      navigate(redirectPath || '/admin/b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 my-4">
      {/* Si ya hay sesión iniciada, mostrar el resumen de identidad */}
      {user && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{user.fullName || user.email}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 uppercase">
                  {profile === 'superadmin'
                    ? 'SuperAdmin Global'
                    : profile === 'store_admin'
                    ? `Admin: ${user.store?.name || 'Comercio'}`
                    : 'Cliente Público'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile === 'superadmin' && (
              <button
                onClick={() => navigate('/superadmin')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Ir a Área SuperAdmin
              </button>
            )}
            {profile === 'store_admin' && user.tenantId && (
              <button
                onClick={() => navigate(`/admin/${user.tenantId}`)}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition cursor-pointer"
              >
                Ir a Área de Mi Comercio
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid: Formulario de Supabase + Selector rápido de perfiles del Módulo 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formulario Supabase Auth */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Acceso con Supabase Auth
                </h2>
                <p className="text-xs text-slate-400">Credenciales del proyecto CentralBo</p>
              </div>
            </div>

            {(localError || error) && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. admin@roma.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Validando sesión...
                  </span>
                ) : (
                  <>
                    <span>Iniciar Sesión en CentralBo</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Seguridad:</span> Autenticación con sesión persistente en Supabase y token JWT validado por RLS.
          </div>
        </div>

        {/* Columna Derecha: Selector de los 3 Perfiles Oficiales */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Selector de Perfiles Módulo 2
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pruebas de los 3 perfiles oficiales de CentralBo
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                3 Perfiles
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Selecciona cualquier perfil para alternar y verificar instantáneamente la resolución de identidad, aislamiento de comercio y enrutamiento:
            </p>

            {/* Lista de perfiles */}
            <div className="space-y-2.5">
              {/* 1. SuperAdmin Global */}
              <button
                type="button"
                onClick={() => handleSelectDemo('superadmin')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  profile === 'superadmin'
                    ? 'bg-indigo-950/50 border-indigo-500/60 shadow-md shadow-indigo-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">1. SuperAdmin Global</span>
                      {profile === 'superadmin' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      superadmin@centralbo.com
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded">
                  Acceso Total
                </span>
              </button>

              {/* 2. Administrador Comercio A */}
              <button
                type="button"
                onClick={() => handleSelectDemo('adminRoma')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  profile === 'store_admin' && user?.email === 'admin@roma.com'
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <StoreIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        2. Admin Comercio A (Roma)
                      </span>
                      {profile === 'store_admin' && user?.email === 'admin@roma.com' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      admin@roma.com (Restaurante Roma)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Tenant A
                </span>
              </button>

              {/* 2b. Administrador Comercio B (Para probar que NO puede entrar a Comercio A) */}
              <button
                type="button"
                onClick={() => handleSelectDemo('adminMilano')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  profile === 'store_admin' && user?.email === 'admin@milano.com'
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                    <StoreIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        2. Admin Comercio B (Milano)
                      </span>
                      {profile === 'store_admin' && user?.email === 'admin@milano.com' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      admin@milano.com (Boutique Milano)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-pink-300 bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 rounded">
                  Tenant B
                </span>
              </button>

              {/* 3. Cliente / Comprador Público */}
              <button
                type="button"
                onClick={() => handleSelectDemo('public')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  profile === 'public_client' && !user
                    ? 'bg-emerald-950/50 border-emerald-500/60 shadow-md shadow-emerald-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        3. Cliente / Comprador Público
                      </span>
                      {profile === 'public_client' && !user && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Sin sesión (Visita tiendas por slug libremente)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Público Libre
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Exactamente los 3 perfiles definidos en el Módulo 2. Sin roles adicionales.
          </div>
        </div>
      </div>
    </div>
  );
};
