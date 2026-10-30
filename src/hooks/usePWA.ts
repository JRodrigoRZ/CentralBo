import { useEffect, useState } from 'react';
import { getActiveManifestId, onManifestChange } from '../lib/pwaTenantService';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Singleton a nivel de módulo con aislamiento multi-tenant
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalPromptManifestId: string | null = null;
let globalIsInstalled = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.warn('[usePWA] Error en listener:', e);
    }
  });
}

// Verificación inicial y suscripciones de aislamiento
if (typeof window !== 'undefined') {
  const checkInitialStandalone = () => {
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean })
      ?.standalone === true;
    globalIsInstalled = isStandaloneMedia || isNavigatorStandalone;
  };
  checkInitialStandalone();

  // Invalidación inmediata del prompt al cambiar de comercio o manifest
  onManifestChange((newManifestId) => {
    if (globalPromptManifestId && globalPromptManifestId !== newManifestId) {
      globalDeferredPrompt = null;
      globalPromptManifestId = null;
      notifyListeners();
    }
  });

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    globalPromptManifestId = getActiveManifestId();
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalIsInstalled = true;
    globalDeferredPrompt = null;
    globalPromptManifestId = null;
    notifyListeners();
  });
}

/**
 * Hook para consumo PWA con verificación de tenant actual
 * @param expectedManifestId Identificador del manifiesto esperado (ej. '/tienda/slug' o '/admin/tenantId')
 */
export function usePWA(expectedManifestId?: string) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => {
      if (expectedManifestId && globalPromptManifestId && globalPromptManifestId !== expectedManifestId) {
        return null;
      }
      return globalDeferredPrompt;
    }
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => globalIsInstalled);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Sincronizar estado inicial verificando coherencia de tenant
    const promptIsValid =
      !expectedManifestId ||
      !globalPromptManifestId ||
      globalPromptManifestId === expectedManifestId;

    setDeferredPrompt(promptIsValid ? globalDeferredPrompt : null);
    setIsInstalled(globalIsInstalled);

    // 1. Detectar modo standalone
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean })
        ?.standalone === true;
      const current = isStandaloneMedia || isNavigatorStandalone;
      globalIsInstalled = current;
      setIsInstalled(current);
    };

    checkStandalone();

    // 2. Detectar dispositivos iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 3. Suscriptor al singleton global con filtro por tenant
    const syncWithGlobal = () => {
      const isValid =
        !expectedManifestId ||
        !globalPromptManifestId ||
        globalPromptManifestId === expectedManifestId;

      setDeferredPrompt(isValid ? globalDeferredPrompt : null);
      setIsInstalled(globalIsInstalled);
    };
    listeners.add(syncWithGlobal);

    // 4. Conectividad de red
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // 5. Comprobar service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        setSwRegistered(registrations.length > 0);
      });
      navigator.serviceWorker.ready.then(() => {
        setSwRegistered(true);
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      listeners.delete(syncWithGlobal);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [expectedManifestId]);

  const install = async (): Promise<boolean> => {
    // Protección estricta: asegurar que el prompt coincide con el tenant esperado
    if (expectedManifestId && globalPromptManifestId && globalPromptManifestId !== expectedManifestId) {
      console.warn('[usePWA] Intento de instalación cancelado: el prompt pertenece a otro tenant.');
      return false;
    }

    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (!promptToUse) return false;

    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        globalIsInstalled = true;
        globalDeferredPrompt = null;
        globalPromptManifestId = null;
        setIsInstalled(true);
        setDeferredPrompt(null);
        notifyListeners();
        return true;
      }
    } catch (err) {
      console.warn('[usePWA] Error al invocar prompt:', err);
    }
    return false;
  };

  const isPromptTenantMatch =
    !expectedManifestId ||
    !globalPromptManifestId ||
    globalPromptManifestId === expectedManifestId;

  return {
    isInstallable: !!(deferredPrompt || (globalDeferredPrompt && isPromptTenantMatch)),
    isInstalled,
    isIOS,
    isOnline,
    swRegistered,
    install,
  };
}
