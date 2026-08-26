// Vercel Serverless Function for Football API
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = process.env.FOOTBALL_DATA_API_KEY || 
    process.env.CHAVE_API_DE_DADOS_DE_FUTEBOL || 
    process.env.VITE_FOOTBALL_DATA_API_KEY || 
    '';

  try {
    const headers: Record<string, string> = {};
    if (API_KEY) {
      headers['X-Auth-Token'] = API_KEY;
    }

    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 7);

    const dateFrom = pastDate.toISOString().split('T')[0];
    const dateTo = futureDate.toISOString().split('T')[0];

    // Fetch live & upcoming matches
    const url = `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      // Also try fetching specific popular competitions
      const fallbackUrl = `https://api.football-data.org/v4/competitions/BSA/matches?status=SCHEDULED,IN_PLAY,PAUSED,FINISHED`;
      const fallbackRes = await fetch(fallbackUrl, { headers });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return res.status(200).json({ success: true, matches: data.matches || [] });
      }
      return res.status(200).json({ success: false, error: 'Failed to fetch from provider', matches: [] });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      matches: data.matches || [],
      count: data.matches?.length || 0,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Vercel serverless football error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}

