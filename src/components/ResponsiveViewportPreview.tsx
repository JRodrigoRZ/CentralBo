import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Check, Compass, Sparkles, Sliders } from 'lucide-react';

type ViewportMode = 'auto' | 'mobile' | 'tablet' | 'desktop';

export const ResponsiveViewportPreview: React.FC = () => {
  const [mode, setMode] = useState<ViewportMode>('auto');

  return (
    <section
      id="responsive-viewport-section"
      className="w-full rounded-2xl bg-slate-900/70 border border-slate-800 p-5 sm:p-6 lg:p-7 backdrop-blur-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              Comprobación Responsive Multi-Dispositivo
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Web Adaptativa
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifica la composición compacta en móvil, intermedia en tablet y amplia en escritorio.
          </p>
        </div>

        {/* Viewport switcher controls */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setMode('auto')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'auto'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Fluido Real</span>
          </button>
          <button
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil (380px)</span>
          </button>
          <button
            onClick={() => setMode('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet (768px)</span>
          </button>
          <button
            onClick={() => setMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              mode === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Escritorio</span>
          </button>
        </div>
      </div>

      {/* Demonstration container representing simulated frame */}
      <div className="w-full flex justify-center bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 sm:p-6 overflow-x-auto">
        <div
          className={`transition-all duration-300 w-full ${
            mode === 'mobile'
              ? 'max-w-[380px] border-2 border-indigo-500/40 rounded-3xl p-4 bg-slate-900 shadow-2xl'
              : mode === 'tablet'
              ? 'max-w-[768px] border-2 border-cyan-500/40 rounded-2xl p-5 bg-slate-900 shadow-2xl'
              : mode === 'desktop'
              ? 'max-w-5xl border border-slate-700/60 rounded-xl p-6 bg-slate-900 shadow-xl'
              : 'max-w-full'
          }`}
        >
          {/* Header of simulated frame */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white">
                {mode === 'mobile'
                  ? 'Vista Móvil — Composición Compacta'
                  : mode === 'tablet'
                  ? 'Vista Tablet — Composición Intermedia'
                  : mode === 'desktop'
                  ? 'Vista Escritorio — Composición Web Amplia'
                  : 'Vista Fluida Activa (Adaptada a tu pantalla)'}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              {mode === 'mobile'
                ? '380 × 667'
                : mode === 'tablet'
                ? '768 × 1024'
                : mode === 'desktop'
                ? '1200+ px'
                : '100% responsive'}
            </span>
          </div>

          {/* Grid simulated layout testing responsive behaviour */}
          <div className="space-y-4">
            {/* Banner preview */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-900/40 via-slate-800/40 to-cyan-900/40 border border-slate-700/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Marketplace Multi-Tenant
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  CentralBo Web & PWA
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Diseñado para adaptarse óptimamente desde smartphones con navegación táctil hasta monitores panorámicos de alta resolución.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold whitespace-nowrap">
                  PWA Ready
                </span>
              </div>
            </div>

            {/* Vertical Cards Showcase */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: 'Restaurante', icon: '🍽️', desc: 'Menú digital, alérgenos, tiempos de preparación', color: 'from-amber-500/10 to-transparent border-amber-500/20' },
                { name: 'Moda & Retail', icon: '👗', desc: 'Guía de tallas, variantes de color y stock', color: 'from-pink-500/10 to-transparent border-pink-500/20' },
                { name: 'Servicios', icon: '💼', desc: 'Duración, reservas y turnos presenciales', color: 'from-emerald-500/10 to-transparent border-emerald-500/20' },
                { name: 'Comercio General', icon: '🏪', desc: 'Catálogo universal multi-categoría', color: 'from-cyan-500/10 to-transparent border-cyan-500/20' },
              ].map((vert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl bg-gradient-to-b ${vert.color} border bg-slate-900/80 flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{vert.icon}</span>
                    <span className="text-xs font-bold text-white">{vert.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{vert.desc}</p>
                  <div className="mt-2 text-[10px] text-indigo-400 font-medium">Vertical Fase 1</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
