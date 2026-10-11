import { Consumable } from './types';

export const CONSUMABLES_CATALOG: Consumable[] = [
  {
    id: 'rewind_tape',
    name: 'Rewind Tape',
    description: 'Discards your latest drawn card and draws a replacement.',
    cost: 15,
    icon: '📼',
    effectType: 'rewind',
  },
  {
    id: 'rigged_die',
    name: 'Rigged Die',
    description: 'Guarantees the next Hit will not exceed 21 if possible.',
    cost: 25,
    icon: '🎲',
    effectType: 'rigged_die',
  },
  {
    id: 'emp_jammer',
    name: 'EMP Jammer',
    description: 'Nullifies the dealer’s special boss passive effect for 2 rounds.',
    cost: 20,
    icon: '📡',
    effectType: 'emp_jammer',
  },
  {
    id: 'medkit_patch',
    name: 'Medkit Patch',
    description: 'Instantly restores 25 HP.',
    cost: 20,
    icon: '💉',
    effectType: 'medkit',
  },
  {
    id: 'armor_plate',
    name: 'Armor Plate',
    description: 'Instantly grants +20 Armor.',
    cost: 18,
    icon: '🛡️',
    effectType: 'armor_plate',
  },
  {
    id: 'overcharge_battery',
    name: 'Overcharge Battery',
    description: 'Your next attack deals double damage.',
    cost: 25,
    icon: '🔋',
    effectType: 'overcharge',
  },
  {
    id: 'splitter_wire',
    name: 'Splitter Wire',
    description: 'Instantly converts your hand into a clean 20 soft total.',
    cost: 30,
    icon: '✂️',
    effectType: 'splitter',
  },
];

export function getConsumableById(id: string): Consumable | undefined {
  return CONSUMABLES_CATALOG.find(c => c.id === id);
}

export function getRandomConsumables(count: number): Consumable[] {
  const shuffled = [...CONSUMABLES_CATALOG].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
