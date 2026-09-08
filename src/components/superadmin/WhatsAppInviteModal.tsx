import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Phone,
  User,
  Store as StoreIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { StoreOwnerInvitation } from '../../types';
import {
  generateActivationUrl,
  generateWhatsAppMessage,
  generateWhatsAppUrl,
} from '../../lib/storeOwnerActivationService';

interface WhatsAppInviteModalProps {
  invitation: StoreOwnerInvitation;
  onClose: () => void;
}

export const WhatsAppInviteModal: React.FC<WhatsAppInviteModalProps> = ({
  invitation,
  onClose,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activationUrl = generateActivationUrl(invitation.token);
  const messageText = generateWhatsAppMessage(invitation);
  const whatsappUrl = generateWhatsAppUrl(invitation);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (e) {
      console.warn('Error al copiar:', e);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.warn('Error al copiar link:', e);
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="modal-whatsapp-invite"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Invitación para WhatsApp
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    invitation.status === 'Acceso activado'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {invitation.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mensaje preparado para el dueño de {invitation.storeName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha del Destinatario */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Dueño</span>
            <div className="flex items-center gap-1.5 font-semibold text-white mt-0.5">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{invitation.ownerName}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-medium">WhatsApp</span>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{invitation.ownerPhone}</span>
            </div>
          </div>
        </div>

        {/* Enlace Único de Activación */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300 block">
            Enlace Único de Activación:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={activationUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono select-all focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copiar enlace</span>
                </>
              )}
            </button>
            <a
              href={activationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer"
              title="Abrir enlace de activación en nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir</span>
            </a>
          </div>
        </div>

        {/* Vista Previa del Mensaje Redactado */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 block">
              Mensaje Preparado para WhatsApp:
            </label>
            <button
              onClick={handleCopyMessage}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              {copiedMessage ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Mensaje copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-slate-200 font-sans whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
            {messageText}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer order-2 sm:order-1"
          >
            Cerrar
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition cursor-pointer order-1 sm:order-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enviar por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
