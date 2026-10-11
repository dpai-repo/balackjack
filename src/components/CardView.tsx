import React from 'react';
import { Card } from '../shared/types';
import { CARD_ENHANCEMENTS } from '../shared/enhancements';

interface CardViewProps {
  card: Card;
  compact?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}

export const CardView: React.FC<CardViewProps> = ({ card, compact = false, highlight = false, onClick }) => {
  if (card.hidden) {
    return (
      <div
        className={`relative ${compact ? 'w-14 h-20' : 'w-20 h-28 sm:w-24 sm:h-34'} 
          rounded-md bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-2 border-cyan-500/60 
          flex flex-col items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-default select-none`}
      >
        <div className="absolute inset-1 border border-cyan-500/20 rounded flex items-center justify-center bg-cyan-950/20">
          <div className="text-cyan-400 font-pixel text-lg opacity-80 animate-pulse">?</div>
        </div>
        <div className="text-[10px] text-cyan-400 font-terminal tracking-widest uppercase">LOCKED</div>
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
      className={`relative ${compact ? 'w-14 h-20 text-xs p-1' : 'w-20 h-28 sm:w-24 sm:h-34 text-sm p-1.5 sm:p-2'} 
        rounded-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 overflow-hidden
        ${highlight ? 'border-yellow-400 ring-2 ring-yellow-400/40 shadow-yellow-500/20' : 'border-slate-700 hover:border-slate-400'} 
        shadow-xl flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 select-none cursor-pointer group`}
    >
      {/* Enhancement Glow Banner */}
      {enh && (
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded text-[7px] font-pixel font-bold uppercase tracking-wider shadow-sm border border-black/40 z-10"
          style={{ backgroundColor: enh.color, color: '#000' }}
        >
          {enh.badge}
        </div>
      )}

      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-center leading-none self-start">
        <span className={`font-pixel font-bold ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'} ${isRed ? 'text-rose-400' : 'text-cyan-300'}`}>
          {card.rank}
        </span>
        <span className={`${compact ? 'text-[10px]' : 'text-xs'} ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Center Large Suit Icon */}
      <div className="flex items-center justify-center my-auto leading-none">
        <span
          className={`${compact ? 'text-base' : 'text-2xl sm:text-3xl'} ${
            isRed ? 'text-rose-500/80 group-hover:text-rose-400' : 'text-cyan-400/80 group-hover:text-cyan-300'
          } transition-colors`}
        >
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Bottom Right Rank & Suit (Omitted in compact mode to prevent overflowing outside card boundary) */}
      {!compact ? (
        <div className="flex flex-col items-center leading-none self-end rotate-180">
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

      {/* Subtle Scanline on Card */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded" />
    </div>
  );
};
