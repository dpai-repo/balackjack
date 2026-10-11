import React, { useState } from 'react';
import { CHARACTERS } from '../shared/characters';
import { CharacterLoadout } from '../shared/types';
import { getJokerById } from '../shared/jokers';
import { getConsumableById } from '../shared/consumables';
import { soundManager } from '../audio/soundManager';

interface CharacterSelectViewProps {
  onSelectCharacter: (char: CharacterLoadout) => void;
  onBack: () => void;
}

export const CharacterSelectView: React.FC<CharacterSelectViewProps> = ({
  onSelectCharacter,
  onBack,
}) => {
  const [selectedId, setSelectedId] = useState<string>(CHARACTERS[0].id);
  const selectedChar = CHARACTERS.find(c => c.id === selectedId) || CHARACTERS[0];
  const startJoker = getJokerById(selectedChar.startingJokerId);
  const startConsumable = getConsumableById(selectedChar.startingConsumableId);

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      <div className="text-center mb-6">
        <h1 className="font-pixel text-xl sm:text-2xl text-cyan-400 glow-cyan mb-2">
          CHOOSE YOUR OPERATIVE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono">
          Select your tactical loadout before hacking the dealer syndicate.
        </p>
      </div>

      {/* CHARACTER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CHARACTERS.map(char => {
          const isSelected = char.id === selectedId;
          return (
            <div
              key={char.id}
              onClick={() => {
                soundManager.playButtonClick();
                setSelectedId(char.id);
              }}
              className={`pixel-box p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900 shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-[1.02]'
                  : 'border-slate-800 hover:border-slate-600 bg-slate-950/60'
              }`}
            >
              <div
                className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center font-pixel text-xl shadow-inner border border-white/10"
                style={{ backgroundColor: `${char.color}22`, color: char.color }}
              >
                {char.id === 'card_sharp' ? '♠' : char.id === 'cyber_punk' ? '⚡' : char.id === 'high_roller' ? '💎' : '❤️'}
              </div>
              <h3 className="font-pixel text-xs text-white mb-0.5">{char.name}</h3>
              <div className="text-[11px] font-mono text-cyan-400 mb-2">{char.title}</div>
              <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-3">
                {char.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* LOADOUT DOSSIER */}
      <div className="pixel-box p-5 rounded-lg border-2 border-slate-700 bg-slate-900/90 mb-6">
        <h2 className="font-pixel text-xs sm:text-sm text-yellow-400 mb-3 flex items-center gap-2">
          <span>📋</span> TACTICAL DOSSIER: {selectedChar.name.toUpperCase()}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-xs font-mono">
          <div className="bg-black/40 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block mb-1">Vitality:</span>
            <span className="text-emerald-400 font-bold text-sm">{selectedChar.hp} HP</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block mb-1">Starting Shield:</span>
            <span className="text-cyan-400 font-bold text-sm">+{selectedChar.armor} Armor</span>
          </div>
          <div className="bg-black/40 p-2.5 rounded border border-slate-800">
            <span className="text-slate-400 block mb-1">Starting Chips:</span>
            <span className="text-yellow-400 font-bold text-sm">{selectedChar.chips} 🪙</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{startJoker?.icon}</span>
              <span className="font-pixel text-xs text-yellow-300">
                Starting Joker: {startJoker?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">{startJoker?.description}</p>
          </div>

          <div className="bg-black/40 p-3 rounded border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{startConsumable?.icon}</span>
              <span className="font-pixel text-xs text-emerald-300">
                Starting Gear: {startConsumable?.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">{startConsumable?.description}</p>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-pixel rounded text-slate-300"
        >
          ← CANCEL
        </button>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onSelectCharacter(selectedChar);
          }}
          className="pixel-btn px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs sm:text-sm font-bold rounded border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
        >
          INITIALIZE MISSION [SPACE] →
        </button>
      </div>
    </div>
  );
};
