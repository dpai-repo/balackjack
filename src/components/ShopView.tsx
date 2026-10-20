import React, { useState } from 'react';
import { Card, Joker, Consumable, CardEnhancementType, CardEditionType, CardSealType } from '../shared/types';
import { CardView } from './CardView';
import { JokerSlotTray } from './JokerSlotTray';
import { CARD_ENHANCEMENTS, CARD_EDITIONS, CARD_SEALS } from '../shared/enhancements';
import { AFFINITY_METAS } from '../shared/jokers';
import { soundManager } from '../audio/soundManager';

interface ShopViewProps {
  playerChips: number;
  playerDeck: Card[];
  shopJokers: Joker[];
  shopConsumables: Consumable[];
  unlockedSlots?: number;
  playerJokers?: Joker[];
  onReorderJokers?: (newSlots: (Joker | null)[]) => void;
  onBuyJoker: (joker: Joker) => void;
  onReplaceJoker?: (replacedJokerId: string, newJoker: Joker, refundChips: number) => void;
  onBuyConsumable: (item: Consumable) => void;
  onBuySlotExpansion?: () => void;
  onEnhanceCard: (cardId: string, enhancement: CardEnhancementType, cost: number) => void;
  onApplyEdition?: (cardId: string, edition: CardEditionType, cost: number) => void;
  onApplySeal?: (cardId: string, seal: CardSealType, cost: number) => void;
  onCloneCard?: (cardId: string, cost: number) => void;
  onRemoveCard: (cardId: string, cost: number) => void;
  onLeaveShop: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  playerChips,
  playerDeck,
  shopJokers,
  shopConsumables,
  unlockedSlots = 5,
  playerJokers = [],
  onReorderJokers,
  onBuyJoker,
  onReplaceJoker,
  onBuyConsumable,
  onEnhanceCard,
  onApplyEdition,
  onApplySeal,
  onCloneCard,
  onRemoveCard,
  onLeaveShop,
}) => {
  const [activeTab, setActiveTab] = useState<'merch' | 'deck_service'>('merch');
  const [selectedDeckCardId, setSelectedDeckCardId] = useState<string | null>(playerDeck[0]?.id || null);
  const [pendingReplaceJoker, setPendingReplaceJoker] = useState<Joker | null>(null);

  // Deck Service Sub-tab
  const [deckServiceTab, setDeckServiceTab] = useState<'enhancements' | 'editions' | 'seals' | 'shred_clone'>('enhancements');

  React.useEffect(() => {
    soundManager.setGameIntensity(0);
  }, []);

  const ENHANCE_COST = 25;
  const EDITION_COST = 35;
  const SEAL_COST = 30;
  const CLONE_COST = 40;
  const REMOVE_COST = 30;

  const selectedCard = playerDeck.find(c => c.id === selectedDeckCardId) || null;

  // Handle clicking to purchase a Joker
  const handleAttemptBuyJoker = (joker: Joker) => {
    soundManager.playButtonClick();
    if (playerJokers.length >= unlockedSlots) {
      setPendingReplaceJoker(joker);
    } else {
      onBuyJoker(joker);
    }
  };

  // Handle confirming a replacement of an equipped Joker
  const handleConfirmReplace = (oldJoker: Joker) => {
    if (!pendingReplaceJoker) return;
    const refund = Math.floor(oldJoker.cost * 0.5);
    if (onReplaceJoker) {
      onReplaceJoker(oldJoker.id, pendingReplaceJoker, refund);
    }
    setPendingReplaceJoker(null);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-3 sm:p-6 text-slate-200">
      {/* SHOP HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5 border-b border-yellow-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-lg sm:text-xl text-yellow-400 glow-gold flex items-center gap-2">
            <span>🏪</span> THE BLACK MARKET SYNAPSE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Smuggled cyber-chips, tactical hardware expansions, card augmentations, and DNA cloning.
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

      {/* OWNED JOKER MATRIX TRAY */}
      <div className="mb-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-pixel text-cyan-400 uppercase tracking-wider">
            Active Joker Matrix (Equipped: {playerJokers.length}/{unlockedSlots} Slots)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {unlockedSlots < 6 ? 'Final 6th slot available via Store Voucher' : 'Maximum capacity unlocked (6/6)'}
          </span>
        </div>
        <JokerSlotTray
          unlockedSlots={unlockedSlots}
          slots={playerJokers}
          onReorderSlots={newSlots => {
            if (onReorderJokers) {
              onReorderJokers(newSlots);
            }
          }}
          compact
        />
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
          🎴 Deck Lab & Cyber-Augmentations ({playerDeck.length} Cards)
        </button>
      </div>

      {/* MERCH TAB */}
      {activeTab === 'merch' && (
        <div className="space-y-6">
          {/* JOKERS FOR SALE */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-pixel text-xs text-yellow-300 uppercase tracking-wider">
                Passive Jokers for Sale
              </h2>
              {playerJokers.length >= unlockedSlots && (
                <span className="text-[10px] font-pixel px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">
                  SLOTS FULL: Purchasing will prompt replacement trade-in
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {shopJokers.map(joker => {
                const canAfford = playerChips >= joker.cost;
                const isFull = playerJokers.length >= unlockedSlots;
                return (
                  <div
                    key={joker.id}
                    className="pixel-box p-3 sm:p-4 rounded-lg flex flex-col justify-between border border-slate-800 bg-slate-950/80 hover:border-slate-700 transition-colors"
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
                              style={{ backgroundColor: meta?.color || '#ffd700', color: '#000' }}
                            >
                              {meta?.name || tag}
                            </span>
                          );
                        })}
                      </div>

                      <p className="text-xs text-slate-300 font-mono leading-relaxed">{joker.description}</p>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => handleAttemptBuyJoker(joker)}
                      className={`mt-4 pixel-btn py-1.5 text-xs font-pixel rounded border font-bold ${
                        canAfford
                          ? isFull
                            ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300'
                            : 'bg-yellow-400 hover:bg-yellow-300 text-black border-yellow-200'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {canAfford
                        ? isFull
                          ? 'SWAP / REPLACE'
                          : 'PURCHASE'
                        : 'INSUFFICIENT CHIPS'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONSUMABLES & VOUCHERS */}
          <div>
            <h2 className="font-pixel text-xs text-emerald-300 uppercase tracking-wider mb-3">
              Tactical Consumables & Expansion Gear
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {shopConsumables.map(item => {
                const canAfford = playerChips >= item.cost;
                const isVoucher = item.effectType === 'joker_slot_voucher';
                const isModPack = item.effectType === 'cyber_mod_pack';
                return (
                  <div
                    key={item.id}
                    className={`pixel-box p-3 sm:p-4 rounded-lg flex flex-col justify-between border ${
                      isVoucher
                        ? 'border-purple-500/80 bg-purple-950/30 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : isModPack
                        ? 'border-cyan-500/80 bg-cyan-950/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'border-slate-800 bg-slate-950/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex items-center gap-1.5">
                          {isVoucher && (
                            <span className="text-[8px] font-pixel px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-500">
                              EXPANSION
                            </span>
                          )}
                          {isModPack && (
                            <span className="text-[8px] font-pixel px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-500">
                              BOOSTER
                            </span>
                          )}
                          <span className="text-xs font-pixel text-emerald-400 font-bold">
                            {item.cost} 🪙
                          </span>
                        </div>
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
                      {canAfford ? 'ACQUIRE GEAR' : 'INSUFFICIENT CHIPS'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DECK SERVICE TAB (CARD AUGMENTATION LAB & PURGE/CLONE) */}
      {activeTab === 'deck_service' && (
        <div className="space-y-5">
          <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="font-pixel text-xs text-cyan-300 uppercase">
                DECK CYBERNETIC WORKBENCH
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Click any card below to install Enhancements, Holographic Editions, Circuit Seals, or DNA Duplication.
              </p>
            </div>
            {selectedCard && (
              <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded border border-cyan-400/40">
                <span className="text-xs font-mono text-slate-300">Selected:</span>
                <span className="font-pixel text-xs text-cyan-300">{selectedCard.rank} of {selectedCard.suit.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* DECK HORIZONTAL SCROLL / GRID */}
          <div className="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 max-h-[160px]">
            {playerDeck.map(card => (
              <div
                key={card.id}
                onClick={() => {
                  soundManager.playCardSelect();
                  setSelectedDeckCardId(card.id);
                }}
                className={`transition-transform cursor-pointer shrink-0 ${
                  selectedDeckCardId === card.id ? 'scale-105 ring-2 ring-cyan-400 rounded-md' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <CardView card={card} compact />
              </div>
            ))}
          </div>

          {selectedCard && (
            <div className="pixel-box p-4 rounded-lg border border-cyan-500/40 bg-slate-900/90 space-y-4">
              
              {/* SUB-TABS FOR AUGMENT TYPES */}
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: 'enhancements', label: `1. Enhancements (${ENHANCE_COST} 🪙)` },
                  { id: 'editions', label: `2. Foil / Holo Editions (${EDITION_COST} 🪙)` },
                  { id: 'seals', label: `3. Circuit Seals (${SEAL_COST} 🪙)` },
                  { id: 'shred_clone', label: `4. DNA Clone & Purge` },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      soundManager.playButtonClick();
                      setDeckServiceTab(sub.id as any);
                    }}
                    className={`px-3 py-1.5 text-xs font-pixel rounded border transition-all ${
                      deckServiceTab === sub.id
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: ENHANCEMENTS */}
              {deckServiceTab === 'enhancements' && (
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Install Neural Material Enhancement on {selectedCard.rank} of {selectedCard.suit.toUpperCase()}:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(CARD_ENHANCEMENTS).map(([type, meta]) => {
                      const canAfford = playerChips >= ENHANCE_COST;
                      const isCurrent = selectedCard.enhancement === type;
                      return (
                        <button
                          key={type}
                          disabled={!canAfford || isCurrent}
                          onClick={() => {
                            soundManager.playArmor();
                            onEnhanceCard(selectedCard.id, type as CardEnhancementType, ENHANCE_COST);
                          }}
                          className={`p-2.5 rounded border text-left flex flex-col justify-between transition-all ${
                            isCurrent
                              ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400'
                              : canAfford
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                              : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm">{meta.icon}</span>
                              <span
                                className="px-1 py-0.2 rounded text-[7px] font-pixel font-bold"
                                style={{ backgroundColor: meta.color, color: '#000' }}
                              >
                                {meta.badge}
                              </span>
                            </div>
                            <span className="font-pixel text-[10px] text-white block mb-1">{meta.name}</span>
                            <p className="text-[9px] text-slate-400 font-mono leading-tight">{meta.description}</p>
                          </div>
                          <div className="mt-2 text-[9px] font-pixel text-right text-yellow-400">
                            {isCurrent ? 'INSTALLED' : `${ENHANCE_COST} 🪙`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: EDITIONS */}
              {deckServiceTab === 'editions' && (
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Apply Specular Hologram Edition ({EDITION_COST} 🪙):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(CARD_EDITIONS).map(([type, meta]) => {
                      const canAfford = playerChips >= EDITION_COST;
                      const isCurrent = selectedCard.edition === type;
                      return (
                        <button
                          key={type}
                          disabled={!canAfford || isCurrent}
                          onClick={() => {
                            soundManager.playArmor();
                            if (onApplyEdition) {
                              onApplyEdition(selectedCard.id, type as CardEditionType, EDITION_COST);
                            }
                          }}
                          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isCurrent
                              ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400'
                              : canAfford
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                              : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-pixel text-xs text-white">{meta.name}</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[8px] font-pixel font-bold"
                                style={{ backgroundColor: meta.color, color: '#000' }}
                              >
                                {meta.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono leading-relaxed">{meta.description}</p>
                          </div>
                          <div className="mt-3 text-[10px] font-pixel text-right text-yellow-400">
                            {isCurrent ? 'EQUIPPED' : `${EDITION_COST} 🪙`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: CIRCUIT SEALS */}
              {deckServiceTab === 'seals' && (
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-2">
                    Stamp Circuit Seal ({SEAL_COST} 🪙):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {Object.entries(CARD_SEALS).map(([type, meta]) => {
                      const canAfford = playerChips >= SEAL_COST;
                      const isCurrent = selectedCard.seal === type;
                      return (
                        <button
                          key={type}
                          disabled={!canAfford || isCurrent}
                          onClick={() => {
                            soundManager.playArmor();
                            if (onApplySeal) {
                              onApplySeal(selectedCard.id, type as CardSealType, SEAL_COST);
                            }
                          }}
                          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                            isCurrent
                              ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400'
                              : canAfford
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-600'
                              : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-base">{meta.icon}</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[7px] font-pixel font-bold"
                                style={{ backgroundColor: `${meta.color}44`, borderColor: meta.color, color: meta.color }}
                              >
                                {meta.badge}
                              </span>
                            </div>
                            <span className="font-pixel text-[10px] text-white block mb-1">{meta.name}</span>
                            <p className="text-[9px] text-slate-300 font-mono leading-tight">{meta.description}</p>
                          </div>
                          <div className="mt-2 text-[9px] font-pixel text-right text-yellow-400">
                            {isCurrent ? 'STAMPED' : `${SEAL_COST} 🪙`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: DNA CLONE & PURGE */}
              {deckServiceTab === 'shred_clone' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DNA CLONE */}
                  <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-slate-950/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🧬</span>
                        <h4 className="font-pixel text-xs text-cyan-300">DNA Cloning Vat</h4>
                      </div>
                      <p className="text-[10px] font-mono text-slate-300 leading-relaxed mb-3">
                        Fabricate an exact digital clone of {selectedCard.rank} of {selectedCard.suit.toUpperCase()} into your deck, retaining all its Enhancements, Editions, and Seals!
                      </p>
                    </div>
                    <button
                      disabled={playerChips < CLONE_COST}
                      onClick={() => {
                        soundManager.playCardSelect();
                        if (onCloneCard) {
                          onCloneCard(selectedCard.id, CLONE_COST);
                        }
                      }}
                      className={`pixel-btn py-2 text-xs font-pixel rounded border font-bold ${
                        playerChips >= CLONE_COST
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      CLONE CARD ({CLONE_COST} 🪙)
                    </button>
                  </div>

                  {/* PURGE / SHRED */}
                  <div className="p-3.5 rounded-lg border border-red-500/30 bg-slate-950/70 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">🗑️</span>
                        <h4 className="font-pixel text-xs text-red-400">Deck Purge / Shredder</h4>
                      </div>
                      <p className="text-[10px] font-mono text-slate-300 leading-relaxed mb-3">
                        Permanently disintegrate this card from your 52-card deck. Thinning your deck increases draw consistency for your highest-scoring augmented cards.
                      </p>
                    </div>
                    <button
                      disabled={playerChips < REMOVE_COST || playerDeck.length <= 20}
                      onClick={() => {
                        soundManager.playBust();
                        onRemoveCard(selectedCard.id, REMOVE_COST);
                        setSelectedDeckCardId(playerDeck.find(c => c.id !== selectedCard.id)?.id || null);
                      }}
                      className={`pixel-btn py-2 text-xs font-pixel rounded border font-bold ${
                        playerChips >= REMOVE_COST && playerDeck.length > 20
                          ? 'bg-red-600 hover:bg-red-500 text-white border-red-400'
                          : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {playerDeck.length <= 20 ? 'DECK AT MIN SIZE' : `PURGE CARD (${REMOVE_COST} 🪙)`}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* JOKER CAPACITY REPLACEMENT MODAL */}
      {pendingReplaceJoker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="pixel-box max-w-2xl w-full p-5 rounded-lg border-2 border-yellow-500/80 bg-slate-950 text-slate-200 space-y-4 shadow-[0_0_24px_rgba(234,179,8,0.3)]">
            <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3">
              <div>
                <h3 className="font-pixel text-sm text-yellow-400 flex items-center gap-2">
                  <span>⚠️</span> JOKER MATRIX AT FULL CAPACITY ({unlockedSlots}/{unlockedSlots})
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Choose an existing Joker to decommission for a trade-in chip refund, or cancel this purchase.
                </p>
              </div>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setPendingReplaceJoker(null);
                }}
                className="text-slate-400 hover:text-white font-mono text-lg px-2"
              >
                ✕
              </button>
            </div>

            {/* SIDE-BY-SIDE CANDIDATE & INVENTORY SWAP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* CANDIDATE NEW JOKER */}
              <div className="sm:col-span-1 p-3 rounded-lg bg-yellow-950/20 border border-yellow-500/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-pixel text-yellow-300 block mb-1">NEW ACQUISITION</span>
                  <div className="text-3xl my-2 text-center">{pendingReplaceJoker.icon}</div>
                  <h4 className="font-pixel text-xs text-white text-center mb-1">{pendingReplaceJoker.name}</h4>
                  <div className="flex justify-center gap-1 mb-2 flex-wrap">
                    {pendingReplaceJoker.affinityTags?.map(tag => (
                      <span
                        key={tag}
                        className="text-[7px] font-pixel px-1 py-0.2 rounded uppercase border border-black/30"
                        style={{ backgroundColor: AFFINITY_METAS[tag]?.color || '#ffd700', color: '#000' }}
                      >
                        {AFFINITY_METAS[tag]?.name || tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 leading-tight">
                    {pendingReplaceJoker.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-yellow-500/30 text-center font-pixel text-xs text-yellow-400">
                  Cost: {pendingReplaceJoker.cost} 🪙
                </div>
              </div>

              {/* EQUIPPED JOKERS ROSTER TO REPLACE */}
              <div className="sm:col-span-2 space-y-2 max-h-[320px] overflow-y-auto pr-1">
                <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wider block">
                  Select an Equipped Joker to Replace:
                </span>
                {playerJokers.map((joker, idx) => {
                  const refund = Math.floor(joker.cost * 0.5);
                  const netCost = pendingReplaceJoker.cost - refund;
                  const canAffordNet = playerChips >= netCost;

                  return (
                    <div
                      key={`${joker.id}-${idx}`}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{joker.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-xs text-slate-200 truncate">{joker.name}</span>
                            <span className="text-[8px] font-pixel px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shrink-0">
                              +{refund} 🪙 TRADE-IN
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 truncate max-w-[240px]">
                            {joker.description}
                          </p>
                        </div>
                      </div>

                      <button
                        disabled={!canAffordNet}
                        onClick={() => handleConfirmReplace(joker)}
                        className={`pixel-btn px-3 py-1.5 text-[10px] font-pixel rounded border font-bold shrink-0 ${
                          canAffordNet
                            ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300'
                            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        REPLACE ({netCost} 🪙)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setPendingReplaceJoker(null);
                }}
                className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-pixel text-xs rounded border border-slate-600"
              >
                CANCEL PURCHASE (KEEP CURRENT JOKERS)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
