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

    // Fetch popular competitions: Brasileirão Série A, Libertadores, and European leagues
    const [resBSA, resCLI] = await Promise.all([
      fetch(`https://api.football-data.org/v4/competitions/BSA/matches`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`https://api.football-data.org/v4/competitions/CLI/matches`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const rawList: any[] = [
      ...(resBSA?.matches && Array.isArray(resBSA.matches) ? resBSA.matches : []),
      ...(resCLI?.matches && Array.isArray(resCLI.matches) ? resCLI.matches : []),
    ];

    const nowTime = Date.now();
    const pastWindow = nowTime - (7 * 24 * 60 * 60 * 1000);
    const futureWindow = nowTime + (21 * 24 * 60 * 60 * 1000);

    const matches: any[] = [];
    const map = new Map<number, any>();

    for (const m of rawList) {
      if (!m.homeTeam?.name || !m.awayTeam?.name) continue;
      if (m.status === 'AWARDED' || m.status === 'CANCELLED' || m.status === 'POSTPONED') continue;

      let kickoffStr = m.utcDate;
      let computedStatus = m.status;
      if (m.status && /^\d{4}-\d{2}-\d{2}/.test(m.status)) {
        kickoffStr = m.status.replace(' ', 'T');
        computedStatus = 'TIMED';
      }

      const kickoff = new Date(kickoffStr).getTime();
      if (isNaN(kickoff)) continue;

      const isLive = computedStatus === 'IN_PLAY' || computedStatus === 'PAUSED' || (computedStatus !== 'FINISHED' && nowTime >= kickoff && nowTime <= kickoff + (115 * 60 * 1000));
      if (isLive && computedStatus !== 'PAUSED') {
        computedStatus = 'IN_PLAY';
      }

      const isFinished = computedStatus === 'FINISHED';

      if (isLive || (kickoff >= nowTime - (2 * 3600 * 1000) && kickoff <= futureWindow) || (isFinished && kickoff >= pastWindow)) {
        m.actualUtcDate = kickoffStr;
        m.status = computedStatus;
        if (!map.has(m.id)) {
          map.set(m.id, m);
          matches.push(m);
        }
      }
    }

    return res.status(200).json({
      success: true,
      matches,
      count: matches.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    console.error('Vercel serverless football error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
}

