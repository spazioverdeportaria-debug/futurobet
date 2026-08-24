import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  Headphones,
  Zap,
  UserCheck
} from 'lucide-react';

interface SupportScreenProps {
  onOpenDeposit?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  'Como depositar via PIX?',
  'Como solicitar meu saque?',
  'Como funcionam os bônus?',
  'Regras gerais dos jogos',
  'Comissão Convide & Ganhe',
  'Suporte com atendente'
];

const ANA_AVATAR_URL = 'https://img.magnific.com/free-photo/3d-people-playing-games-gambling-casino_23-2151728709.jpg?semt=ais_hybrid&w=740&q=80';

// Função para limpar qualquer asterisco de negrito da mensagem
function cleanText(text: string): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

export default function SupportScreen({ onOpenDeposit }: SupportScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá! Sou a Ana, especialista de suporte da FuturoBet. 👋\n\nEstou aqui para te ajudar com dúvidas sobre jogos, depósitos via PIX, saques rápidos, bônus e funcionamento da plataforma.\n\nComo posso te ajudar agora?',
      timestamp: 'Agora'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Rolagem suave controlada estritamente dentro da caixa de mensagens do chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleWhatsAppSupport = () => {
    const text = encodeURIComponent('Olá! Preciso de atendimento com o Suporte Humano / ADM da FuturoBet.');
    window.open(`https://wa.me/5511999999999?text=${text}`, '_blank');
  };

  // Motor de Resposta Direto e Limpo da Ana (sem asteriscos e sem especificar jogos pontuais)
  const getAnaDirectResponse = (query: string): string => {
    const q = query.toLowerCase().trim();

    // 1. Relatos de ERRO / TRAVAMENTO / PERDA DE JOGO (Encaminhamento estrito para o Humano/ADM)
    if (
      q.includes('erro') || 
      q.includes('travou') || 
      q.includes('bug') || 
      q.includes('tela preta') || 
      q.includes('congelou') || 
      q.includes('ganhando') || 
      q.includes('perdi') || 
      q.includes('sumiu') || 
      q.includes('bloqueada') ||
      q.includes('humano') ||
      q.includes('adm') ||
      q.includes('falar com pessoa') ||
      q.includes('atendente')
    ) {
      return `⚠️ Erros em jogos ou problemas de conta:\n\nPara conferência de rodadas travadas, erros gráficos ou validação de saldo, o atendimento é realizado diretamente pelo Suporte Humano (ADM).\n\n👉 Basta clicar no botão verde "Falar com Suporte Humano (ADM)" localizado logo abaixo para abrir nosso WhatsApp oficial 24h. O time técnico acessa o log do servidor na mesma hora para você.`;
    }

    // 2. Depósitos PIX
    if (q.includes('depósito') || q.includes('deposito') || q.includes('depositar') || q.includes('pix') || q.includes('colocar dinheiro') || q.includes('recarga') || q.includes('saldo')) {
      return `💳 Como funciona o Depósito PIX:\n\n• Valor mínimo: Apenas R$ 5,00.\n• Tempo de crédito: Instantâneo (cai em menos de 10 segundos).\n• Processamento: 100% automatizado e seguro via SysPay.\n• Passo a passo: Clique no botão amarelo "Depositar", digite o valor, copie a chave PIX Copia e Cola ou escaneie o QR Code no app do seu banco. O saldo entra automaticamente na sua conta assim que você pagar.`;
    }

    // 3. Saques PIX
    if (q.includes('saque') || q.includes('sacar') || q.includes('retirar') || q.includes('receber') || q.includes('lucro')) {
      return `💰 Como funciona o Saque PIX:\n\n• Disponibilidade: 24 horas por dia, 7 dias por semana (inclusive finais de semana e feriados).\n• Chaves aceitas: CPF, E-mail, Telefone ou Chave Aleatória.\n• Taxas: Isento (R$ 0,00 de taxa).\n• Regra: O pagamento é enviado via PIX direto para a conta bancária do mesmo titular cadastrado.`;
    }

    // 4. Bônus e Promoções
    if (q.includes('bônus') || q.includes('bonus') || q.includes('promoção') || q.includes('promocao') || q.includes('50%') || q.includes('vip') || q.includes('convide') || q.includes('comissão') || q.includes('comissao')) {
      return `🎁 Bônus e Vantagens da FuturoBet:\n\n1. Super Bônus de 50% em Esportes: Ganhe 50% extra para apostar nos principais campeonatos de futebol e lutas.\n2. Convide & Ganhe (5% Vitalício): Compartilhe seu link exclusivo disponível na aba Futuro e receba 5% de comissão contínua sobre as apostas dos seus indicados.\n3. Roda da Fortuna Diária: 1 giro gratuito a cada 24 horas com prêmios em dinheiro e giros extras.`;
    }

    // 5. Regras gerais e funcionamento dos jogos
    if (q.includes('jogo') || q.includes('jogos') || q.includes('regras') || q.includes('como jogar') || q.includes('slot') || q.includes('cassino') || q.includes('roleta') || q.includes('crash') || q.includes('esporte') || q.includes('aposta')) {
      return `🎰 Funcionamento e Regras dos Jogos:\n\n• Slots e Caça-níqueis: Gire os rolos combinando símbolos nas linhas de pagamento para obter multiplicadores e rodadas bônus.\n• Cassino Ao Vivo e Roleta: Faça suas apostas em números, cores ou dúzias com dealers em tempo real.\n• Jogos Crash: Acompanhe o multiplicador subir e faça o cash out antes da rodada encerrar.\n• Apostas Esportivas: Escolha seus palpites em futebol, basquete, lutas e muito mais com cotações atualizadas em tempo real.\n• Todos os jogos operam com tecnologia RNG auditada e certificada.`;
    }

    // 6. Saudações
    if (['oi', 'ola', 'olá', 'boa tarde', 'bom dia', 'boa noite', 'opa', 'e ai', 'e aí', 'hello'].includes(q) || q.length <= 3) {
      return `Olá! Sou a Ana. Como posso te ajudar com dúvidas sobre jogos, depósitos, saques ou bônus da FuturoBet?`;
    }

    // 7. Bloqueio de Hacks / Dicas milagrosas
    if (q.includes('dica') || q.includes('como ganhar') || q.includes('hack') || q.includes('sinal') || q.includes('código') || q.includes('programação') || q.includes('desenvolvimento') || q.includes('robô') || q.includes('robo')) {
      return `Como especialista oficial de suporte, informo que todos os jogos da plataforma utilizam gerador de números aleatórios (RNG) certificado e não aceitam métodos externos ou sinais milagrosos.\n\nPosso te ajudar explicando como funcionam as regras, depósitos, saques e promoções da casa!`;
    }

    // Resposta padrão objetiva
    return `Entendi sua dúvida! Sou a Ana, assistente de suporte da FuturoBet. Estou aqui para esclarecer qualquer pergunta sobre o funcionamento dos jogos, depósitos via PIX, saques ou bônus. Se você precisa resolver algum problema técnico específico em sua conta, utilize o botão de Suporte Humano (ADM) logo abaixo.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || inputMessage).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-4)
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      let botReplyText = '';

      if (data && data.success && data.reply) {
        botReplyText = cleanText(data.reply);
      } else {
        botReplyText = cleanText(getAnaDirectResponse(msg));
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

    } catch (e) {
      clearTimeout(timeoutId);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: cleanText(getAnaDirectResponse(msg)),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3.5 pt-1 pb-24 flex flex-col font-sans">
      
      {/* 👤 CABEÇALHO COM AVATAR DA ANA */}
      <div className="flex items-center justify-between py-2.5 px-1 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={ANA_AVATAR_URL} 
              alt="Ana Suporte Especialista"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#090e17] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">Ana</h1>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap size={10} className="fill-amber-300" />
                Suporte Especialista
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dúvidas sobre jogos, depósitos, saques e promoções
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([
            {
              id: 'welcome',
              sender: 'bot',
              text: 'Histórico reiniciado! Sou a Ana. Como posso te ajudar com suas dúvidas sobre a FuturoBet agora?',
              timestamp: 'Agora'
            }
          ])}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/60 transition cursor-pointer"
          title="Reiniciar chat"
        >
          <RotateCcw size={13} />
          <span className="hidden sm:inline">Nova conversa</span>
        </button>
      </div>

      {/* 💬 ÁREA DE CONVERSA COM CONTAINER COM ROLAGEM DEDICADA */}
      <div 
        ref={chatContainerRef}
        className="space-y-4 py-2 overflow-y-auto max-h-[460px] min-h-[280px] pr-1 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 text-sm ${isBot ? 'justify-start' : 'justify-end'} animate-in fade-in duration-150`}
            >
              {isBot && (
                <img 
                  src={ANA_AVATAR_URL} 
                  alt="Ana Avatar"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-xl object-cover border border-amber-400/50 mt-1 shrink-0 shadow-sm"
                />
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 space-y-1.5 relative group shadow-md transition-all ${
                  isBot
                    ? 'bg-[#0f172a] text-slate-100 border border-slate-800/90 rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black font-medium rounded-tr-sm'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed text-[13.5px] break-words">
                  {msg.text}
                </div>
                
                <div className={`flex items-center justify-between text-[10px] pt-1 ${isBot ? 'text-slate-400' : 'text-black/70 font-semibold'}`}>
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <button
                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-amber-300 cursor-pointer ml-2 flex items-center gap-1"
                      title="Copiar texto"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span className="text-[10px]">Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-7 h-7 rounded-xl bg-amber-400 text-black flex items-center justify-center shrink-0 font-black text-xs mt-1 shadow-sm">
                  EU
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-center">
            <img 
              src={ANA_AVATAR_URL} 
              alt="Ana Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-xl object-cover border border-amber-400/50 shrink-0"
            />
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-400 ml-1">Ana respondendo...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 💡 SUGESTÕES RÁPIDAS (CARROSSEL) */}
      <div className="py-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(suggestion)}
              className="text-xs font-medium text-slate-300 hover:text-amber-300 bg-[#0d1424] hover:bg-[#131d33] border border-slate-800 hover:border-amber-400/40 px-3.5 py-1.5 rounded-full whitespace-nowrap transition active:scale-95 cursor-pointer shrink-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* ✍️ CAMPO DE INPUT DIRETO */}
      <div className="rounded-2xl bg-[#09101d] border border-slate-800 focus-within:border-amber-400/70 p-2 shadow-xl transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pergunte à Ana sobre jogos, depósitos, saques..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none leading-normal"
          />
          
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-400 hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 text-black flex items-center justify-center font-bold transition shadow-md active:scale-95 cursor-pointer shrink-0"
            title="Enviar mensagem"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* 🟢 BOTÃO DE SUPORTE HUMANO (ADM) POSICIONADO ABAIXO DA IA */}
      <div className="mt-3.5 pt-1">
        <button
          onClick={handleWhatsAppSupport}
          className="w-full rounded-2xl bg-gradient-to-r from-[#0d3b20] via-[#092b17] to-[#05180d] border border-emerald-500/40 hover:border-emerald-400 p-3.5 shadow-lg flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-black flex items-center justify-center shadow-[0_0_15px_rgba(37,211,102,0.35)] shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle size={22} className="fill-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  A IA não resolveu? Falar com Suporte Humano (ADM)
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Para erros em jogos, travamentos ou verificação de conta no WhatsApp 24h
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
            <ArrowUpRight size={16} />
          </div>
        </button>
      </div>

      {/* 🛡️ RODA-PÉ DISCRETO */}
      <div className="text-center text-[11px] text-slate-500 pt-3 flex items-center justify-center gap-1.5">
        <ShieldCheck size={13} className="text-emerald-400" />
        <span>FuturoBet Oficial • Atendimento e Segurança 24/7</span>
      </div>

    </div>
  );
}
