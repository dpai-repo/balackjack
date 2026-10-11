import React, { useState } from 'react';
import { JOKERS_CATALOG } from '../shared/jokers';
import { CARD_ENHANCEMENTS } from '../shared/enhancements';
import { CONSUMABLES_CATALOG } from '../shared/consumables';
import { BOSSES } from '../shared/bosses';
import { soundManager } from '../audio/soundManager';

interface CollectionViewProps {
  onBack: () => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'jokers' | 'enhancements' | 'consumables' | 'bosses'>('jokers');

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-xl text-cyan-400 glow-cyan flex items-center gap-2">
            <span>📚</span> THE BALACKJACK DATABASE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Classified intelligence on all cards, cyber Jokers, tech gear, and high-stakes bosses.
          </p>
        </div>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 border-slate-600 text-xs font-pixel rounded"
        >
          ← BACK TO TERMINAL
        </button>
      </div>

      {/* TABS */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { id: 'jokers', label: 'Jokers (15)', icon: '🃏' },
          { id: 'enhancements', label: 'Upgrades (8)', icon: '✨' },
          { id: 'consumables', label: 'Gear (7)', icon: '🎒' },
          { id: 'bosses', label: 'Bosses (5)', icon: '👹' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab(tab.id as any);
            }}
            className={`pixel-btn py-2 text-xs font-pixel rounded border transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="hidden sm:inline mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTab === 'jokers' &&
          JOKERS_CATALOG.map(joker => (
            <div key={joker.id} className="pixel-box p-4 rounded border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{joker.icon}</span>
                    <span className="font-pixel text-xs text-yellow-300">{joker.name}</span>
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
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{joker.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex justify-between">
                <span>Value:</span>
                <span className="text-amber-400 font-bold">{joker.cost} Chips</span>
              </div>
            </div>
          ))}

        {activeTab === 'enhancements' &&
          Object.values(CARD_ENHANCEMENTS).map(enh => (
            <div key={enh.type} className="pixel-box p-4 rounded border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-pixel text-xs text-cyan-300">{enh.name}</span>
                <span
                  className="text-[9px] font-pixel px-1.5 py-0.5 rounded font-bold"
                  style={{ backgroundColor: enh.color, color: '#000' }}
                >
                  {enh.badge}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{enh.description}</p>
            </div>
          ))}

        {activeTab === 'consumables' &&
          CONSUMABLES_CATALOG.map(item => (
            <div key={item.id} className="pixel-box p-4 rounded border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-pixel text-xs text-emerald-300">{item.name}</span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono flex justify-between">
                <span>Cost:</span>
                <span className="text-amber-400 font-bold">{item.cost} Chips</span>
              </div>
            </div>
          ))}

        {activeTab === 'bosses' &&
          BOSSES.map(boss => (
            <div key={boss.id} className="pixel-box p-4 rounded border border-red-900/40 bg-red-950/10">
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
                  <span>Strike Damage:</span>
                  <span className="text-orange-400 font-bold">{boss.baseDamage} DMG</span>
                </div>
              </div>
              <div className="mt-2 p-2 bg-black/40 rounded border border-red-950 text-xs font-mono text-red-300/90 leading-tight">
                <span className="text-red-400 font-bold">Protocol:</span> {boss.specialRule}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
