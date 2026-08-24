import React from 'react';
import { Flame, Gamepad2, Tv, Bomb, Gift, LayoutGrid } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryNav({ selectedCategory, onSelectCategory }: CategoryNavProps) {
  const categories = [
    { id: 'Todos', label: 'Todos os Jogos', icon: LayoutGrid },
    { id: 'Slots', label: 'Slots PG', icon: Flame },
    { id: 'Ao Vivo', label: 'Cassino Ao Vivo', icon: Tv },
    { id: 'Mines', label: 'Crash & Mines', icon: Bomb },
    { id: 'Novos', label: 'Lançamentos', icon: Gamepad2 },
    { id: 'Bônus', label: 'Promoções', icon: Gift },
  ];

  return (
    <div className="w-full px-3 pt-2.5 select-none">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 cursor-pointer border shrink-0 ${
                isActive
                  ? 'bg-amber-400 text-black font-black border-amber-300 shadow-sm'
                  : 'bg-[#0b1220] hover:bg-[#121c30] text-slate-300 hover:text-white border-[#1b2844]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black stroke-[2.5]' : 'text-amber-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
