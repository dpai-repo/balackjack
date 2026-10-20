import { Card, CardEnhancementType, CardEditionType, CardSealType } from './types';

export interface CardEnhancementMeta {
  type: CardEnhancementType;
  name: string;
  description: string;
  badge: string;
  color: string;
  icon: string;
}

export interface CardEditionMeta {
  type: CardEditionType;
  name: string;
  description: string;
  badge: string;
  color: string;
  chipsBonus: number;
  multBonus: number;
  multMultiplier: number;
}

export interface CardSealMeta {
  type: CardSealType;
  name: string;
  description: string;
  badge: string;
  color: string;
  icon: string;
}

export const CARD_ENHANCEMENTS: Record<CardEnhancementType, CardEnhancementMeta> = {
  bonus_chips: {
    type: 'bonus_chips',
    name: 'Cyber-Chip',
    description: '+30 base Attack Chips when this card is scored.',
    badge: '+30 CHIP',
    color: '#00f0ff',
    icon: '💎',
  },
  overclocked: {
    type: 'overclocked',
    name: 'Overclocked',
    description: '+4 Attack Multiplier when this card is scored.',
    badge: '+4 MULT',
    color: '#ff9100',
    icon: '⚡',
  },
  glass: {
    type: 'glass',
    name: 'Glass Card',
    description: 'x2.0 Total Attack Multiplier, but has a 1-in-4 (25%) chance to shatter permanently from your deck on score!',
    badge: 'x2.0 GLASS',
    color: '#e0f7fa',
    icon: '🪟',
  },
  steel: {
    type: 'steel',
    name: 'Steel Plated',
    description: 'x1.5 Attack Multiplier while held in hand (not played) when standing.',
    badge: 'x1.5 STEEL',
    color: '#90a4ae',
    icon: '🛡️',
  },
  golden: {
    type: 'golden',
    name: 'Golden Reserve',
    description: 'Yields +15 bonus chips on victory, plus +$4 credits if held in hand at round end.',
    badge: 'GOLD',
    color: '#ffd700',
    icon: '🪙',
  },
  glitch: {
    type: 'glitch',
    name: 'Quantum Glitch',
    description: 'Quantum flexibility: shifts card value automatically (1-10) to prevent bust!',
    badge: 'GLITCH',
    color: '#39ff14',
    icon: '👾',
  },
  armored: {
    type: 'armored',
    name: 'Nanotech Armor',
    description: 'Instantly grants +10 Armor to the player when drawn or dealt.',
    badge: '+10 ARMOR',
    color: '#00d2ff',
    icon: '🔰',
  },
  radioactive: {
    type: 'radioactive',
    name: 'Radioactive Isotope',
    description: 'Inflicts 8 ongoing radiation damage directly to Dealer HP on stand.',
    badge: '8 RAD',
    color: '#76ff03',
    icon: '☢️',
  },
  vampiric: {
    type: 'vampiric',
    name: 'Vampiric Drain',
    description: 'Restores +6 HP when scored in a winning combat round.',
    badge: '+6 VAMP',
    color: '#ff1744',
    icon: '🩸',
  },
  holographic: {
    type: 'holographic',
    name: 'Holographic',
    description: '+12 base attack damage when this card is played.',
    badge: 'HOLO',
    color: '#00f0ff',
    icon: '✨',
  },
  polychrome: {
    type: 'polychrome',
    name: 'Polychrome',
    description: '1.5x multiplier to the entire attack when scored.',
    badge: 'POLY',
    color: '#ff00ea',
    icon: '🌈',
  },
};

export const CARD_EDITIONS: Record<CardEditionType, CardEditionMeta> = {
  foil: {
    type: 'foil',
    name: 'Foil Edition',
    description: '+50 Attack Chips when this card is scored.',
    badge: 'FOIL',
    color: '#00e5ff',
    chipsBonus: 50,
    multBonus: 0,
    multMultiplier: 1.0,
  },
  holographic: {
    type: 'holographic',
    name: 'Holographic Edition',
    description: '+10 Attack Multiplier when this card is scored.',
    badge: 'HOLO',
    color: '#d500f9',
    chipsBonus: 0,
    multBonus: 10,
    multMultiplier: 1.0,
  },
  polychrome: {
    type: 'polychrome',
    name: 'Polychrome Edition',
    description: 'x1.5 Total Multiplier when this card is scored.',
    badge: 'POLY',
    color: '#00e676',
    chipsBonus: 0,
    multBonus: 0,
    multMultiplier: 1.5,
  },
};

export const CARD_SEALS: Record<CardSealType, CardSealMeta> = {
  red: {
    type: 'red',
    name: 'Red Circuit Seal',
    description: 'Retriggers this card: scores all chip and mult values an extra time.',
    badge: 'RETRIGGER',
    color: '#ff1744',
    icon: '🔴',
  },
  gold: {
    type: 'gold',
    name: 'Gold Mint Seal',
    description: 'Instantly earns +$3 credits every time this card is scored.',
    badge: '+$3 CRED',
    color: '#ffd700',
    icon: '🟡',
  },
  blue: {
    type: 'blue',
    name: 'Blue Protocol Seal',
    description: 'Synthesizes a random Tactical Gear consumable if held in hand at round end.',
    badge: 'GEAR FAB',
    color: '#2979ff',
    icon: '🔵',
  },
  purple: {
    type: 'purple',
    name: 'Purple Glitch Seal',
    description: 'Generates a random Cyber-Mod Augmentation consumable when discarded.',
    badge: 'MOD FAB',
    color: '#aa00ff',
    icon: '🟣',
  },
};

// HELPER SCORING CALCULATIONS
export function getCardScoredChips(card: Card): number {
  let chips = 0;
  if (card.enhancement === 'bonus_chips') chips += 30;
  if (card.enhancement === 'holographic') chips += 12;
  if (card.edition === 'foil') chips += CARD_EDITIONS.foil.chipsBonus;
  return chips;
}

export function getCardScoredMult(card: Card): number {
  let mult = 0;
  if (card.enhancement === 'overclocked') mult += 4;
  if (card.edition === 'holographic') mult += CARD_EDITIONS.holographic.multBonus;
  return mult;
}

export function getCardScoredXMult(card: Card): number {
  let xMult = 1.0;
  if (card.enhancement === 'glass') xMult *= 2.0;
  if (card.enhancement === 'polychrome') xMult *= 1.5;
  if (card.edition === 'polychrome') xMult *= CARD_EDITIONS.polychrome.multMultiplier;
  return xMult;
}
