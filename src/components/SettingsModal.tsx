import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GameSettings } from '../shared/types';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  musicMuted: false,
  sfxMuted: false,
  crtEnabled: true,
  crtPreset: 'classic',
  scanlines: true,
  curvature: true,
  chromaticAberration: true,
  vignette: true,
  screenShake: true,
  reducedMotion: false,
  graphicsQuality: 'medium',
  gameSpeed: 'normal',
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const update = (partial: Partial<GameSettings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    soundManager.setVolumes(
      updated.masterVolume,
      updated.musicVolume,
      updated.sfxVolume,
      updated.musicMuted,
      updated.sfxMuted
    );
  };

  const handleCrtPresetChange = (preset: 'off' | 'subtle' | 'classic' | 'heavy') => {
    if (preset === 'off') {
      update({
        crtPreset: 'off',
        crtEnabled: false,
        scanlines: false,
        curvature: false,
        chromaticAberration: false,
        vignette: false,
      });
    } else if (preset === 'subtle') {
      update({
        crtPreset: 'subtle',
        crtEnabled: true,
        scanlines: true,
        curvature: false,
        chromaticAberration: false,
        vignette: true,
      });
    } else if (preset === 'classic') {
      update({
        crtPreset: 'classic',
        crtEnabled: true,
        scanlines: true,
        curvature: true,
        chromaticAberration: true,
        vignette: true,
      });
    } else if (preset === 'heavy') {
      update({
        crtPreset: 'heavy',
        crtEnabled: true,
        scanlines: true,
        curvature: true,
        chromaticAberration: true,
        vignette: true,
      });
    }
  };

  const handleQualityChange = (quality: 'low' | 'medium' | 'high') => {
    if (quality === 'low') {
      update({
        graphicsQuality: 'low',
        crtPreset: 'off',
        crtEnabled: false,
        scanlines: false,
        curvature: false,
        screenShake: false,
      });
    } else if (quality === 'medium') {
      update({
        graphicsQuality: 'medium',
        crtPreset: 'classic',
        crtEnabled: true,
        scanlines: true,
        curvature: true,
        screenShake: true,
      });
    } else if (quality === 'high') {
      update({
        graphicsQuality: 'high',
        crtPreset: 'heavy',
        crtEnabled: true,
        scanlines: true,
        curvature: true,
        chromaticAberration: true,
        vignette: true,
        screenShake: true,
      });
    }
  };

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
        className="pixel-box max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 text-slate-200 border-2 border-cyan-500/50 shadow-2xl rounded-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-5">
          <h2 className="font-pixel text-cyan-400 text-sm sm:text-base flex items-center gap-2">
            <span>⚙️</span> SYSTEM CONFIGURATION
          </h2>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="pixel-btn px-2 py-1 bg-red-950/50 hover:bg-red-800 border-red-500 text-red-200 text-xs font-pixel rounded"
          >
            ESC [X]
          </button>
        </div>

        {/* AUDIO CONTROLS */}
        <div className="space-y-4 mb-6">
          <h3 className="font-pixel text-xs text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔊</span> Audio Matrix
          </h3>

          <div className="space-y-3 bg-slate-900/60 p-3 rounded border border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={e => update({ masterVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>Music Volume (Lo-Fi Synth)</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={e => update({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span>SFX Volume</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={e => update({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.musicMuted}
                  onChange={e => update({ musicMuted: e.target.checked })}
                  className="accent-rose-500"
                />
                Mute Music
              </label>
              <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sfxMuted}
                  onChange={e => update({ sfxMuted: e.target.checked })}
                  className="accent-rose-500"
                />
                Mute SFX
              </label>
            </div>
          </div>
        </div>

        {/* CRT & GRAPHICS PRESETS */}
        <div className="space-y-4 mb-6">
          <h3 className="font-pixel text-xs text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>📺</span> Retro CRT & Display Engine
          </h3>

          <div className="space-y-3 bg-slate-900/60 p-3 rounded border border-slate-800">
            <div>
              <div className="text-xs font-mono mb-2">Graphics Preset</div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      soundManager.playButtonClick();
                      handleQualityChange(q);
                    }}
                    className={`pixel-btn py-1 text-xs font-pixel uppercase rounded border ${
                      settings.graphicsQuality === q
                        ? 'bg-cyan-500 text-black border-cyan-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-mono mb-2">CRT Shading Preset</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['off', 'subtle', 'classic', 'heavy'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      soundManager.playButtonClick();
                      handleCrtPresetChange(p);
                    }}
                    className={`pixel-btn py-1 text-[10px] font-pixel uppercase rounded border ${
                      settings.crtPreset === p
                        ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scanlines}
                  onChange={e => update({ scanlines: e.target.checked })}
                  className="accent-cyan-400"
                />
                Scanlines
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.curvature}
                  onChange={e => update({ curvature: e.target.checked })}
                  className="accent-cyan-400"
                />
                Curvature
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.chromaticAberration}
                  onChange={e => update({ chromaticAberration: e.target.checked })}
                  className="accent-cyan-400"
                />
                Chromatic Aberration
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.vignette}
                  onChange={e => update({ vignette: e.target.checked })}
                  className="accent-cyan-400"
                />
                Vignette
              </label>
            </div>
          </div>
        </div>

        {/* ACCESSIBILITY & GAMEPLAY */}
        <div className="space-y-4 mb-6">
          <h3 className="font-pixel text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🕹️</span> Accessibility & Game Speed
          </h3>

          <div className="space-y-2 bg-slate-900/60 p-3 rounded border border-slate-800 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.screenShake}
                onChange={e => update({ screenShake: e.target.checked })}
                className="accent-emerald-400"
              />
              Screen Shake on Impacts
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={e => update({ reducedMotion: e.target.checked })}
                className="accent-emerald-400"
              />
              Reduced Motion
            </label>
            <div className="flex items-center justify-between pt-2">
              <span>Game Combat Pace:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => update({ gameSpeed: 'normal' })}
                  className={`pixel-btn px-2 py-0.5 text-xs rounded border ${
                    settings.gameSpeed === 'normal'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => update({ gameSpeed: 'fast' })}
                  className={`pixel-btn px-2 py-0.5 text-xs rounded border ${
                    settings.gameSpeed === 'fast'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  Turbo Fast
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onUpdateSettings(DEFAULT_SETTINGS);
            }}
            className="text-xs text-slate-400 hover:text-white underline font-mono"
          >
            Restore Factory Defaults
          </button>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="pixel-btn px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs rounded border-cyan-300 font-bold"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
