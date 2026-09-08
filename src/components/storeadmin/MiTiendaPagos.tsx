import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  MessageCircle,
  Save,
  CheckCircle2,
  Lock,
  Building2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Store, StorePaymentSettings } from '../../types';
import {
  getStorePaymentSettings,
  saveStorePaymentSettings,
  getStoreProfile,
} from '../../lib/storeAdminService';

interface MiTiendaPagosProps {
  store: Store;
}

export const MiTiendaPagos: React.FC<MiTiendaPagosProps> = ({ store }) => {
  const [settings, setSettings] = useState<StorePaymentSettings>(() =>
    getStorePaymentSettings(store.id)
  );
  const profile = getStoreProfile(store.id);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStorePaymentSettings(store.id, settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>Métodos de Pago Aceptados</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configura los métodos de pago que acepta tu comercio. Activa o desactiva individualmente cada opción.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Guardar Configuración</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>Configuración de métodos de pago guardada exitosamente para {store.name}.</span>
        </div>
      )}

      {/* CANAL OBLIGATORIO: WHATSAPP (No modificable ni deshabilitable) */}
      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">WhatsApp — Canal Obligatorio</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Siempre Activo</span>
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Canal permanente de coordinación y confirmación directa de pedidos y reservas
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-900/80 px-3 py-2 rounded-xl border border-emerald-500/20">
            <span className="text-slate-400 text-[11px] block">Número de atención:</span>
            <span className="font-mono font-bold text-white">
              {profile.whatsapp || profile.phone || 'Configura tu número en Mi Tienda > Contacto'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-500/20 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            En CentralBo, <strong>WhatsApp es obligatorio</strong> y no se trata como un método de pago opcional.
            No puede ser deshabilitado, ocultado ni desactivado desde la configuración.
            Al finalizar un pedido, el cliente siempre dispondrá del botón para enviar el detalle completo por WhatsApp a este comercio.
          </span>
        </div>
      </div>

      {/* MÉTODOS DE PAGO CONFIGURABLES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Métodos Configurables por el Comercio
          </h3>
          <span className="text-[11px] text-slate-400">
            Activa o desactiva según la operativa de tu negocio
          </span>
        </div>

        {/* 1. QR SIMPLE */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition ${
          settings.qrSimple
            ? 'bg-slate-900/90 border-indigo-500/50'
            : 'bg-slate-950/60 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Cobro con QR Simple</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    settings.qrSimple
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {settings.qrSimple ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permite a tus clientes pagar escaneando un código QR desde cualquier aplicación bancaria boliviana.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.qrSimple}
                onChange={(e) => setSettings({ ...settings, qrSimple: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* 2. TRANSFERENCIA BANCARIA */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition space-y-3 ${
          settings.bankTransfer
            ? 'bg-slate-900/90 border-cyan-500/50'
            : 'bg-slate-950/60 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Transferencia Bancaria</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    settings.bankTransfer
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {settings.bankTransfer ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Permite a tus clientes pagar mediante transferencia interbancaria directa. (Sin pasarelas automáticas ni cobro de comisiones).
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.bankTransfer}
                onChange={(e) => setSettings({ ...settings, bankTransfer: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {settings.bankTransfer && (
            <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Banco (opcional)</label>
                <input
                  type="text"
                  value={settings.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        ...(settings.bankDetails || {}),
                        bankName: e.target.value,
                      },
                    })
                  }
                  placeholder="Ej: Banco BNB, BCP..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Nº de Cuenta (opcional)</label>
                <input
                  type="text"
                  value={settings.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        ...(settings.bankDetails || {}),
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="Ej: 150-1234567-0-1"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Titular (opcional)</label>
                <input
                  type="text"
                  value={settings.bankDetails?.accountHolder || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankDetails: {
                        ...(settings.bankDetails || {}),
                        accountHolder: e.target.value,
                      },
                    })
                  }
                  placeholder="Ej: Nombre de la Empresa o Persona"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. EFECTIVO CONTRAENTREGA */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition ${
          settings.cashOnDelivery
            ? 'bg-slate-900/90 border-emerald-500/50'
            : 'bg-slate-950/60 border-slate-800 opacity-80'
        }`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">Efectivo Contraentrega</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    settings.cashOnDelivery
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {settings.cashOnDelivery ? 'Habilitado' : 'Deshabilitado (Por Defecto)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El cliente paga en efectivo cuando el pedido es entregado a domicilio o retirado en el local.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-300/90">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>No aparece automáticamente en el checkout; solo estará disponible para tus clientes si activas este interruptor.</span>
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={settings.cashOnDelivery}
                onChange={(e) => setSettings({ ...settings, cashOnDelivery: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Resumen de configuración para el checkout */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 space-y-2">
        <h4 className="font-bold text-slate-200">Impacto en la Tienda Pública:</h4>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>
            Tus clientes solo podrán seleccionar en el checkout los métodos que tengas habilitados (
            {[
              settings.qrSimple && 'QR Simple',
              settings.bankTransfer && 'Transferencia',
              settings.cashOnDelivery && 'Efectivo Contraentrega',
            ].filter(Boolean).join(', ') || 'Ninguno seleccionado: la coordinación de pago se indicará por WhatsApp'}
            ).
          </li>
          <li>
            WhatsApp se mantiene <strong>siempre disponible</strong> en el checkout y al finalizar el pedido para que el cliente te envíe el resumen.
          </li>
          <li>
            Esta configuración es completamente <strong>independiente y aislada</strong> para <strong>{store.name}</strong>.
          </li>
        </ul>
      </div>
    </form>
  );
};
