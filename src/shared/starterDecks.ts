import { StarterDeck, Card } from './types';

export const STARTER_DECKS: StarterDeck[] = [
  {
    id: 'neon_standard',
    name: 'Neon Standard',
    subtitle: 'Classic Street Runner Deck',
    description: 'A finely calibrated standard 52-card cyber-deck with reliable balance and standard market access.',
    icon: '♠️',
    color: '#00f0ff',
    bonusChips: 0,
    startingJokerSlots: 5,
    perksDescription: 'Balanced starting bankroll, standard 5/6 Joker matrix, standard 2 discards.',
    specialRulesDescription: 'No special drawbacks or modifications.',
    isUnlockedDefault: true,
  },
  {
    id: 'high_roller',
    name: 'High-Roller Vault',
    subtitle: 'Corporate Syndicate Bank',
    description: 'Funded by Megacorp venture capital. Massive starting bankroll and elevated interest yield, but tightened discard margin.',
    icon: '💎',
    color: '#ffd700',
    bonusChips: 80,
    startingJokerSlots: 5,
    interestCapBonus: 2,
    discardsModifier: -1,
    perksDescription: '+80 Starting Chips, +$2 max interest cap per round.',
    specialRulesDescription: '-1 Discard per combat encounter.',
    isUnlockedDefault: true,
  },
  {
    id: 'tactical_ops',
    name: 'Tactical Spec-Ops',
    subtitle: 'Military Black-Ops Deck',
    description: 'Armored combat specialists carrying field gear and military tech consumables into every raid.',
    icon: '🎒',
    color: '#39ff14',
    bonusChips: 10,
    startingJokerSlots: 5,
    startingConsumables: ['emp_jammer', 'medkit'],
    perksDescription: 'Starts equipped with an EMP Jammer and Military Medkit.',
    specialRulesDescription: 'Enhanced consumable synthesis odds during combat.',
    unlockCondition: 'Win 1 Run with any character.',
    isUnlockedDefault: false,
  },
  {
    id: 'quantum_glitch',
    name: 'Quantum Glitch',
    subtitle: 'Anarchist Zero-Day Deck',
    description: 'Heavily corrupted firmware. 4 high face cards are permanently infused with Quantum Glitch and Polychrome.',
    icon: '👾',
    color: '#d500f9',
    bonusChips: 20,
    startingJokerSlots: 4,
    perksDescription: '4 Face Cards start pre-augmented with Quantum Glitch and Polychrome.',
    specialRulesDescription: 'Starts with 4 of 6 Joker slots unlocked (2 locked slots).',
    unlockCondition: 'Score 5 Natural Blackjacks in a single run.',
    isUnlockedDefault: false,
  },
  {
    id: 'syndicate_vip',
    name: 'Syndicate VIP',
    subtitle: 'Black Market Syndicate Deck',
    description: 'Maximum black market privileges and instant 6-slot Joker expansion from the very first round.',
    icon: '👑',
    color: '#ff0055',
    bonusChips: 40,
    startingJokerSlots: 6,
    perksDescription: 'All 6 Joker Slots unlocked immediately from round 1; Store Rerolls cost 50% less.',
    specialRulesDescription: 'Boss encounters scale +15% higher initial armor.',
    unlockCondition: 'Defeat any Act 3 Boss on Red Stake or higher.',
    isUnlockedDefault: false,
  },
];

export const STARTER_DECKS_MAP: Record<string, StarterDeck> = STARTER_DECKS.reduce(
  (acc, deck) => {
    acc[deck.id] = deck;
    return acc;
  },
  {} as Record<string, StarterDeck>
);

// Apply custom deck modifications based on starter deck selected
export function modifyDeckForStarter(deck: Card[], deckId: string): Card[] {
  if (deckId === 'quantum_glitch') {
    let faceModCount = 0;
    return deck.map(card => {
      if ((card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') && faceModCount < 4) {
        faceModCount++;
        return {
          ...card,
          enhancement: 'glitch',
          edition: 'polychrome',
        };
      }
      return card;
    });
  }
  return deck;
}
