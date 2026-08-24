import React, { useState, useEffect } from 'react';
import { HERO_BANNERS, BannerConfig } from '../data/gamesConfig';
import { Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface BannerCarouselProps {
  onSelectGame: (gameName: string) => void;
  onOpenDeposit: () => void;
}

export default function BannerCarousel({ onSelectGame, onOpenDeposit }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % HERO_BANNERS.length);
  };

  const handleBannerAction = (b: BannerConfig) => {
    if (b.actionType === 'deposit') {
      onOpenDeposit();
    } else {
      onSelectGame(b.gameId || b.title);
    }
  };

  return (
    <div className="w-full relative px-3 pt-2 select-none">
      {/* Perfectly proportioned Modern Casino Hero Banner */}
      <div className="relative w-full aspect-[2.4/1] sm:aspect-[2.8/1] min-h-[135px] max-h-[155px] rounded-xl overflow-hidden border border-[#1e2c47] hover:border-amber-400/60 bg-[#080e1a] shadow-lg group cursor-pointer">
        
        {/* Carousel Slide Items */}
        {HERO_BANNERS.map((b, idx) => (
          <div
            key={b.id}
            onClick={() => handleBannerAction(b)}
            className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
              idx === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            {/* Background Artwork Image - Clean and Visible */}
            <img
              src={b.image}
              alt={b.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-95 group-hover:scale-102 transition-transform duration-500"
            />
            
            {/* Minimal Corner Gradient to Ensure High Text Readability Without Obscuring Art */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />

            {/* Top Badge Tag */}
            <div className="absolute top-2 left-2.5 z-20">
              <span className="bg-gradient-to-b from-[#fff6be] via-[#f7b700] to-[#8f5a00] border border-[#fffde0] text-black font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center gap-1 tracking-wider">
                <Sparkles className="w-2.5 h-2.5 fill-black stroke-black animate-pulse" />
                {b.badge}
              </span>
            </div>

            {/* Compact Bottom Content Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-end justify-between gap-2">
              
              {/* Concise Title & Subtitle */}
              <div className="flex-1 min-w-0 pr-1">
                <h2 className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.98)] leading-tight uppercase font-sans tracking-wide truncate">
                  {b.title}
                </h2>
                <p className="text-[10px] sm:text-xs text-amber-200/90 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate mt-0.5">
                  {b.subtitle}
                </p>
              </div>

              {/* Crisp High-Contrast CTA Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBannerAction(b);
                }}
                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Zap className="w-3 h-3 fill-black stroke-black" />
                <span>{b.ctaText}</span>
              </button>

            </div>
          </div>
        ))}

        {/* Subtle Arrow Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-black/80 border border-amber-500/50 text-amber-300 rounded-full hover:bg-amber-500 hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 p-1.5 bg-black/80 border border-amber-500/50 text-amber-300 rounded-full hover:bg-amber-500 hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-lg"
          aria-label="Próximo"
        >
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Clean Pagination Dots */}
        <div className="absolute top-2.5 right-3 z-30 flex justify-end items-center gap-1">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-4 bg-amber-400 shadow-[0_0_8px_#ffd700]'
                  : 'w-1.5 bg-zinc-600/80 hover:bg-zinc-400'
              }`}
              aria-label={`Ir para banner ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
