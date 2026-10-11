import { CharacterLoadout } from './types';

export const CHARACTERS: CharacterLoadout[] = [
  {
    id: 'card_sharp',
    name: 'Card Sharp',
    title: 'The Ace Specialist',
    description: 'Masters precise card management. Starts with Loaded Ace Joker and Rewind Tape.',
    hp: 100,
    maxHp: 100,
    armor: 10,
    chips: 35,
    startingJokerId: 'loaded_ace',
    startingConsumableId: 'rewind_tape',
    color: '#00f0ff',
  },
  {
    id: 'cyber_punk',
    name: 'Cyber Punk',
    title: 'The Glitch Rebel',
    description: 'Specializes in risk protection and counter-attacks. Starts with Lucky Static Joker and EMP Jammer.',
    hp: 95,
    maxHp: 95,
    armor: 20,
    chips: 25,
    startingJokerId: 'lucky_static',
    startingConsumableId: 'emp_jammer',
    color: '#39ff14',
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    title: 'Streak Gambler',
    description: 'Thrives on momentum and consecutive wins. Starts with Redline Joker and Overcharge Battery.',
    hp: 85,
    maxHp: 85,
    armor: 0,
    chips: 60,
    startingJokerId: 'redline',
    startingConsumableId: 'overcharge_battery',
    color: '#ffd700',
  },
  {
    id: 'field_medic',
    name: 'Field Medic',
    title: 'Co-op Guardian',
    description: 'Team player capable of enduring heavy damage and regenerating vitality. Starts with Heart Pulse and Medkit.',
    hp: 110,
    maxHp: 110,
    armor: 15,
    chips: 30,
    startingJokerId: 'heart_pulse',
    startingConsumableId: 'medkit_patch',
    color: '#ff00ea',
  },
];

export function getCharacterById(id: string): CharacterLoadout {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
