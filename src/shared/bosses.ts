import { Boss } from './types';

export const BOSSES: Boss[] = [
  {
    id: 'pit_boss',
    name: 'The Pit Boss',
    title: 'Floor Overseer',
    maxHp: 120,
    baseDamage: 14,
    portrait: 'boss_pit',
    specialRule: 'Enforces Aggression: Standing on 16 or lower suffers +6 penalty damage.',
    ruleType: 'extra_stand_damage',
    act: 1,
  },
  {
    id: 'madame_roulette',
    name: 'Madame Roulette',
    title: 'Queen of the Wheel',
    maxHp: 180,
    baseDamage: 18,
    portrait: 'boss_roulette',
    specialRule: 'Unpredictable Play: Changes stand threshold between 16 and 18 each round.',
    ruleType: 'dynamic_stand_threshold',
    act: 2,
  },
  {
    id: 'cyber_croupier',
    name: 'Cyber Croupier',
    title: 'Neural Deck Weaver',
    maxHp: 240,
    baseDamage: 22,
    portrait: 'boss_croupier',
    specialRule: 'Dealer always hits on soft 17, and dealers blackjacks deal 2x damage.',
    ruleType: 'draw_on_soft_17',
    act: 3,
  },
  {
    id: 'high_roller',
    name: 'The High Roller',
    title: 'Gilded Tycoon',
    maxHp: 320,
    baseDamage: 26,
    portrait: 'boss_roller',
    specialRule: 'Greed Shield: Dealer gains 15 Armor whenever player hits 3 or more times.',
    ruleType: 'punish_many_hits',
    act: 4,
  },
  {
    id: 'grand_algorithm',
    name: 'The Grand Algorithm',
    title: 'Master of the House',
    maxHp: 450,
    baseDamage: 32,
    portrait: 'boss_algorithm',
    specialRule: 'Total Dominance: Dealer summons firewalls, deals pierce damage, and alters bust thresholds.',
    ruleType: 'grand_algorithm',
    act: 5,
  },
];

export function getBossByAct(act: number): Boss {
  return BOSSES.find(b => b.act === act) || BOSSES[BOSSES.length - 1];
}
