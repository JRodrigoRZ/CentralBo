import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import healthHandler from './api/health.js';
import createStoreOwnerHandler from './api/superadmin/create-store-owner.js';

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

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DE VITE / PRODUCCIÓN
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CentralBo Server] Servidor activo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
