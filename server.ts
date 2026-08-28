import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  createSyncPayPixDeposit,
  requestSyncPayWithdrawal,
  checkSyncPayTransactionStatus,
  pendingTransactions,
} from './src/lib/syncpay';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'VegasBet SyncPay API', timestamp: new Date().toISOString() });
  });

  // 1. SyncPay Deposit Endpoint
  app.post('/api/syncpay/deposit', async (req, res) => {
    try {
      const { amount, clientName, clientCpf, clientEmail, externalId } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: 'Valor de depósito inválido.' });
      }

      const result = await createSyncPayPixDeposit({
        amount: Number(amount),
        clientName: clientName || 'Jogador VegasBet',
        clientCpf,
        clientEmail,
        externalId,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error in /api/syncpay/deposit:', error);
      return res.status(500).json({ success: false, error: error.message || 'Erro ao comunicar com SyncPay.' });
    }
  });

  // 2. SyncPay Withdrawal Endpoint
  app.post('/api/syncpay/withdraw', async (req, res) => {
    try {
      const { amount, pixKey, pixKeyType, clientName, clientCpf } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: 'Valor de saque inválido.' });
      }
      if (!pixKey) {
        return res.status(400).json({ success: false, error: 'Chave PIX é obrigatória.' });
      }

      const result = await requestSyncPayWithdrawal({
        amount: Number(amount),
        pixKey,
        pixKeyType: pixKeyType || 'CPF',
        clientName: clientName || 'Jogador VegasBet',
        clientCpf: clientCpf || '000.000.000-00',
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error in /api/syncpay/withdraw:', error);
      return res.status(500).json({ success: false, error: error.message || 'Erro ao processar saque SyncPay.' });
    }
  });

  // 3. SyncPay Check Transaction Status
  app.get('/api/syncpay/check-pix/:id', async (req, res) => {
    const { id } = req.params;
    const tx = pendingTransactions.get(id);

    // Query live status from SyncPayments API
    const liveStatus = await checkSyncPayTransactionStatus(id);
    if (liveStatus === 'PAID') {
      if (tx) {
        tx.status = 'PAID';
        pendingTransactions.set(id, tx);
      }
      return res.json({
        success: true,
        transactionId: id,
        status: 'PAID',
        amount: tx?.amount,
        createdAt: tx?.createdAt,
      });
    }

    if (!tx) {
      return res.json({ success: true, transactionId: id, status: liveStatus });
    }

    return res.json({
      success: true,
      transactionId: id,
      status: tx.status,
      amount: tx.amount,
      createdAt: tx.createdAt,
    });
  });

  // 4. Simulate Payment Completion for testing in UI
  app.post('/api/syncpay/simulate-pay', (req, res) => {
    const { transactionId } = req.body;
    if (transactionId && pendingTransactions.has(transactionId)) {
      const tx = pendingTransactions.get(transactionId)!;
      tx.status = 'PAID';
      pendingTransactions.set(transactionId, tx);
    }
    return res.json({ success: true, status: 'PAID', message: 'Pagamento marcado como concluído no SyncPay!' });
  });

  // 5. SyncPay & Astrofy Webhook Handlers (Postback callbacks)
  const handlePaymentWebhook = (req: express.Request, res: express.Response) => {
    try {
      const event = req.body || {};
      console.log('SyncPay/Astrofy Webhook Received at', req.path, ':', JSON.stringify(event));

      const txId = event.external_id || event.id || event.transaction_id || event.data?.id || event.data?.external_id || event.reference_id || event.pix_id;
      const rawStatus = (event.status || event.event || event.type || event.data?.status || '').toString().toUpperCase();

      const isPaid = 
        rawStatus === 'PAID' || 
        rawStatus === 'COMPLETED' || 
        rawStatus === 'APPROVED' || 
        rawStatus === 'CONFIRMED' || 
        rawStatus === 'SUBSCRIPTION-ACTIVATED' ||
        rawStatus === 'SUBSCRIPTION-RENEWED' ||
        rawStatus === 'PAYMENT_RECEIVED' ||
        rawStatus.includes('PAID') ||
        rawStatus.includes('APPROVED');

      if (txId && pendingTransactions.has(txId)) {
        if (isPaid) {
          const tx = pendingTransactions.get(txId)!;
          tx.status = 'PAID';
          pendingTransactions.set(txId, tx);
          console.log(`[SyncPay/Astrofy] Transaction ${txId} marked as PAID via webhook.`);
        }
      }

      return res.json({ received: true, success: true, status: 'PROCESSED' });
    } catch (err: any) {
      console.error('Webhook Error:', err);
      return res.status(400).json({ error: 'Webhook processing failed', details: err.message });
    }
  };

  // Support all common webhook routes (SyncPay, Astrofy, etc.)
  app.post('/api/syncpay/webhook', handlePaymentWebhook);
  app.post('/api/syncpay/webhook/subscription-activated', handlePaymentWebhook);
  app.post('/api/syncpay/webhook/subscription-renewed', handlePaymentWebhook);
  app.post('/webhook/syncpayment', handlePaymentWebhook);
  app.post('/webhook/syncpayment/subscription-activated', handlePaymentWebhook);
  app.post('/webhook/syncpayment/subscription-renewed', handlePaymentWebhook);


  // 6. Get SyncPay Gateway Status
  app.get('/api/syncpay/config', (req, res) => {
    const clientId = process.env.SYNCPAY_CLIENT_ID || process.env.SYSPAY_CLIENT_KEY || '296fd6ea-0a24-45a6-a882-fd2a75edbe55';
    const clientSecret = process.env.SYNCPAY_CLIENT_SECRET || process.env.SYSPAY_RECEIVE_KEY || '79bf01e5-6a6d-481a-ad15-5e7b89170efb';
    const apiUrl = process.env.SYNCPAY_API_URL || process.env.SYSPAY_API_URL || 'https://api.syncpay.com.br';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    res.json({
      configured: true,
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      clientIdMasked: clientId ? `${clientId.slice(0, 8)}...${clientId.slice(-6)}` : '',
      clientSecretMasked: clientSecret ? `${clientSecret.slice(0, 8)}...${clientSecret.slice(-6)}` : '',
      apiUrl,
      gateway: 'API da Sync (SyncPay)',
      webhookUrl: `${appUrl}/api/syncpay/webhook`,
      environment: 'SyncPay Produção Ativo',
      activeProfiles: [
        { client: 'futurobet (Vendas/Cobrança)', clientId: '296fd6ea-0a24-45a6-a882-fd2a75edbe55', active: true },
        { client: 'futurobet (PIX)', clientId: '36adf56b-e3f6-4319-b10b-e1347e62eafd', active: true },
        { client: 'futurobet (Webhook)', clientId: '3d0717fe-95a1-4b39-a5cc-9cbd8a9dd244', active: true },
        { client: 'Future', clientId: 'ba94c956-585b-4873-92d2-5b669ab07e8e', active: true },
      ]
    });
  });

  // 7. Football Data API Proxy Endpoint (football-data.org) & 20-min Automatic Background Engine
  const FOOTBALL_TOKEN = process.env.FOOTBALL_DATA_API_KEY || '66a8c0db0996416795b19e9e17cb5c4f';
  let matchesCache: { data: any; timestamp: number } | null = null;
  const SYNC_INTERVAL_MS = 20 * 60 * 1000; // 20 minutes automatic background refresh as requested
  let nextSyncTimestamp = Date.now() + SYNC_INTERVAL_MS;

  // Background fetch helper to keep cache fresh every 20 minutes even if user is not in casino
  const refreshFootballCacheInBackground = async () => {
    try {
      const now = Date.now();
      nextSyncTimestamp = now + SYNC_INTERVAL_MS;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const nextWeekStr = new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Query both general date-range matches, upcoming Brasileirão Série A fixtures, and finished results
      const [resDateRange, resBSA, resPL, resPD, resFinished] = await Promise.all([
        fetch(`https://api.football-data.org/v4/matches?dateFrom=${todayStr}&dateTo=${nextWeekStr}`, {
          headers: { 'X-Auth-Token': FOOTBALL_TOKEN },
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.football-data.org/v4/competitions/BSA/matches?status=SCHEDULED,TIMED,IN_PLAY,PAUSED,FINISHED`, {
          headers: { 'X-Auth-Token': FOOTBALL_TOKEN },
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.football-data.org/v4/competitions/PL/matches?status=SCHEDULED,TIMED,IN_PLAY,PAUSED,FINISHED`, {
          headers: { 'X-Auth-Token': FOOTBALL_TOKEN },
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.football-data.org/v4/competitions/PD/matches?status=SCHEDULED,TIMED,IN_PLAY,PAUSED,FINISHED`, {
          headers: { 'X-Auth-Token': FOOTBALL_TOKEN },
        }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`https://api.football-data.org/v4/matches?status=FINISHED`, {
          headers: { 'X-Auth-Token': FOOTBALL_TOKEN },
        }).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      const map = new Map<number, any>();
      if (resDateRange?.matches && Array.isArray(resDateRange.matches)) {
        resDateRange.matches.forEach((m: any) => map.set(m.id, m));
      }
      if (resBSA?.matches && Array.isArray(resBSA.matches)) {
        resBSA.matches.forEach((m: any) => map.set(m.id, m));
      }
      if (resPL?.matches && Array.isArray(resPL.matches)) {
        resPL.matches.slice(0, 30).forEach((m: any) => map.set(m.id, m));
      }
      if (resPD?.matches && Array.isArray(resPD.matches)) {
        resPD.matches.slice(0, 30).forEach((m: any) => map.set(m.id, m));
      }
      if (resFinished?.matches && Array.isArray(resFinished.matches)) {
        resFinished.matches.slice(0, 20).forEach((m: any) => map.set(m.id, m));
      }

      const combinedMatches = Array.from(map.values()).filter((m: any) => {
        if (m.status === 'AWARDED' || m.status === 'CANCELLED' || m.status === 'POSTPONED') {
          return false;
        }
        return Boolean(m.homeTeam && m.awayTeam);
      });

      if (combinedMatches.length > 0) {
        matchesCache = { data: { matches: combinedMatches }, timestamp: Date.now() };
        console.log(`[Football Sync 20min] Background update completed. ${combinedMatches.length} 100% REAL active/upcoming matches stored.`);
      }
    } catch (e) {
      console.warn('[Football API] Background 20-min sync error:', e);
    }
  };

  // 8. Basketball API (TheSportsDB v1 NBA endpoint 4387)
  let basketballCache: { data: any; timestamp: number } | null = null;
  const refreshBasketballCache = async () => {
    try {
      const [resNext, resPast] = await Promise.all([
        fetch('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4387')
          .then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4387')
          .then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      const events: any[] = [];
      if (resNext?.events && Array.isArray(resNext.events)) {
        events.push(...resNext.events);
      }
      if (resPast?.events && Array.isArray(resPast.events)) {
        events.push(...resPast.events.slice(0, 10));
      }

      basketballCache = {
        data: { events },
        timestamp: Date.now(),
      };
      console.log(`[Basketball Sync] Updated. ${events.length} NBA games fetched.`);
    } catch (e) {
      console.warn('[Basketball API] Sync warning:', e);
    }
  };

  // 9. MMA / UFC API (TheSportsDB v1 UFC endpoint 4443)
  let mmaCache: { data: any; timestamp: number } | null = null;
  const refreshMmaCache = async () => {
    try {
      const [resNext, resPast] = await Promise.all([
        fetch('https://www.thesportsdb.com/api/v1/json/123/eventsnextleague.php?id=4443')
          .then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('https://www.thesportsdb.com/api/v1/json/123/eventspastleague.php?id=4443')
          .then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      const events: any[] = [];
      if (resNext?.events && Array.isArray(resNext.events)) {
        events.push(...resNext.events);
      }
      if (resPast?.events && Array.isArray(resPast.events)) {
        events.push(...resPast.events.slice(0, 10));
      }

      mmaCache = {
        data: { events },
        timestamp: Date.now(),
      };
      console.log(`[MMA Sync] Updated. ${events.length} UFC fight events fetched.`);
    } catch (e) {
      console.warn('[MMA API] Sync warning:', e);
    }
  };

  // Initial warmup
  refreshFootballCacheInBackground();
  refreshBasketballCache();
  refreshMmaCache();

  // Set automated 20-minute recurring schedule
  setInterval(() => {
    refreshFootballCacheInBackground();
    refreshBasketballCache();
    refreshMmaCache();
  }, SYNC_INTERVAL_MS);

  // Basketball Endpoint
  app.get('/api/sports/basketball', async (req, res) => {
    try {
      const now = Date.now();
      if (!basketballCache || now - basketballCache.timestamp > SYNC_INTERVAL_MS) {
        await refreshBasketballCache();
      }
      return res.json({
        success: true,
        source: 'thesportsdb_v1',
        lastSync: basketballCache?.timestamp || now,
        events: basketballCache?.data?.events || [],
      });
    } catch (error: any) {
      return res.json({ success: false, events: [], error: error.message });
    }
  });

  // MMA Endpoint
  app.get('/api/sports/mma', async (req, res) => {
    try {
      const now = Date.now();
      if (!mmaCache || now - mmaCache.timestamp > SYNC_INTERVAL_MS) {
        await refreshMmaCache();
      }
      return res.json({
        success: true,
        source: 'thesportsdb_v1',
        lastSync: mmaCache?.timestamp || now,
        events: mmaCache?.data?.events || [],
      });
    } catch (error: any) {
      return res.json({ success: false, events: [], error: error.message });
    }
  });

  // Sync status endpoint
  app.get('/api/football/sync-status', (req, res) => {
    res.json({
      success: true,
      lastSync: matchesCache ? new Date(matchesCache.timestamp).toISOString() : null,
      nextSync: new Date(nextSyncTimestamp).toISOString(),
      syncIntervalMinutes: 20,
      totalMatches: matchesCache?.data?.matches?.length || 0,
      serverTime: new Date().toISOString()
    });
  });

  app.get('/api/football/matches', async (req, res) => {
    try {
      const now = Date.now();
      if (matchesCache && now - matchesCache.timestamp < SYNC_INTERVAL_MS && matchesCache.data.matches?.length > 0) {
        return res.json({ 
          success: true, 
          source: 'cache_20min', 
          lastSync: matchesCache.timestamp,
          nextSync: nextSyncTimestamp,
          ...matchesCache.data 
        });
      }

      await refreshFootballCacheInBackground();

      if (matchesCache && matchesCache.data.matches?.length > 0) {
        return res.json({ 
          success: true, 
          source: 'live_api', 
          lastSync: matchesCache.timestamp,
          nextSync: nextSyncTimestamp,
          ...matchesCache.data 
        });
      }

      return res.status(200).json({ success: true, matches: [], source: 'empty' });
    } catch (error: any) {
      console.error('Error in /api/football/matches:', error);
      if (matchesCache) {
        return res.json({ success: true, source: 'cache_error_fallback', ...matchesCache.data });
      }
      return res.status(500).json({ success: false, error: error.message || 'Erro de conexão com servidor de futebol.' });
    }
  });

  // 8. AI Support Assistant Endpoint (Gemini 3.7 Flash)
  let googleGenAIClient: GoogleGenAI | null = null;
  const getAIClient = (): GoogleGenAI | null => {
    if (!googleGenAIClient && process.env.GEMINI_API_KEY) {
      try {
        googleGenAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } catch (e) {
        console.warn('GoogleGenAI failed to initialize:', e);
      }
    }
    return googleGenAIClient;
  };

  app.post('/api/support/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Mensagem inválida.' });
      }

      const client = getAIClient();
      if (!client) {
        // Return structured knowledge fallback
        return res.json({ 
          success: true, 
          reply: null, 
          source: 'local_fallback',
          note: 'Using local intelligent support engine' 
        });
      }

      const systemInstruction = `Você é a Ana, a Especialista Oficial e Assistente Inteligente de Suporte da FuturoBet (futurobet.vip).

SEU PAPEL E REGRAS:
1. ESCOPO PERMITIDO: Você responde com clareza, cordialidade e rapidez sobre o funcionamento geral da FuturoBet:
   - REGRAS GERAIS DOS JOGOS: Como funcionam os caça-níqueis (slots), cassino ao vivo, roleta, jogos crash e apostas esportivas em geral, de forma neutra sem fixar ou inventar catálogo fixo de um único jogo.
   - REGRAS DE DEPÓSITOS PIX: Mínimo R$ 5,00, crédito instantâneo em menos de 10 segundos, automático e sem taxas.
   - REGRAS DE SAQUES PIX: Disponível 24 horas por dia, 7 dias por semana, sem taxas, pagamento instantâneo para a conta bancária do titular.
   - BÔNUS E PROMOÇÕES: Super Bônus de 50% em Esportes, Comissão de 5% Vitalícia no Convide & Ganhe e Roda da Fortuna diária.

2. REGRA DE OURO SOBRE FORMATAÇÃO:
   - NUNCA use asteriscos (*) ou duplos asteriscos (**) para destacar palavras em negrito. Escreva sempre em texto simples e limpo com quebras de linha normais.

3. REGRA DE OURO SOBRE ERROS E TRAVAMENTOS:
   - Se o usuário relatar qualquer ERRO no cassino (ex: jogo travou, tela congelou, saldo não subiu, problema no PIX do banco ou verificação de conta), responda diretamente:
     "Para qualquer erro no jogo, travamento ou ajuste de saldo na sua conta, o atendimento é realizado exclusivamente pelo Suporte Humano (ADM) no botão verde de WhatsApp localizado logo abaixo. Eles verificam os logs do servidor na mesma hora!"

4. RESTRIÇÕES:
   - NÃO dê palpites, dicas de apostas, previsões milagrosas ou "hacks".
   - NÃO responda sobre programação ou código-fonte.
   - Mantenha respostas diretas, sem enrolação e em português do Brasil.`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.role === 'user' || h.role === 'model' || h.role === 'assistant') {
            contents.push({
              role: h.role === 'assistant' ? 'model' : h.role,
              parts: [{ text: h.text || h.content || '' }]
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      let replyText: string | null = null;
      const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'];

      for (const modelName of modelsToTry) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });

          if (response && response.text) {
            replyText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} call failed, trying next fallback:`, modelErr?.message || modelErr);
        }
      }

      if (replyText) {
        const cleanedReply = replyText.replace(/\*\*/g, '').replace(/\*/g, '');
        return res.json({ success: true, reply: cleanedReply, source: 'gemini' });
      }

      // If all external AI models are temporarily overloaded, gracefully return fallback
      return res.json({ 
        success: true, 
        reply: null, 
        source: 'local_fallback',
        note: 'AI service busy, client will provide instant humanized local response' 
      });
    } catch (error: any) {
      console.warn('Support Chat AI Endpoint handled gracefully:', error?.message || error);
      return res.json({ 
        success: true, 
        reply: null, 
        source: 'error_fallback'
      });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
