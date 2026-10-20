import React, { useState, useEffect, useRef } from 'react';
import { Card, Boss, HandCalculation, Joker, Consumable, FloatingText, StakeLevel } from '../shared/types';
import { CardView } from './CardView';
import { FloatingCombatText } from './FloatingCombatText';
import { ParticleCanvas, ParticleEvent } from './ParticleCanvas';
import { JokerSlotTray } from './JokerSlotTray';
import { DeckInspectionModal } from './DeckInspectionModal';
import { calculateHandValue, shouldDealerHit, evaluateCombatRound } from '../shared/rules';
import { evaluateComboLinks, getSlotMultiplier } from '../shared/jokers';
import { createStandardDeck, shuffleDeck } from '../shared/deck';
import { CONSUMABLES_CATALOG } from '../shared/consumables';
import { STAKES_MAP } from '../shared/stakes';
import { careerManager } from '../shared/careerManager';
import { soundManager } from '../audio/soundManager';

interface CombatViewProps {
  boss: Boss;
  playerDeck: Card[];
  playerHp: number;
  playerMaxHp: number;
  playerArmor: number;
  playerChips: number;
  playerJokers: Joker[];
  unlockedJokerSlots?: number;
  onUpdateJokers?: (jokers: Joker[]) => void;
  onUpdateDeck?: (deck: Card[]) => void;
  playerConsumables: Consumable[];
  stakeLevel?: StakeLevel;
  onVictory: (remainingHp: number, remainingArmor: number, chipsEarned: number) => void;
  onDefeat: () => void;
  onTriggerShake: () => void;
}

