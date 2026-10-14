import React, { useState, useEffect } from 'react';
import { Card } from '../shared/types';
import { CARD_ENHANCEMENTS } from '../shared/enhancements';

interface CardViewProps {
  card: Card;
  compact?: boolean;
  highlight?: boolean;
  isNew?: boolean;
  onClick?: () => void;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  compact = false,
  highlight = false,
  isNew = false,
  onClick,
}) => {
  const [justRevealed, setJustRevealed] = useState(false);

  useEffect(() => {
    if (!card.hidden) {
      setJustRevealed(true);
      const timer = setTimeout(() => setJustRevealed(false), 800);
      return () => clearTimeout(timer);
    }
  }, [card.hidden]);

  if (card.hidden) {
    return (
      <div
        className={`relative ${compact ? 'w-13 h-19' : 'w-20 h-28 sm:w-24 sm:h-34'} 
          rounded-md bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-2 border-cyan-500/60 
          flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-default select-none overflow-hidden card-deal-anim`}
      >
        <div className="absolute inset-1 border border-cyan-500/20 rounded flex items-center justify-center bg-cyan-950/20">
          <div className="text-cyan-400 font-pixel text-base sm:text-lg opacity-80 animate-pulse">?</div>
        </div>
        <div className="text-[8px] sm:text-[9px] text-cyan-400 font-terminal tracking-widest uppercase">LOCKED</div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitSymbols: Record<string, string> = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  const enh = card.enhancement ? CARD_ENHANCEMENTS[card.enhancement] : null;

  return (
    <div
      onClick={onClick}
      className={`relative ${compact ? 'w-13 h-19 text-xs p-1' : 'w-20 h-28 sm:w-24 sm:h-34 text-sm p-1.5 sm:p-2'} 
        rounded-md bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 border-2 overflow-hidden
        ${highlight ? 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-yellow-500/20' : 'border-slate-700 hover:border-slate-400'} 
        shadow-xl flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 select-none cursor-pointer group
        ${isNew ? 'card-deal-anim' : ''} ${justRevealed ? 'card-flip-anim' : ''}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Enhancement Glow Badge */}
      {enh && (
        <div
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded text-[7px] font-pixel font-bold uppercase tracking-wider shadow-sm border border-black/50 z-10 whitespace-nowrap"
          style={{ backgroundColor: enh.color, color: '#000' }}
        >
          {enh.badge}
        </div>
      )}

      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-start leading-none self-start z-10">
        <span className={`font-pixel font-bold ${compact ? 'text-[9px]' : 'text-xs sm:text-sm'} ${isRed ? 'text-rose-400' : 'text-cyan-300'}`}>
          {card.rank}
        </span>
        <span className={`${compact ? 'text-[9px]' : 'text-xs'} ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Center Large Suit Icon */}
      <div className="flex items-center justify-center my-auto leading-none z-10 pointer-events-none">
        <span
          className={`${compact ? 'text-sm' : 'text-xl sm:text-2xl'} ${
            isRed ? 'text-rose-500/80 group-hover:text-rose-400' : 'text-cyan-400/80 group-hover:text-cyan-300'
          } transition-colors`}
        >
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Bottom Right Rank & Suit (Strictly inset, omitted in compact mode to ensure it never overlaps outside boundary) */}
      {!compact ? (
        <div className="flex flex-col items-end leading-none self-end rotate-180 z-10">
          <span className={`font-pixel font-bold text-xs sm:text-sm ${isRed ? 'text-rose-400' : 'text-cyan-300'}`}>
            {card.rank}
          </span>
          <span className={`text-xs ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
      ) : (
        <div className="h-0.5" />
      )}

      {/* Specular Sheen Animation upon reveal */}
      {justRevealed && (
        <div className="card-sheen-anim absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent pointer-events-none" />
      )}

      {/* Subtle Scanline on Card */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded" />
    </div>
  );
};
