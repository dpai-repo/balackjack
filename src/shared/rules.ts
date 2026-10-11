import { Card, HandCalculation, Rank } from './types';

export function getRankBaseValue(rank: Rank): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function calculateHandValue(cards: Card[]): HandCalculation {
  // Only evaluate visible cards
  const visibleCards = cards.filter(c => !c.hidden);
  if (visibleCards.length === 0) {
    return {
      total: 0,
      isSoft: false,
      isBust: false,
      isBlackjack: false,
      hardTotal: 0,
      softTotal: 0,
    };
  }

  let acesCount = 0;
  let hardTotal = 0;
  let softTotal = 0;

  for (const card of visibleCards) {
    let cardVal = getRankBaseValue(card.rank);
    // Overclocked enhancement adds +2 (except Ace)
    if (card.enhancement === 'overclocked' && card.rank !== 'A') {
      cardVal += 2;
    }

    if (card.rank === 'A') {
      acesCount++;
      hardTotal += 1;
      softTotal += 11;
    } else {
      hardTotal += cardVal;
      softTotal += cardVal;
    }
  }

  // Adjust soft total if it busts
  let total = softTotal;
  let adjustedAces = acesCount;

  while (total > 21 && adjustedAces > 0) {
    total -= 10;
    adjustedAces--;
  }

  // Natural Blackjack: exactly 2 cards that total 21
  const isNaturalBlackjack = visibleCards.length === 2 && total === 21;
  const isSoft = total !== hardTotal && total <= 21;
  const isBust = total > 21;

  return {
    total,
    isSoft,
    isBust,
    isBlackjack: isNaturalBlackjack,
    hardTotal,
    softTotal,
  };
}

export function shouldDealerHit(
  dealerCalc: HandCalculation,
  ruleType: string = 'standard',
  thresholdOverride: number = 17
): boolean {
  if (dealerCalc.isBust) return false;

  // Custom boss rules
  if (ruleType === 'draw_on_soft_17') {
    // Hits on soft 17 (e.g. Ace + 6)
    if (dealerCalc.total === 17 && dealerCalc.isSoft) return true;
    return dealerCalc.total < 17;
  }

  return dealerCalc.total < thresholdOverride;
}

export interface CombatResultCalculation {
  outcome: 'player_win' | 'dealer_win' | 'push' | 'player_bust' | 'dealer_bust';
  damageToDealer: number;
  damageToPlayer: number;
  margin: number;
  bonusSummary: string[];
}

export function evaluateCombatRound(
  playerCalc: HandCalculation,
  dealerCalc: HandCalculation,
  baseAttack: number = 20,
  dealerDamage: number = 15,
  options?: {
    standPenalty?: boolean;
    consecutiveWins?: number;
    hasLoadedAce?: boolean;
    hasTwinEcho?: boolean;
    hasLuckyStatic?: boolean;
    hasRedline?: boolean;
    hasFriendlyFire?: boolean;
    hasNeonFlush?: boolean;
    playerHand?: Card[];
  }
): CombatResultCalculation {
  const bonuses: string[] = [];
  let damageToDealer = 0;
  let damageToPlayer = 0;
  let margin = 0;

  // 1. Player Bust
  if (playerCalc.isBust) {
    damageToPlayer = dealerDamage;
    bonuses.push('Bust! - Took direct dealer damage');

    // Lucky static check: if bust by 1 (total === 22)
    if (options?.hasLuckyStatic && playerCalc.total === 22) {
      damageToDealer += 12;
      bonuses.push('Lucky Static sparked: 12 static damage on 22 bust!');
    }

    if (options?.hasFriendlyFire) {
      damageToPlayer += 8;
      bonuses.push('Friendly Fire recoil! +8 self damage');
    }

    return {
      outcome: 'player_bust',
      damageToDealer,
      damageToPlayer,
      margin: 0,
      bonusSummary: bonuses,
    };
  }

  // 2. Dealer Bust
  if (dealerCalc.isBust) {
    margin = 21 - (21 - playerCalc.total);
    damageToDealer = Math.round(baseAttack * 1.5 + playerCalc.total);
    bonuses.push(`Dealer Bust! +50% Bonus: ${damageToDealer} damage`);

    if (playerCalc.isBlackjack) {
      damageToDealer = Math.round(damageToDealer * 2.0);
      bonuses.push('Blackjack Overdrive! 2x multiplier!');
    }

    return {
      outcome: 'dealer_bust',
      damageToDealer,
      damageToPlayer: 0,
      margin,
      bonusSummary: bonuses,
    };
  }

  // 3. Compare totals
  if (playerCalc.total > dealerCalc.total) {
    margin = playerCalc.total - dealerCalc.total;
    // Higher margin = more damage (e.g. 21 vs 17 is margin 4 = +20%)
    const marginMultiplier = 1 + margin * 0.15;
    let attack = Math.round((baseAttack + playerCalc.total) * marginMultiplier);
    bonuses.push(`Won by +${margin} margin (x${marginMultiplier.toFixed(2)})`);

    if (playerCalc.isBlackjack) {
      attack = Math.round(attack * 2.2);
      bonuses.push('Natural Blackjack! x2.2 critical!');
    }

    // Check consecutive wins (Redline)
    if (options?.hasRedline && (options.consecutiveWins || 0) > 0) {
      const redlineBonus = Math.round(attack * (0.25 * (options.consecutiveWins || 0)));
      attack += redlineBonus;
      bonuses.push(`Redline streak x${options.consecutiveWins}: +${redlineBonus} dmg`);
    }

    // Friendly fire
    if (options?.hasFriendlyFire) {
      attack = Math.round(attack * 1.3);
      bonuses.push('Friendly Fire: +30% attack damage');
    }

    damageToDealer = attack;
    return {
      outcome: 'player_win',
      damageToDealer,
      damageToPlayer: 0,
      margin,
      bonusSummary: bonuses,
    };
  } else if (playerCalc.total < dealerCalc.total) {
    margin = dealerCalc.total - playerCalc.total;
    damageToPlayer = dealerDamage + margin * 2;
    bonuses.push(`Lost by ${margin} points (-${damageToPlayer} HP)`);

    // Pit boss special stand penalty: standing on <= 16
    if (options?.standPenalty && playerCalc.total <= 16) {
      damageToPlayer += 6;
      bonuses.push('Pit Boss Punish: +6 damage for standing <= 16');
    }

    return {
      outcome: 'dealer_win',
      damageToDealer: 0,
      damageToPlayer,
      margin,
      bonusSummary: bonuses,
    };
  } else {
    // Push (Tie)
    bonuses.push('Push! Stalemate with dealer.');
    if (options?.hasLuckyStatic) {
      damageToDealer = 10;
      bonuses.push('Lucky Static: 10 static shock on Push!');
    }

    return {
      outcome: 'push',
      damageToDealer,
      damageToPlayer: 0,
      margin: 0,
      bonusSummary: bonuses,
    };
  }
}
