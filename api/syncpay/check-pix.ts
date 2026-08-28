// Vercel Serverless Function for SyncPayments PIX Status Check
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query?.id || req.query?.identifier || '';

  if (!id) {
    return res.status(400).json({ status: 'PENDING', error: 'Missing transaction ID' });
  }

  try {
    const host = 'https://api.syncpayments.com.br';
    const authRes = await fetch(`${host}/api/partner/v1/auth-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SYNCPAY_CLIENT_ID || '36adf56b-e3f6-4319-b10b-e1347e62eafd',
        client_secret: process.env.SYNCPAY_CLIENT_SECRET || '8240be3d-2c32-4f78-8e71-6a2d0d523abc',
      }),
    });

    if (authRes.ok) {
      const authData = await authRes.json();
      const token = authData.access_token || authData.token;
      if (token) {
        const statusRes = await fetch(`${host}/api/partner/v1/transaction/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const rawStatus = (statusData.status || statusData.data?.status || '').toUpperCase();
          if (['PAID', 'COMPLETED', 'CONFIRMED', 'SETTLED', 'SUCCESS'].includes(rawStatus)) {
            return res.status(200).json({ status: 'PAID', transactionId: id });
          }
          if (['FAILED', 'CANCELED', 'REFUNDED', 'EXPIRED'].includes(rawStatus)) {
            return res.status(200).json({ status: 'FAILED', transactionId: id });
          }
        }
      }
    }

    return res.status(200).json({ status: 'PENDING', transactionId: id });
  } catch (err: any) {
    return res.status(200).json({ status: 'PENDING', transactionId: id });
  }
}
