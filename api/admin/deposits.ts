// Vercel Serverless Function for Admin Moderated Deposits
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Token verification
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Acesso restrito. Faça login como administrador.' });
  }

  return res.status(200).json({
    success: true,
    deposits: [],
    totalPending: 0,
    totalApproved: 0,
  });
}
