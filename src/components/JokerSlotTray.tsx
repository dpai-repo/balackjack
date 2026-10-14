import React, { useState } from 'react';
import { Joker, ComboLink } from '../shared/types';
import { AFFINITY_METAS, evaluateComboLinks, getSlotMultiplier } from '../shared/jokers';
import { soundManager } from '../audio/soundManager';

interface JokerSlotTrayProps {
  unlockedSlots: number; // 3 to 6
  slots: (Joker | null)[];
  onReorderSlots: (newSlots: (Joker | null)[]) => void;
  activeLinks?: ComboLink[];
  compact?: boolean;
}

export const JokerSlotTray: React.FC<JokerSlotTrayProps> = ({
  unlockedSlots,
  slots,
  onReorderSlots,
  activeLinks: externalLinks,
  compact = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedMobileIndex, setSelectedMobileIndex] = useState<number | null>(null);

  // Compute active links from current slots configuration
  const currentSlots = slots.slice(0, unlockedSlots);
  while (currentSlots.length < unlockedSlots) {
    currentSlots.push(null);
  }
  const links = externalLinks || evaluateComboLinks(currentSlots);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!currentSlots[index]) return;
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setHoverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setHoverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setHoverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newSlots = [...currentSlots];
    const temp = newSlots[draggedIndex];
    newSlots[draggedIndex] = newSlots[targetIndex];
    newSlots[targetIndex] = temp;

    setDraggedIndex(null);
    soundManager.playComboLink();
    onReorderSlots(newSlots);
  };

  // Mobile / Click-to-swap support
  const handleSlotClick = (index: number) => {
    if (selectedMobileIndex === null) {
      if (currentSlots[index]) {
        setSelectedMobileIndex(index);
        soundManager.playButtonClick();
      }
    } else {
      if (selectedMobileIndex !== index) {
        const newSlots = [...currentSlots];
        const temp = newSlots[selectedMobileIndex];
        newSlots[selectedMobileIndex] = newSlots[index];
        newSlots[index] = temp;
        soundManager.playComboLink();
        onReorderSlots(newSlots);
      }
      setSelectedMobileIndex(null);
    }
  };

  return (
    <div className="w-full">
      {/* TRAY HEADER */}
      <div className="flex items-center justify-between mb-1.5 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-pixel text-yellow-400">
            JOKER MATRIX ({currentSlots.filter(Boolean).length}/{unlockedSlots} SLOTS)
          </span>
          {links.length > 0 && (
            <span className="text-[9px] font-pixel text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/50 animate-pulse">
              ⚡ {links.length} ACTIVE COMBO LINK{links.length > 1 ? 'S' : ''}!
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
          Drag & Drop or Click to Rearrange • Adjacent Affinities Trigger Resonance
        </span>
      </div>

      {/* SLOTS CONTAINER */}
      <div className="relative flex items-center justify-start sm:justify-center gap-2 sm:gap-3 p-2 bg-slate-950/80 rounded-lg border border-slate-800 overflow-x-auto select-none">
        {currentSlots.map((joker, index) => {
          const isOccupied = !!joker;
          const isSelected = selectedMobileIndex === index;
          const isHovered = hoverIndex === index;
          const mult = getSlotMultiplier(index, links);
          const hasActiveLink = mult > 1;

          // Check if link exists to next slot
          const linkToNext = links.find(l => l.sourceIndex === index && l.targetIndex === index + 1);

          return (
            <React.Fragment key={index}>
              {/* JOKER SLOT */}
              <div
                draggable={isOccupied}
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={e => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, index)}
                onClick={() => handleSlotClick(index)}
                className={`relative flex flex-col items-center justify-between rounded-lg p-1.5 sm:p-2 cursor-pointer transition-all duration-150 ${
                  compact
                    ? 'w-16 h-20 sm:w-20 sm:h-24'
                    : 'w-20 h-24 sm:w-24 sm:h-28'
                } ${
                  isHovered
                    ? 'border-2 border-yellow-400 bg-yellow-950/30 scale-105'
                    : isSelected
                    ? 'border-2 border-cyan-400 ring-2 ring-cyan-400/50 bg-cyan-950/40 scale-105'
                    : hasActiveLink
                    ? 'border-2 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)] bg-slate-900'
                    : isOccupied
                    ? 'border-2 border-slate-700 hover:border-slate-400 bg-slate-900'
                    : 'border-2 border-dashed border-slate-800 bg-slate-950/40 hover:border-slate-600'
                }`}
                title={
                  joker
                    ? `${joker.name} (Slot ${index + 1})\n${joker.description}${
                        hasActiveLink ? `\n🔥 COMBO ACTIVE: x${mult.toFixed(2)} Synergized!` : ''
                      }`
                    : `Slot ${index + 1} (Empty)`
                }
              >
                {/* SLOT NUMBER WATERMARK */}
                <span className="absolute top-1 left-1.5 text-[8px] font-pixel text-slate-600">
                  #{index + 1}
                </span>

                {/* SYNERGY MULTIPLIER BADGE */}
                {hasActiveLink && (
                  <div className="absolute -top-2 right-1 px-1 py-0.2 bg-gradient-to-r from-cyan-500 to-sky-400 text-black text-[8px] font-pixel font-bold rounded shadow-sm border border-black/40 animate-pulse">
                    x{mult.toFixed(2)}
                  </div>
                )}

                {joker ? (
                  <>
                    {/* JOKER ICON */}
                    <div className="my-auto text-xl sm:text-2xl transition-transform hover:scale-110">
                      {joker.icon}
                    </div>

                    {/* JOKER NAME */}
                    <div className="w-full text-center">
                      <div className="font-pixel text-[8px] sm:text-[9px] text-slate-200 truncate">
                        {joker.name}
                      </div>

                      {/* AFFINITY TAGS */}
                      <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                        {joker.affinityTags?.map(tag => {
                          const meta = AFFINITY_METAS[tag];
                          return (
                            <span
                              key={tag}
                              className="text-[6px] sm:text-[7px] font-pixel px-1 py-0.2 rounded uppercase border border-black/30"
                              style={{ backgroundColor: meta.color, color: '#000' }}
                            >
                              {meta.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="my-auto text-center">
                    <span className="text-slate-600 text-xs sm:text-sm font-pixel block">+</span>
                    <span className="text-[7px] font-pixel text-slate-600 uppercase">EMPTY</span>
                  </div>
                )}
              </div>

              {/* INTER-SLOT CONDUIT / COMBO LINK WIRE */}
              {index < unlockedSlots - 1 && (
                <div className="flex flex-col items-center justify-center -mx-1 sm:-mx-1.5 z-10">
                  {linkToNext ? (
                    <div
                      className="neon-wire-glow px-1 py-0.5 rounded text-[7px] font-pixel font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-md border"
                      style={{
                        backgroundColor: AFFINITY_METAS[linkToNext.synergyTag]?.color || '#00f0ff',
                        color: '#000',
                        borderColor: '#fff',
                      }}
                      title={`${linkToNext.synergyName}: ${linkToNext.synergyBonusText}`}
                    >
                      <span>⚡</span>
                      <span className="hidden sm:inline">{linkToNext.synergyName}</span>
                    </div>
                  ) : (
                    <div className="w-3 sm:w-4 h-0.5 bg-slate-800" />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* LOCKED SLOTS PREVIEW (UP TO 6 MAX) */}
        {unlockedSlots < 6 && (
          <div
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-800/60 bg-black/30 text-center opacity-60 p-2 ${
              compact ? 'w-16 h-20 sm:w-20 sm:h-24' : 'w-20 h-24 sm:w-24 sm:h-28'
            }`}
            title={`Slot ${unlockedSlots + 1} Locked - Unlock via Matrix Expansion Voucher card in the Shop`}
          >
            <span className="text-slate-600 text-base sm:text-lg mb-1">🔒</span>
            <span className="text-[7px] font-pixel text-slate-500 uppercase">SLOT {unlockedSlots + 1}</span>
            <span className="text-[6px] font-mono text-slate-600">IN SHOP</span>
          </div>
        )}
      </div>
    </div>
  );
};
