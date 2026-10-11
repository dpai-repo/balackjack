import React from 'react';
import { FloatingText } from '../shared/types';

interface FloatingCombatTextProps {
  items: FloatingText[];
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ items }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute font-pixel font-bold text-sm sm:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] animate-bounce"
          style={{
            left: item.x ? `${item.x}%` : '50%',
            top: item.y ? `${item.y}%` : '40%',
            transform: 'translate(-50%, -50%)',
            color: item.color,
          }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
};
