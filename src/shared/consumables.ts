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
  {
    id: 'joker_slot_voucher',
    name: 'Matrix Expansion Voucher',
    description: 'Permanently unlocks your 6th Joker slot. Consumed upon activation.',
    cost: 50,
    icon: '⚡',
    effectType: 'joker_slot_voucher',
  },
];

export const JOKER_SLOT_VOUCHER: Consumable = {
  id: 'joker_slot_voucher',
  name: 'Matrix Expansion Voucher',
  description: 'Permanently unlocks your 6th Joker slot. Consumed upon activation.',
  cost: 50,
  icon: '⚡',
  effectType: 'joker_slot_voucher',
};

export function getConsumableById(id: string): Consumable | undefined {
  return CONSUMABLES_CATALOG.find(c => c.id === id);
}

export function getRandomConsumables(count: number, currentUnlockedSlots?: number): Consumable[] {
  // If player has less than 6 slots, give voucher a 45% chance to appear in store
  const canSpawnVoucher = currentUnlockedSlots !== undefined && currentUnlockedSlots < 6;
  const shouldSpawnVoucher = canSpawnVoucher && Math.random() < 0.45;

  const basePool = CONSUMABLES_CATALOG.filter(c => c.id !== 'joker_slot_voucher');
  const shuffled = [...basePool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, shouldSpawnVoucher ? count - 1 : count);

  if (shouldSpawnVoucher) {
    selected.push(JOKER_SLOT_VOUCHER);
  }

  return selected.sort(() => 0.5 - Math.random());
}
