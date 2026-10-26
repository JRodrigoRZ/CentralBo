import express, { Request, Response } from 'express';
import path from 'path';
import { readFile } from 'fs/promises';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import healthHandler from './api/health.js';
import createStoreOwnerHandler from './api/superadmin/create-store-owner.js';
import updateStoreStatusHandler from './api/superadmin/update-store-status.js';
import createOrderHandler from './api/checkout/create-order.js';
import createAppointmentHandler from './api/appointments/create-appointment.js';
import appointmentAvailabilityHandler from './api/appointments/availability.js';
import activePromotionsHandler from './api/promotions/active.js';
import chatHandler from './api/chat.js';
import commercialEventsHandler from './api/commercial/events.js';
import commercialMetricsHandler from './api/commercial/metrics.js';
import { syncWithCloudStorage } from './src/lib/commercialStore.js';
import {
  fetchPublicStoreSeoMetadata,
  injectStoreSeoFailureMetadata,
  injectStoreSeoMetadata,
} from './src/lib/storeSeoService.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ----------------------------------------------------------------------------
// API ROUTES (Compartidas entre Vercel Serverless y Container Local/Express)
// ----------------------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  healthHandler(req as any, res as any);
});

// 2. Creación Real de Comercio + Dueño (SuperAdmin)
app.post('/api/superadmin/create-store-owner', (req: Request, res: Response) => {
  createStoreOwnerHandler(req as any, res as any);
});

// 2b. Actualización Canónica de Estado de Comercio (SuperAdmin P1-SA-01)
app.post('/api/superadmin/update-store-status', (req: Request, res: Response) => {
  updateStoreStatusHandler(req as any, res as any);
});

// 3. Creación Atómica de Pedidos (Público / Checkout Anónimo H-01)
app.all('/api/checkout/create-order', (req: Request, res: Response) => {
  createOrderHandler(req as any, res as any);
});

// 4. Creación Atómica de Citas y Protección de Concurrencia (Público / Storefront H-02)
app.all('/api/appointments/create-appointment', (req: Request, res: Response) => {
  createAppointmentHandler(req as any, res as any);
});

// 5. Consulta Pública Segura de Disponibilidad (Privacidad Estricta H-02)
app.all('/api/appointments/availability', (req: Request, res: Response) => {
  appointmentAvailabilityHandler(req as any, res as any);
});

// 6. Consulta Pública Segura de Promociones y Cupones Activos (Fase 2 Parte 2)
app.all('/api/promotions/active', (req: Request, res: Response) => {
  activePromotionsHandler(req as any, res as any);
});

// 7. Chatbot de Atención Inteligente Multi-Tenant (Google Generative AI + Supabase)
app.all('/api/chat', (req: Request, res: Response) => {
  chatHandler(req as any, res as any);
});

// 8. Medición y Métricas Comerciales Centralizadas (Módulo 7 Persistente)
app.all('/api/commercial/events', (req: Request, res: Response) => {
  commercialEventsHandler(req as any, res as any);
});

app.all('/api/commercial/metrics', (req: Request, res: Response) => {
  commercialMetricsHandler(req as any, res as any);
});

// ----------------------------------------------------------------------------
// SEO DINÁMICO PARA TIENDAS PÚBLICAS (/tienda/:slug)
// ----------------------------------------------------------------------------

interface PublicStoreHtmlResult {
  status: 200 | 404 | 503;
  html: string;
}

async function renderPublicStoreHtml(
  slug: string,
  indexHtml: string
): Promise<PublicStoreHtmlResult> {
  try {
    const metadata = await fetchPublicStoreSeoMetadata(slug);

    if (!metadata) {
      return {
        status: 404,
        html: injectStoreSeoFailureMetadata(indexHtml, 'not_found'),
      };
    }

    return {
      status: 200,
      html: injectStoreSeoMetadata(indexHtml, metadata),
    };
  } catch (error) {
    console.error('[MAXINEGO SEO] No se pudieron cargar los metadatos de la tienda:', error);
    return {
      status: 503,
      html: injectStoreSeoFailureMetadata(indexHtml, 'query_error'),
    };
  }
}

function sendPublicStoreHtml(res: Response, result: PublicStoreHtmlResult): void {
  if (result.status !== 200) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  res.status(result.status).type('html').send(result.html);
}

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE VITE / PRODUCCIÓN
// ----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Inyección de SEO dinámico en modo desarrollo antes de Vite
    app.get('/tienda/:slug', async (req: Request, res: Response, next) => {
      try {
        const sourceHtml = await readFile(path.join(process.cwd(), 'index.html'), 'utf8');
        const transformedHtml = await vite.transformIndexHtml(req.originalUrl, sourceHtml);
        const result = await renderPublicStoreHtml(req.params.slug, transformedHtml);
        sendPublicStoreHtml(res, result);
      } catch (error) {
        next(error);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Inyección de SEO dinámico en modo producción
    app.get('/tienda/:slug', async (req: Request, res: Response, next) => {
      try {
        const indexHtml = await readFile(path.join(distPath, 'index.html'), 'utf8');
        const result = await renderPublicStoreHtml(req.params.slug, indexHtml);
        sendPublicStoreHtml(res, result);
      } catch (error) {
        next(error);
      }
    });

    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Sincronización duradera inicial de métricas comerciales con Supabase Storage
  try {
    await syncWithCloudStorage();
    console.log('[CentralBo Server] Métricas comerciales sincronizadas con Supabase Cloud Storage');
  } catch (err) {
    console.warn('[CentralBo Server] Sincronización inicial de métricas:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CentralBo Server] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
