import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { testCentralBoConnection } from '../lib/supabase';
import { usePWA } from '../hooks/usePWA';

export const SystemReadinessCard: React.FC = () => {
  const { isOnline, swRegistered, isInstalled } = usePWA();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [dbStatus, setDbStatus] = useState<{
    testing: boolean;
    tested: boolean;
    connected: boolean;
    message: string;
    endpoint: string;
    latencyMs?: number;
  }>({
    testing: false,
    tested: false,
    connected: false,
    message: 'Pendiente de prueba',
    endpoint: 'https://wuerdwkcpurbtcwyqjep.supabase.co',
  });

  // SEC-14A-04: Cooldown para evitar saturación o llamadas repetitivas en pruebas de conectividad
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Probar conectividad no destructiva al montar
  useEffect(() => {
    runConnectionTest(false);
  }, []);

  const runConnectionTest = async (isManual = false) => {
    // Si ya está probando o en cooldown, ignorar la petición
    if (dbStatus.testing || (isManual && cooldownRemaining > 0)) {
      return;
    }

    setDbStatus((prev) => ({ ...prev, testing: true }));
    const result = await testCentralBoConnection();
    setDbStatus({
      testing: false,
      tested: true,
      connected: result.connected,
      message: result.message,
      endpoint: result.endpoint,
      latencyMs: result.latencyMs,
    });

    if (isManual) {
      setCooldownRemaining(8); // 8 segundos de cooldown
    }
  };

  const getDeviceCategory = () => {
    if (windowWidth < 640) return { label: 'Móvil (Compacto)', icon: Smartphone, color: 'text-amber-400' };
    if (windowWidth < 1024) return { label: 'Tablet (Intermedio)', icon: Tablet, color: 'text-cyan-400' };
    return { label: 'Escritorio / PC (Amplio)', icon: Monitor, color: 'text-indigo-400' };
  };

  const device = getDeviceCategory();
  const DeviceIcon = device.icon;

  return (
    <div
      id="system-readiness-dashboard"
      className="w-full grid grid-cols-1 lg:grid-cols-3 gap-5"
    >
      {/* 1. Arquitectura Web Responsive */}
      <div
        id="card-responsive-engine"
        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 backdrop-blur-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Plataforma Web Responsive
                </h3>
                <p className="text-[11px] text-slate-400">Sin dependencias nativas</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Web App
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Ejecución universal en navegador con React 19, TypeScript y Tailwind CSS. No es un APK ni requiere emuladores.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 flex items-center gap-2">
                <DeviceIcon className={`w-4 h-4 ${device.color}`} />
                <span>Viewport actual</span>
              </span>
              <span className="font-semibold text-white">
                {windowWidth}px ({device.label})
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Motor de Estilos</span>
              <span className="font-semibold text-white">Tailwind CSS v4 (Móvil + Tablet + PC)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Empaquetador</span>
              <span className="font-semibold text-white">Vite 6 + ESNext Modules</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Diseño fluido</span>
          <span className="text-emerald-400 font-medium">100% Adaptativo</span>
        </div>
      </div>

      {/* 2. PWA Compliance */}
      <div
        id="card-pwa-compliance"
        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 backdrop-blur-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  PWA Instalable
                </h3>
                <p className="text-[11px] text-slate-400">Progressive Web App</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              PWA Ready
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Lista para ser instalada en la pantalla de inicio o escritorio sin tiendas de aplicaciones externas.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Web App Manifest</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> /manifest.json
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Iconos de Sistema</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 192px, 512px, Maskable
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Soporte Apple Safari</span>
              <span className="font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> apple-touch-icon
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Service Worker / Caché</span>
              <span className="font-medium text-slate-200">
                {swRegistered ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activo (VitePWA)
                  </span>
                ) : (
                  <span className="text-indigo-300">Preparado (VitePWA)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Modo de ejecución</span>
          <span className="text-indigo-400 font-medium">
            {isInstalled ? 'Standalone (Instalado)' : 'Navegador Web / PWA'}
          </span>
        </div>
      </div>

      {/* 3. Conexión Segura con Supabase CentralBo */}
      <div
        id="card-supabase-connection"
        className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 backdrop-blur-sm flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Conexión Supabase
                </h3>
                <p className="text-[11px] text-slate-400">Proyecto CentralBo</p>
              </div>
            </div>
            <button
              id="test-supabase-btn"
              onClick={() => runConnectionTest(true)}
              disabled={dbStatus.testing || cooldownRemaining > 0}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={cooldownRemaining > 0 ? `Espera ${cooldownRemaining}s para volver a probar` : 'Comprobar conectividad no destructiva'}
            >
              <RefreshCw className={`w-3 h-3 ${dbStatus.testing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>
                {dbStatus.testing
                  ? 'Probando...'
                  : cooldownRemaining > 0
                  ? `Espera (${cooldownRemaining}s)`
                  : 'Verificar'}
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Configurado con credenciales públicas <code className="text-cyan-300">anon</code>. Sin secretos ni <code className="text-slate-400">service_role</code> en el cliente.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-slate-400 text-[11px] mb-0.5">Endpoint CentralBo</div>
              <div className="font-mono text-xs text-slate-200 truncate">
                {dbStatus.endpoint}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-[11px]">Estado de Conectividad</span>
                {dbStatus.latencyMs !== undefined && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dbStatus.latencyMs}ms
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    dbStatus.connected
                      ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                      : dbStatus.testing
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-indigo-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    dbStatus.connected ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  {dbStatus.message}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Esquema Fase 1</span>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Preservado en /supabase
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Clave del cliente</span>
          <span className="font-mono text-slate-300 text-[10px]">sb_publishable_...</span>
        </div>
      </div>
    </div>
  );
};
