// Vercel Serverless Function for SyncPayments PIX Deposit
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { amount, clientName, clientCpf, clientEmail } = req.body || {};
    const numAmount = parseFloat(amount);

    if (!numAmount || isNaN(numAmount) || numAmount < 20) {
      return res.status(400).json({ success: false, error: 'Valor mínimo de depósito é R$ 20,00' });
    }

    const host = 'https://api.syncpayments.com.br';
    const pairs = [
      {
        clientId: process.env.SYNCPAY_CLIENT_ID || '36adf56b-e3f6-4319-b10b-e1347e62eafd',
        clientSecret: process.env.SYNCPAY_CLIENT_SECRET || '8240be3d-2c32-4f78-8e71-6a2d0d523abc',
      },
      { clientId: '296fd6ea-0a24-45a6-a882-fd2a75edbe55', clientSecret: '79bf01e5-6a6d-481a-ad15-5e7b89170efb' },
      { clientId: 'ba94c956-585b-4873-92d2-5b669ab07e8e', clientSecret: 'ee03d3f5-ee93-4997-8226-6ad2d001e717' },
      { clientId: '3d0717fe-95a1-4b39-a5cc-9cbd8a9dd244', clientSecret: 'bbaebafa-6306-4ad5-9300-820e41735247' },
    ];

    let accessToken: string | null = null;

    for (const pair of pairs) {
      try {
        const authRes = await fetch(`${host}/api/partner/v1/auth-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            client_id: pair.clientId,
            client_secret: pair.clientSecret,
          }),
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          accessToken = authData.access_token || authData.token;
          if (accessToken) break;
        }
      } catch (e) {
        // Try next
      }
    }

    if (!accessToken) {
      return res.status(500).json({ success: false, error: 'Falha na autenticação com a SyncPayments' });
    }

    const cleanCpf = (clientCpf || '12345678909').replace(/\D/g, '') || '12345678909';
    const cleanName = (clientName || 'Jogador FuturoBet').trim();
    const cleanEmail = (clientEmail || 'cliente@futurobet.com').trim();

    const cashInRes = await fetch(`${host}/api/partner/v1/cash-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        amount: Number(numAmount.toFixed(2)),
        description: `Deposito FuturoBet R$ ${numAmount.toFixed(2)}`,
        client: {
          name: cleanName,
          cpf: cleanCpf,
          email: cleanEmail,
        },
      }),
    });

    const cashInData = await cashInRes.json();
    const pixCode = cashInData.pix_code || cashInData.qrcode || cashInData.emv || cashInData.data?.pix_code;
    const identifier = cashInData.identifier || cashInData.id || `SYNC_${Date.now()}`;

    if (!pixCode) {
      return res.status(502).json({
        success: false,
        error: cashInData.message || 'Não foi possível gerar a chave PIX na SyncPayments',
      });
    }

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(pixCode)}`;

    return res.status(200).json({
      success: true,
      transactionId: identifier,
      amount: numAmount,
      pixCode,
      qrCodeUrl,
      expiresAt: cashInData.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      isSimulated: false,
      status: 'PENDING',
      gatewayMessage: 'PIX oficial gerado com sucesso via API da Sync.',
    });
  } catch (error: any) {
    console.error('Vercel serverless deposit error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Erro interno no servidor' });
  }
}
