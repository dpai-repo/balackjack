import React, { useState, useEffect } from 'react';
import { Card } from '../shared/types';
import { CARD_ENHANCEMENTS, CARD_EDITIONS, CARD_SEALS } from '../shared/enhancements';

interface CardViewProps {
  card: Card;
  compact?: boolean;
  highlight?: boolean;
  isNew?: boolean;
  showDetailsOnHover?: boolean;
  onClick?: () => void;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  compact = false,
  highlight = false,
  isNew = false,
  showDetailsOnHover = false,
  onClick,
}) => {
  const [justRevealed, setJustRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
  const edition = card.edition ? CARD_EDITIONS[card.edition] : null;
  const seal = card.seal ? CARD_SEALS[card.seal] : null;

  // Edition border/glow styling
  let editionBorderClass = 'border-slate-700 hover:border-slate-400';
  let editionBgGlow = '';
  if (card.edition === 'foil') {
    editionBorderClass = 'border-cyan-400 ring-1 ring-cyan-300/50 shadow-cyan-500/30';
    editionBgGlow = 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-cyan-900/30';
  } else if (card.edition === 'holographic') {
    editionBorderClass = 'border-fuchsia-400 ring-1 ring-fuchsia-400/50 shadow-fuchsia-500/30';
    editionBgGlow = 'bg-gradient-to-br from-purple-950/50 via-slate-900 to-fuchsia-900/40';
  } else if (card.edition === 'polychrome') {
    editionBorderClass = 'border-emerald-400 ring-2 ring-emerald-400/60 shadow-emerald-500/40 animate-pulse';
    editionBgGlow = 'bg-gradient-to-br from-emerald-950/40 via-purple-950/30 to-amber-950/30';
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative ${compact ? 'w-13 h-19 text-xs p-1' : 'w-20 h-28 sm:w-24 sm:h-34 text-sm p-1.5 sm:p-2'} 
        rounded-md bg-gradient-to-b from-slate-900 via-slate-925 to-slate-950 border-2 overflow-hidden
        ${highlight ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-yellow-500/30 scale-105' : editionBorderClass} 
        ${card.isShattered ? 'opacity-40 grayscale line-through' : ''}
        shadow-xl flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 select-none cursor-pointer group
        ${isNew ? 'card-deal-anim' : ''} ${justRevealed ? 'card-flip-anim' : ''}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Background Edition Sheen */}
      {editionBgGlow && <div className={`absolute inset-0 pointer-events-none ${editionBgGlow}`} />}

      {/* Foil / Holographic moving sheen */}
      {card.edition === 'foil' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-60 card-sheen-anim pointer-events-none" />
      )}
      {card.edition === 'holographic' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/15 via-fuchsia-400/25 to-cyan-400/15 opacity-75 pointer-events-none animate-pulse" />
      )}
      {card.edition === 'polychrome' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,0,234,0.15)_0%,rgba(0,240,255,0.15)_100%)] pointer-events-none" />
      )}

      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-start leading-none self-start z-10">
        <span
          className={`font-pixel font-bold ${compact ? 'text-[9px]' : 'text-xs sm:text-sm'} ${
            card.edition === 'polychrome'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-yellow-300'
              : isRed
              ? 'text-rose-400'
              : 'text-cyan-300'
          }`}
        >
          {card.rank}
        </span>
        <span className={`${compact ? 'text-[9px]' : 'text-xs'} ${isRed ? 'text-rose-500' : 'text-cyan-400'}`}>
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Top Right Seal Stamp */}
      {seal && (
        <div
          title={`${seal.name}: ${seal.description}`}
          className="absolute top-1 right-1 z-20 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border shadow-md font-pixel text-[8px] sm:text-[9px]"
          style={{ backgroundColor: `${seal.color}33`, borderColor: seal.color, color: seal.color }}
        >
          {seal.icon}
        </div>
      )}

      {/* Enhancement Glow Badge */}
      {enh && (
        <div
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded text-[6px] sm:text-[7px] font-pixel font-bold uppercase tracking-wider shadow-sm border border-black/50 z-20 whitespace-nowrap"
          style={{ backgroundColor: enh.color, color: '#000' }}
        >
          {enh.badge}
        </div>
      )}

      {/* Center Large Suit Icon */}
      <div className="flex items-center justify-center my-auto leading-none z-10 pointer-events-none">
        <span
          className={`${compact ? 'text-sm' : 'text-xl sm:text-2xl'} ${
            card.edition === 'polychrome'
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-400'
              : isRed
              ? 'text-rose-500/80 group-hover:text-rose-400'
              : 'text-cyan-400/80 group-hover:text-cyan-300'
          } transition-colors`}
        >
          {suitSymbols[card.suit]}
        </span>
      </div>

      {/* Bottom Center Edition Badge */}
      {edition && (
        <div
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded text-[6px] font-pixel font-bold uppercase tracking-wider z-20 border border-black/40"
          style={{ backgroundColor: edition.color, color: '#000' }}
        >
          {edition.badge}
        </div>
      )}

      {/* Bottom Right Rank & Suit */}
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

      {/* Shattered Overlay if glass broke */}
      {card.isShattered && (
        <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center z-30 pointer-events-none">
          <span className="font-pixel text-[8px] text-red-400 font-bold tracking-widest uppercase">SHATTERED</span>
        </div>
      )}

      {/* Hover Tooltip Details */}
      {(showDetailsOnHover || isHovered) && (enh || edition || seal) && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 bg-slate-950/95 border border-cyan-500/80 rounded p-1.5 shadow-2xl z-50 pointer-events-none text-left">
          {enh && (
            <div className="text-[9px] font-mono leading-tight mb-0.5" style={{ color: enh.color }}>
              <span className="font-bold font-pixel">[{enh.name}]:</span> {enh.description}
            </div>
          )}
          {edition && (
            <div className="text-[9px] font-mono leading-tight mb-0.5" style={{ color: edition.color }}>
              <span className="font-bold font-pixel">[{edition.name}]:</span> {edition.description}
            </div>
          )}
          {seal && (
            <div className="text-[9px] font-mono leading-tight" style={{ color: seal.color }}>
              <span className="font-bold font-pixel">[{seal.name}]:</span> {seal.description}
            </div>
          )}
        </div>
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
