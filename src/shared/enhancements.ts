import { CardEnhancementType } from './types';

export interface CardEnhancementMeta {
  type: CardEnhancementType;
  name: string;
  description: string;
  badge: string;
  color: string;
}

export const CARD_ENHANCEMENTS: Record<CardEnhancementType, CardEnhancementMeta> = {
  holographic: {
    type: 'holographic',
    name: 'Holographic',
    description: '+12 base attack damage when this card is played.',
    badge: 'HOLO',
    color: '#00f0ff',
  },
  polychrome: {
    type: 'polychrome',
    name: 'Polychrome',
    description: '1.5x multiplier to the entire attack when scored.',
    badge: 'POLY',
    color: '#ff00ea',
  },
  glitch: {
    type: 'glitch',
    name: 'Glitch Card',
    description: 'Quantum flexibility: shifts value automatically to prevent bust!',
    badge: 'GLITCH',
    color: '#39ff14',
  },
  armored: {
    type: 'armored',
    name: 'Armored',
    description: 'Instantly grants +10 Armor to the player when drawn.',
    badge: 'ARMOR',
    color: '#00d2ff',
  },
  radioactive: {
    type: 'radioactive',
    name: 'Radioactive',
    description: 'Inflicts 8 ongoing radiation damage directly to Dealer on stand.',
    badge: 'RAD',
    color: '#76ff03',
  },
  golden: {
    type: 'golden',
    name: 'Golden',
    description: 'Yields +15 bonus Chips when in a winning hand.',
    badge: 'GOLD',
    color: '#ffd700',
  },
  vampiric: {
    type: 'vampiric',
    name: 'Vampiric',
    description: 'Restores +6 HP when used in a winning hand.',
    badge: 'VAMP',
    color: '#ff1744',
  },
  overclocked: {
    type: 'overclocked',
    name: 'Overclocked',
    description: '+2 to card point value (e.g. 8 becomes 10).',
    badge: 'OVR',
    color: '#ff9100',
  },
};
