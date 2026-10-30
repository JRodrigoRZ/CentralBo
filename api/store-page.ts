import type { IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import {
  fetchPublicStoreSeoMetadata,
  injectStoreSeoFailureMetadata,
  injectStoreSeoMetadata,
} from '../src/lib/storeSeoService.js';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  send: (body: string) => VercelResponse;
}

const VERCEL_DEPLOYMENT_HOST_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+vercel\.app$/i;

function getTrustedDeploymentOrigin(): string | null {
  const deploymentHost = process.env.VERCEL_URL?.trim().toLowerCase();
  if (
    !deploymentHost ||
    deploymentHost.length > 253 ||
    !VERCEL_DEPLOYMENT_HOST_PATTERN.test(deploymentHost)
  ) {
    return null;
  }

  return `https://${deploymentHost}`;
}

async function loadBuiltIndex(): Promise<string> {
  try {
    return await readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
  } catch {
    const deploymentOrigin = getTrustedDeploymentOrigin();
    if (!deploymentOrigin) {
      throw new Error('No existe un origen de despliegue seguro para cargar el HTML base.');
    }

    const response = await fetch(new URL('/index.html', deploymentOrigin), {
      headers: { Accept: 'text/html' },
      redirect: 'error',
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar index.html (estado ${response.status}).`);
    }

    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes('text/html')) {
      throw new Error('El origen de despliegue no devolvió un documento HTML válido.');
    }

    return response.text();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.status(405).send('Método no permitido');
    return;
  }

  try {
    const rawSlug = req.query?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug || '';
    const indexHtml = await loadBuiltIndex();

    let metadata: Awaited<ReturnType<typeof fetchPublicStoreSeoMetadata>>;
    try {
      metadata = await fetchPublicStoreSeoMetadata(slug);
    } catch (error) {
      console.error('[MAXINEGO SEO] No se pudieron cargar los metadatos de la tienda:', error);
      const unavailableHtml = injectStoreSeoFailureMetadata(indexHtml, 'query_error');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.status(503).send(req.method === 'HEAD' ? '' : unavailableHtml);
      return;
    }

    if (!metadata) {
      const notFoundHtml = injectStoreSeoFailureMetadata(indexHtml, 'not_found');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.status(404).send(req.method === 'HEAD' ? '' : notFoundHtml);
      return;
    }

    const renderedHtml = injectStoreSeoMetadata(indexHtml, metadata);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(req.method === 'HEAD' ? '' : renderedHtml);
  } catch (error) {
    console.error('[MAXINEGO SEO] No se pudo generar el HTML inicial de la tienda:', error);
    res.status(500).send('No se pudo cargar la página de la tienda.');
  }
}
