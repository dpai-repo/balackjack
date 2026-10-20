import React, { useState } from 'react';
import { Card, Suit } from '../shared/types';
import { CardView } from './CardView';
import { CARD_ENHANCEMENTS, CARD_EDITIONS, CARD_SEALS } from '../shared/enhancements';
import { soundManager } from '../audio/soundManager';

interface DeckInspectionModalProps {
  deck: Card[];
  onClose: () => void;
  title?: string;
  actionButton?: {
    label: string;
    onAction: (card: Card) => void;
    disabledPredicate?: (card: Card) => boolean;
  };
}

export const DeckInspectionModal: React.FC<DeckInspectionModalProps> = ({
  deck,
  onClose,
  title = 'DECK MATRIX INSPECTOR',
  actionButton,
}) => {
  const [selectedSuit, setSelectedSuit] = useState<Suit | 'all' | 'augmented'>('all');
  const [selectedCard, setSelectedCard] = useState<Card | null>(deck[0] || null);

  const filteredCards = deck.filter(c => {
    if (selectedSuit === 'all') return true;
    if (selectedSuit === 'augmented') return Boolean(c.enhancement || c.edition || c.seal);
    return c.suit === selectedSuit;
  });

  const augmentedCount = deck.filter(c => c.enhancement || c.edition || c.seal).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-950 border-2 border-cyan-500/80 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/40 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎴</span>
            <div>
              <h2 className="font-pixel text-sm sm:text-base text-cyan-400 glow-cyan tracking-wide">
                {title}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono">
                {deck.length} Total Cards in Database • {augmentedCount} Cyber-Augmented
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="pixel-btn px-3 py-1 bg-slate-800 hover:bg-slate-700 border-slate-600 text-xs font-pixel rounded text-slate-300"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* SUIT & FILTER BAR */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 py-2.5 bg-slate-900/40 border-b border-slate-800 text-xs">
          {[
            { id: 'all', label: `ALL (${deck.length})` },
            { id: 'augmented', label: `AUGMENTED (${augmentedCount})` },
            { id: 'spades', label: `♠ SPADES (${deck.filter(c => c.suit === 'spades').length})` },
            { id: 'hearts', label: `♥ HEARTS (${deck.filter(c => c.suit === 'hearts').length})` },
            { id: 'diamonds', label: `♦ DIAMONDS (${deck.filter(c => c.suit === 'diamonds').length})` },
            { id: 'clubs', label: `♣ CLUBS (${deck.filter(c => c.suit === 'clubs').length})` },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                soundManager.playButtonClick();
                setSelectedSuit(f.id as any);
              }}
              className={`px-2.5 py-1 text-[10px] font-pixel rounded border transition-all ${
                selectedSuit === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* BODY GRID & INSPECTOR SPLIT */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 p-4 gap-4">
          
          {/* CARDS SCROLLABLE GRID */}
          <div className="lg:col-span-3 overflow-y-auto max-h-[58vh] pr-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {filteredCards.map(card => {
              const isSelected = selectedCard?.id === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => {
                    soundManager.playCardSelect();
                    setSelectedCard(card);
                  }}
                  className={`p-1 rounded cursor-pointer transition-all flex justify-center ${
                    isSelected ? 'ring-2 ring-cyan-400 bg-cyan-950/40' : 'hover:bg-slate-900/60'
                  }`}
                >
                  <CardView card={card} compact={true} />
                </div>
              );
            })}
            {filteredCards.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 font-pixel text-xs">
                NO CARDS MATCH CURRENT FILTER.
              </div>
            )}
          </div>

          {/* INSPECTOR DETAILS SIDEBAR */}
          <div className="bg-slate-900/70 border border-cyan-500/30 rounded-lg p-4 flex flex-col justify-between">
            {selectedCard ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 transform scale-110">
                  <CardView card={selectedCard} compact={false} />
                </div>
                <h3 className="font-pixel text-sm text-cyan-300">
                  {selectedCard.rank} of {selectedCard.suit.toUpperCase()}
                </h3>

                {/* MODIFIER BREAKDOWNS */}
                <div className="w-full mt-3 space-y-2 text-left font-mono text-xs">
                  {selectedCard.enhancement && CARD_ENHANCEMENTS[selectedCard.enhancement] && (
                    <div className="bg-slate-950/80 p-2 rounded border border-cyan-500/30">
                      <div className="text-[10px] text-cyan-400 font-pixel uppercase">Enhancement</div>
                      <div className="font-bold text-white">
                        {CARD_ENHANCEMENTS[selectedCard.enhancement].name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {CARD_ENHANCEMENTS[selectedCard.enhancement].description}
                      </div>
                    </div>
                  )}

                  {selectedCard.edition && CARD_EDITIONS[selectedCard.edition] && (
                    <div className="bg-slate-950/80 p-2 rounded border border-fuchsia-500/30">
                      <div className="text-[10px] text-fuchsia-400 font-pixel uppercase">Edition</div>
                      <div className="font-bold text-white">
                        {CARD_EDITIONS[selectedCard.edition].name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {CARD_EDITIONS[selectedCard.edition].description}
                      </div>
                    </div>
                  )}

                  {selectedCard.seal && CARD_SEALS[selectedCard.seal] && (
                    <div className="bg-slate-950/80 p-2 rounded border border-amber-500/30">
                      <div className="text-[10px] text-amber-400 font-pixel uppercase">Seal Stamp</div>
                      <div className="font-bold text-white">
                        {CARD_SEALS[selectedCard.seal].name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {CARD_SEALS[selectedCard.seal].description}
                      </div>
                    </div>
                  )}

                  {!selectedCard.enhancement && !selectedCard.edition && !selectedCard.seal && (
                    <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800 text-center text-slate-500 text-[10px]">
                      Standard unmodified neural card. Visit the Black Market to install cyberware upgrades.
                    </div>
                  )}
                </div>

                {/* ACTION BUTTON IF PASSED (E.G. SHRED / CLONE) */}
                {actionButton && (
                  <button
                    onClick={() => actionButton.onAction(selectedCard)}
                    disabled={actionButton.disabledPredicate ? actionButton.disabledPredicate(selectedCard) : false}
                    className="w-full mt-4 pixel-btn py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-black font-pixel font-bold text-xs rounded border border-cyan-300"
                  >
                    {actionButton.label}
                  </button>
                )}
              </div>
            ) : (
              <div className="my-auto text-center text-slate-500 font-mono text-xs">
                Select a card from the grid to inspect neural telemetry.
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
              Target cards with Glass or Retrigger Seals for highest score burst potential.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
