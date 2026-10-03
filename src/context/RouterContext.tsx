import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppRoute } from '../types';
import { useAuth } from './AuthContext';

interface RouterContextType {
  currentRoute: AppRoute;
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

/**
 * Detecta si el hostname actual corresponde a un subdominio de tienda en producción (ej. cafedelicia.centralbo.bo)
 * Reglas:
 * - Debe ser un subdominio de centralbo.bo
 * - centralbo.bo NO produce slug de tienda
 * - www.centralbo.bo NO produce slug de tienda
 * - Entornos de desarrollo/preview (localhost, 127.0.0.1, *.run.app, etc.) devuelven null
 */
export function getStoreSlugFromHostname(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawHostname = window.location.hostname || '';
    const hostname = rawHostname.toLowerCase().split(':')[0].trim();
    const baseDomain = 'centralbo.bo';

    // Debe ser estrictamente un subdominio de centralbo.bo
    if (!hostname.endsWith(`.${baseDomain}`)) {
      return null;
    }

    // Extraer la porción anterior a .centralbo.bo
    const subdomain = hostname.slice(0, -(baseDomain.length + 1)).trim();

    // Validar que no sea vacío ni 'www'
    if (!subdomain || subdomain === 'www') {
      return null;
    }

    // Si hubiera subdominios anidados (ej. promo.cafedelicia), extraer el slug correspondiente
    const parts = subdomain.split('.');
    const candidateSlug = parts[parts.length - 1];
    if (!candidateSlug || candidateSlug === 'www') {
      return null;
    }

    return candidateSlug;
  } catch {
    return null;
  }
}

/**
 * Resuelve la ruta inicial respetando el parámetro de apertura PWA (?pwa_slug=... o ?pwa_admin=...),
 * el hash de URL (#/tienda/slug), el pathname directo (/tienda/slug)
 * o el subdominio de tienda en producción (ej. cafedelicia.centralbo.bo).
 */
