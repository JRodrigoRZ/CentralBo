import React from 'react';
import { MapPin, ExternalLink, Navigation, Compass } from 'lucide-react';
import { StoreLocationSettings } from '../../types';

interface StoreLocationMapProps {
  storeName: string;
  storeAddress?: string;
  location?: StoreLocationSettings;
  primaryColor?: string;
}

export const StoreLocationMap: React.FC<StoreLocationMapProps> = ({
  storeName,
  storeAddress,
  location,
  primaryColor = '#2563eb',
}) => {
  if (!location || !location.isConfigured || !location.embedUrl) {
    return null;
  }

  const effectiveAddress = location.displayAddress || storeAddress || '';
  const hasCoordinates =
    typeof location.latitude === 'number' && typeof location.longitude === 'number';

  return (
    <section
      aria-label={`Ubicación de ${storeName}`}
      className="w-full my-8 animate-in fade-in duration-300"
    >
      <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800/90 bg-white dark:bg-stone-900/60 p-5 sm:p-7 shadow-xs overflow-hidden transition-colors">
        {/* ENCABEZADO DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-stone-100 dark:border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: primaryColor }}
              >
                Ubicación
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-white tracking-tight">
              Encuéntranos
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              Consulta nuestra ubicación en Google Maps.
            </p>
          </div>

          {/* BOTÓN DE ACCIÓN DIRECTA: VER EN GOOGLE MAPS */}
          <a
            href={location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: primaryColor }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all active:scale-95 cursor-pointer shrink-0"
            title={`Abrir ubicación de ${storeName} en Google Maps`}
          >
            <Compass className="w-4 h-4" />
            <span>Ver en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        {/* DETALLE DEL ESTABLECIMIENTO Y REFERENCIAS */}
        <div className="pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block text-stone-900 dark:text-white">
                {storeName}
              </span>
              {effectiveAddress && (
                <span className="text-stone-600 dark:text-stone-400 block">
                  {effectiveAddress}
                </span>
              )}
              {location.referenceNotes && (
                <span className="text-[11px] text-stone-500 dark:text-stone-400 italic block">
                  Referencia: {location.referenceNotes}
                </span>
              )}
            </div>
          </div>

          {hasCoordinates && (
            <div className="text-[11px] font-mono text-stone-400 dark:text-stone-500 self-start sm:self-center shrink-0">
              {location.latitude?.toFixed(5)}, {location.longitude?.toFixed(5)}
            </div>
          )}
        </div>

        {/* CONTENEDOR DEL MAPA EMBEBIDO INTERACTIVO */}
        <div className="mt-2 w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 relative shadow-inner">
          <iframe
            title={`Mapa de ubicación de ${storeName}`}
            src={location.embedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};
