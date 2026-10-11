import React, { useState } from 'react';
import { Card, Joker, Consumable, CardEnhancementType } from '../shared/types';
import { CardView } from './CardView';
import { CARD_ENHANCEMENTS } from '../shared/enhancements';
import { soundManager } from '../audio/soundManager';

interface ShopViewProps {
  playerChips: number;
  playerDeck: Card[];
  shopJokers: Joker[];
  shopConsumables: Consumable[];
  onBuyJoker: (joker: Joker) => void;
  onBuyConsumable: (item: Consumable) => void;
  onEnhanceCard: (cardId: string, enhancement: CardEnhancementType, cost: number) => void;
  onRemoveCard: (cardId: string, cost: number) => void;
  onLeaveShop: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  playerChips,
  playerDeck,
  shopJokers,
  shopConsumables,
  onBuyJoker,
  onBuyConsumable,
  onEnhanceCard,
  onRemoveCard,
  onLeaveShop,
}) => {
  const [activeTab, setActiveTab] = useState<'merch' | 'deck_service'>('merch');
  const [selectedDeckCardId, setSelectedDeckCardId] = useState<string | null>(null);

  const ENHANCE_COST = 25;
  const REMOVE_COST = 30;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      {/* SHOP HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-yellow-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-xl text-yellow-400 glow-gold flex items-center gap-2">
            <span>🏪</span> THE BLACK MARKET SYNAPSE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Smuggled cyber-chips, tactical hardware, and card overhauls.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/40 rounded-lg flex items-center gap-2">
            <span className="text-sm">🪙</span>
            <span className="font-pixel text-xs sm:text-sm text-yellow-300 font-bold">{playerChips} CHIPS</span>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onLeaveShop();
            }}
            className="pixel-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs rounded border-emerald-300 font-bold"
          >
            DEPART SHOP →
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('merch');
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel rounded border ${
            activeTab === 'merch'
              ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          🛒 Black Market Inventory
        </button>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setActiveTab('deck_service');
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel rounded border ${
            activeTab === 'deck_service'
              ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          🎴 Deck Lab & Enhancements ({playerDeck.length} Cards)
        </button>
      </div>

      {/* MERCH TAB */}
      {activeTab === 'merch' && (
        <div className="space-y-6">
          {/* JOKERS */}
          <div>
            <h2 className="font-pixel text-xs text-yellow-300 uppercase tracking-wider mb-3">
              Passive Jokers for Sale
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {shopJokers.map(joker => {
                const canAfford = playerChips >= joker.cost;
                return (
                  <div
                    key={joker.id}
                    className="pixel-box p-4 rounded-lg flex flex-col justify-between border border-slate-800 bg-slate-950/80"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{joker.icon}</span>
                        <span className="text-xs font-pixel text-amber-400 font-bold">
                          {joker.cost} 🪙
                        </span>
                      </div>
                      <h3 className="font-pixel text-xs text-white mb-1">{joker.name}</h3>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">{joker.description}</p>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playButtonClick();
                        onBuyJoker(joker);
                      }}
                      className={`mt-4 pixel-btn py-1.5 text-xs font-pixel rounded border font-bold ${
                        canAfford
                          ? 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-200'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'PURCHASE' : 'INSUFFICIENT CHIPS'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONSUMABLES */}
          <div>
            <h2 className="font-pixel text-xs text-emerald-300 uppercase tracking-wider mb-3">
              Tactical Consumables & Gear
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shopConsumables.map(item => {
                const canAfford = playerChips >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="pixel-box p-4 rounded-lg flex flex-col justify-between border border-slate-800 bg-slate-950/80"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-xs font-pixel text-amber-400 font-bold">
                          {item.cost} 🪙
                        </span>
                      </div>
                      <h3 className="font-pixel text-xs text-white mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.description}</p>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playButtonClick();
                        onBuyConsumable(item);
                      }}
                      className={`mt-4 pixel-btn py-1.5 text-xs font-pixel rounded border font-bold ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-300'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'PURCHASE GEAR' : 'INSUFFICIENT CHIPS'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DECK LAB TAB */}
      {activeTab === 'deck_service' && (
        <div>
          <div className="p-4 bg-slate-900/80 rounded-lg border border-cyan-500/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-pixel text-xs text-cyan-300">CARD WORKBENCH</h3>
              <p className="text-xs text-slate-400 font-mono">
                Click any card below to apply cyber enhancements or permanently shred it from your deck.
              </p>
            </div>
            {selectedDeckCardId && (
              <div className="flex gap-2">
                <button
                  disabled={playerChips < ENHANCE_COST}
                  onClick={() => {
                    const randomEnhTypes: CardEnhancementType[] = ['holographic', 'polychrome', 'armored', 'vampiric'];
                    const randomEnh = randomEnhTypes[Math.floor(Math.random() * randomEnhTypes.length)];
                    onEnhanceCard(selectedDeckCardId, randomEnh, ENHANCE_COST);
                    soundManager.playArmor();
                  }}
                  className={`pixel-btn px-3 py-1.5 text-xs font-pixel rounded border ${
                    playerChips >= ENHANCE_COST
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 font-bold'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  ENHANCE ({ENHANCE_COST}🪙)
                </button>
                <button
                  disabled={playerChips < REMOVE_COST || playerDeck.length <= 10}
                  onClick={() => {
                    onRemoveCard(selectedDeckCardId, REMOVE_COST);
                    setSelectedDeckCardId(null);
                    soundManager.playBust();
                  }}
                  className={`pixel-btn px-3 py-1.5 text-xs font-pixel rounded border ${
                    playerChips >= REMOVE_COST && playerDeck.length > 10
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 font-bold'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  SHRED ({REMOVE_COST}🪙)
                </button>
              </div>
            )}
          </div>

          {/* PLAYER DECK GRID */}
          <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto p-2 bg-black/40 rounded border border-slate-800">
            {playerDeck.map(card => (
              <div
                key={card.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedDeckCardId(card.id);
                }}
                className={`cursor-pointer transition-transform ${
                  selectedDeckCardId === card.id ? 'scale-110 ring-2 ring-cyan-400 rounded' : 'hover:scale-105'
                }`}
              >
                <CardView card={card} compact />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
