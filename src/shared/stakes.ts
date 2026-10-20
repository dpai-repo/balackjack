import { StakeConfig, StakeLevel } from './types';

export const STAKES_LIST: StakeConfig[] = [
  {
    id: 'white',
    name: 'White Stake',
    order: 1,
    subtitle: 'Street Runner Baseline',
    description: 'Standard cyberpunk combat rules. Fair black market prices and standard target scores.',
    color: '#e2e8f0',
    badge: 'WHITE',
    modifiers: {},
  },
  {
    id: 'red',
    name: 'Red Stake',
    order: 2,
    subtitle: 'Mercenary Contract',
    description: 'Small Mob combat encounters yield no baseline chip reward payout.',
    color: '#ef4444',
    badge: 'RED',
    modifiers: {
      noSmallBlindReward: true,
    },
  },
  {
    id: 'green',
    name: 'Green Stake',
    order: 3,
    subtitle: 'Sub-Net Infiltrator',
    description: 'Required enemy target HP and damage thresholds scale 25% faster with each act.',
    color: '#22c55e',
    badge: 'GREEN',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.25,
    },
  },
  {
    id: 'blue',
    name: 'Blue Stake',
    order: 4,
    subtitle: 'Firewall Protocol',
    description: '-1 Discard allowance per combat encounter. Hand management is critical.',
    color: '#3b82f6',
    badge: 'BLUE',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.25,
      discardsModifier: -1,
    },
  },
  {
    id: 'purple',
    name: 'Purple Stake',
    order: 5,
    subtitle: 'Corporate Inflation',
    description: 'Black Market store items, rerolls, and decker services inflate by +$2 per act.',
    color: '#a855f7',
    badge: 'PURPLE',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.25,
      discardsModifier: -1,
      priceInflationPerAct: 2,
    },
  },
  {
    id: 'orange',
    name: 'Orange Stake',
    order: 6,
    subtitle: 'Black Market Scarcity',
    description: 'Cyber-Mod booster packs cost +$3. Store Jokers may be Perishable (deactivates after 5 rounds).',
    color: '#f97316',
    badge: 'ORANGE',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.25,
      discardsModifier: -1,
      priceInflationPerAct: 2,
      boosterPackCostIncrease: 3,
      perishableJokers: true,
    },
  },
  {
    id: 'gold',
    name: 'Gold Stake',
    order: 7,
    subtitle: 'Syndicate Debt',
    description: 'Purchased Jokers may be Rental (costs -$3 chips upkeep at the conclusion of every round).',
    color: '#eab308',
    badge: 'GOLD',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.3,
      discardsModifier: -1,
      priceInflationPerAct: 2,
      boosterPackCostIncrease: 3,
      perishableJokers: true,
      rentalJokers: true,
    },
  },
  {
    id: 'cyber_overdrive',
    name: 'Cyber-Overdrive Stake',
    order: 8,
    subtitle: 'AI Singularity',
    description: 'Bosses activate their passive abilities on both Hit and Stand. 1 in 10 dealt cards is secretly glitched.',
    color: '#ec4899',
    badge: 'OVERDRIVE',
    modifiers: {
      noSmallBlindReward: true,
      targetScoreMultiplier: 1.4,
      discardsModifier: -1,
      priceInflationPerAct: 3,
      boosterPackCostIncrease: 5,
      perishableJokers: true,
      rentalJokers: true,
      bossDoubleAbilities: true,
      glitchedHands: true,
    },
  },
];

export const STAKES_MAP: Record<StakeLevel, StakeConfig> = STAKES_LIST.reduce(
  (acc, stake) => {
    acc[stake.id] = stake;
    return acc;
  },
  {} as Record<StakeLevel, StakeConfig>
);
