import React from 'react';
import { 
  Headphones, 
  Layers, 
  Trophy, 
  Crown, 
  Sparkles,
  Zap
} from 'lucide-react';

export type NavTab = 'cassino' | 'futebol' | 'promocoes' | 'suporte';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
}

export default function BottomNav({ currentTab, onTabChange, onOpenDeposit, onOpenWithdraw }: BottomNavProps) {
  const navItems = [
    { 
      id: 'suporte' as NavTab, 
      label: 'Suporte', 
      icon: Headphones 
    },
    { 
      id: 'cassino' as NavTab, 
      label: 'Cassino', 
      icon: Layers 
    },
    { 
      id: 'futebol' as NavTab, 
      label: 'Esportes', 
      icon: Trophy 
    },
    { 
      id: 'promocoes' as NavTab, 
      label: 'Futuro', 
      icon: Crown 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#070d18]/95 backdrop-blur-md border-t border-slate-800/90 px-2.5 py-2 z-40 shadow-[0_-10px_35px_rgba(0,0,0,0.95)] select-none flex items-center justify-between">
      
      {/* Navigation Items (Menu, Cassino, Esportes, Área VIP) */}
      <div className="flex items-center justify-around flex-1 mr-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer group active:scale-95 ${
                isActive 
                  ? 'text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive 
                      ? 'text-amber-400 scale-110' 
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </div>
              <span 
                className={`text-[10.5px] mt-0.5 font-medium tracking-tight transition-colors ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Button: Carteira (Depositar & Sacar) */}
      <button
        onClick={onOpenDeposit}
        className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-200 text-[#0a0702] font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-[0_0_20px_rgba(251,191,36,0.45),inset_0_1px_2px_rgba(255,255,255,0.8)] hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer shrink-0 border border-amber-200/90 select-none"
        title="Abrir Carteira (Depósito e Saque PIX)"
      >
        <Zap className="w-3.5 h-3.5 fill-[#0a0702] stroke-[#0a0702]" />
        <span className="tracking-wide font-sans font-black">Carteira</span>
      </button>

    </nav>
  );
}