function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Hash en la URL si existe (ej. #/tienda/restaurante-roma o #/admin/tenantId)
  if (window.location.hash && window.location.hash.length > 1) {
    let hash = window.location.hash.slice(1);

    // Fragmentos de recuperación o autenticación de Supabase (ej. #access_token=... o #error=... o type=recovery)
    // Se dirigen a /login para que LoginView y AuthContext procesen el estado de recuperación sin colisionar con rutas de tienda
    if (
      hash.includes('access_token=') ||
      hash.includes('type=recovery') ||
      hash.includes('error_description=')
    ) {
      return '/login';
    }

    // Si es un ancla interna de producto (#prod-...), no es una ruta de navegación principal
    if (!hash.startsWith('prod-')) {
      if (!hash.startsWith('/')) {
        hash = `/${hash}`;
      }
      return hash;
    }
  }

  // 2. Parámetros de apertura específicos (?pwa_slug=... o ?pwa_admin=...)
  if (window.location.search) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const pwaSlug = searchParams.get('pwa_slug') || searchParams.get('tienda');
      if (pwaSlug) {
        return `/tienda/${pwaSlug}`;
      }
      const pwaAdmin = searchParams.get('pwa_admin');
      if (pwaAdmin) {
        return `/admin/${pwaAdmin}`;
      }
    } catch {
      // Fallback a pathname
    }
  }

  // 3. Pathname directo (ej. /tienda/restaurante-roma)
  const pathname = window.location.pathname;
  if (pathname && pathname !== '/' && pathname !== '/index.html') {
    return pathname;
  }

  // 4. Subdominio de tienda en producción (ej. cafedelicia.centralbo.bo)
  const subdomainSlug = getStoreSlugFromHostname();
  if (subdomainSlug) {
    return `/tienda/${subdomainSlug}`;
  }

  return '/';
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return getInitialPath();
  });

  // Parsear la ruta actual en base a path y contexto de seguridad del usuario
  const parseRoute = useCallback((path: string): AppRoute => {
    let effectivePath = path || '/';
    if (effectivePath.includes('#')) {
      effectivePath = effectivePath.substring(effectivePath.indexOf('#') + 1);
    }
    if (!effectivePath.startsWith('/')) {
      effectivePath = `/${effectivePath}`;
    }

    const cleanPath = effectivePath.split('?')[0] || '/';
    const parts = cleanPath.split('/').filter(Boolean);

    // Fragmentos de recuperación o autenticación de Supabase (evitar resolver como slug de tienda)
    if (
      effectivePath.includes('access_token=') ||
      effectivePath.includes('type=recovery') ||
      effectivePath.includes('error_description=')
    ) {
      return { type: 'login' };
    }

    // 1. Ruta Inicio (o Storefront si se accede mediante subdominio de tienda)
    if (parts.length === 0 || cleanPath === '/') {
      const subdomainSlug = getStoreSlugFromHostname();
      if (subdomainSlug) {
        return { type: 'public_store', slug: subdomainSlug };
      }
      return { type: 'home' };
    }

    // 2. Ruta Login
    if (parts[0] === 'login') {
      const urlParams = new URLSearchParams(
        typeof window !== 'undefined'
          ? window.location.hash.split('?')[1] || window.location.search
          : ''
      );
      return { type: 'login', redirect: urlParams.get('redirect') || undefined };
    }

    // 3. Tienda Pública (Accesible por slug SIN requerir autenticación)
    if (parts[0] === 'tienda') {
      const slug = parts[1];
      if (!slug) {
        return { type: 'home' };
      }
      return { type: 'public_store', slug };
    }

    // Si aún está cargando la sesión, no validar restricciones para evitar parpadeos
    if (isLoading) {
      if (parts[0] === 'superadmin') return { type: 'superadmin' };
      if (parts[0] === 'admin') return { type: 'store_admin', tenantId: parts[1] };
    }

    // 4. Área SuperAdmin
    if (parts[0] === 'superadmin') {
      if (!user) {
        return { type: 'login', redirect: '/superadmin' };
      }

      if (profile !== 'superadmin') {
        return {
          type: 'unauthorized',
          reason: 'Acceso Denegado: Área restringida exclusivamente al perfil SuperAdmin Global.',
          attemptedPath: path,
          requiredRole: 'superadmin',
        };
      }

      return { type: 'superadmin' };
    }

    // 5. Área Administrador del Comercio
    if (parts[0] === 'admin') {
      if (!user) {
        return { type: 'login', redirect: path };
      }

      const targetTenantId = parts[1];

      // Caso SuperAdmin: Puede supervisar cualquier tenant
      if (profile === 'superadmin') {
        return { type: 'store_admin', tenantId: targetTenantId || user.tenantId || undefined };
      }

      // Caso Administrador de Comercio (o usuario con tenantId asignado)
      if (profile === 'store_admin' || (user && user.tenantId)) {
        const userTenantId = user.tenantId;
        if (!userTenantId) {
          return {
            type: 'unauthorized',
            reason: 'Esta cuenta no tiene asignado un comercio activo válido.',
            attemptedPath: path,
            requiredRole: 'admin',
          };
        }

        // CASO 2: Si no se especifica tenantId en la URL (#/admin), resolver y navegar hacia su propio comercio
        if (!targetTenantId) {
          if (typeof window !== 'undefined' && window.location.hash !== `#/admin/${userTenantId}`) {
            window.location.replace(`#/admin/${userTenantId}`);
          }
          return { type: 'store_admin', tenantId: userTenantId };
        }

        // CASO 3: SEGURIDAD CRÍTICA MULTI-TENANT:
        // Verificar que el administrador NO pueda acceder ni administrar otro comercio distinto al suyo
        if (userTenantId !== targetTenantId) {
          return {
            type: 'unauthorized',
            reason: `Violación de Frontera Multi-Tenant: Su cuenta está asociada exclusivamente a su comercio. No tiene permisos para acceder ni administrar el comercio solicitado.`,
            attemptedPath: path,
            requiredRole: 'admin',
            userTenantId: userTenantId,
            targetTenantId: targetTenantId,
          };
        }

        return { type: 'store_admin', tenantId: userTenantId };
      }

      // Cliente público que intente entrar a admin
      return {
        type: 'unauthorized',
        reason: 'Esta cuenta no tiene asignado un comercio con rol de administrador.',
        attemptedPath: path,
        requiredRole: 'store_admin',
      };
    }

    // 6. Tienda Pública accesible por slug directo (ej. /mitienda o /restaurante-roma)
    if (parts.length === 1 && !['login', 'superadmin', 'admin', 'tienda'].includes(parts[0])) {
      return { type: 'public_store', slug: parts[0] };
    }

    return { type: 'home' };
  }, [user, profile, isLoading]);

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseRoute(currentPath));

  // Escuchar cambios de hash y navegación en la ventana
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getInitialPath());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Actualizar la ruta evaluada cuando cambia la ruta o el estado de autenticación
  useEffect(() => {
    setCurrentRoute(parseRoute(currentPath));
  }, [currentPath, parseRoute]);

  const navigate = useCallback((path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = normalized;
    setCurrentPath(normalized);
  }, []);

  return (
    <RouterContext.Provider value={{ currentRoute, currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter debe ser utilizado dentro de un RouterProvider');
  }
  return context;
}
