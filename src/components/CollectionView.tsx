import React, { useState } from 'react';
import { JOKERS_CATALOG, AFFINITY_METAS } from '../shared/jokers';
import { CARD_ENHANCEMENTS, CARD_EDITIONS, CARD_SEALS } from '../shared/enhancements';
import { CONSUMABLES_CATALOG } from '../shared/consumables';
import { BOSSES } from '../shared/bosses';
import { STAKES_LIST } from '../shared/stakes';
import { STARTER_DECKS } from '../shared/starterDecks';
import { careerManager } from '../shared/careerManager';
import { CardView } from './CardView';
import { Card } from '../shared/types';
import { soundManager } from '../audio/soundManager';

interface CollectionViewProps {
  onBack: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<
    'jokers' | 'augments' | 'decks_stakes' | 'consumables' | 'bosses' | 'career_history'
  >('jokers');

  const profile = careerManager.getProfile();
  const lifetime = profile.lifetimeStats;
  const discoveredJokers = profile.discoveredJokers;

  // Sample card for live augment testing
  const [previewSuit] = useState<'spades' | 'hearts'>('spades');
  const [previewRank] = useState<'A' | 'K' | '10'>('A');

  return (
    <div className="max-w-6xl mx-auto w-full p-3 sm:p-6 text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-lg sm:text-xl text-cyan-400 glow-cyan flex items-center gap-2">
            <span>📚</span> THE CYBER-CODEX & ARCHIVE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Classified neural database, card augmentation telemetry, stake protocols, and lifetime run history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded font-mono text-xs">
            <span className="text-slate-400">Career Runs:</span>
            <span className="text-cyan-400 font-pixel font-bold">{lifetime.totalRuns}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Victories:</span>
            <span className="text-emerald-400 font-pixel font-bold">{lifetime.runsWon}</span>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onBack();
            }}
            className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 border-slate-600 text-xs font-pixel rounded text-slate-200"
          >
            ← BACK TO TERMINAL
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        {[
          { id: 'jokers', label: `Jokers (${discoveredJokers.length}/${JOKERS_CATALOG.length})`, icon: '🃏' },
          { id: 'augments', label: 'Augment Lab', icon: '✨' },
          { id: 'decks_stakes', label: 'Decks & Stakes', icon: '🎴' },
          { id: 'consumables', label: `Gear (${CONSUMABLES_CATALOG.length})`, icon: '🎒' },
          { id: 'bosses', label: `Bosses (${BOSSES.length})`, icon: '👹' },
          { id: 'career_history', label: `Career (${profile.runHistory.length} Runs)`, icon: '📜' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab(tab.id as any);
            }}
            className={`pixel-btn py-2 text-xs font-pixel rounded border transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black border-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id.toUpperCase().slice(0, 5)}</span>
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: JOKERS */}
      {/* ============================================================== */}
      {activeTab === 'jokers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Discovered: {discoveredJokers.length} of {JOKERS_CATALOG.length} Cyber-Jokers in classified neural net.
            </span>
            <span className="text-cyan-400">
              {Math.round((discoveredJokers.length / JOKERS_CATALOG.length) * 100)}% UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOKERS_CATALOG.map(joker => {
              const isDiscovered = discoveredJokers.includes(joker.id);

              if (!isDiscovered) {
                return (
                  <div
                    key={joker.id}
                    className="pixel-box p-4 rounded-lg border border-slate-900 bg-slate-950/70 opacity-60 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl filter blur-[2px] opacity-40">❓</span>
                      <span className="text-[9px] font-pixel px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                        UNDISCOVERED
                      </span>
                    </div>
                    <div>
                      <h3 className="font-pixel text-xs text-slate-500 tracking-wider">CLASSIFIED JOKER</h3>
                      <p className="text-[11px] font-mono text-slate-600 mt-1">
                        Synthesize or purchase in the Black Market during future runs to decode neural telemetry.
                      </p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-600">
                      Rarity: {joker.rarity.toUpperCase()}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={joker.id}
                  className={`pixel-box p-4 rounded-lg border flex flex-col justify-between bg-slate-950/90 ${
                    joker.rarity === 'legendary'
                      ? 'border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : joker.rarity === 'rare'
                      ? 'border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                      : joker.rarity === 'uncommon'
                      ? 'border-cyan-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{joker.icon}</span>
                        <h3 className="font-pixel text-xs text-white">{joker.name}</h3>
                      </div>
                      <span
                        className={`text-[9px] font-pixel uppercase px-1.5 py-0.5 rounded ${
                          joker.rarity === 'legendary'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : joker.rarity === 'rare'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : joker.rarity === 'uncommon'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {joker.rarity}
                      </span>
                    </div>

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

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>Base Market Value:</span>
                    <span className="text-amber-400 font-bold">{joker.cost} 🪙</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: AUGMENT LAB (Enhancements, Editions, Seals) */}
      {/* ============================================================== */}
      {activeTab === 'augments' && (
        <div className="space-y-8">
          {/* SECTION A: ENHANCEMENTS */}
          <div>
            <h2 className="font-pixel text-sm text-cyan-400 glow-cyan mb-2 flex items-center gap-2">
              <span>💎</span> 1. CARD ENHANCEMENTS (MATERIAL ALTERATIONS)
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Permanent modifications to the card's physical/digital material that activate upon score, draw, or hand stand.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(CARD_ENHANCEMENTS).map(enh => {
                const sampleCard: Card = {
                  id: `demo-${enh.type}`,
                  suit: previewSuit,
                  rank: previewRank,
                  enhancement: enh.type,
                };
                return (
                  <div key={enh.type} className="pixel-box p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 flex items-center gap-4">
                    <div className="shrink-0">
                      <CardView card={sampleCard} compact={true} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{enh.icon}</span>
                        <span className="font-pixel text-xs text-white truncate">{enh.name}</span>
                        <span
                          className="px-1 py-0.2 rounded text-[7px] font-pixel font-bold uppercase shrink-0"
                          style={{ backgroundColor: enh.color, color: '#000' }}
                        >
                          {enh.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono leading-snug">{enh.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: EDITIONS */}
          <div>
            <h2 className="font-pixel text-sm text-fuchsia-400 glow-purple mb-2 flex items-center gap-2">
              <span>✨</span> 2. HOLOGRAPHIC EDITIONS (SPECULAR FOILS)
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Visual holographic coatings that add raw chips, flat multipliers, or exponential multipliers to attacks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(CARD_EDITIONS).map(ed => {
                const sampleCard: Card = {
                  id: `demo-${ed.type}`,
                  suit: previewSuit,
                  rank: previewRank,
                  edition: ed.type,
                };
                return (
                  <div key={ed.type} className="pixel-box p-4 rounded-lg border border-fuchsia-500/30 bg-slate-950/80 flex items-center gap-4">
                    <div className="shrink-0">
                      <CardView card={sampleCard} compact={true} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-pixel text-xs text-white">{ed.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[8px] font-pixel font-bold"
                          style={{ backgroundColor: ed.color, color: '#000' }}
                        >
                          {ed.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">{ed.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION C: SEALS */}
          <div>
            <h2 className="font-pixel text-sm text-amber-400 glow-gold mb-2 flex items-center gap-2">
              <span>🔴</span> 3. CIRCUIT SEALS (MICROCHIP STAMPS)
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              High-frequency microchips stamped into card corners that trigger re-triggers, bounty payouts, or gear fabrications.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(CARD_SEALS).map(seal => {
                const sampleCard: Card = {
                  id: `demo-${seal.type}`,
                  suit: previewSuit,
                  rank: previewRank,
                  seal: seal.type,
                };
                return (
                  <div key={seal.type} className="pixel-box p-3.5 rounded-lg border border-amber-500/30 bg-slate-950/80 flex items-center gap-3">
                    <div className="shrink-0">
                      <CardView card={sampleCard} compact={true} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{seal.icon}</span>
                        <span className="font-pixel text-[11px] text-white">{seal.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono leading-tight">{seal.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STARTER DECKS & CYBER-STAKES */}
      {/* ============================================================== */}
      {activeTab === 'decks_stakes' && (
        <div className="space-y-8">
          {/* STARTER DECKS */}
          <div>
            <h2 className="font-pixel text-sm text-cyan-400 glow-cyan mb-2 flex items-center gap-2">
              <span>🎴</span> STARTER DECK ARCHITECTURES
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Choose your custom baseline deck with tailored bankrolls, starting gear, and special rules.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STARTER_DECKS.map(deck => {
                const isUnlocked = careerManager.isDeckUnlocked(deck.id);
                const beatenStakes = profile.completedStakes[deck.id] || [];

                return (
                  <div
                    key={deck.id}
                    className={`pixel-box p-4 rounded-lg border flex flex-col justify-between ${
                      isUnlocked ? 'border-cyan-500/40 bg-slate-950/85' : 'border-slate-800 bg-slate-950/50 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{deck.icon}</span>
                          <div>
                            <h3 className="font-pixel text-xs text-white">{deck.name}</h3>
                            <div className="text-[9px] font-mono text-cyan-400">{deck.subtitle}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[8px] font-pixel px-1.5 py-0.5 rounded ${
                            isUnlocked
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 font-mono leading-relaxed mb-3">{deck.description}</p>

                      <div className="space-y-1.5 text-[10px] font-mono bg-slate-900/60 p-2.5 rounded border border-slate-800">
                        <div className="text-emerald-400">
                          <span className="font-bold font-pixel">PERK:</span> {deck.perksDescription}
                        </div>
                        <div className="text-amber-400">
                          <span className="font-bold font-pixel">RULES:</span> {deck.specialRulesDescription}
                        </div>
                        {!isUnlocked && deck.unlockCondition && (
                          <div className="text-rose-400 pt-1 border-t border-slate-800">
                            <span className="font-bold font-pixel">UNLOCK:</span> {deck.unlockCondition}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">Stakes Conquered:</span>
                      <span className="text-cyan-400 font-pixel font-bold">
                        {beatenStakes.length} / {STAKES_LIST.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ASCENSION STAKES */}
          <div>
            <h2 className="font-pixel text-sm text-yellow-400 glow-gold mb-2 flex items-center gap-2">
              <span>⚡</span> 8 CYBER-ASCENSION DIFFICULTY STAKES
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Escalating heat stakes that apply compounding modifiers to test your deckbuilding mastery.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STAKES_LIST.map((stake, idx) => (
                <div
                  key={stake.id}
                  className="pixel-box p-3.5 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-xs text-white">
                        {idx + 1}. {stake.name}
                      </span>
                      <span
                        className="text-[8px] font-pixel px-1.5 py-0.5 rounded font-bold"
                        style={{ backgroundColor: stake.color, color: '#000' }}
                      >
                        {stake.badge}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400 mb-1.5">{stake.subtitle}</div>
                    <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{stake.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CONSUMABLES & GEAR */}
      {/* ============================================================== */}
      {activeTab === 'consumables' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONSUMABLES_CATALOG.map(item => (
            <div key={item.id} className="pixel-box p-4 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-pixel text-xs text-emerald-300">{item.name}</span>
                  </div>
                  <span className="font-pixel text-xs text-amber-400 font-bold">{item.cost} 🪙</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex justify-between">
                <span>Category:</span>
                <span className="text-cyan-400 uppercase font-pixel text-[9px]">Tactical Hack</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: BOSS INTEL DOSSIER */}
      {/* ============================================================== */}
      {activeTab === 'bosses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOSSES.map(boss => (
            <div key={boss.id} className="pixel-box p-4 rounded-lg border border-red-900/40 bg-red-950/15 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-pixel text-xs text-red-400">{boss.name}</h3>
                    <div className="text-[10px] font-mono text-slate-400">{boss.title}</div>
                  </div>
                  <span className="text-xs font-pixel bg-red-900/60 text-red-200 px-2 py-0.5 rounded border border-red-700">
                    ACT {boss.act}
                  </span>
                </div>
                <div className="my-2 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Boss Health:</span>
                    <span className="text-red-400 font-bold">{boss.maxHp} HP</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Base Strike Damage:</span>
                    <span className="text-orange-400 font-bold">{boss.baseDamage} DMG</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-black/50 rounded border border-red-950 text-xs font-mono text-red-300/90 leading-tight">
                  <span className="text-red-400 font-bold">Protocol:</span> {boss.specialRule}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-red-950/80 text-[10px] text-slate-500 font-mono text-center">
                Counter with high Armor retention and early Glass / Retrigger burst damage.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CAREER ARCHIVE & RUN HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'career_history' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Runs', val: lifetime.totalRuns, color: 'text-cyan-400' },
              { label: 'Victories', val: lifetime.runsWon, color: 'text-emerald-400' },
              { label: 'Blackjacks', val: lifetime.blackjacks, color: 'text-yellow-400' },
              { label: 'Highest Hand', val: `${lifetime.highestHandScore} pts`, color: 'text-fuchsia-400' },
              { label: 'Bosses Crushed', val: lifetime.bossesDefeated, color: 'text-rose-400' },
              { label: 'Cards Enhanced', val: lifetime.cardsEnhanced, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="pixel-box p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase">{s.label}</div>
                <div className={`font-pixel text-sm sm:text-base font-bold mt-1 ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* RUN HISTORY ARCHIVE LOG */}
          <div>
            <h2 className="font-pixel text-xs text-cyan-300 uppercase tracking-wider mb-3">
              Telemetry Log: Last {profile.runHistory.length} Expeditions
            </h2>
            {profile.runHistory.length === 0 ? (
              <div className="pixel-box p-8 text-center text-slate-500 font-pixel text-xs border border-slate-800 bg-slate-950/50">
                NO EXPEDITION TELEMETRY RECORDED YET. EMBARK ON A RUN FROM THE TERMINAL.
              </div>
            ) : (
              <div className="space-y-2.5">
                {profile.runHistory.map(run => {
                  const isWin = run.outcome === 'victory';
                  const dateStr = new Date(run.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={run.id}
                      className={`p-3.5 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isWin
                          ? 'border-emerald-500/50 bg-emerald-950/15'
                          : 'border-red-900/40 bg-red-950/15'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{isWin ? '🏆' : '💀'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-pixel text-xs font-bold ${
                                isWin ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isWin ? 'VICTORY' : 'DEFEATED IN ACT ' + run.act}
                            </span>
                            <span className="text-[9px] font-pixel px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 uppercase border border-slate-700">
                              {run.stakeId.toUpperCase()} STAKE
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            Deck: <span className="text-slate-200">{run.deckId}</span> • Final Score:{' '}
                            <span className="text-yellow-400 font-bold">{run.score}</span> • Enhanced Cards:{' '}
                            <span className="text-cyan-400 font-bold">{run.enhancedCardCount}</span>
                          </div>
                          {!isWin && run.defeatReason && (
                            <div className="text-[10px] font-mono text-rose-400/90 mt-0.5">
                              Cause: {run.defeatReason}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto text-right font-mono text-[10px] text-slate-400">
                        <span>{dateStr}</span>
                        <span className="text-amber-400">{run.chipsEarned} 🪙 Earned</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
