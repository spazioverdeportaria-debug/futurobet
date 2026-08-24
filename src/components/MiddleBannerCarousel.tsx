import React, { useState, useEffect } from 'react';
import { Gift, Award, ChevronLeft, ChevronRight, Crown, Zap } from 'lucide-react';

interface MiddleBannerCarouselProps {
  onOpenDeposit: () => void;
}

export default function MiddleBannerCarousel({ onOpenDeposit }: MiddleBannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: 'bonus-banner',
      tag: '🎁 BÔNUS 100% PIX',
      title: 'DOBRAMOS SEU PRIMEIRO DEPÓSITO',
      subtitle: 'Deposite R$ 20 e jogue com R$ 40 na hora!',
      buttonText: 'DOBRAR ⚡',
      icon: Gift,
      image: 'https://i.pinimg.com/1200x/d5/a6/6a/d5a66a9e6425636bb7c89537d26af07f.jpg',
    },
    {
      id: 'traditional-games',
      tag: '🔥 SLOTS EM ALTA',
      title: 'SLOTS COM RTP MÁXIMO',
      subtitle: 'Sweet Bonanza, Gates e Sugar Rush com minutos pagantes!',
      buttonText: 'JOGAR 🍭',
      icon: Award,
      image: 'https://i.pinimg.com/1200x/49/b5/94/49b594c29ef556b15a94f46369ae1e46.jpg',
    },
    {
      id: 'jackpot-banner',
      tag: '⚡ SAQUE INSTANTÂNEO',
      title: 'GANHOU? SAQUE EM 10 SEGUNDOS',
      subtitle: 'Pagamento automático via PIX SyncPay 24 horas.',
      buttonText: 'DEPOSITAR 💰',
      icon: Crown,
      image: 'https://i.pinimg.com/1200x/4b/43/9d/4b439db2e26d391346850d1c2dd73ff7.jpg',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full my-3 px-3 select-none">
      {/* Modern Casino Middle Banner Container */}
      <div className="relative w-full aspect-[2.4/1] sm:aspect-[2.8/1] min-h-[135px] max-h-[155px] rounded-xl overflow-hidden border border-[#1e2c47] hover:border-amber-400/60 bg-[#080e1a] shadow-md group cursor-pointer" onClick={onOpenDeposit}>
        {slides.map((slide, idx) => {
          const Icon = slide.icon;
          const isActive = idx === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
                isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
              }`}
            >
              {/* Clean Visible Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-95 group-hover:scale-102 transition-transform duration-500"
              />
              
              {/* Minimal Dark Gradient for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />

              {/* Top Tag Badge */}
              <div className="absolute top-2 left-2.5 z-20">
                <span className="text-[8.5px] font-black uppercase text-black bg-amber-400 px-2 py-0.5 rounded-md flex items-center gap-1 tracking-tight">
                  <Icon className="w-2.5 h-2.5 fill-black stroke-black" />
                  {slide.tag}
                </span>
              </div>

              {/* Bottom Text & Button Bar */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 flex items-end justify-between gap-2">
                
                {/* Text Area */}
                <div className="flex-1 min-w-0 pr-1">
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase font-sans tracking-wide leading-tight truncate">
                    {slide.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-bold drop-shadow truncate mt-0.5">
                    {slide.subtitle}
                  </p>
                </div>

                {/* Crisp CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDeposit();
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] sm:text-xs px-3 py-1.5 rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Zap className="w-3 h-3 fill-black stroke-black" />
                  <span>{slide.buttonText}</span>
                </button>

              </div>
            </div>
          );
        })}

        {/* Carousel Arrow Controls */}
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

        {/* Pagination Dots */}
        <div className="absolute top-2.5 right-3 z-30 flex justify-end items-center gap-1">
          {slides.map((_, idx) => (
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
