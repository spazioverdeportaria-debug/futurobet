import React, { useState } from 'react';
import { GameConfig } from '../data/gamesConfig';
import { Play, Sparkles } from 'lucide-react';

interface GameCardProps {
  key?: string | number;
  game: GameConfig;
  onSelect: (gameName: string) => void;
}

export default function GameCard({ game, onSelect }: GameCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(game.name)}
      className="group relative bg-[#0d1424] border border-[#1b2942] hover:border-amber-400/80 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-[0_6px_20px_rgba(245,158,11,0.25)] transition-all duration-200 hover:-translate-y-1 select-none flex flex-col"
    >
      {/* Game Artwork Poster (Proporção 3:4 Padrão Internacional de Cassino) */}
      <div className="w-full aspect-[3/4] relative overflow-hidden bg-[#070c18] flex items-center justify-center">
        {!imgError ? (
          <img
            src={game.bgImage}
            alt={game.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          /* Styled Fallback Cover Card if image fails to load */
          <div className="w-full h-full bg-[#0a1120] p-2 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-2xl mb-1 transform group-hover:scale-110 transition-transform duration-300">
              {game.icon}
            </span>
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight line-clamp-2 px-1 z-10 leading-tight">
              {game.name}
            </span>
            <span className="text-[8px] text-slate-400 font-medium uppercase mt-0.5 z-10">
              {game.provider}
            </span>
          </div>
        )}
        
        {/* Subtle Dark Gradient at the bottom for typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c18] via-transparent to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-200 pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute top-1.5 inset-x-1.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
          {/* Micro Badge Tag */}
          {game.badge ? (
            <span
              className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 tracking-tight shrink-0 shadow-sm ${
                game.badge === 'HOT'
                  ? 'bg-amber-400 text-black border-amber-300 font-black'
                  : game.badge === 'NOVO'
                  ? 'bg-emerald-500 text-white border-emerald-400 font-black'
                  : 'bg-[#152238] text-amber-300 border-amber-400/40'
              }`}
            >
              <Sparkles className="w-2 h-2 fill-current" />
              <span>{game.badge}</span>
            </span>
          ) : <div />}

          {/* Multiplier / RTP Mini Pill */}
          {game.multiplier ? (
            <span className="bg-black/85 border border-slate-700/80 text-amber-300 font-bold text-[8px] px-1.5 py-0.5 rounded-md font-mono shrink-0 shadow-sm">
              {game.multiplier}
            </span>
          ) : game.rtp ? (
            <span className="bg-black/85 border border-slate-700/80 text-emerald-400 font-bold text-[7.5px] px-1 py-0.5 rounded-md font-mono shrink-0">
              {game.rtp}
            </span>
          ) : null}
        </div>

        {/* Professional Play Overlay on Hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-[1px] transition-all duration-200">
          <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
          </div>
        </div>

        {/* Bottom Game Name & Provider inside the card */}
        <div className="absolute bottom-0 inset-x-0 p-1.5 z-10 bg-gradient-to-t from-[#060a14] via-[#060a14]/90 to-transparent">
          <h4 className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
            {game.name}
          </h4>
          <span className="text-[8.5px] text-slate-400 font-semibold truncate block">
            {game.provider}
          </span>
        </div>
      </div>
    </div>
  );
}
