import { Card, Suit, Rank, CardEnhancementType } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 9)}`,
        suit,
        rank,
      });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(cards: Card[]): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createRandomEnhancedCard(forceEnhancement?: CardEnhancementType): Card {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const possibleEnhancements: CardEnhancementType[] = [
    'holographic',
    'polychrome',
    'glitch',
    'armored',
    'radioactive',
    'golden',
    'vampiric',
    'overclocked',
  ];
  const enhancement = forceEnhancement || possibleEnhancements[Math.floor(Math.random() * possibleEnhancements.length)];
  return {
    id: `${suit}-${rank}-enh-${Math.random().toString(36).substring(2, 9)}`,
    suit,
    rank,
    enhancement,
  };
}
