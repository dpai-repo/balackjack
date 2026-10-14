import { Joker, ComboLink, JokerAffinityTag } from './types';

export interface AffinityMeta {
  tag: JokerAffinityTag;
  name: string;
  badge: string;
  color: string;
  glowClass: string;
  synergyName: string;
  bonusText: string;
  multiplier: number;
}

export const AFFINITY_METAS: Record<JokerAffinityTag, AffinityMeta> = {
  suit_blade: {
    tag: 'suit_blade',
    name: 'Blade',
    badge: '⚔️ BLADE',
    color: '#38bdf8',
    glowClass: 'shadow-[0_0_12px_rgba(56,189,248,0.6)] border-sky-400',
    synergyName: 'Blade Resonance',
    bonusText: '+25% Pierce & Attack Surge',
    multiplier: 1.25,
  },
  high_roller: {
    tag: 'high_roller',
    name: 'Gilded',
    badge: '🪙 GILDED',
    color: '#fbbf24',
    glowClass: 'shadow-[0_0_12px_rgba(251,191,36,0.6)] border-amber-400',
    synergyName: 'Gilded Circuit',
    bonusText: '+20% Chip Yield & Gold Scaling',
    multiplier: 1.2,
  },
  quantum: {
    tag: 'quantum',
    name: 'Quantum',
    badge: '⚛️ QUANTUM',
    color: '#a855f7',
    glowClass: 'shadow-[0_0_12px_rgba(168,85,247,0.6)] border-purple-400',
    synergyName: 'Quantum Entanglement',
    bonusText: '+30% Probability Flux & Save',
    multiplier: 1.3,
  },
  medic: {
    tag: 'medic',
    name: 'Bio-Medic',
    badge: '💉 MEDIC',
    color: '#34d399',
    glowClass: 'shadow-[0_0_12px_rgba(52,211,153,0.6)] border-emerald-400',
    synergyName: 'Bio-Feedback Loop',
    bonusText: '+25% Vitality & Armor Shielding',
    multiplier: 1.25,
  },
  overdrive: {
    tag: 'overdrive',
    name: 'Overdrive',
    badge: '⚡ OVERDRIVE',
    color: '#f43f5e',
    glowClass: 'shadow-[0_0_12px_rgba(244,63,94,0.6)] border-rose-500',
    synergyName: 'Overdrive Surge',
    bonusText: '+35% Critical Multiplier',
    multiplier: 1.35,
  },
};

