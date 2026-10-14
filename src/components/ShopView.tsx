import React, { useState } from 'react';
import { Card, Joker, Consumable, CardEnhancementType } from '../shared/types';
import { CardView } from './CardView';
import { CARD_ENHANCEMENTS } from '../shared/enhancements';
import { AFFINITY_METAS } from '../shared/jokers';
import { soundManager } from '../audio/soundManager';

interface ShopViewProps {
  playerChips: number;
  playerDeck: Card[];
  shopJokers: Joker[];
  shopConsumables: Consumable[];
  unlockedSlots?: number;
  onBuyJoker: (joker: Joker) => void;
  onBuyConsumable: (item: Consumable) => void;
  onBuySlotExpansion?: () => void;
  onEnhanceCard: (cardId: string, enhancement: CardEnhancementType, cost: number) => void;
  onRemoveCard: (cardId: string, cost: number) => void;
  onLeaveShop: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  playerChips,
  playerDeck,
  shopJokers,
  shopConsumables,
  unlockedSlots = 3,
  onBuyJoker,
  onBuyConsumable,
  onBuySlotExpansion,
  onEnhanceCard,
  onRemoveCard,
  onLeaveShop,
}) => {
  const [activeTab, setActiveTab] = useState<'merch' | 'deck_service'>('merch');
  const [selectedDeckCardId, setSelectedDeckCardId] = useState<string | null>(null);

  React.useEffect(() => {
    soundManager.setGameIntensity(0);
  }, []);

  const ENHANCE_COST = 25;
  const REMOVE_COST = 30;
  const slotExpansionCost = unlockedSlots === 3 ? 60 : 100;
  const canBuySlotExpansion = unlockedSlots < 5 && playerChips >= slotExpansionCost;

  return (
    <div className="max-w-5xl mx-auto w-full p-3 sm:p-6 text-slate-200">
      {/* SHOP HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 border-b border-yellow-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-lg sm:text-xl text-yellow-400 glow-gold flex items-center gap-2">
            <span>🏪</span> THE BLACK MARKET SYNAPSE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Smuggled cyber-chips, tactical hardware expansions, and card overhauls.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
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
      <div className="flex gap-2 mb-5">
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
          {/* HARDWARE EXPANSION (JOKER SLOTS) */}
          <div className="pixel-box p-4 rounded-lg border-2 border-purple-500/50 bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-900/60 border border-purple-400 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-pixel text-xs sm:text-sm text-purple-300 font-bold">
                    JOKER MATRIX EXPANSION (+1 SLOT)
                  </h3>
                  <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-700">
                    CURRENT: {unlockedSlots}/5
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Expand active Joker capacity from {unlockedSlots} to {unlockedSlots + 1}. Unlocks additional adjacency combo link opportunities.
                </p>
              </div>
            </div>

            <div>
              {unlockedSlots < 5 ? (
                <button
                  disabled={!canBuySlotExpansion}
                  onClick={() => {
                    if (onBuySlotExpansion) {
                      soundManager.playSlotUnlock();
                      onBuySlotExpansion();
                    }
                  }}
                  className={`pixel-btn px-5 py-2.5 text-xs font-pixel rounded border font-bold ${
                    canBuySlotExpansion
                      ? 'bg-purple-500 hover:bg-purple-400 text-black border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {canBuySlotExpansion ? `UNLOCK SLOT (${slotExpansionCost} 🪙)` : `NEED ${slotExpansionCost} 🪙`}
                </button>
              ) : (
                <span className="px-4 py-2 rounded bg-slate-900 text-yellow-400 border border-yellow-500/40 text-xs font-pixel">
                  MAX CAPACITY REACHED
                </span>
              )}
            </div>
          </div>

          {/* JOKERS */}
          <div>
            <h2 className="font-pixel text-xs text-yellow-300 uppercase tracking-wider mb-3">
              Passive Jokers for Sale
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {shopJokers.map(joker => {
                const canAfford = playerChips >= joker.cost;
                return (
                  <div
                    key={joker.id}
                    className="pixel-box p-3 sm:p-4 rounded-lg flex flex-col justify-between border border-slate-800 bg-slate-950/80"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{joker.icon}</span>
                        <span className="text-xs font-pixel text-amber-400 font-bold">
                          {joker.cost} 🪙
                        </span>
                      </div>
                      <h3 className="font-pixel text-xs text-white mb-1">{joker.name}</h3>

                      {/* AFFINITY BADGES */}
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {joker.affinityTags?.map(tag => {
                          const meta = AFFINITY_METAS[tag];
                          return (
                            <span
                              key={tag}
                              className="text-[7px] font-pixel px-1.5 py-0.5 rounded uppercase border border-black/30"
                              style={{ backgroundColor: meta.color, color: '#000' }}
                            >
                              {meta.name}
                            </span>
                          );
                        })}
                      </div>

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {shopConsumables.map(item => {
                const canAfford = playerChips >= item.cost;
                return (
                  <div
                    key={item.id}
                    className="pixel-box p-3 sm:p-4 rounded-lg flex flex-col justify-between border border-slate-800 bg-slate-950/80"
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

      {/* DECK SERVICE TAB */}
      {activeTab === 'deck_service' && (
        <div className="space-y-6">
          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-xs font-mono text-cyan-200">
            Select a card from your current deck below to modify with holographic coatings, overclocking, or purging.
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto p-3 bg-black/40 rounded-lg border border-slate-800 min-h-[140px]">
            {playerDeck.map(card => (
              <div
                key={card.id}
                onClick={() => setSelectedDeckCardId(card.id)}
                className={`transition-transform cursor-pointer ${
                  selectedDeckCardId === card.id ? 'scale-105 ring-2 ring-yellow-400 rounded-md' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <CardView card={card} compact />
              </div>
            ))}
          </div>

          {selectedDeckCardId && (
            <div className="pixel-box p-4 rounded-lg border border-yellow-500/40 bg-slate-900/90 space-y-4">
              <h3 className="font-pixel text-xs text-yellow-300">
                Card Operations for Selected Asset
              </h3>

              {/* CARD ENHANCEMENT OPTIONS */}
              <div>
                <div className="text-xs font-mono text-slate-400 mb-2">Apply Cybernetic Enhancement ({ENHANCE_COST} 🪙):</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CARD_ENHANCEMENTS).map(([type, meta]) => {
                    const canAfford = playerChips >= ENHANCE_COST;
                    return (
                      <button
                        key={type}
                        disabled={!canAfford}
                        onClick={() => {
                          soundManager.playArmor();
                          onEnhanceCard(selectedDeckCardId, type as CardEnhancementType, ENHANCE_COST);
                        }}
                        className={`p-2 rounded border text-left text-xs transition-colors ${
                          canAfford
                            ? 'bg-slate-950 hover:bg-slate-800 border-slate-700'
                            : 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-pixel text-[10px] mb-0.5" style={{ color: meta.color }}>
                          {meta.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono line-clamp-2">{meta.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PURGE CARD FROM DECK */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-pixel text-xs text-rose-400">Card Extraction (Purge)</div>
                  <div className="text-xs text-slate-400 font-mono">Permanently remove this card from your draw shoe.</div>
                </div>
                <button
                  disabled={playerChips < REMOVE_COST || playerDeck.length <= 10}
                  onClick={() => {
                    soundManager.playButtonClick();
                    onRemoveCard(selectedDeckCardId, REMOVE_COST);
                    setSelectedDeckCardId(null);
                  }}
                  className={`pixel-btn px-4 py-2 font-pixel text-xs rounded border font-bold ${
                    playerChips >= REMOVE_COST && playerDeck.length > 10
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  }`}
                >
                  PURGE CARD ({REMOVE_COST} 🪙)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
