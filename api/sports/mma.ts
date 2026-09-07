// Vercel Serverless Function for MMA / UFC matches
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'public, s-maxage=1200, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const [resNext, resPast] = await Promise.all([
      fetch('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4443').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4443').then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    const events: any[] = [];
    if (resNext?.events && Array.isArray(resNext.events)) {
      events.push(...resNext.events);
    }
    if (resPast?.events && Array.isArray(resPast.events)) {
      events.push(...resPast.events.slice(0, 10));
    }

    return res.status(200).json({
      success: true,
      source: 'thesportsdb_v1',
      lastSync: Date.now(),
      events,
    });
  } catch (error: any) {
    return res.status(200).json({ success: false, events: [], error: error.message });
  }
}
