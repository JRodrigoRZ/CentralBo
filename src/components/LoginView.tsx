import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Key,
  KeyRound,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  LogOut,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  CheckCircle2,
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

type LoginMode = 'login' | 'forgot_password' | 'reset_password' | 'reset_success';

export const LoginView: React.FC<LoginViewProps> = ({ redirectPath }) => {
  const {
    user,
    profile,
    isLoading,
    error,
    isPasswordRecovery,
    setIsPasswordRecovery,
    signInWithPassword,
    updatePassword,
    resetPasswordForEmail,
    signOut,
    clearError,
  } = useAuth();
  const { navigate } = useRouter();

  // Modo actual de la vista
  const [mode, setMode] = useState<LoginMode>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        return 'reset_password';
      }
    }
    return 'login';
  });

  // Campos de inicio de sesión
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Campos de recuperación de contraseña (solicitud por correo)
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [sendingRecovery, setSendingRecovery] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Campos de definición de nueva contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Enlace expirado o inválido
  const [linkExpiredError, setLinkExpiredError] = useState<string | null>(null);

  // Sincronizar modo con el evento PASSWORD_RECOVERY de Supabase Auth
  useEffect(() => {
    if (isPasswordRecovery) {
      setMode('reset_password');
    }
  }, [isPasswordRecovery]);

  // Detectar enlaces expirados o parámetros en la URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        setMode('reset_password');
      }
      if (
        hash.includes('error_code=otp_expired') ||
        hash.includes('otp_expired') ||
        (hash.includes('error=access_denied') && hash.includes('type=recovery'))
      ) {
        setLinkExpiredError(
          'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'
        );
      }
    }
  }, []);

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

  // Manejo del formulario normal de inicio de sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        lockDuration = MAX_LOCK_DURATION_MS;
      } else if (newFailures >= MAX_CONSECUTIVE_FAILURES) {
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

  // Manejo de la solicitud de correo de recuperación
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(false);

    const cleanEmail = recoveryEmail.trim();
    if (!cleanEmail) {
      setForgotError('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setForgotError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setSendingRecovery(true);
    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.success) {
        setForgotSuccess(true);
      } else {
        setForgotError(res.error || 'No se pudo enviar el correo de recuperación.');
      }
    } catch {
      setForgotError('Ocurrió un error inesperado al conectar con el servicio.');
    } finally {
      setSendingRecovery(false);
    }
  };

  // Manejo del formulario de definición de nueva contraseña
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword) {
      setResetError('Por favor ingresa la nueva contraseña.');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!confirmPassword) {
      setResetError('Por favor confirma la nueva contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setNewPassword('');
        setConfirmPassword('');
        setResetError(null);
        clearRateLimit();
        setLockSecondsRemaining(0);

        // Limpiar URL hash para evitar re-activar modo recuperación en recargas
        if (typeof window !== 'undefined') {
          try {
            window.history.replaceState(null, '', window.location.pathname + '#/login');
          } catch {}
        }

        // Cerrar sesión temporal de recuperación para forzar inicio limpio con nueva clave
        try {
          await signOut();
        } catch {}

        setIsPasswordRecovery(false);
        setMode('reset_success');
      } else {
        const errorText = res.error || 'Ocurrió un error al actualizar la contraseña.';
        setResetError(
          errorText.includes('same_password')
            ? 'La nueva contraseña debe ser diferente a la anterior.'
            : errorText
        );
      }
    } catch {
      setResetError('Ocurrió un error inesperado al conectar con el servicio.');
    } finally {
      setIsSubmittingReset(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 my-6">
      {/* Resumen de sesión si el usuario ya está autenticado y NO está en recuperación de clave */}
      {user && mode === 'login' && !isPasswordRecovery && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.fullName || user.email}
                </span>
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

      {/* VISTA 1: Definir Nueva Contraseña (Restablecimiento activo) */}
      {mode === 'reset_password' && (
        <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nueva Contraseña
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.email
                  ? `Establece una nueva contraseña para ${user.email}`
                  : 'Define una nueva contraseña segura para tu cuenta'}
              </p>
            </div>
          </div>

          {resetError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{resetError}</span>
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="input-new-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Nueva Contraseña *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  disabled={isSubmittingReset}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  aria-label={showNewPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="input-confirm-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  disabled={isSubmittingReset}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingReset}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmittingReset ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Actualizando contraseña...
                </span>
              ) : (
                <>
                  <span>Actualizar Contraseña</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setIsPasswordRecovery(false);
              }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancelar y volver al inicio de sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* VISTA 2: Éxito tras actualizar contraseña */}
      {mode === 'reset_success' && (
        <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            ¡Contraseña actualizada con éxito!
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Tu nueva contraseña ya está registrada en el sistema de autenticación de MAXINEGO. Ahora
            puedes iniciar sesión normalmente con tus nuevas credenciales.
          </p>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
              setPassword('');
            }}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VISTA 3: Solicitar Enlace de Recuperación por Correo */}
      {mode === 'forgot_password' && (
        <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recuperar Contraseña
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingresa tu correo para recibir las instrucciones de acceso
              </p>
            </div>
          </div>

          {forgotSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Enlace de recuperación enviado</span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed text-[11px]">
                  Si existe una cuenta asociada a <strong className="underline">{recoveryEmail}</strong>,
                  recibirás un correo electrónico de Supabase con el enlace para definir tu nueva contraseña.
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[10px] pt-1">
                  Nota: Revisa también tu carpeta de correo no deseado o spam.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotSuccess(false);
                  setForgotError(null);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{forgotError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico del Comercio
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="ejemplo@maxinego.app"
                    disabled={sendingRecovery}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingRecovery}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {sendingRecovery ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando enlace...
                  </span>
                ) : (
                  <>
                    <span>Enviar Enlace de Recuperación</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotError(null);
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Recuperación segura verificada por correo</span>
          </div>
        </div>
      )}

      {/* VISTA 4: Formulario de Inicio de Sesión Normal */}
      {mode === 'login' && (
        <div className="max-w-md mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ingresa tus credenciales de acceso a MAXINEGO
              </p>
            </div>
          </div>

          {/* Alerta de enlace expirado */}
          {linkExpiredError && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{linkExpiredError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_password');
                  setLinkExpiredError(null);
                }}
                className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 underline cursor-pointer"
              >
                Solicitar un nuevo enlace de recuperación
              </button>
            </div>
          )}

          {/* Bloqueo temporal por intentos fallidos */}
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

          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                  placeholder="ejemplo@maxinego.app"
                  disabled={submitting || lockSecondsRemaining > 0}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  id="btn-olvidaste-contrasena"
                  onClick={() => {
                    setRecoveryEmail(email);
                    setForgotError(null);
                    setForgotSuccess(false);
                    setMode('forgot_password');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
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
      )}
    </div>
  );
};
