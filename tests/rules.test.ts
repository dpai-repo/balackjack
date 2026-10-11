import { describe, it, expect } from 'vitest';
import { Card } from '../src/shared/types';
import {
  calculateHandValue,
  shouldDealerHit,
  evaluateCombatRound,
  getRankBaseValue,
} from '../src/shared/rules';
import { GameRoom } from '../src/server/room';
import { JOKERS_CATALOG, getJokerById } from '../src/shared/jokers';
import { CONSUMABLES_CATALOG } from '../src/shared/consumables';
import { BOSSES } from '../src/shared/bosses';
import { CHARACTERS } from '../src/shared/characters';

describe('Blackjack Hand Calculation Rules', () => {
  it('correctly calculates basic numeric and face cards', () => {
    const cards: Card[] = [
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '7' },
    ];
    const calc = calculateHandValue(cards);
    expect(calc.total).toBe(17);
    expect(calc.isSoft).toBe(false);
    expect(calc.isBust).toBe(false);
    expect(calc.isBlackjack).toBe(false);
  });

  it('correctly handles face cards (J, Q, K = 10)', () => {
    const cards: Card[] = [
      { id: '1', suit: 'clubs', rank: 'J' },
      { id: '2', suit: 'diamonds', rank: 'Q' },
    ];
    const calc = calculateHandValue(cards);
    expect(calc.total).toBe(20);
  });

  it('detects Natural Blackjack with exactly 2 cards (Ace + 10/Face)', () => {
    const cards: Card[] = [
      { id: '1', suit: 'spades', rank: 'A' },
      { id: '2', suit: 'hearts', rank: 'K' },
    ];
    const calc = calculateHandValue(cards);
    expect(calc.total).toBe(21);
    expect(calc.isBlackjack).toBe(true);
    expect(calc.isSoft).toBe(true);
  });

  it('handles soft vs hard Ace adjustments on hits', () => {
    // A + 6 = 17 (Soft 17)
    const softHand: Card[] = [
      { id: '1', suit: 'hearts', rank: 'A' },
      { id: '2', suit: 'spades', rank: '6' },
    ];
    expect(calculateHandValue(softHand).total).toBe(17);
    expect(calculateHandValue(softHand).isSoft).toBe(true);

    // Hit with 8: A + 6 + 8 = 15 (Hard 15, Ace adjusted from 11 to 1)
    const hitHand = [...softHand, { id: '3', suit: 'clubs' as const, rank: '8' as const }];
    const hitCalc = calculateHandValue(hitHand);
    expect(hitCalc.total).toBe(15);
    expect(hitCalc.isSoft).toBe(false);
    expect(hitCalc.isBust).toBe(false);
  });

  it('correctly handles multiple Aces in the same hand', () => {
    // A + A + 9 = 21 (11 + 1 + 9 = 21)
    const twoAces: Card[] = [
      { id: '1', suit: 'spades', rank: 'A' },
      { id: '2', suit: 'hearts', rank: 'A' },
      { id: '3', suit: 'diamonds', rank: '9' },
    ];
    const calc1 = calculateHandValue(twoAces);
    expect(calc1.total).toBe(21);
    expect(calc1.isBlackjack).toBe(false); // 3 cards, not natural

    // A + A + A + 10 = 13 (1 + 1 + 1 + 10 = 13)
    const threeAces: Card[] = [
      { id: '1', suit: 'spades', rank: 'A' },
      { id: '2', suit: 'hearts', rank: 'A' },
      { id: '3', suit: 'diamonds', rank: 'A' },
      { id: '4', suit: 'clubs', rank: '10' },
    ];
    expect(calculateHandValue(threeAces).total).toBe(13);
  });

  it('detects Bust when hand exceeds 21', () => {
    const bustHand: Card[] = [
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'diamonds', rank: '6' },
      { id: '3', suit: 'clubs', rank: '7' },
    ];
    const calc = calculateHandValue(bustHand);
    expect(calc.total).toBe(23);
    expect(calc.isBust).toBe(true);
  });

  it('supports Overclocked enhancement (+2 rank value)', () => {
    const overclockedCard: Card = {
      id: '1',
      suit: 'spades',
      rank: '8',
      enhancement: 'overclocked',
    };
    const regularCard: Card = {
      id: '2',
      suit: 'hearts',
      rank: '9',
    };
    // 8 (+2) + 9 = 19
    const calc = calculateHandValue([overclockedCard, regularCard]);
    expect(calc.total).toBe(19);
  });
});

