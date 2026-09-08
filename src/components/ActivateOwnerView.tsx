import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Lock,
  Sparkles,
  Phone,
  Mail,
  Building2,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  getInvitationByToken,
  activateStoreOwnerAccount,
} from '../lib/storeOwnerActivationService';
import { StoreOwnerInvitation } from '../types';

interface ActivateOwnerViewProps {
  token: string;
}

export const ActivateOwnerView: React.FC<ActivateOwnerViewProps> = ({ token }) => {
  const { navigate } = useRouter();
  const { signInWithPassword } = useAuth();

  const [invitation, setInvitation] = useState<StoreOwnerInvitation | null | undefined>(
    undefined
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  // Buscar invitación al montar o cambiar el token
  useEffect(() => {
    if (!token) {
      setInvitation(null);
      return;
    }
    const found = getInvitationByToken(token);
    setInvitation(found || null);
  }, [token]);

  // Validaciones de formulario
  const isLengthValid = password.length >= 6;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = isLengthValid && doPasswordsMatch && !submitting;

  const handleActivateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (!isLengthValid) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas ingresadas no coinciden. Por favor verifícalas.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const result = activateStoreOwnerAccount(token, password);

    if (!result.success) {
      setErrorMessage(result.error || 'Ocurrió un error al activar la cuenta.');
      setSubmitting(false);
      return;
    }

    // Activación exitosa en el servicio
    setActivatedSuccess(true);
    setSubmitting(false);
  };

  // Botón para acceder directamente después de la activación
  const handleProceedToLogin = async () => {
    if (!invitation) {
      navigate('/login');
      return;
    }

    // Iniciar sesión automáticamente con la contraseña recién establecida
    setSubmitting(true);
    const loginRes = await signInWithPassword(invitation.ownerEmail, password);
    setSubmitting(false);

    if (loginRes.success) {
      navigate(`/admin/${invitation.storeId}`);
    } else {
      navigate('/login');
    }
  };

  // 1. Estado de carga inicial
  if (invitation === undefined) {
    return (
      <div className="w-full max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-300">Verificando enlace de activación...</p>
      </div>
    );
  }

  // 2. Token no encontrado / Invitación inválida
  if (invitation === null) {
    return (
      <div className="w-full max-w-lg mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-5 shadow-2xl animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Enlace de Activación Inválido o Expirado</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            No pudimos encontrar una invitación asociada a este enlace en CentralBo.
            Asegúrate de haber copiado el enlace completo o solicita al SuperAdmin que te reenvíe la
            invitación por WhatsApp.
          </p>
        </div>
        <div className="pt-3 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            <span>Volver a Inicio de CentralBo</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Caso: Invitación ya utilizada / Acceso activado previamente
  if (invitation.status === 'Acceso activado' && !activatedSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-5 shadow-2xl animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <span>Acceso activado</span>
          </div>
          <h2 className="text-xl font-bold text-white">Esta invitación ya fue utilizada</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            El acceso de administrador para el comercio <strong>{invitation.storeName}</strong> ya
            fue activado previamente por <strong>{invitation.ownerName}</strong>.
          </p>
          <p className="text-[11px] text-slate-400">
            Ya puedes iniciar sesión con tu correo{' '}
            <span className="font-mono text-cyan-300 font-semibold">{invitation.ownerEmail}</span> y
            la contraseña que creaste.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <span>Ir a Iniciar Sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 4. Caso: Confirmación de Activación Exitosa recién completada
  if (activatedSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto my-10 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/50 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Acceso activado
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ¡Cuenta Activada Exitosamente!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hola <strong className="text-white">{invitation.ownerName}</strong>, tu acceso como{' '}
            <strong className="text-cyan-400">Administrador de Comercio</strong> para{' '}
            <strong className="text-white">{invitation.storeName}</strong> ya se encuentra
            completamente operativo.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Comercio vinculado:</span>
            <span className="font-semibold text-white">{invitation.storeName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Correo de acceso:</span>
            <span className="font-mono text-cyan-300 font-semibold">{invitation.ownerEmail}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Seguridad:</span>
            <span className="text-emerald-400 font-medium">Contraseña personal protegida</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleProceedToLogin}
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Ingresando al panel...
              </span>
            ) : (
              <>
                <span>Acceder a Mi Panel de Tienda</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 5. Pantalla Principal de Activación para el Dueño
  return (
    <div className="w-full max-w-xl mx-auto my-6 sm:my-10 space-y-6">
      {/* Tarjeta de Bienvenida y Datos del Comercio */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
                  CentralBo
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Invitación pendiente
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white">
                Activación de Cuenta de Dueño
              </h1>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hidden sm:block">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Mensaje de Bienvenida */}
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>¡Bienvenido a CentralBo, {invitation.ownerName}!</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Tu comercio <strong className="text-white">{invitation.storeName}</strong> ha sido dado
            de alta en la plataforma. Para completar la activación y asegurar tu acceso exclusivo,
            por favor define tu propia contraseña.
          </p>
          <p className="text-[11px] text-slate-400 italic">
            * El SuperAdmin de CentralBo no conocerá ni tendrá acceso a tu contraseña definitiva.
          </p>
        </div>

        {/* Resumen de Datos de la Invitación */}
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Comercio:</span>
            </span>
            <span className="font-bold text-white text-right">{invitation.storeName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Administrador:</span>
            </span>
            <span className="font-semibold text-slate-200">{invitation.ownerName}</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Correo de acceso:</span>
            </span>
            <span className="font-mono text-cyan-300 font-semibold">{invitation.ownerEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp:</span>
            </span>
            <span className="font-mono text-slate-300">{invitation.ownerPhone}</span>
          </div>
        </div>

        {/* Mensaje de Error si ocurre */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario de Creación de Contraseña */}
        <form onSubmit={handleActivateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Crear Contraseña Personal *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1.5 text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Repite la contraseña exactamente"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1.5 text-slate-500 hover:text-slate-300 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validadores visuales en tiempo real */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isLengthValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isLengthValid ? '✓' : '•'}
              </span>
              <span className={isLengthValid ? 'text-emerald-300' : 'text-slate-400'}>
                Longitud mínima de 6 caracteres
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  doPasswordsMatch
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {doPasswordsMatch ? '✓' : '•'}
              </span>
              <span className={doPasswordsMatch ? 'text-emerald-300' : 'text-slate-400'}>
                Las contraseñas coinciden
              </span>
            </div>
          </div>

          {/* Botón de Acción Principal */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Activando cuenta...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Activar cuenta</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Nota de Aislamiento y Privacidad */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
        <p className="text-slate-300 font-medium">Aislamiento Multi-Tenant Garantizado</p>
        <p className="text-[11px]">
          Tu cuenta tiene acceso exclusivo a la administración de{' '}
          <strong className="text-slate-200">{invitation.storeName}</strong>. No tendrás acceso a
          datos de otros comercios ni al panel SuperAdmin.
        </p>
      </div>
    </div>
  );
};
