import { getCentralCommercialMetrics } from '../../src/lib/commercialStore.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Solo se admite GET.',
    });
  }

  // Verificación de autorización: Las métricas comerciales globales no deben ser públicas
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado. Las métricas comerciales globales están reservadas a personal administrativo.',
    });
  }

  const metrics = await getCentralCommercialMetrics();

  return res.status(200).json({
    success: true,
    fuente: 'central_maxinego_persistente',
    metricas: metrics,
    timestamp: new Date().toISOString(),
  });
}
