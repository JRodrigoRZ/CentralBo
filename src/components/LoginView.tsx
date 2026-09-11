import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  LogOut,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';

interface LoginViewProps {
  redirectPath?: string;
}

// SEC-14A-01: Configuración de protección contra abuso en autenticación
const AUTH_RATE_LIMIT_KEY = 'cb_auth_ratelimit';
const MAX_CONSECUTIVE_FAILURES = 5;
const BASE_LOCK_DURATION_MS = 30000; // 30 segundos
const MAX_LOCK_DURATION_MS = 60000; // 60 segundos

interface AuthRateLimitRecord {
  failures: number;
  lockUntil: number;
}

function getStoredRateLimit(): AuthRateLimitRecord {
  try {
    const raw = localStorage.getItem(AUTH_RATE_LIMIT_KEY);
    if (!raw) return { failures: 0, lockUntil: 0 };
    const parsed = JSON.parse(raw);
    return {
      failures: typeof parsed.failures === 'number' ? parsed.failures : 0,
      lockUntil: typeof parsed.lockUntil === 'number' ? parsed.lockUntil : 0,
    };
  } catch {
    return { failures: 0, lockUntil: 0 };
  }
}

function saveRateLimit(record: AuthRateLimitRecord): void {
  try {
    localStorage.setItem(AUTH_RATE_LIMIT_KEY, JSON.stringify(record));
  } catch {}
}

function clearRateLimit(): void {
  try {
    localStorage.removeItem(AUTH_RATE_LIMIT_KEY);
  } catch {}
}

export const LoginView: React.FC<LoginViewProps> = ({ redirectPath }) => {
  const { user, profile, isLoading, error, signInWithPassword, signOut, clearError } =
    useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Inicializar contador de bloqueo persistente contra recarga (SEC-14A-01)
  const [lockSecondsRemaining, setLockSecondsRemaining] = useState<number>(() => {
    const stored = getStoredRateLimit();
    if (stored.lockUntil > Date.now()) {
      return Math.ceil((stored.lockUntil - Date.now()) / 1000);
    }
    return 0;
  });

  // Temporizador activo para el cooldown
  useEffect(() => {
    if (lockSecondsRemaining <= 0) return;

    const timer = setInterval(() => {
      const stored = getStoredRateLimit();
      const remaining = Math.ceil((stored.lockUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockSecondsRemaining(0);
        setLocalError(null);
        clearInterval(timer);
      } else {
        setLockSecondsRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockSecondsRemaining]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comprobación dura de bloqueo temporal activo
    const stored = getStoredRateLimit();
    if (stored.lockUntil > Date.now()) {
      const remaining = Math.ceil((stored.lockUntil - Date.now()) / 1000);
      setLockSecondsRemaining(remaining);
      setLocalError(
        `Acceso temporalmente bloqueado por demasiados intentos fallidos. Por favor espera ${remaining} segundos.`
      );
      return;
    }

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
      // Reinicio del contador de fallos tras autenticación exitosa
      clearRateLimit();
      setLockSecondsRemaining(0);

      if (res.user) {
        if (res.user.profile === 'store_admin' && res.user.tenantId) {
          navigate(`/admin/${res.user.tenantId}`);
          return;
        }
        if (res.user.profile === 'superadmin') {
          navigate(redirectPath && redirectPath !== '/login' ? redirectPath : '/superadmin');
          return;
        }
      }

      if (redirectPath && redirectPath !== '/login') {
        navigate(redirectPath);
      } else {
        navigate('/');
      }
    } else {
      // Gestión de fallo: comprobación de HTTP 429 / Rate limit de proveedor o acumulación local
      const errorMsg = res.error || 'Credenciales no válidas';
      const isRateLimited =
        errorMsg.includes('429') ||
        errorMsg.toLowerCase().includes('too many requests') ||
        errorMsg.toLowerCase().includes('rate limit') ||
        errorMsg.toLowerCase().includes('exceeded');

      const current = getStoredRateLimit();
      const newFailures = isRateLimited
        ? Math.max(current.failures + 1, MAX_CONSECUTIVE_FAILURES)
        : current.failures + 1;

      let lockDuration = 0;
      if (isRateLimited) {
        // Bloqueo de 60 segundos si el proveedor o red reporta 429
        lockDuration = MAX_LOCK_DURATION_MS;
      } else if (newFailures >= MAX_CONSECUTIVE_FAILURES) {
        // Bloqueo progresivo: 5 fallos = 30s; 6 fallos = 45s; 7+ fallos = 60s
        const extraSteps = newFailures - MAX_CONSECUTIVE_FAILURES;
        lockDuration = Math.min(BASE_LOCK_DURATION_MS + extraSteps * 15000, MAX_LOCK_DURATION_MS);
      }

      if (lockDuration > 0) {
        const lockUntil = Date.now() + lockDuration;
        saveRateLimit({ failures: newFailures, lockUntil });
        const remainingSecs = Math.ceil(lockDuration / 1000);
        setLockSecondsRemaining(remainingSecs);
        setLocalError(
          `Demasiados intentos fallidos consecutivos. Por seguridad, el acceso está temporalmente bloqueado durante ${remainingSecs} segundos.`
        );
      } else {
        saveRateLimit({ failures: newFailures, lockUntil: 0 });
        const attemptsLeft = MAX_CONSECUTIVE_FAILURES - newFailures;
        const warning =
          attemptsLeft <= 2
            ? ` (Te quedan ${attemptsLeft} intento${attemptsLeft === 1 ? '' : 's'} antes del bloqueo temporal)`
            : '';
        setLocalError(`${errorMsg}${warning}`);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 my-6">
      {/* Si ya hay sesión iniciada, mostrar el resumen de identidad */}
      {user && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{user.fullName || user.email}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/40 uppercase">
                  {profile === 'superadmin'
                    ? 'SuperAdmin'
                    : profile === 'store_admin'
                    ? `Admin: ${user.store?.name || 'Comercio'}`
                    : 'Cliente'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile === 'superadmin' && (
              <button
                onClick={() => navigate('/superadmin')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Panel SuperAdmin
              </button>
            )}
            {profile === 'store_admin' && user.tenantId && (
              <button
                onClick={() => navigate(`/admin/${user.tenantId}`)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Panel de Mi Tienda
              </button>
            )}
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Formulario de Acceso Profesional */}
      <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ingresa tus credenciales de acceso a CentralBo</p>
          </div>
        </div>

        {lockSecondsRemaining > 0 ? (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 animate-pulse" />
            <div>
              <p className="font-semibold mb-0.5">Acceso temporalmente restringido</p>
              <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
                Demasiados intentos fallidos consecutivos. Por seguridad, debes esperar{' '}
                <span className="font-bold underline">{lockSecondsRemaining} segundos</span> antes de volver a intentar.
              </p>
            </div>
          </div>
        ) : (localError || error) ? (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{localError || error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@centralbo.com"
                disabled={submitting || lockSecondsRemaining > 0}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting || lockSecondsRemaining > 0}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || isLoading || lockSecondsRemaining > 0}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {lockSecondsRemaining > 0 ? (
              <span className="inline-flex items-center gap-2 text-amber-200">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Bloqueado temporalmente ({lockSecondsRemaining}s)</span>
              </span>
            ) : submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              <>
                <span>Acceder a la Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Acceso seguro y protegido</span>
        </div>
      </div>
    </div>
  );
};