describe('Dealer Rules & Boss Variants', () => {
  it('dealer hits on < 17 and stands on >= 17 in standard mode', () => {
    const hand16 = calculateHandValue([
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '6' },
    ]);
    expect(shouldDealerHit(hand16, 'standard', 17)).toBe(true);

    const hand17 = calculateHandValue([
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '7' },
    ]);
    expect(shouldDealerHit(hand17, 'standard', 17)).toBe(false);
  });

  it('dealer hits on soft 17 if boss has draw_on_soft_17 rule', () => {
    const soft17 = calculateHandValue([
      { id: '1', suit: 'spades', rank: 'A' },
      { id: '2', suit: 'hearts', rank: '6' },
    ]);
    expect(shouldDealerHit(soft17, 'draw_on_soft_17')).toBe(true);

    const hard17 = calculateHandValue([
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '7' },
    ]);
    expect(shouldDealerHit(hard17, 'draw_on_soft_17')).toBe(false);
  });
});

describe('Combat Resolution & Synergy Bonuses', () => {
  it('rewards player win with margin multiplier bonus', () => {
    const pCalc = calculateHandValue([
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '10' },
    ]); // 20
    const dCalc = calculateHandValue([
      { id: '3', suit: 'diamonds', rank: '10' },
      { id: '4', suit: 'clubs', rank: '7' },
    ]); // 17

    const res = evaluateCombatRound(pCalc, dCalc, 20, 15);
    expect(res.outcome).toBe('player_win');
    expect(res.margin).toBe(3);
    // Base 20 + 20 total = 40, margin multiplier 1 + 3 * 0.15 = 1.45 => 58
    expect(res.damageToDealer).toBeGreaterThan(45);
    expect(res.damageToPlayer).toBe(0);
  });

  it('applies consecutive streak bonus with Redline', () => {
    const pCalc = calculateHandValue([
      { id: '1', suit: 'spades', rank: '10' },
      { id: '2', suit: 'hearts', rank: '9' },
    ]); // 19
    const dCalc = calculateHandValue([
      { id: '3', suit: 'diamonds', rank: '10' },
      { id: '4', suit: 'clubs', rank: '8' },
    ]); // 18

    const noRedline = evaluateCombatRound(pCalc, dCalc, 20, 15);
    const withRedline = evaluateCombatRound(pCalc, dCalc, 20, 15, {
      hasRedline: true,
      consecutiveWins: 3,
    });

    expect(withRedline.damageToDealer).toBeGreaterThan(noRedline.damageToDealer);
  });

  it('Lucky Static discharges on Push and 22 Bust', () => {
    const pushP = calculateHandValue([{ id: '1', suit: 'spades', rank: '10' }, { id: '2', suit: 'hearts', rank: '8' }]);
    const pushD = calculateHandValue([{ id: '3', suit: 'diamonds', rank: '10' }, { id: '4', suit: 'clubs', rank: '8' }]);
    const pushRes = evaluateCombatRound(pushP, pushD, 20, 15, { hasLuckyStatic: true });
    expect(pushRes.damageToDealer).toBe(10);
  });
});

describe('Game Data Catalog Integrity', () => {
  it('contains at least 12 distinct functional Jokers', () => {
    expect(JOKERS_CATALOG.length).toBeGreaterThanOrEqual(12);
    JOKERS_CATALOG.forEach(j => {
      expect(j.id).toBeTruthy();
      expect(j.name).toBeTruthy();
      expect(j.cost).toBeGreaterThan(0);
      expect(j.effectType).toBeTruthy();
    });
  });

  it('contains at least 6 functional Consumables', () => {
    expect(CONSUMABLES_CATALOG.length).toBeGreaterThanOrEqual(6);
    CONSUMABLES_CATALOG.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.effectType).toBeTruthy();
    });
  });

  it('contains 5 distinct Bosses with unique mechanics', () => {
    expect(BOSSES.length).toBe(5);
    const acts = BOSSES.map(b => b.act);
    expect(acts).toEqual([1, 2, 3, 4, 5]);
  });

  it('contains 4 distinct Starting Characters', () => {
    expect(CHARACTERS.length).toBe(4);
    CHARACTERS.forEach(char => {
      expect(char.hp).toBeGreaterThan(50);
      expect(char.startingJokerId).toBeTruthy();
      expect(getJokerById(char.startingJokerId)).toBeDefined();
    });
  });
});

describe('Multiplayer Server Security & Authoritative Rules', () => {
  it('keeps dealer hole card hidden from state until dealer turn', () => {
    const room = new GameRoom('TEST', true);
    room.addPlayer('p1', 'Alice', 'card_sharp');
    room.handleAction('p1', { type: 'ready' });
    room.handleAction('p1', { type: 'start_game' });

    // Dealer cards in broadcasted state
    const bossCards = room.state.bossCards;
    expect(bossCards.length).toBe(2);
    expect(bossCards[0].hidden).toBeFalsy();
    // The second card must be hidden!
    expect(bossCards[1].hidden).toBe(true);
  });

  it('caps multiplayer rooms at max 6 players', () => {
    const room = new GameRoom('TEST', true);
    for (let i = 0; i < 8; i++) {
      room.addBotPlayer();
    }
    expect(Object.keys(room.state.players).length).toBeLessThanOrEqual(6);
  });
});
