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
  Package,
  MessageCircle,
  ShoppingBag,
  Store,
  Smartphone,
  Shield,
  Check,
  Sparkles,
  UtensilsCrossed,
  Coffee,
  QrCode,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { MaxiNegoLogo } from './common/MaxiNegoLogo';

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
  const [showPassword, setShowPassword] = useState(false);
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

        if (typeof window !== 'undefined') {
          try {
            window.history.replaceState(null, '', window.location.pathname + '#/login');
          } catch {}
        }

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
    <div className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-8 sm:py-12 lg:py-16 px-4 overflow-hidden">
      {/* Estilos CSS para micro-animaciones suaves de flotación */}
      <style>{`
        @keyframes mnFloatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes mnFloatMedium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(-1.5deg); }
        }
        @keyframes mnFloatFast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes mnFloatReverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(14px) rotate(1.2deg); }
        }
        .mn-anim-float-slow {
          animation: mnFloatSlow 6.5s ease-in-out infinite;
        }
        .mn-anim-float-medium {
          animation: mnFloatMedium 5.2s ease-in-out infinite;
        }
        .mn-anim-float-fast {
          animation: mnFloatFast 4.4s ease-in-out infinite;
        }
        .mn-anim-float-reverse {
          animation: mnFloatReverse 5.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .mn-anim-float-slow,
          .mn-anim-float-medium,
          .mn-anim-float-fast,
          .mn-anim-float-reverse {
            animation: none !important;
          }
        }
      `}</style>

      {/* AMBIENTE ESCÉNICO: Tapiz de Íconos Comerciales + Luces Radiales */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Fondo base con degradado suave según el tema */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 dark:from-[#060a15] dark:via-[#080d1e] dark:to-[#070b18]" />

        {/* Resplandores atmosféricos radiales con colores de MAXINEGO */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] sm:w-[780px] h-[520px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/18 to-violet-600/15 rounded-full blur-3xl opacity-85 dark:opacity-60" />
        <div className="absolute -bottom-12 -left-12 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-12 -right-12 w-96 h-96 bg-violet-600/12 dark:bg-violet-600/15 rounded-full blur-3xl opacity-65" />

        {/* TAPÍZ DE ÍCONOS COMERCIALES (Gastronomía, Comercio Local y Retail)
            Inspirado en patrón doodle continuo, adaptado con finas líneas vectoriales,
            máscara radial centrada para preservar el protagonismo y legibilidad del formulario */}
        <div
          className="absolute inset-0 text-slate-800/[0.08] dark:text-blue-300/[0.09]"
          style={{
            maskImage:
              'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0.18) 20%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,1) 100%)',
          }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="mn-commerce-doodle-pattern"
                width="200"
                height="200"
                patternUnits="userSpaceOnUse"
              >
                <g
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  {/* 1. HAMBURGUESA (x=16, y=14) */}
                  <g transform="translate(14, 12)">
                    <path d="M 4 10 C 4 4 22 4 22 10 Z" />
                    <line x1="2" y1="13" x2="24" y2="13" />
                    <path d="M 3 16 Q 6 18 9 16 Q 12 18 15 16 Q 18 18 21 16 Q 23 18 24 16" />
                    <line x1="4" y1="19" x2="22" y2="19" />
                    <circle cx="9" cy="7.5" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="14" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
                    <circle cx="17" cy="8" r="0.6" fill="currentColor" stroke="none" />
                  </g>

                  {/* 2. TAZA DE CAFÉ HUMEANTE (x=68, y=12) */}
                  <g transform="translate(68, 12)">
                    <path d="M 5 8 L 7 18 C 7 20 17 20 17 18 L 19 8 Z" />
                    <path d="M 18 10 C 22 10 22 15 18 15" />
                    <line x1="3" y1="20" x2="21" y2="20" />
                    <path d="M 9 5 C 10 3.5 9 2.5 10 1" />
                    <path d="M 13 5 C 14 3.5 13 2.5 14 1" />
                  </g>

                  {/* 3. TIENDA LOCAL / FACHADA (x=118, y=10) */}
                  <g transform="translate(118, 10)">
                    <path d="M 12 2 L 2 7 L 22 7 Z" />
                    <path d="M 2 7 L 4 13 Q 7 15 10 13 Q 14 15 17 13 Q 20 15 22 13 L 22 7" />
                    <line x1="4" y1="13" x2="4" y2="21" />
                    <line x1="20" y1="13" x2="20" y2="21" />
                    <rect x="9" y="14" width="6" height="7" />
                  </g>

                  {/* 4. PORCIÓN DE PIZZA (x=164, y=12) */}
                  <g transform="translate(164, 12) rotate(8 12 12)">
                    <path d="M 4 5 Q 14 3 20 8" />
                    <path d="M 4 5 L 12 22 L 20 8" />
                    <circle cx="10" cy="10" r="1.4" />
                    <circle cx="14" cy="14" r="1.4" />
                    <circle cx="11" cy="16" r="1" />
                  </g>

                  {/* 5. PAPAS FRITAS (x=16, y=62) */}
                  <g transform="translate(16, 62)">
                    <path d="M 4 10 L 6 22 L 18 22 L 20 10 Z" />
                    <path d="M 4 10 Q 12 13 20 10" />
                    <line x1="7" y1="10" x2="7" y2="4" />
                    <line x1="10" y1="10" x2="10" y2="2" />
                    <line x1="14" y1="10" x2="14" y2="3" />
                    <line x1="17" y1="10" x2="17" y2="5" />
                  </g>

                  {/* 6. MEDIALUNA / CROISSANT (x=66, y=62) */}
                  <g transform="translate(66, 62)">
                    <path d="M 3 17 C 5 9 11 6 15 6 C 19 6 25 9 27 17 C 23 15 19 16 15 17 C 11 16 7 15 3 17 Z" />
                    <path d="M 10 7 C 11 11 11 15 10 16" />
                    <line x1="15" y1="6" x2="15" y2="17" />
                    <path d="M 20 7 C 19 11 19 15 20 16" />
                  </g>

                  {/* 7. BOLSA DE COMPRAS / RETAIL (x=118, y=60) */}
                  <g transform="translate(118, 60)">
                    <rect x="4" y="8" width="16" height="14" rx="2" />
                    <path d="M 8 8 V 5 C 8 3.5 16 3.5 16 5 V 8" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </g>

                  {/* 8. CONO DE HELADO (x=166, y=60) */}
                  <g transform="translate(166, 60)">
                    <path d="M 6 12 L 12 24 L 18 12 Z" />
                    <line x1="8" y1="15" x2="16" y2="15" />
                    <line x1="9" y1="18" x2="15" y2="18" />
                    <path d="M 5 12 C 4 8 8 5 12 5 C 16 5 20 8 19 12 Z" />
                    <circle cx="12" cy="3.5" r="1.5" />
                  </g>

                  {/* 9. CUBIERTOS: CUCHILLO Y TENEDOR (x=16, y=112) */}
                  <g transform="translate(16, 112)">
                    {/* Tenedor */}
                    <line x1="5" y1="3" x2="5" y2="8" />
                    <line x1="8" y1="3" x2="8" y2="8" />
                    <line x1="11" y1="3" x2="11" y2="8" />
                    <path d="M 5 8 Q 8 11 11 8" />
                    <line x1="8" y1="10" x2="8" y2="21" />
                    {/* Cuchillo */}
                    <path d="M 18 3 C 21 5 21 11 18 13 L 18 21" />
                  </g>

                  {/* 10. BEBIDA CON PAJITA / REFRESCO (x=66, y=110) */}
                  <g transform="translate(66, 110)">
                    <path d="M 5 9 L 7 23 L 17 23 L 19 9 Z" />
                    <line x1="4" y1="9" x2="20" y2="9" />
                    <path d="M 12 9 L 14 2 L 17 2" />
                    <path d="M 6 14 Q 12 16 18 14" />
                  </g>

                  {/* 11. CHAMPIÑÓN / VEGETAL (x=118, y=112) */}
                  <g transform="translate(118, 112)">
                    <path d="M 3 13 C 3 6 21 6 21 13 Z" />
                    <circle cx="8" cy="9" r="1.2" />
                    <circle cx="15" cy="8.5" r="1" />
                    <path d="M 9 13 V 19 C 9 20.5 15 20.5 15 19 V 13" />
                  </g>

                  {/* 12. ETIQUETA DE DESCUENTO / PRECIO (x=166, y=112) */}
                  <g transform="translate(166, 112)">
                    <path d="M 3 12 L 11 4 L 21 4 L 21 14 L 13 22 Z" />
                    <circle cx="16.5" cy="8.5" r="1.5" />
                    <line x1="9" y1="14" x2="14" y2="9" />
                  </g>

                  {/* 13. CUPCAKE CON CEREZA (x=16, y=160) */}
                  <g transform="translate(16, 160)">
                    <path d="M 5 13 L 7 22 L 17 22 L 19 13 Z" />
                    <line x1="9" y1="13" x2="10" y2="22" />
                    <line x1="13" y1="13" x2="13" y2="22" />
                    <line x1="17" y1="13" x2="16" y2="22" />
                    <path d="M 4 13 C 4 9 8 7 12 7 C 16 7 20 9 20 13 Z" />
                    <circle cx="12" cy="4.5" r="1.5" />
                  </g>

                  {/* 14. MANZANA / FRUTA FRESCA (x=66, y=160) */}
                  <g transform="translate(66, 160)">
                    <path d="M 12 7 C 8 4 4 7 4 12 C 4 18 9 20 12 20 C 15 20 20 18 20 12 C 20 7 16 4 12 7 Z" />
                    <path d="M 12 7 Q 13 3 15 2" />
                    <path d="M 13 4 Q 16 4 17 3" />
                  </g>

                  {/* 15. CAJA DE ENVÍO / PAQUETE (x=118, y=160) */}
                  <g transform="translate(118, 160)">
                    <path d="M 4 7 L 12 3 L 20 7 L 12 11 Z" />
                    <path d="M 4 7 V 17 L 12 21 V 11" />
                    <path d="M 20 7 V 17 L 12 21" />
                  </g>

                  {/* 16. GORRO DE CHEF (x=166, y=160) */}
                  <g transform="translate(166, 160)">
                    <line x1="6" y1="18" x2="18" y2="18" />
                    <line x1="6" y1="21" x2="18" y2="21" />
                    <path d="M 6 18 C 3 15 4 10 8 11 C 9 7 15 7 16 11 C 20 10 21 15 18 18 Z" />
                  </g>
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mn-commerce-doodle-pattern)" />
          </svg>
        </div>
      </div>

      {/* ELEMENTOS DECORATIVOS FLOTANTES (Comercio local y Beneficios reales)
          Diseñados para envolver la escena en desktop/tablet con movimiento suave,
          manteniéndose discretos y sin obstruir en pantallas móviles */}
      <div className="hidden xl:block absolute inset-0 pointer-events-none max-w-7xl mx-auto -z-5">
        {/* 1. ARRIBA A LA IZQUIERDA: Chip Beneficio WhatsApp */}
        <div className="absolute top-16 left-6 mn-anim-float-slow">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-emerald-500/5 hover:border-emerald-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>Pedidos por WhatsApp</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Directo a tu número oficial</p>
            </div>
          </div>
        </div>

        {/* 2. MEDIA IZQUIERDA: Ramo Gastronomía (Comercio real) */}
        <div className="absolute top-[48%] left-2 -translate-y-1/2 mn-anim-float-medium">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-amber-500/5 hover:border-amber-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Gastronomía Local
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Menús, combos y delivery</p>
            </div>
          </div>
        </div>

        {/* 3. ABAJO A LA IZQUIERDA: Chip Cero Comisiones & Cobros QR */}
        <div className="absolute bottom-16 left-8 mn-anim-float-fast">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-blue-500/5 hover:border-blue-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                <span>0% Comisiones</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">100% tuyo</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Cobros por QR o efectivo</p>
            </div>
          </div>
        </div>

        {/* 4. ARRIBA A LA DERECHA: Chip Tienda Digital Propia */}
        <div className="absolute top-16 right-6 mn-anim-float-reverse">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-blue-500/5 hover:border-blue-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Tienda Digital Propia
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tu marca, tu catálogo 24/7</p>
            </div>
          </div>
        </div>

        {/* 5. MEDIA DERECHA: Ramo Moda & Retail (Comercio real) */}
        <div className="absolute top-[48%] right-2 -translate-y-1/2 mn-anim-float-slow">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-violet-500/5 hover:border-violet-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Moda, Calzado & Retail
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Variantes, tallas y stock real</p>
            </div>
          </div>
        </div>

        {/* 6. ABAJO A LA DERECHA: Chip Acceso Seguro y Encriptado */}
        <div className="absolute bottom-16 right-8 mn-anim-float-medium">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-indigo-500/5 hover:border-indigo-400/50 transition">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                Acceso Seguro SSL
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Panel privado para tu negocio</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR CENTRAL: FORMULARIO PROTAGONISTA */}
      <div className="w-full max-w-lg mx-auto relative z-10 space-y-6">
        
        {/* RESUMEN DE SESIÓN SI YA ESTÁ AUTENTICADO */}
        {user && mode === 'login' && !isPasswordRecovery && (
          <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60">
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

            <div className="flex items-center gap-2.5">
              {profile === 'superadmin' && (
                <button
                  onClick={() => navigate('/superadmin')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Panel SuperAdmin
                </button>
              )}
              {profile === 'store_admin' && user.tenantId && (
                <button
                  onClick={() => navigate(`/admin/${user.tenantId}`)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
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

        {/* TARJETA PROTAGONISTA DEL FORMULARIO CON RESPLANDOR PERIMETRAL */}
        <div className="relative group">
          {/* Resplandor perimetral de acento tecnológico */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-violet-600/30 rounded-3xl blur-xl opacity-60 dark:opacity-80 transition duration-1000 -z-10" />

          {/* TARJETA INTERIOR */}
          <div className="relative rounded-3xl bg-white/95 dark:bg-[#0b1222]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-9 shadow-2xl shadow-blue-900/10 dark:shadow-black/60 transition-all">
            
            {/* VISTA 1: Definir Nueva Contraseña */}
            {mode === 'reset_password' && (
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0 shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Nueva Contraseña
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {user?.email
                        ? `Establece una nueva contraseña para ${user.email}`
                        : 'Define una nueva contraseña segura para tu cuenta'}
                    </p>
                  </div>
                </div>

                {resetError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
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
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60"
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
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60"
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
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
              <div className="text-center py-2">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  ¡Contraseña actualizada con éxito!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed max-w-sm mx-auto">
                  Tu nueva contraseña ya está registrada en el sistema de autenticación de MAXINEGO. Ya puedes ingresar directamente a tu panel.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError(null);
                    setPassword('');
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Iniciar Sesión Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* VISTA 3: Solicitar Enlace de Recuperación por Correo */}
            {mode === 'forgot_password' && (
              <div>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 shrink-0 shadow-xs">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Recuperar Contraseña
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Ingresa el correo de tu comercio para recibir instrucciones
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
                        recibirás un correo con el enlace seguro para definir tu nueva contraseña.
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
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotSubmit} className="space-y-4">
                    {forgotError && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
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
                          placeholder="tu-negocio@maxinego.app"
                          disabled={sendingRecovery}
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={sendingRecovery}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

            {/* VISTA 4: Formulario de Inicio de Sesión Normal (PROTAGONISTA) */}
            {mode === 'login' && (
              <div>
                {/* Cabecera del formulario con Logo y Badge de Plataforma */}
                <div className="text-center mb-7">
                  <div className="inline-flex items-center justify-center mb-3">
                    <MaxiNegoLogo size={52} />
                  </div>

                  {/* Badge de estado del portal */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Portal Oficial de Comercios</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Acceso para Comercios
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Administra tus productos, atiende tus pedidos y actualiza tu catálogo en vivo
                  </p>
                </div>

                {/* Alerta de enlace expirado */}
                {linkExpiredError && (
                  <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-2">
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
                  <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-xs">
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
                  <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span>{localError || error}</span>
                  </div>
                ) : null}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Campo de Correo Electrónico */}
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
                        placeholder="tu-comercio@maxinego.app"
                        disabled={submitting || lockSecondsRemaining > 0}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Campo de Contraseña */}
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
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={submitting || lockSecondsRemaining > 0}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* BOTÓN PRINCIPAL CON RESPLANDOR Y PRESENCIA VISUAL */}
                  <button
                    type="submit"
                    disabled={submitting || isLoading || lockSecondsRemaining > 0}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
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
                        <span>Ingresar a Mi Panel</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Pie de seguridad en la tarjeta */}
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Acceso seguro cifrado SSL · Datos y ventas protegidos</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