export const CombatView: React.FC<CombatViewProps> = ({
  boss,
  playerDeck,
  playerHp: initialPlayerHp,
  playerMaxHp,
  playerArmor: initialArmor,
  playerChips: initialChips,
  playerJokers: initialJokers,
  unlockedJokerSlots = 3,
  onUpdateJokers,
  onUpdateDeck,
  playerConsumables: initialConsumables,
  stakeLevel = 'white',
  onVictory,
  onDefeat,
  onTriggerShake,
}) => {
  // Combat State
  const [deck, setDeck] = useState<Card[]>([]);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [bossHp, setBossHp] = useState<number>(boss.maxHp);
  const [bossFlashHp, setBossFlashHp] = useState<number>(boss.maxHp);
  const [bossArmor, setBossArmor] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<number>(initialPlayerHp);
  const [playerFlashHp, setPlayerFlashHp] = useState<number>(initialPlayerHp);
  const [playerArmor, setPlayerArmor] = useState<number>(initialArmor);
  const [playerChips, setPlayerChips] = useState<number>(initialChips);
  const [consumables, setConsumables] = useState<Consumable[]>(initialConsumables);

  // Equipped Jokers State
  const [equippedJokers, setEquippedJokers] = useState<(Joker | null)[]>(() => {
    const slots: (Joker | null)[] = [...initialJokers];
    while (slots.length < unlockedJokerSlots) {
      slots.push(null);
    }
    return slots.slice(0, unlockedJokerSlots);
  });

  // Round State
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [hitsThisRound, setHitsThisRound] = useState<number>(0);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [dealerHoleCard, setDealerHoleCard] = useState<Card | null>(null);

  const [phase, setPhase] = useState<'dealing' | 'player_turn' | 'dealer_turn' | 'round_resolved' | 'boss_defeated'>('dealing');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [roundSummary, setRoundSummary] = useState<string | null>(null);
  const [particleEvents, setParticleEvents] = useState<ParticleEvent[]>([]);

  const playerCalc: HandCalculation = calculateHandValue(playerCards);
  const dealerCalc: HandCalculation = calculateHandValue(dealerCards);

  // Active combo links computed from equipped slot arrangement
  const activeLinks = evaluateComboLinks(equippedJokers);

  // Initialize combat encounter
  useEffect(() => {
    soundManager.playBgm('boss');
    const freshDeck = shuffleDeck(playerDeck.length >= 20 ? [...playerDeck] : createStandardDeck());
    setDeck(freshDeck);
    startNewRound(freshDeck);
    window.focus();
  }, []);

  // Update delayed health reservoirs for smooth HP damage flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setBossFlashHp(bossHp);
    }, 450);
    return () => clearTimeout(timer);
  }, [bossHp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPlayerFlashHp(playerHp);
    }, 450);
    return () => clearTimeout(timer);
  }, [playerHp]);

  // Dynamic Amiga MOD Tracker Intensity modulation based on live encounter stakes
  useEffect(() => {
    if (phase === 'boss_defeated') {
      soundManager.setGameIntensity(0);
      return;
    }
    const isCritical = (bossHp < boss.maxHp * 0.35) || (playerHp < playerMaxHp * 0.35);
    if (isCritical) {
      soundManager.setGameIntensity(3);
    } else if (phase === 'dealer_turn' || phase === 'round_resolved') {
      soundManager.setGameIntensity(2);
    } else {
      const calc = calculateHandValue(playerCards);
      if (calc.total >= 18 && !calc.isBust) {
        soundManager.setGameIntensity(2);
      } else {
        soundManager.setGameIntensity(1);
      }
    }
  }, [phase, bossHp, playerHp, playerCards, boss.maxHp, playerMaxHp]);

  const addLog = (msg: string) => {
    setCombatLogs(prev => [msg, ...prev.slice(0, 20)]);
  };

  const addFloatingText = (text: string, color: string, x: number = 50, y: number = 40) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, color, x, y, timestamp: Date.now() }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1200);
  };

  const triggerParticles = (type: 'spark' | 'shard' | 'bust', x: number, y: number, color?: string, count?: number) => {
    setParticleEvents(prev => [...prev, { type, x, y, color, count }]);
  };

  const handleReorderJokers = (newSlots: (Joker | null)[]) => {
    setEquippedJokers(newSlots);
    const compactJokers = newSlots.filter((j): j is Joker => j !== null);
    if (onUpdateJokers) {
      onUpdateJokers(compactJokers);
    }
    const newLinks = evaluateComboLinks(newSlots);
    if (newLinks.length > 0) {
      addLog(`⚡ Combo Reconfigured: ${newLinks.length} active resonance link(s)!`);
      triggerParticles('spark', 50, 75, '#00f0ff', 16);
    }
  };

  const startNewRound = (currentDeck: Card[] = deck) => {
    if (bossHp <= 0 || phase === 'boss_defeated') {
      return;
    }

    let workingDeck = [...currentDeck];
    if (workingDeck.length < 15) {
      workingDeck = shuffleDeck(createStandardDeck());
    }

    setPhase('dealing');
    setHitsThisRound(0);
    setRoundSummary(null);

    // Deal 2 player cards, 1 dealer visible, 1 dealer hole card
    const p1 = workingDeck.pop()!;
    const d1 = workingDeck.pop()!;
    const p2 = workingDeck.pop()!;
    const dHole = workingDeck.pop()!;

    soundManager.playCardDeal();

    // Check armored cards
    let bonusArmor = 0;
    [p1, p2].forEach(c => {
      if (c.enhancement === 'armored') bonusArmor += 10;
    });
    if (bonusArmor > 0) {
      setPlayerArmor(prev => prev + bonusArmor);
      addFloatingText(`+${bonusArmor} ARMOR`, '#00d2ff', 35, 65);
      triggerParticles('spark', 35, 65, '#00d2ff', 10);
    }

    setPlayerCards([p1, p2]);
    setDealerHoleCard(dHole);
    // Dealer initially displays visible card + secret hole placeholder
    setDealerCards([d1, { id: 'hole-card', suit: 'spades', rank: 'A', hidden: true }]);
    setDeck(workingDeck);

    setTimeout(() => {
      setPhase('player_turn');
      const calc = calculateHandValue([p1, p2]);
      if (calc.isBlackjack) {
        addFloatingText('NATURAL 21!', '#ffd700', 50, 50);
        triggerParticles('spark', 50, 50, '#ffd700', 25);
        soundManager.playBlackjack();
      }
    }, 500);
  };

  // PLAYER HIT
  const handleHit = () => {
    if (phase !== 'player_turn') return;
    soundManager.playHit();
    triggerParticles('spark', 50, 55, '#38bdf8', 10);

    let workingDeck = [...deck];
    if (workingDeck.length === 0) {
      workingDeck = shuffleDeck(createStandardDeck());
    }
    const card = workingDeck.pop()!;
    const newCards = [...playerCards, card];

    if (card.enhancement === 'armored') {
      setPlayerArmor(prev => prev + 10);
      addFloatingText('+10 ARMOR', '#00d2ff', 35, 65);
    }

    const newHits = hitsThisRound + 1;
    setHitsThisRound(newHits);

    // High Roller Boss Rule: Punish 3+ hits by granting dealer 15 armor
    if (boss.ruleType === 'punish_many_hits' && newHits >= 3) {
      setBossArmor(prev => prev + 15);
      addFloatingText('BOSS GAINED +15 SHIELD', '#ff9100', 50, 25);
      addLog('High Roller Protocol: Dealer gained +15 Shield from excessive hits!');
    }

    const calc = calculateHandValue(newCards);
    setPlayerCards(newCards);
    setDeck(workingDeck);

    if (calc.isBust) {
      // Check for Ghost Hand
      const hasGhostHand = equippedJokers.some(j => j?.id === 'ghost_hand');
      if (hasGhostHand) {
        soundManager.playArmor();
        addFloatingText('GHOST HAND: 21 SAVED!', '#a855f7', 50, 60);
        addLog('Ghost Hand Joker negated bust! Hand locked safely at 21.');
        setPhase('dealer_turn');
        setTimeout(() => runDealerTurn(newCards), 800);
      } else {
        soundManager.playBust();
        onTriggerShake();
        triggerParticles('bust', 50, 55, '#ef4444', 30);
        addFloatingText('BUST!', '#ef4444', 50, 60);
        addLog(`Player Busted with ${calc.total}!`);
        resolveCombat(newCards, dealerCards, true);
      }
    } else if (calc.total === 21) {
      addFloatingText('21 LOCKED!', '#22c55e', 50, 60);
      triggerParticles('spark', 50, 55, '#22c55e', 18);
      setPhase('dealer_turn');
      setTimeout(() => runDealerTurn(newCards), 700);
    }
  };

  // PLAYER STAND
  const handleStand = () => {
    if (phase !== 'player_turn') return;
    soundManager.playStand();
    setPhase('dealer_turn');

    // Radioactive cards emit radiation
    playerCards.forEach(c => {
      if (c.enhancement === 'radioactive') {
        setBossHp(prev => Math.max(0, prev - 8));
        addFloatingText('8 RADIATION DMG', '#76ff03', 50, 25);
        triggerParticles('shard', 50, 25, '#76ff03', 8);
        addLog('Radioactive Card poisoned the dealer for 8 damage!');
      }
    });

    runDealerTurn(playerCards);
  };

  // KEYBOARD CONTROLS (H / S / SPACE) with robust key/code matching & ref stability
  const hitRef = useRef(handleHit);
  hitRef.current = handleHit;
  const standRef = useRef(handleStand);
  standRef.current = handleStand;
  const startNewRoundRef = useRef(startNewRound);
  startNewRoundRef.current = startNewRound;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const roundSummaryRef = useRef(roundSummary);
  roundSummaryRef.current = roundSummary;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const key = e.key.toLowerCase();
      const code = e.code;

      if (key === 'h' || code === 'KeyH') {
        if (phaseRef.current === 'player_turn') {
          e.preventDefault();
          hitRef.current();
        }
      } else if (key === 's' || code === 'KeyS') {
        if (phaseRef.current === 'player_turn') {
          e.preventDefault();
          standRef.current();
        }
      } else if (key === ' ' || key === 'enter' || code === 'Space' || code === 'Enter') {
        if (roundSummaryRef.current && phaseRef.current === 'round_resolved') {
          e.preventDefault();
          startNewRoundRef.current();
        }
      } else if (key === 'd' || code === 'KeyD') {
        e.preventDefault();
        setShowDeckModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // DEALER TURN
  const runDealerTurn = (finalPlayerCards: Card[]) => {
    soundManager.playCardFlip();
    // Reveal hidden card
    const visibleDealer = dealerHoleCard
      ? [dealerCards[0], dealerHoleCard]
      : dealerCards;
    setDealerCards(visibleDealer);
    setDealerHoleCard(null);

    let workingDeck = [...deck];
    const standThreshold = boss.ruleType === 'dynamic_stand_threshold'
      ? (16 + Math.floor(Math.random() * 3))
      : 17;

    const dealerStep = (cards: Card[]) => {
      const calc = calculateHandValue(cards);
      if (shouldDealerHit(calc, boss.ruleType, standThreshold)) {
        setTimeout(() => {
          if (workingDeck.length === 0) workingDeck = shuffleDeck(createStandardDeck());
          const newCard = workingDeck.pop()!;
          const updatedCards = [...cards, newCard];
          setDealerCards(updatedCards);
          setDeck(workingDeck);
          soundManager.playCardDeal();
          dealerStep(updatedCards);
        }, 550);
      } else {
        setTimeout(() => {
          resolveCombat(finalPlayerCards, cards, false);
        }, 650);
      }
    };

    dealerStep(visibleDealer);
  };

  // COMBAT RESOLUTION & COMBO LINK SYNERGIES
  const resolveCombat = (pCards: Card[], dCards: Card[], playerBusted: boolean) => {
    setPhase('round_resolved');
    const pCalc = playerBusted ? { ...calculateHandValue(pCards), isBust: true } : calculateHandValue(pCards);
    const dCalc = calculateHandValue(dCards);

    // Compute active jokers and their adjacency multipliers
    const activeJokersWithMult = equippedJokers.map((joker, index) => {
      if (!joker) return null;
      return {
        joker,
        multiplier: getSlotMultiplier(index, activeLinks),
      };
    }).filter(Boolean);

    const hasLoadedAce = activeJokersWithMult.some(item => item?.joker.id === 'loaded_ace');
    const hasTwinEcho = activeJokersWithMult.some(item => item?.joker.id === 'twin_echo');
    const hasLuckyStatic = activeJokersWithMult.some(item => item?.joker.id === 'lucky_static');
    const hasRedline = activeJokersWithMult.some(item => item?.joker.id === 'redline');
    const hasFriendlyFire = activeJokersWithMult.some(item => item?.joker.id === 'friendly_fire');
    const hasNeonFlush = activeJokersWithMult.some(item => item?.joker.id === 'neon_flush');
    const hasHouseThief = activeJokersWithMult.some(item => item?.joker.id === 'house_thief');
    const hasHeartPulse = activeJokersWithMult.some(item => item?.joker.id === 'heart_pulse');
    const hasDiamondVault = activeJokersWithMult.some(item => item?.joker.id === 'diamond_vault');

    const result = evaluateCombatRound(
      pCalc,
      dCalc,
      25,
      boss.baseDamage,
      {
        standPenalty: boss.ruleType === 'extra_stand_damage',
        consecutiveWins,
        hasLoadedAce,
        hasTwinEcho,
        hasLuckyStatic,
        hasRedline,
        hasFriendlyFire,
        hasNeonFlush,
        playerHand: pCards,
      }
    );

    let finalDamageToBoss = result.damageToDealer;

    // Apply highest active combo link multiplier to base attack damage if any combo is active
    if (activeLinks.length > 0 && finalDamageToBoss > 0) {
      const bestLinkMultiplier = Math.max(...activeLinks.map(l => l.multiplier));
      const amplified = Math.round(finalDamageToBoss * bestLinkMultiplier);
      const diff = amplified - finalDamageToBoss;
      finalDamageToBoss = amplified;
      addLog(`⚡ Combo Link Resonance amplified attack by +${diff} DMG (x${bestLinkMultiplier})!`);
      triggerParticles('spark', 50, 20, '#00f0ff', 18);
    }

    // Card Enhancements, Editions, and Seals resolution
    let glassShatteredIds: string[] = [];
    let instantCreditBounty = 0;

    pCards.forEach(c => {
      const repetitions = c.seal === 'red' ? 2 : 1;
      for (let r = 0; r < repetitions; r++) {
        // Flat chips additions
        if (c.enhancement === 'bonus_chips') finalDamageToBoss += 30;
        if (c.enhancement === 'holographic') finalDamageToBoss += 12;
        if (c.edition === 'foil') finalDamageToBoss += 50;

        // Multipliers additions
        if (c.enhancement === 'overclocked') finalDamageToBoss = Math.round(finalDamageToBoss * 1.25 + 4);
        if (c.edition === 'holographic') finalDamageToBoss = Math.round(finalDamageToBoss * 1.35 + 10);
        if (c.enhancement === 'polychrome' || c.edition === 'polychrome') {
          finalDamageToBoss = Math.round(finalDamageToBoss * 1.5);
        }

        // Glass Card (x2.0 mult with 25% shatter chance)
        if (c.enhancement === 'glass') {
          finalDamageToBoss = Math.round(finalDamageToBoss * 2.0);
          if (r === 0 && Math.random() < 0.25) {
            glassShatteredIds.push(c.id);
          }
        }

        // Steel Card (x1.5 mult)
        if (c.enhancement === 'steel') {
          finalDamageToBoss = Math.round(finalDamageToBoss * 1.5);
        }

        // Gold Seal: +3 credits on score
        if (c.seal === 'gold') {
          instantCreditBounty += 3;
        }
      }
    });

    if (instantCreditBounty > 0) {
      setPlayerChips(prev => prev + instantCreditBounty);
      addFloatingText(`+${instantCreditBounty} 🪙 (GOLD SEAL)`, '#ffd700', 60, 60);
      addLog(`Gold Circuit Seal minted +${instantCreditBounty} Credits!`);
    }

    if (glassShatteredIds.length > 0) {
      soundManager.playBust();
      addFloatingText('GLASS SHATTERED!', '#f43f5e', 50, 45);
      triggerParticles('shard', 50, 45, '#e0f7fa', 30);
      addLog(`⚠️ Critical Overload: Glass card shattered into digital dust!`);
      if (onUpdateDeck) {
        onUpdateDeck(playerDeck.filter(c => !glassShatteredIds.includes(c.id)));
      }
    }

    // Record lifetime combat analytics
    careerManager.recordCombatStats({
      blackjacks: pCalc.isBlackjack ? 1 : 0,
      busts: pCalc.isBust ? 1 : 0,
      damageDealt: finalDamageToBoss,
      highestHandScore: finalDamageToBoss,
    });

    if (finalDamageToBoss > 0) {
      soundManager.playAttack();
      onTriggerShake();
      triggerParticles('shard', 50, 20, '#f43f5e', 20);
      setConsecutiveWins(prev => prev + 1);

      // Boss shield absorption
      let netBossHpDamage = finalDamageToBoss;
      if (bossArmor > 0) {
        const absorbed = Math.min(bossArmor, netBossHpDamage);
        setBossArmor(prev => prev - absorbed);
        netBossHpDamage -= absorbed;
      }

      setBossHp(prev => {
        const next = Math.max(0, prev - netBossHpDamage);
        if (next === 0) {
          setPhase('boss_defeated');
          triggerParticles('bust', 50, 25, '#ffd700', 40);
          setTimeout(() => {
            soundManager.playBgm('victory');
            onVictory(playerHp, playerArmor, 45);
          }, 1200);
        }
        return next;
      });

      addFloatingText(`-${finalDamageToBoss} HP`, '#38bdf8', 50, 20);

      // Bonus chips & heals from enhancements & jokers
      if (hasDiamondVault) {
        const diamonds = pCards.filter(c => c.suit === 'diamonds').length;
        if (diamonds > 0) {
          setPlayerChips(prev => prev + diamonds * 8);
          addFloatingText(`+${diamonds * 8} 🪙`, '#ffd700', 70, 70);
        }
      }
      if (hasHeartPulse) {
        const hearts = pCards.filter(c => c.suit === 'hearts').length;
        if (hearts > 0) {
          setPlayerHp(prev => Math.min(playerMaxHp, prev + hearts * 5));
          addFloatingText(`+${hearts * 5} HP`, '#f43f5e', 30, 70);
        }
      }
      if (hasHouseThief) {
        setPlayerArmor(prev => prev + 12);
        addFloatingText('+12 ARMOR', '#00d2ff', 35, 65);
      }

      // Vampiric Card Healing
      const vampCards = pCards.filter(c => c.enhancement === 'vampiric').length;
      if (vampCards > 0) {
        const vampHeal = vampCards * 6;
        setPlayerHp(prev => Math.min(playerMaxHp, prev + vampHeal));
        addFloatingText(`+${vampHeal} HP (VAMP)`, '#ff1744', 30, 65);
        addLog(`Vampiric Drain siphoned +${vampHeal} HP to operative.`);
      }

      // Golden Card Payout
      const goldCards = pCards.filter(c => c.enhancement === 'golden').length;
      if (goldCards > 0) {
        const goldBonus = goldCards * 15;
        setPlayerChips(prev => prev + goldBonus);
        addFloatingText(`+${goldBonus} 🪙 (GOLD)`, '#ffd700', 65, 65);
        addLog(`Golden Reserve awarded +${goldBonus} Chips on victory!`);
      }

      // Blue Protocol Seal Gear Synthesis
      const blueSealCard = pCards.find(c => c.seal === 'blue');
      if (blueSealCard && consumables.length < 3) {
        const randomGear = CONSUMABLES_CATALOG[Math.floor(Math.random() * CONSUMABLES_CATALOG.length)];
        setConsumables(prev => [...prev, randomGear]);
        addFloatingText(`+${randomGear.name}`, '#2979ff', 40, 70);
        addLog(`Blue Protocol Seal fabricated tactical gear: ${randomGear.name}!`);
      }
    } else if (result.outcome === 'dealer_win' || result.outcome === 'player_bust') {
      soundManager.playPlayerHit();
      onTriggerShake();
      triggerParticles('shard', 50, 65, '#ef4444', 16);
      setConsecutiveWins(0);

      let netPlayerHpDamage = result.damageToPlayer;
      if (playerArmor > 0) {
        const absorbed = Math.min(playerArmor, netPlayerHpDamage);
        setPlayerArmor(prev => prev - absorbed);
        netPlayerHpDamage -= absorbed;
      }

      setPlayerHp(prev => {
        const next = Math.max(0, prev - netPlayerHpDamage);
        if (next === 0) {
          setTimeout(() => {
            onDefeat();
          }, 1000);
        }
        return next;
      });

      addFloatingText(`-${result.damageToPlayer} HP`, '#ef4444', 50, 65);
    }

    const isPlayerVictory = result.outcome === 'player_win' || result.outcome === 'dealer_bust';
    const isPlayerLoss = result.outcome === 'dealer_win' || result.outcome === 'player_bust';

    setRoundNumber(prev => prev + 1);
    setRoundSummary(
      `${isPlayerVictory ? 'VICTORY' : result.outcome === 'push' ? 'STANDOFF (PUSH)' : 'DEFEAT'}: ${
        isPlayerVictory
          ? `Dealt ${finalDamageToBoss} DMG to ${boss.name}`
          : isPlayerLoss
          ? `Took ${result.damageToPlayer} damage from Dealer`
          : 'Both stood on equal ground'
      }`
    );

    result.bonusSummary.forEach(b => addLog(b));
  };

  // CONSUMABLES
  const useConsumable = (item: Consumable) => {
    soundManager.playArmor();
    setConsumables(prev => prev.filter(c => c.id !== item.id));

    if (item.effectType === 'medkit') {
      setPlayerHp(prev => Math.min(playerMaxHp, prev + 25));
      addFloatingText('+25 HP', '#22c55e', 50, 65);
      addLog('Used Medkit: Restored 25 HP.');
    } else if (item.effectType === 'armor_plate') {
      setPlayerArmor(prev => prev + 20);
      addFloatingText('+20 ARMOR', '#00d2ff', 50, 65);
      addLog('Used Armor Plate: Gained 20 Armor.');
    } else if (item.effectType === 'overcharge') {
      setBossHp(prev => Math.max(0, prev - 25));
      addFloatingText('25 DIRECT DMG', '#ec4899', 50, 20);
      addLog('Overcharge EMP blasted the dealer for 25 damage!');
    } else if (item.effectType === 'rewind') {
      if (playerCards.length > 2) {
        const discarded = playerCards[playerCards.length - 1];
        let workingDeck = [...deck];
        if (workingDeck.length === 0) workingDeck = shuffleDeck(createStandardDeck());
        const replacement = workingDeck.pop()!;
        const updated = [...playerCards.slice(0, -1), replacement];
        setPlayerCards(updated);
        setDeck(workingDeck);
        addLog(`Rewound ${discarded.rank} -> Drew replacement.`);
      }
    }
  };

  const bustRiskPercent = playerCalc.total <= 11 ? 0 : Math.min(100, Math.round(((playerCalc.total - 11) / 10) * 100));

  return (
    <div className="relative max-w-5xl mx-auto w-full p-2 sm:p-4 flex flex-col justify-between min-h-[92vh] select-none">
      {/* CANVAS PARTICLES LAYER */}
      <ParticleCanvas events={particleEvents} />

      {/* FLOATING DAMAGE & BUFF NUMBERS */}
      <FloatingCombatText items={floatingTexts} />

      {/* TOP: DEALER / BOSS HUD */}
      <div className="pixel-box p-3 sm:p-4 rounded-lg border-2 border-red-900/80 bg-red-950/20 mb-2 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-900/40 border border-red-500/50 flex items-center justify-center font-pixel text-xl shadow-inner">
              👹
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-pixel text-xs sm:text-sm text-red-400 font-bold">{boss.name}</h2>
                <span className="text-[10px] font-pixel bg-red-900 text-red-100 px-2 py-0.5 rounded border border-red-700">
                  ACT {boss.act}
                </span>
                <span
                  className="text-[10px] font-pixel px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${STAKES_MAP[stakeLevel]?.color || '#ffffff'}22`,
                    borderColor: STAKES_MAP[stakeLevel]?.color || '#ffffff',
                    color: STAKES_MAP[stakeLevel]?.color || '#ffffff',
                  }}
                >
                  {STAKES_MAP[stakeLevel]?.name || 'White Stake'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">{boss.title}</div>
            </div>
          </div>

          {/* BOSS HEALTH BAR WITH DUAL FLASH RESERVOIR */}
          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-red-400 font-bold">DEALER HP</span>
              <span className="text-slate-200">
                {bossHp}/{boss.maxHp} {bossArmor > 0 && <span className="text-cyan-400">({bossArmor} Shield)</span>}
              </span>
            </div>
            <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              {/* White damage reservoir bar (lerps slower) */}
              <div
                className="absolute inset-y-0 left-0 bg-white/60 transition-all duration-500"
                style={{ width: `${Math.max(0, (bossFlashHp / boss.maxHp) * 100)}%` }}
              />
              {/* Primary HP gradient */}
              <div
                className="relative h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-200"
                style={{ width: `${Math.max(0, (bossHp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* BOSS PASSIVE PROTOCOL BANNER */}
        <div className="mt-2 pt-2 border-t border-red-950 text-xs font-mono text-red-300/80 flex items-center gap-2">
          <span className="text-red-400 font-bold">PROTOCOL:</span> {boss.specialRule}
        </div>
      </div>

      {/* DEALER'S CARDS TABLE */}
      <div className="flex flex-col items-center justify-center my-1 sm:my-3">
        <div className="text-xs font-pixel text-slate-400 mb-1.5 flex items-center gap-2">
          <span>DEALER HAND:</span>
          <span className="text-red-300 font-bold">
            {phase === 'player_turn' ? `${dealerCalc.total} + ?` : `${dealerCalc.total}`}
          </span>
          {dealerCalc.isBlackjack && <span className="text-yellow-400 font-bold animate-pulse">BLACKJACK!</span>}
          {dealerCalc.isBust && <span className="text-emerald-400 font-bold">BUSTED!</span>}
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[110px] sm:min-h-[130px]">
          {dealerCards.map((card, idx) => (
            <CardView key={`${card.id}-${idx}`} card={card} />
          ))}
        </div>
      </div>

      {/* ROUND SUMMARY & ACTION FEEDBACK */}
      {roundSummary && phase !== 'boss_defeated' && (
        <div className="mx-auto my-1.5 px-4 py-2 rounded-lg bg-slate-900/90 border border-yellow-400/50 text-center font-pixel text-xs text-yellow-300 shadow-lg">
          {roundSummary}
          <div className="mt-2">
            <button
              onClick={() => startNewRound()}
              className="pixel-btn px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs rounded border-yellow-200 font-bold shadow-md animate-pulse"
            >
              NEXT ROUND [SPACE] →
            </button>
          </div>
        </div>
      )}

      {/* BOSS DEFEATED CELEBRATION */}
      {phase === 'boss_defeated' && (
        <div className="mx-auto my-2 px-6 py-3 rounded-lg bg-emerald-950/90 border-2 border-emerald-400 text-center font-pixel text-emerald-300 shadow-2xl animate-pulse">
          🎉 BOSS DEFEATED! ADVANCING TO REWARDS...
        </div>
      )}

      {/* PLAYER'S CARDS TABLE */}
      <div className="flex flex-col items-center justify-center my-1 sm:my-3">
        <div className="flex items-center justify-center gap-2 sm:gap-3 min-h-[110px] sm:min-h-[130px] mb-2">
          {playerCards.map((card, idx) => (
            <CardView key={`${card.id}-${idx}`} card={card} isNew={idx >= playerCards.length - 1} />
          ))}
        </div>

        {/* HAND VALUE & BUST RISK METER */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded flex items-center gap-2 shadow-sm">
            <span className="text-slate-400">Hand Total:</span>
            <span className="font-pixel text-sm text-cyan-300 font-bold">
              {playerCalc.total} {playerCalc.isSoft && `(Soft)`}
            </span>
          </div>

          {phase === 'player_turn' && (
            <div className={`px-2.5 py-1 rounded border text-xs font-mono ${
              bustRiskPercent === 0
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                : bustRiskPercent < 50
                ? 'bg-yellow-950/60 border-yellow-500 text-yellow-300'
                : 'bg-red-950/60 border-red-500 text-red-300 animate-pulse'
            }`}>
              Bust Danger: {bustRiskPercent}%
            </div>
          )}

          {consecutiveWins > 0 && (
            <div className="px-2 py-0.5 bg-purple-950/60 border border-purple-500 text-purple-300 rounded font-pixel text-[10px]">
              Streak: {consecutiveWins}x 🔥
            </div>
          )}

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setShowDeckModal(true);
            }}
            title="Inspect full deck composition & augments [D]"
            className="pixel-btn px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🎴</span>
            <span>DECK ({playerDeck.length})</span>
            <kbd className="text-[9px] px-1 bg-cyan-900/60 rounded border border-cyan-700/60 text-cyan-200">D</kbd>
          </button>
        </div>
      </div>

      {/* JOKER MATRIX TRAY WITH DRAG-AND-DROP REORDER & COMBO LINKS */}
      <div className="my-2">
        <JokerSlotTray
          unlockedSlots={unlockedJokerSlots}
          slots={equippedJokers}
          onReorderSlots={handleReorderJokers}
          activeLinks={activeLinks}
        />
      </div>

      {/* BOTTOM ACTION DOCK: PLAYER HEALTH & HIT / STAND CONTROLS */}
      <div className="pixel-box p-3 sm:p-4 rounded-lg border-2 border-cyan-500/50 bg-slate-900/95 sticky bottom-1 z-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* PLAYER HEALTH & ARMOR WITH FLASH BAR */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="w-40 sm:w-48 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-bold">OPERATIVE HP</span>
                <span className="text-slate-200">
                  {playerHp}/{playerMaxHp} {playerArmor > 0 && <span className="text-cyan-400">(+{playerArmor} Arm)</span>}
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="absolute inset-y-0 left-0 bg-white/60 transition-all duration-500"
                  style={{ width: `${Math.max(0, (playerFlashHp / playerMaxHp) * 100)}%` }}
                />
                <div
                  className="relative h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-200"
                  style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="border-l border-slate-700 pl-3">
              <div className="text-[10px] text-slate-400 font-mono">CHIPS</div>
              <div className="font-pixel text-xs text-yellow-400">{playerChips} 🪙</div>
            </div>
          </div>

          {/* COMBAT ACTION BUTTONS (HIT [H] & STAND [S]) */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button
              disabled={phase !== 'player_turn'}
              onClick={handleHit}
              className={`flex-1 sm:flex-none pixel-btn px-6 py-3 font-pixel text-xs sm:text-sm font-bold rounded border ${
                phase === 'player_turn'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              HIT [H]
            </button>
            <button
              disabled={phase !== 'player_turn'}
              onClick={handleStand}
              className={`flex-1 sm:flex-none pixel-btn px-6 py-3 font-pixel text-xs sm:text-sm font-bold rounded border ${
                phase === 'player_turn'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              STAND [S]
            </button>
          </div>
        </div>

        {/* CONSUMABLES QUICK GEAR BAR */}
        {consumables.length > 0 && (
          <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-800">
            <span className="text-[10px] font-pixel text-slate-400">TACTICAL GEAR:</span>
            <div className="flex gap-2 flex-wrap">
              {consumables.map(item => (
                <button
                  key={item.id}
                  disabled={phase !== 'player_turn'}
                  onClick={() => useConsumable(item)}
                  title={`Use ${item.name}: ${item.description}`}
                  className="pixel-btn px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 text-[10px] font-pixel rounded flex items-center gap-1.5"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MID-COMBAT DECK & AUGMENTATIONS INSPECTION MODAL */}
      {showDeckModal && (
        <DeckInspectionModal
          deck={playerDeck}
          onClose={() => setShowDeckModal(false)}
        />
      )}
    </div>
  );
};
