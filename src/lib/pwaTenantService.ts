/**
 * CentralBo — Servicio PWA Específico por Comercio y Administración
 *
 * Módulo de Aislamiento e Instalación PWA:
 * 1. Genera e inyecta dinámicamente el Web App Manifest por comercio (slug)
 * 2. Genera e inyecta dinámicamente el Web App Manifest para el administrador
 * 3. Provee icono e identidad visual únicos basados en datos reales del comercio
 * 4. Configura start_url e id aislados para que cada instalación abra su tienda correspondiente
 */

import { useEffect } from 'react';

export interface StorePWAConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  primaryColor?: string | null;
}

export interface AdminPWAConfig {
  tenantId: string;
  storeName: string;
  description?: string | null;
}

/**
 * Genera un icono SVG Data URI de alta definición (512x512)
 * personalizado con las iniciales y el color primario del comercio.
 */
export function generateStoreIconSvg(storeName: string, primaryColor: string = '#4f46e5'): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (storeName.trim().slice(0, 2) || 'CB').toUpperCase();

  const safeColor = primaryColor || '#4f46e5';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${safeColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="#ffffff" stroke-width="6" stroke-opacity="0.25" />
  <text x="50%" y="53%" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="200" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" filter="url(#textGlow)">
    ${initials}
  </text>
  <rect x="180" y="385" width="152" height="14" rx="7" fill="#ffffff" opacity="0.65" />
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Genera un icono SVG Data URI para el panel administrativo del comercio
 */
export function generateAdminIconSvg(storeName: string): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  const initials =
    words.length > 1
      ? (words[0][0] + words[1][0]).toUpperCase()
      : (storeName.trim().slice(0, 2) || 'AD').toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="adminGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312e81" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#adminGrad)" />
  <rect x="20" y="20" width="472" height="472" rx="96" fill="none" stroke="#6366f1" stroke-width="6" stroke-opacity="0.4" />
  <text x="50%" y="46%" font-family="system-ui, -apple-system, sans-serif" font-size="180" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
    ${initials}
  </text>
  <!-- Badge ADMIN -->
  <rect x="126" y="360" width="260" height="52" rx="26" fill="#4f46e5" />
  <text x="50%" y="393" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">
    ADMIN
  </text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Construye el objeto de manifiesto para la tienda pública de un comercio
 */
export function buildStoreManifest(config: StorePWAConfig) {
  const safeName = config.name.trim();
  const shortName = safeName.length > 12 ? safeName.slice(0, 12).trim() : safeName;
  const description =
    config.description?.trim() || `Tienda oficial de ${safeName} en CentralBo`;
  const primaryColor = config.primaryColor || '#0f172a';
  const iconSvgUri = generateStoreIconSvg(safeName, primaryColor);

  const icons: Array<{ src: string; sizes: string; type: string; purpose?: string }> = [];

  // Si el comercio tiene logo personalizado, se coloca en primer lugar
  if (config.logoUrl && config.logoUrl.trim()) {
    icons.push({
      src: config.logoUrl,
      sizes: '192x192 512x512',
      type: 'image/png',
      purpose: 'any',
    });
  }

  // Icono vectorial dinámico del comercio
  icons.push({
    src: iconSvgUri,
    sizes: '512x512',
    type: 'image/svg+xml',
    purpose: 'any',
  });

  // Fallbacks estándar PNG del proyecto para compatibilidad estricta
  icons.push(
    {
      src: '/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/pwa-maskable-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    }
  );

  return {
    id: `/tienda/${config.slug}`,
    name: safeName,
    short_name: shortName,
    description,
    start_url: `/?pwa_slug=${encodeURIComponent(config.slug)}#/tienda/${encodeURIComponent(config.slug)}`,
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: primaryColor,
    background_color: '#0f172a',
    icons,
  };
}

/**
 * Construye el objeto de manifiesto para el panel administrativo del comercio
 */
export function buildAdminManifest(config: AdminPWAConfig) {
  const safeName = config.storeName.trim();
  const shortName = `Admin ${safeName.length > 6 ? safeName.slice(0, 6).trim() : safeName}`;
  const description =
    config.description?.trim() || `Panel de administración de ${safeName} en CentralBo`;
  const adminIconSvgUri = generateAdminIconSvg(safeName);

  return {
    id: `/admin/${config.tenantId}`,
    name: `Administración — ${safeName}`,
    short_name: shortName,
    description,
    start_url: `/?pwa_admin=${encodeURIComponent(config.tenantId)}#/admin/${encodeURIComponent(config.tenantId)}`,
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    icons: [
      {
        src: adminIconSvgUri,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}

/**
 * Construye el manifiesto global para el portal principal de CentralBo
 */
export function buildPlatformManifest() {
  return {
    id: '/',
    name: 'CentralBo — Plataforma PWA',
    short_name: 'CentralBo',
    description: 'Plataforma SaaS Marketplace Multi-Tenant y PWA de CentralBo',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    theme_color: '#0f172a',
    background_color: '#0f172a',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

/**
 * Aplica activamente un manifiesto Web App al documento DOM
 */
export function applyPWAManifest(manifestObj: ReturnType<typeof buildStoreManifest>): void {
  if (typeof document === 'undefined') return;

  try {
    const jsonString = JSON.stringify(manifestObj);
    const dataUri = `data:application/manifest+json;charset=utf-8,${encodeURIComponent(jsonString)}`;

    // 1. Manifiesto <link rel="manifest">
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = dataUri;

    // 2. Título de la página
    document.title = `${manifestObj.name} — CentralBo`;

    // 3. Meta theme-color
    let metaTheme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = manifestObj.theme_color;

    // 4. Meta apple-mobile-web-app-title
    let metaApple = document.querySelector<HTMLMetaElement>(
      'meta[name="apple-mobile-web-app-title"]'
    );
    if (!metaApple) {
      metaApple = document.createElement('meta');
      metaApple.name = 'apple-mobile-web-app-title';
      document.head.appendChild(metaApple);
    }
    metaApple.content = manifestObj.short_name;

    // 5. Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc && manifestObj.description) {
      metaDesc.content = manifestObj.description;
    }

    // 6. Iconos apple-touch-icon y favicon si están disponibles
    if (manifestObj.icons && manifestObj.icons.length > 0) {
      const topIcon = manifestObj.icons[0].src;
      let appleIcon = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
      if (appleIcon) {
        appleIcon.href = topIcon;
      }
    }
  } catch (err) {
    console.warn('[CentralBo PWA] No se pudo actualizar dinámicamente el manifiesto:', err);
  }
}

/**
 * Hook de React para vincular la tienda actual al manifiesto PWA dinámico
 */
export function useStorePWA(config: StorePWAConfig | null): void {
  useEffect(() => {
    if (!config) return;

    const storeManifest = buildStoreManifest(config);
    applyPWAManifest(storeManifest);

    return () => {
      // Al salir de la tienda, restaurar el manifiesto base de CentralBo
      const platformManifest = buildPlatformManifest();
      applyPWAManifest(platformManifest);
    };
  }, [config?.slug, config?.name, config?.primaryColor, config?.logoUrl, config?.description]);
}

/**
 * Hook de React para vincular la administración actual al manifiesto PWA dinámico
 */
export function useAdminPWA(config: AdminPWAConfig | null): void {
  useEffect(() => {
    if (!config) return;

    const adminManifest = buildAdminManifest(config);
    applyPWAManifest(adminManifest);

    return () => {
      const platformManifest = buildPlatformManifest();
      applyPWAManifest(platformManifest);
    };
  }, [config?.tenantId, config?.storeName, config?.description]);
}
