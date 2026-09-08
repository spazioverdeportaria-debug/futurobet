// Vercel Serverless Function for Admin Login
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { username, password } = req.body || {};
    const validUser = 'copywriter';
    const validPass = process.env.ADMIN_PASSWORD || '3657';

    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (cleanUser === validUser && cleanPass === validPass) {
      const sessionToken = `adm_${crypto.randomBytes(32).toString('hex')}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24h

      return res.status(200).json({
        success: true,
        token: sessionToken,
        expiresAt,
        user: {
          username: 'copywriter',
          role: 'SUPER_ADMIN',
          name: 'Administrador Master',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Usuário ou senha de administrador incorretos.',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro interno ao processar login administrativo.',
    });
  }
}
