import React, { useState } from 'react';
import { Card, Joker } from '../shared/types';
import { CardView } from './CardView';
import { soundManager } from '../audio/soundManager';

interface RewardViewProps {
  act: number;
  offeredCards: Card[];
  offeredJokers: Joker[];
  chipsReward: number;
  onPickCard: (card: Card) => void;
  onPickJoker: (joker: Joker) => void;
  onSkipReward: () => void;
  onRestHeal: () => void;
}

export const RewardView: React.FC<RewardViewProps> = ({
  act,
  offeredCards,
  offeredJokers,
  chipsReward,
  onPickCard,
  onPickJoker,
  onSkipReward,
  onRestHeal,
}) => {
  const [tab, setTab] = useState<'joker' | 'card'>('joker');

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      <div className="text-center mb-6">
        <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 font-pixel text-xs rounded border border-yellow-500/40 mb-2">
          ENCOUNTER SECURED +{chipsReward} 🪙 CHIPS
        </div>
        <h1 className="font-pixel text-xl sm:text-2xl text-cyan-400 glow-cyan">
          CHOOSE YOUR SPOILS
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Select an upgrade to strengthen your deck before Act {act + 1}.
        </p>
      </div>

      {/* TABS */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setTab('joker');
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel rounded border ${
            tab === 'joker'
              ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          🃏 Acquire New Joker
        </button>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            setTab('card');
          }}
          className={`pixel-btn px-4 py-2 text-xs font-pixel rounded border ${
            tab === 'card'
              ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          ✨ Draft Enhanced Card
        </button>
      </div>

      {/* JOKER SELECTION */}
      {tab === 'joker' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {offeredJokers.map(joker => (
            <div
              key={joker.id}
              onClick={() => {
                soundManager.playButtonClick();
                onPickJoker(joker);
              }}
              className="pixel-box p-4 rounded-lg cursor-pointer hover:border-yellow-400 hover:scale-105 transition-all flex flex-col justify-between border-2 border-slate-800 bg-slate-950/80 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{joker.icon}</span>
                  <span className="text-[9px] font-pixel uppercase px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    {joker.rarity}
                  </span>
                </div>
                <h3 className="font-pixel text-xs text-yellow-300 mb-2 group-hover:text-yellow-400">
                  {joker.name}
                </h3>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  {joker.description}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-800 text-center font-pixel text-[10px] text-yellow-400">
                [CLICK TO EQUIP]
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CARD SELECTION */}
      {tab === 'card' && (
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {offeredCards.map(card => (
            <div
              key={card.id}
              onClick={() => {
                soundManager.playButtonClick();
                onPickCard(card);
              }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <CardView card={card} />
              <button className="pixel-btn px-3 py-1 bg-cyan-950/60 group-hover:bg-cyan-500 group-hover:text-black border border-cyan-500/40 text-cyan-300 text-[10px] font-pixel rounded transition-colors">
                TAKE CARD
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REST / SKIP OPTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            soundManager.playHeal();
            onRestHeal();
          }}
          className="pixel-btn px-4 py-2 bg-emerald-950/80 hover:bg-emerald-800 border-emerald-500 text-emerald-200 text-xs font-pixel rounded flex items-center gap-1.5"
        >
          <span>💊</span> Field Medkit: Restore +25 HP
        </button>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onSkipReward();
          }}
          className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-pixel rounded"
        >
          SKIP UPGRADE →
        </button>
      </div>
    </div>
  );
};
