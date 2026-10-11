import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CombatStats } from '../shared/types';
import { soundManager } from '../audio/soundManager';

interface StatsModalProps {
  stats: CombatStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) {
          soundManager.playButtonClick();
          onClose();
        }
      }}
    >
      <div
        className="pixel-box w-full max-w-md p-6 text-slate-200 border-2 border-yellow-500/50 rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-yellow-500/30 pb-3 mb-4">
          <h2 className="font-pixel text-yellow-400 text-sm flex items-center gap-2">
            <span>🏆</span> OPERATIVE DOSSIER & STATS
          </h2>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="pixel-btn px-2 py-1 bg-red-950/50 hover:bg-red-800 border-red-500 text-red-200 text-xs font-pixel rounded"
          >
            [X]
          </button>
        </div>

        <div className="space-y-3 font-mono text-sm bg-slate-900/60 p-4 rounded border border-slate-800">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Total Combat Rounds Won:</span>
            <span className="text-emerald-400 font-bold">{stats.roundsWon}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Bosses Defeated:</span>
            <span className="text-yellow-400 font-bold">{stats.bossesDefeated}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Natural Blackjacks Dealt:</span>
            <span className="text-cyan-400 font-bold">{stats.blackjacksDealt}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Total Damage Inflicted:</span>
            <span className="text-purple-400 font-bold">{stats.damageDealt}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Highest Single Strike:</span>
            <span className="text-pink-400 font-bold">{stats.highestSingleHit}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Busts Endured:</span>
            <span className="text-red-400 font-bold">{stats.bustsOccurred}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Damage Sustained:</span>
            <span className="text-orange-400 font-bold">{stats.damageTaken}</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="mt-5 w-full pixel-btn py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-pixel text-xs rounded border-yellow-300 font-bold"
        >
          RETURN TO ARCHIVES
        </button>
      </div>
    </div>,
    document.body
  );
};
