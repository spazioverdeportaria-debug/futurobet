// Vercel Serverless Function for System Status & Maintenance
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'FuturoBet Vercel API',
    maintenanceMode: false,
    maintenanceMessage: 'Sistema em Manutenção para Melhorias. Voltamos em instantes!',
    timestamp: new Date().toISOString(),
  });
}
