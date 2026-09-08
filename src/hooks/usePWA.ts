import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Singleton a nivel de módulo para que cualquier componente o ruta tenga acceso al prompt
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
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

// Verificación inicial de standalone
if (typeof window !== 'undefined') {
  const checkInitialStandalone = () => {
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean })
      ?.standalone === true;
    globalIsInstalled = isStandaloneMedia || isNavigatorStandalone;
  };
  checkInitialStandalone();

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalIsInstalled = true;
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => globalIsInstalled);
  const [isIOS, setIsIOS] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Sincronizar estado inicial
    setDeferredPrompt(globalDeferredPrompt);
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

    // 3. Suscriptor al singleton global
    const syncWithGlobal = () => {
      setDeferredPrompt(globalDeferredPrompt);
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
  }, []);

  const install = async (): Promise<boolean> => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (!promptToUse) return false;
    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      if (outcome === 'accepted') {
        globalIsInstalled = true;
        globalDeferredPrompt = null;
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

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    isOnline,
    swRegistered,
    install,
  };
}
