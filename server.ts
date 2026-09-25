import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import healthHandler from './api/health.js';
import createStoreOwnerHandler from './api/superadmin/create-store-owner.js';
import createOrderHandler from './api/checkout/create-order.js';
import createAppointmentHandler from './api/appointments/create-appointment.js';
import appointmentAvailabilityHandler from './api/appointments/availability.js';

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
