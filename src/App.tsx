import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { usePWA } from './hooks/usePWA';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PortalHome } from './components/PortalHome';
import { LoginView } from './components/LoginView';
import { PublicStoreView } from './components/PublicStoreView';
import { ActivateOwnerView } from './components/ActivateOwnerView';
import { SuperAdminArea } from './components/SuperAdminArea';
import { StoreAdminArea } from './components/StoreAdminArea';
import { UnauthorizedView } from './components/UnauthorizedView';

function AppContent() {
  const { currentRoute } = useRouter();
  const pwaStatus = usePWA();
  const isPublicStore = currentRoute.type === 'public_store';

  return (
    <div
      className={`min-h-screen ${
        isPublicStore
          ? 'bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-amber-500 selection:text-white'
          : 'bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 selection:bg-amber-500 selection:text-white'
      } flex flex-col transition-colors`}
    >
      {/* Barra de navegación superior responsive - Excluida en tienda pública */}
      {!isPublicStore && (
        <Header pwaStatus={pwaStatus} onInstallClick={pwaStatus.install} />
      )}

      {/* Alerta toast de desconexión PWA */}
      <OfflineIndicator />

      {/* Contenido Dinámico de la Ruta Multi-Tenant */}
      <main className={isPublicStore ? "flex-1 w-full" : "flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10"}>
        {currentRoute.type === 'home' && <PortalHome />}

        {currentRoute.type === 'login' && (
          <LoginView redirectPath={currentRoute.redirect} />
        )}

        {currentRoute.type === 'activar' && (
          <ActivateOwnerView token={currentRoute.token} />
        )}

        {currentRoute.type === 'public_store' && (
          <PublicStoreView slug={currentRoute.slug} />
        )}

        {currentRoute.type === 'superadmin' && <SuperAdminArea />}

        {currentRoute.type === 'store_admin' && (
          <StoreAdminArea tenantId={currentRoute.tenantId} />
        )}

        {currentRoute.type === 'unauthorized' && (
          <UnauthorizedView
            reason={currentRoute.reason}
            attemptedPath={currentRoute.attemptedPath}
            requiredRole={currentRoute.requiredRole}
            userTenantId={currentRoute.userTenantId}
            targetTenantId={currentRoute.targetTenantId}
          />
        )}
      </main>

      {/* Pie de página institucional - Excluido en tienda pública */}
      {!isPublicStore && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