export const JOKERS_CATALOG: Joker[] = [
  {
    id: 'loaded_ace',
    name: 'Loaded Ace',
    description: 'Aces deal +18 bonus damage when present in a winning hand.',
    rarity: 'common',
    cost: 25,
    icon: '🂡',
    effectType: 'ace_bonus',
    affinityTags: ['suit_blade', 'overdrive'],
  },
  {
    id: 'twin_echo',
    name: 'Twin Echo',
    description: 'Any matching rank pair in hand adds +22 flat attack damage.',
    rarity: 'common',
    cost: 30,
    icon: '♊',
    effectType: 'pair_bonus',
    affinityTags: ['quantum', 'overdrive'],
  },
  {
    id: 'lucky_static',
    name: 'Lucky Static',
    description: 'Converts Pushes and 22-Busts into a 12 damage electrical discharge to Dealer.',
    rarity: 'uncommon',
    cost: 35,
    icon: '⚡',
    effectType: 'push_shock',
    affinityTags: ['quantum', 'overdrive'],
  },
  {
    id: 'redline',
    name: 'Redline',
    description: 'Consecutive wins grant +25% compounding attack damage (resets on defeat).',
    rarity: 'uncommon',
    cost: 40,
    icon: '🏎️',
    effectType: 'consecutive_buff',
    affinityTags: ['high_roller', 'overdrive'],
  },
  {
    id: 'house_thief',
    name: 'House Thief',
    description: 'Winning against the dealer siphons 12 Armor to you.',
    rarity: 'uncommon',
    cost: 35,
    icon: '🦹',
    effectType: 'siphon_armor',
    affinityTags: ['medic', 'high_roller'],
  },
  {
    id: 'ghost_hand',
    name: 'Ghost Hand',
    description: 'Prevents 1 bust per combat encounter, setting hand total safely to 21.',
    rarity: 'rare',
    cost: 50,
    icon: '👻',
    effectType: 'bust_save',
    affinityTags: ['quantum', 'medic'],
  },
  {
    id: 'friendly_fire',
    name: 'Friendly Fire',
    description: '+35% total attack damage, but busting deals 8 recoil damage to all allies.',
    rarity: 'rare',
    cost: 45,
    icon: '💥',
    effectType: 'high_risk_damage',
    affinityTags: ['suit_blade', 'overdrive'],
  },
  {
    id: 'neon_flush',
    name: 'Neon Flush',
    description: 'If all cards in hand share the same suit, multiply attack damage by 2.2x.',
    rarity: 'rare',
    cost: 50,
    icon: '🌈',
    effectType: 'flush_mult',
    affinityTags: ['suit_blade', 'high_roller'],
  },
  {
    id: 'blackjack_overdrive',
    name: 'Blackjack Overdrive',
    description: 'Natural 21 deals an extra 35 critical damage and heals 10 HP.',
    rarity: 'rare',
    cost: 55,
    icon: '👑',
    effectType: 'natural_overdrive',
    affinityTags: ['overdrive', 'medic'],
  },
  {
    id: 'card_counter',
    name: 'Card Counter',
    description: 'Every low card (2-6) played adds +6 attack power this combat.',
    rarity: 'common',
    cost: 25,
    icon: '🔢',
    effectType: 'low_card_counter',
    affinityTags: ['quantum', 'high_roller'],
  },
  {
    id: 'shield_siphon',
    name: 'Shield Siphon',
    description: 'Winning by a margin of 3 or more points converts margin into +6 Armor.',
    rarity: 'common',
    cost: 30,
    icon: '🛡️',
    effectType: 'margin_armor',
    affinityTags: ['medic', 'suit_blade'],
  },
  {
    id: 'cyber_spades',
    name: 'Cyber Spades',
    description: 'Spades cards deal +8 extra damage and shock the dealer for 5 piercing damage.',
    rarity: 'uncommon',
    cost: 35,
    icon: '♠️',
    effectType: 'spades_shock',
    affinityTags: ['suit_blade', 'overdrive'],
  },
  {
    id: 'heart_pulse',
    name: 'Heart Pulse',
    description: 'Winning a round restores +5 HP for each Heart card in your hand.',
    rarity: 'common',
    cost: 30,
    icon: '♥️',
    effectType: 'hearts_heal',
    affinityTags: ['medic', 'high_roller'],
  },
  {
    id: 'diamond_vault',
    name: 'Diamond Vault',
    description: 'Each Diamond card in a winning hand awards +8 extra Chips.',
    rarity: 'common',
    cost: 25,
    icon: '♦️',
    effectType: 'diamonds_chips',
    affinityTags: ['high_roller', 'quantum'],
  },
  {
    id: 'club_brawler',
    name: 'Club Brawler',
    description: 'Club cards ignore dealer armor and grant +5 base damage.',
    rarity: 'common',
    cost: 28,
    icon: '♣️',
    effectType: 'clubs_pierce',
    affinityTags: ['suit_blade', 'overdrive'],
  },
];

export function getJokerById(id: string): Joker | undefined {
  return JOKERS_CATALOG.find(j => j.id === id);
}

export function getRandomJokers(count: number, excludeIds: string[] = []): Joker[] {
  const available = JOKERS_CATALOG.filter(j => !excludeIds.includes(j.id));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Evaluates Combo Links formed between adjacent equipped Jokers that share affinity tags.
 */
export function evaluateComboLinks(slots: (Joker | null)[]): ComboLink[] {
  const links: ComboLink[] = [];

  for (let i = 0; i < slots.length - 1; i++) {
    const current = slots[i];
    const next = slots[i + 1];
    if (!current || !next) continue;

    const currentTags = current.affinityTags || [];
    const nextTags = next.affinityTags || [];

    // Find shared affinity tag with highest synergy multiplier
    const sharedTags = currentTags.filter(tag => nextTags.includes(tag));
    if (sharedTags.length > 0) {
      // Pick best tag
      const bestTag = sharedTags.reduce((prev, curr) => {
        return (AFFINITY_METAS[curr]?.multiplier || 1) > (AFFINITY_METAS[prev]?.multiplier || 1) ? curr : prev;
      }, sharedTags[0]);

      const meta = AFFINITY_METAS[bestTag];

      links.push({
        sourceIndex: i,
        targetIndex: i + 1,
        sourceJokerId: current.id,
        targetJokerId: next.id,
        synergyTag: bestTag,
        synergyName: meta.synergyName,
        synergyBonusText: meta.bonusText,
        multiplier: meta.multiplier,
      });
    }
  }

  return links;
}

/**
 * Calculates the compounded synergy multiplier for a Joker given active adjacency links.
 */
export function getSlotMultiplier(slotIndex: number, activeLinks: ComboLink[]): number {
  let mult = 1.0;
  for (const link of activeLinks) {
    if (link.sourceIndex === slotIndex || link.targetIndex === slotIndex) {
      mult *= link.multiplier;
    }
  }
  return mult;
}
