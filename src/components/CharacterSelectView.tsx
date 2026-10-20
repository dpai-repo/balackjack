import React, { useState } from 'react';
import { CHARACTERS } from '../shared/characters';
import { CharacterLoadout, StarterDeck, StakeLevel } from '../shared/types';
import { getJokerById } from '../shared/jokers';
import { getConsumableById } from '../shared/consumables';
import { STARTER_DECKS } from '../shared/starterDecks';
import { STAKES_LIST, STAKES_MAP } from '../shared/stakes';
import { careerManager } from '../shared/careerManager';
import { soundManager } from '../audio/soundManager';

interface CharacterSelectViewProps {
  onSelectLoadout: (char: CharacterLoadout, deck: StarterDeck, stake: StakeLevel) => void;
  onBack: () => void;
}

export const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({
  onSelectLoadout,
  onBack,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(CHARACTERS[0].id);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(STARTER_DECKS[0].id);
  const [selectedStakeId, setSelectedStakeId] = useState<StakeLevel>('white');

  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];
  const selectedDeck = STARTER_DECKS.find(d => d.id === selectedDeckId) || STARTER_DECKS[0];
  const selectedStake = STAKES_MAP[selectedStakeId] || STAKES_LIST[0];

  const startJoker = getJokerById(selectedChar.startingJokerId);
  const startConsumable = getConsumableById(selectedChar.startingConsumableId);

  return (
    <div className="max-w-5xl mx-auto w-full p-3 sm:p-6 text-slate-200">
      <div className="text-center mb-6">
        <h1 className="font-pixel text-xl sm:text-2xl text-cyan-400 glow-cyan mb-1.5">
          MISSION DEPLOYMENT PROTOCOL
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Configure your cybernetic Operative, baseline Starter Deck, and Ascension Stake before breaching the Dealer Syndicate.
        </p>
      </div>

      {/* STEP 1: OPERATIVE SELECTION */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-pixel text-yellow-400">01 // SELECT OPERATIVE LOADOUT</span>
          <span className="text-[10px] font-mono text-slate-500">• 4 Distinct Cyber-Archetypes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CHARACTERS.map(char => {
            const isSelected = char.id === selectedCharId;
            return (
              <div
                key={char.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedCharId(char.id);
                }}
                className={`pixel-box p-3.5 rounded-lg cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-[1.02]'
                    : 'border-slate-800 hover:border-slate-600 bg-slate-950/60'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg mb-2.5 flex items-center justify-center font-pixel text-lg border border-white/10"
                  style={{ backgroundColor: `${char.color}22`, color: char.color }}
                >
                  {char.id === 'card_sharp' ? '♠' : char.id === 'cyber_punk' ? '⚡' : char.id === 'high_roller' ? '💎' : '❤️'}
                </div>
                <h3 className="font-pixel text-xs text-white mb-0.5">{char.name}</h3>
                <div className="text-[10px] font-mono text-cyan-400 mb-1.5">{char.title}</div>
                <p className="text-[10px] text-slate-400 font-mono leading-relaxed line-clamp-2">
                  {char.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: STARTER DECK CAROUSEL */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel text-yellow-400">02 // SELECT STARTER DECK</span>
            <span className="text-[10px] font-mono text-slate-500">• Neural architecture and starting bonuses</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STARTER_DECKS.map(deck => {
            const isUnlocked = careerManager.isDeckUnlocked(deck.id);
            const isSelected = deck.id === selectedDeckId;
            return (
              <div
                key={deck.id}
                onClick={() => {
                  if (isUnlocked) {
                    soundManager.playButtonClick();
                    setSelectedDeckId(deck.id);
                  }
                }}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col justify-between ${
                  !isUnlocked
                    ? 'border-slate-900 bg-slate-950/40 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{deck.icon}</span>
                    <span
                      className={`text-[7px] font-pixel px-1 py-0.2 rounded uppercase ${
                        isUnlocked ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isUnlocked ? 'READY' : 'LOCKED'}
                    </span>
                  </div>
                  <h4 className="font-pixel text-xs text-white mb-0.5">{deck.name}</h4>
                  <p className="text-[9px] text-slate-400 font-mono leading-tight mb-2">{deck.subtitle}</p>
                </div>
                <div className="text-[9px] font-mono text-emerald-400 bg-black/40 p-1.5 rounded border border-slate-800">
                  {deck.perksDescription}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: ASCENSION STAKES SELECTOR */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel text-yellow-400">03 // CYBER-ASCENSION STAKE</span>
            <span className="text-[10px] font-mono text-slate-500">• Compounding difficulty modifiers</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Current Stake: <span className="font-pixel text-white" style={{ color: selectedStake.color }}>{selectedStake.name}</span>
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAKES_LIST.map((stake, idx) => {
            const isUnlocked = careerManager.isStakeUnlocked(selectedDeckId, stake.id);
            const isSelected = stake.id === selectedStakeId;
            return (
              <button
                key={stake.id}
                disabled={!isUnlocked}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedStakeId(stake.id);
                }}
                className={`p-2 rounded border text-center transition-all ${
                  !isUnlocked
                    ? 'border-slate-900 bg-slate-950/40 text-slate-600 opacity-40 cursor-not-allowed'
                    : isSelected
                    ? 'ring-2 font-bold bg-slate-900 scale-105'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 text-slate-300'
                }`}
                style={{
                  borderColor: isSelected ? stake.color : undefined,
                  boxShadow: isSelected ? `0 0 10px ${stake.color}44` : undefined,
                }}
              >
                <div className="text-[9px] font-mono text-slate-400">STAKE {idx + 1}</div>
                <div className="font-pixel text-[10px] truncate" style={{ color: stake.color }}>
                  {stake.badge}
                </div>
              </button>
            );
          })}
        </div>
        {/* Selected Stake Detail Strip */}
        <div className="mt-2.5 p-2.5 bg-slate-950/90 border border-slate-800 rounded flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <span className="text-slate-300">{selectedStake.description}</span>
          </div>
        </div>
      </div>

      {/* DOSSIER SUMMARY & EMBARK */}
      <div className="pixel-box p-4 rounded-lg border-2 border-slate-700 bg-slate-900/90 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">OPERATIVE:</span>
            <span className="font-pixel text-cyan-300 font-bold">{selectedChar.name}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block text-[10px]">DECK ARCHITECTURE:</span>
            <span className="font-pixel text-yellow-300 font-bold">{selectedDeck.name}</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block text-[10px]">STARTING CHIPS:</span>
            <span className="font-pixel text-emerald-400 font-bold">{selectedChar.chips + selectedDeck.bonusChips} 🪙</span>
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block text-[10px]">DIFFICULTY STAKE:</span>
            <span className="font-pixel font-bold" style={{ color: selectedStake.color }}>
              {selectedStake.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onBack();
            }}
            className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-pixel rounded text-slate-300"
          >
            ← BACK
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onSelectLoadout(selectedChar, selectedDeck, selectedStakeId);
            }}
            className="pixel-btn flex-1 sm:flex-none px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs sm:text-sm font-bold rounded border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            BREACH MAINFRAME →
          </button>
        </div>
      </div>
    </div>
  );
};
