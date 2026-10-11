import { Joker } from './types';

export const JOKERS_CATALOG: Joker[] = [
  {
    id: 'loaded_ace',
    name: 'Loaded Ace',
    description: 'Aces deal +18 bonus damage when present in a winning hand.',
    rarity: 'common',
    cost: 25,
    icon: '🂡',
    effectType: 'ace_bonus',
  },
  {
    id: 'twin_echo',
    name: 'Twin Echo',
    description: 'Any matching rank pair in hand adds +22 flat attack damage.',
    rarity: 'common',
    cost: 30,
    icon: '♊',
    effectType: 'pair_bonus',
  },
  {
    id: 'lucky_static',
    name: 'Lucky Static',
    description: 'Converts Pushes and 22-Busts into a 12 damage electrical discharge to Dealer.',
    rarity: 'uncommon',
    cost: 35,
    icon: '⚡',
    effectType: 'push_shock',
  },
  {
    id: 'redline',
    name: 'Redline',
    description: 'Consecutive wins grant +25% compounding attack damage (resets on defeat).',
    rarity: 'uncommon',
    cost: 40,
    icon: '🏎️',
    effectType: 'consecutive_buff',
  },
  {
    id: 'house_thief',
    name: 'House Thief',
    description: 'Winning against the dealer siphons 12 Armor to you.',
    rarity: 'uncommon',
    cost: 35,
    icon: '🦹',
    effectType: 'siphon_armor',
  },
  {
    id: 'ghost_hand',
    name: 'Ghost Hand',
    description: 'Prevents 1 bust per combat encounter, setting hand total safely to 21.',
    rarity: 'rare',
    cost: 50,
    icon: '👻',
    effectType: 'bust_save',
  },
  {
    id: 'friendly_fire',
    name: 'Friendly Fire',
    description: '+35% total attack damage, but busting deals 8 recoil damage to all allies.',
    rarity: 'rare',
    cost: 45,
    icon: '💥',
    effectType: 'high_risk_damage',
  },
  {
    id: 'neon_flush',
    name: 'Neon Flush',
    description: 'If all cards in hand share the same suit, multiply attack damage by 2.2x.',
    rarity: 'rare',
    cost: 50,
    icon: '🌈',
    effectType: 'flush_mult',
  },
  {
    id: 'blackjack_overdrive',
    name: 'Blackjack Overdrive',
    description: 'Natural 21 deals an extra 35 critical damage and heals 10 HP.',
    rarity: 'rare',
    cost: 55,
    icon: '👑',
    effectType: 'natural_overdrive',
  },
  {
    id: 'card_counter',
    name: 'Card Counter',
    description: 'Every low card (2-6) played adds +6 attack power this combat.',
    rarity: 'common',
    cost: 25,
    icon: '🔢',
    effectType: 'low_card_counter',
  },
  {
    id: 'shield_siphon',
    name: 'Shield Siphon',
    description: 'Winning by a margin of 3 or more points converts margin into +6 Armor.',
    rarity: 'common',
    cost: 30,
    icon: '🛡️',
    effectType: 'margin_armor',
  },
  {
    id: 'cyber_spades',
    name: 'Cyber Spades',
    description: 'Spades cards deal +8 extra damage and shock the dealer for 5 piercing damage.',
    rarity: 'uncommon',
    cost: 35,
    icon: '♠️',
    effectType: 'spades_shock',
  },
  {
    id: 'heart_pulse',
    name: 'Heart Pulse',
    description: 'Winning a round restores +5 HP for each Heart card in your hand.',
    rarity: 'common',
    cost: 30,
    icon: '♥️',
    effectType: 'hearts_heal',
  },
  {
    id: 'diamond_vault',
    name: 'Diamond Vault',
    description: 'Each Diamond card in a winning hand awards +8 extra Chips.',
    rarity: 'common',
    cost: 25,
    icon: '♦️',
    effectType: 'diamonds_chips',
  },
  {
    id: 'club_brawler',
    name: 'Club Brawler',
    description: 'Club cards ignore dealer armor and grant +5 base damage.',
    rarity: 'common',
    cost: 28,
    icon: '♣️',
    effectType: 'clubs_pierce',
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
