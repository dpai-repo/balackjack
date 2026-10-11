import React from 'react';
import { Boss } from '../shared/types';
import { BOSSES } from '../shared/bosses';
import { soundManager } from '../audio/soundManager';

interface RunMapViewProps {
  currentAct: number;
  stageType: 'combat' | 'elite' | 'shop' | 'boss';
  onEnterNode: () => void;
}

export const RunMapView: React.FC<RunMapViewProps> = ({
  currentAct,
  stageType,
  onEnterNode,
}) => {
  const currentBoss: Boss = BOSSES[currentAct - 1] || BOSSES[BOSSES.length - 1];

  const acts = [
    { act: 1, name: 'The Pit Boss', icon: '👤', danger: 'LOW' },
    { act: 2, name: 'Madame Roulette', icon: '🎲', danger: 'MEDIUM' },
    { act: 3, name: 'Cyber Croupier', icon: '🤖', danger: 'HIGH' },
    { act: 4, name: 'The High Roller', icon: '💎', danger: 'LETHAL' },
    { act: 5, name: 'The Grand Algorithm', icon: '🧠', danger: 'FINAL BOSS' },
  ];

  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      <div className="text-center mb-6">
        <h1 className="font-pixel text-xl sm:text-2xl text-cyan-400 glow-cyan mb-1">
          SYNDICATE NETWORK MAP
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Route your run through the underground servers to reach The Grand Algorithm.
        </p>
      </div>

      {/* TIMELINE PATH */}
      <div className="space-y-4 mb-8">
        {acts.map(item => {
          const isPassed = item.act < currentAct;
          const isCurrent = item.act === currentAct;
          const isFuture = item.act > currentAct;

          return (
            <div
              key={item.act}
              className={`pixel-box p-4 rounded-lg flex items-center justify-between transition-all ${
                isCurrent
                  ? 'border-2 border-cyan-400 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : isPassed
                  ? 'border border-slate-800 bg-black/40 opacity-50'
                  : 'border border-slate-900 bg-black/20 opacity-40'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-pixel text-lg ${
                    isCurrent
                      ? 'bg-cyan-500 text-black font-bold animate-pulse'
                      : isPassed
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {isPassed ? '✓' : item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-white">ACT {item.act}: {item.name}</span>
                    <span
                      className={`text-[9px] font-pixel px-1.5 py-0.2 rounded ${
                        item.danger === 'FINAL BOSS'
                          ? 'bg-rose-900 text-rose-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.danger}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {isCurrent ? `Target Locked: ${stageType.toUpperCase()} ENCOUNTER` : isPassed ? 'NODE CLEARED' : 'SIGNAL ENCRYPTED'}
                  </div>
                </div>
              </div>

              {isCurrent && (
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    onEnterNode();
                  }}
                  className="pixel-btn px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-pixel text-xs font-bold rounded border-cyan-200 shadow-lg"
                >
                  ENGAGE NODE →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* CURRENT BOSS PREVIEW */}
      <div className="p-4 rounded-lg border border-red-900/60 bg-red-950/20 text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <span className="text-red-400 font-pixel font-bold">NEXT BOSS INTEL: {currentBoss.name}</span>
          <span className="text-slate-400">MAX HP: {currentBoss.maxHp}</span>
        </div>
        <p className="text-slate-300">{currentBoss.specialRule}</p>
      </div>
    </div>
  );
};
