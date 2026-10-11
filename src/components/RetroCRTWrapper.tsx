import React from 'react';
import { GameSettings } from '../shared/types';

interface RetroCRTWrapperProps {
  settings: GameSettings;
  isShaking?: boolean;
  children: React.ReactNode;
}

export const RetroCRTWrapper: React.FC<RetroCRTWrapperProps> = ({
  settings,
  isShaking = false,
  children,
}) => {
  const isCrtActive = settings.crtEnabled && settings.crtPreset !== 'off';

  let containerClasses = 'crt-container relative min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col ';

  if (settings.screenShake && isShaking) {
    containerClasses += 'screen-shaking ';
  }

  if (isCrtActive) {
    if (settings.curvature) containerClasses += 'crt-curvature ';
    if (settings.scanlines) containerClasses += 'crt-scanlines ';
    if (settings.vignette) containerClasses += 'crt-vignette ';
    if (settings.crtPreset === 'heavy') containerClasses += 'crt-flicker ';
    if (settings.chromaticAberration) containerClasses += 'chromatic-aberration ';
  }

  return (
    <div className={containerClasses}>
      {/* Top Monitor Bezel Glow in High Quality */}
      {isCrtActive && settings.graphicsQuality === 'high' && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent z-40" />
      )}
      {children}
    </div>
  );
};
