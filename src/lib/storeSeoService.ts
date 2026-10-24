const PLATFORM_ORIGIN = 'https://www.maxinego.app';

export interface StoreSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string | null;
}

export type StoreSeoFailureKind = 'not_found' | 'query_error';

interface PublicStoreRow {
  name?: unknown;
  slug?: unknown;
  logo_url?: unknown;
  profile?: unknown;
}

interface StoreSeoFetchOptions {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  fetchImpl?: typeof fetch;
}

const STORE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
}

function normalizeStoreImageUrl(value: unknown): string | null {
  const rawUrl = nonEmptyString(value);
  if (!rawUrl) return null;

  try {
    const imageUrl = new URL(rawUrl, PLATFORM_ORIGIN);
    if (!['http:', 'https:'].includes(imageUrl.protocol)) return null;
    if (imageUrl.username || imageUrl.password) return null;
    return imageUrl.href;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function replaceHeadElement(html: string, pattern: RegExp, replacement: string): string {
  if (pattern.test(html)) {
    return html.replace(pattern, () => replacement);
  }

  return html.replace(/<\/head>/i, () => `  ${replacement}\n</head>`);
}

export async function fetchPublicStoreSeoMetadata(
  rawSlug: string,
  options: StoreSeoFetchOptions = {}
): Promise<StoreSeoMetadata | null> {
  const slug = rawSlug.trim().toLowerCase();
  if (!STORE_SLUG_PATTERN.test(slug)) return null;

  const supabaseUrl = options.supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    options.supabaseAnonKey ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables públicas de Supabase para generar el SEO de la tienda.');
  }

  const endpoint = new URL('/rest/v1/stores', supabaseUrl);
  endpoint.searchParams.set('select', 'name,slug,logo_url,profile');
  endpoint.searchParams.set('slug', `eq.${slug}`);
  endpoint.searchParams.set('status', 'in.(activo,prueba)');
  endpoint.searchParams.set('limit', '1');

  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(endpoint, {
    headers: {
      Accept: 'application/json',
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase respondió con estado ${response.status} al consultar el SEO de la tienda.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload) || payload.length === 0) return null;

  const row = payload[0] as PublicStoreRow;
  const name = nonEmptyString(row.name);
  const resolvedSlug = nonEmptyString(row.slug);
  if (!name || !resolvedSlug || !STORE_SLUG_PATTERN.test(resolvedSlug)) return null;

  const profile = row.profile && typeof row.profile === 'object'
    ? (row.profile as Record<string, unknown>)
    : {};
  const description =
    nonEmptyString(profile.description) || `Tienda oficial de ${name} en MAXINEGO`;

  return {
    title: `${name} — MAXINEGO`,
    description,
    canonicalUrl: `${PLATFORM_ORIGIN}/tienda/${encodeURIComponent(resolvedSlug)}`,
    imageUrl: normalizeStoreImageUrl(row.logo_url),
  };
}

export function injectStoreSeoMetadata(html: string, metadata: StoreSeoMetadata): string {
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const canonicalUrl = escapeHtml(metadata.canonicalUrl);

  let renderedHtml = replaceHeadElement(
    html,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${title}</title>`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
    `<meta name="description" content="${description}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i,
    `<meta property="og:title" content="${title}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i,
    `<meta property="og:description" content="${description}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );

  renderedHtml = renderedHtml.replace(
    /\s*<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/gi,
    ''
  );

  if (metadata.imageUrl) {
    renderedHtml = replaceHeadElement(
      renderedHtml,
      /<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/i,
      `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`
    );
  }

  return renderedHtml;
}

export function injectStoreSeoFailureMetadata(
  html: string,
  failureKind: StoreSeoFailureKind
): string {
  const title = failureKind === 'not_found'
    ? 'Tienda no encontrada — MAXINEGO'
    : 'Tienda temporalmente no disponible — MAXINEGO';
  const description = failureKind === 'not_found'
    ? 'La tienda solicitada no existe o no está disponible en MAXINEGO.'
    : 'No se pudo consultar la tienda en este momento. Inténtalo de nuevo más tarde.';
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);

  let renderedHtml = replaceHeadElement(
    html,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapedTitle}</title>`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
    `<meta name="description" content="${escapedDescription}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:title["'])[^>]*>/i,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bproperty=["']og:description["'])[^>]*>/i,
    `<meta property="og:description" content="${escapedDescription}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bname=["']twitter:title["'])[^>]*>/i,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bname=["']twitter:description["'])[^>]*>/i,
    `<meta name="twitter:description" content="${escapedDescription}" />`
  );
  renderedHtml = replaceHeadElement(
    renderedHtml,
    /<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/i,
    '<meta name="robots" content="noindex, nofollow" />'
  );

  return renderedHtml
    .replace(/\s*<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, '')
    .replace(/\s*<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi, '')
    .replace(/\s*<meta\b(?=[^>]*\bproperty=["']og:image["'])[^>]*>/gi, '');
}
