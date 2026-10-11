import React, { useState, useEffect } from 'react';
import { Card, Boss, HandCalculation, Joker, Consumable, FloatingText } from '../shared/types';
import { CardView } from './CardView';
import { FloatingCombatText } from './FloatingCombatText';
import { calculateHandValue, shouldDealerHit, evaluateCombatRound } from '../shared/rules';
import { createStandardDeck, shuffleDeck } from '../shared/deck';
import { soundManager } from '../audio/soundManager';

interface CombatViewProps {
  boss: Boss;
  playerDeck: Card[];
  playerHp: number;
  playerMaxHp: number;
  playerArmor: number;
  playerChips: number;
  playerJokers: Joker[];
  playerConsumables: Consumable[];
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
  playerJokers,
  playerConsumables: initialConsumables,
  onVictory,
  onDefeat,
  onTriggerShake,
}) => {
  // Combat State
  const [deck, setDeck] = useState<Card[]>([]);
  const [bossHp, setBossHp] = useState<number>(boss.maxHp);
  const [bossArmor, setBossArmor] = useState<number>(0);
  const [playerHp, setPlayerHp] = useState<number>(initialPlayerHp);
  const [playerArmor, setPlayerArmor] = useState<number>(initialArmor);
  const [playerChips, setPlayerChips] = useState<number>(initialChips);
  const [consumables, setConsumables] = useState<Consumable[]>(initialConsumables);

  // Round State
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [consecutiveWins, setConsecutiveWins] = useState<number>(0);
  const [hitsThisRound, setHitsThisRound] = useState<number>(0);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [dealerHoleCard, setDealerHoleCard] = useState<Card | null>(null);

  const [phase, setPhase] = useState<'dealing' | 'player_turn' | 'dealer_turn' | 'round_resolved'>('dealing');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [roundSummary, setRoundSummary] = useState<string | null>(null);

  const playerCalc: HandCalculation = calculateHandValue(playerCards);
  const dealerCalc: HandCalculation = calculateHandValue(dealerCards);

  // Initialize combat encounter
  useEffect(() => {
    soundManager.playBgm('boss');
    const freshDeck = shuffleDeck(playerDeck.length >= 20 ? [...playerDeck] : createStandardDeck());
    setDeck(freshDeck);
    startNewRound(freshDeck);
  }, []);

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

  const startNewRound = (currentDeck: Card[] = deck) => {
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
    }

    setPlayerCards([p1, p2]);
    setDealerHoleCard(dHole);
    // Dealer initially displays visible card + secret placeholder
    setDealerCards([d1, { id: 'hole-card', suit: 'spades', rank: 'A', hidden: true }]);
    setDeck(workingDeck);

    setTimeout(() => {
      setPhase('player_turn');
      const calc = calculateHandValue([p1, p2]);
      if (calc.isBlackjack) {
        addFloatingText('NATURAL 21!', '#ffd700', 50, 50);
        soundManager.playBlackjack();
      }
    }, 600);
  };

  // PLAYER HIT
  const handleHit = () => {
    if (phase !== 'player_turn') return;
    soundManager.playHit();

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
      addLog('High Roller Rule: Dealer gained +15 Shield from excessive hits!');
    }

    const calc = calculateHandValue(newCards);
    setPlayerCards(newCards);
    setDeck(workingDeck);

    if (calc.isBust) {
      // Check for Ghost Hand
      const hasGhostHand = playerJokers.some(j => j.id === 'ghost_hand');
      if (hasGhostHand) {
        soundManager.playArmor();
        addFloatingText('GHOST HAND: 21 SAVED!', '#a855f7', 50, 60);
        addLog('Ghost Hand Joker negated bust! Hand locked safely at 21.');
        setPhase('dealer_turn');
        setTimeout(() => runDealerTurn(newCards), 800);
      } else {
        soundManager.playBust();
        onTriggerShake();
        addFloatingText('BUST!', '#ef4444', 50, 60);
        addLog(`Player Busted with ${calc.total}!`);
        resolveCombat(newCards, dealerCards, true);
      }
    } else if (calc.total === 21) {
      addFloatingText('21 LOCKED!', '#22c55e', 50, 60);
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
        addLog('Radioactive Card poisoned the dealer for 8 damage!');
      }
    });

    runDealerTurn(playerCards);
  };

  // DEALER TURN
  const runDealerTurn = (finalPlayerCards: Card[]) => {
    soundManager.playCardFlip();
    // Reveal hidden card
    const visibleDealer = dealerHoleCard
      ? [dealerCards[0], dealerHoleCard]
      : dealerCards;
    setDealerCards(visibleDealer);
    setDealerHoleCard(null);

    let currentDealerCalc = calculateHandValue(visibleDealer);
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
        }, 600);
      } else {
        setTimeout(() => {
          resolveCombat(finalPlayerCards, cards, false);
        }, 700);
      }
    };

    dealerStep(visibleDealer);
  };

  // COMBAT RESOLUTION
  const resolveCombat = (pCards: Card[], dCards: Card[], playerBusted: boolean) => {
    setPhase('round_resolved');
    const pCalc = playerBusted ? { ...calculateHandValue(pCards), isBust: true } : calculateHandValue(pCards);
    const dCalc = calculateHandValue(dCards);

    const hasLoadedAce = playerJokers.some(j => j.id === 'loaded_ace');
    const hasTwinEcho = playerJokers.some(j => j.id === 'twin_echo');
    const hasLuckyStatic = playerJokers.some(j => j.id === 'lucky_static');
    const hasRedline = playerJokers.some(j => j.id === 'redline');
    const hasFriendlyFire = playerJokers.some(j => j.id === 'friendly_fire');
    const hasNeonFlush = playerJokers.some(j => j.id === 'neon_flush');
    const hasHouseThief = playerJokers.some(j => j.id === 'house_thief');
    const hasHeartPulse = playerJokers.some(j => j.id === 'heart_pulse');
    const hasDiamondVault = playerJokers.some(j => j.id === 'diamond_vault');

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

    // Card enhancements multipliers (Polychrome / Holographic)
    pCards.forEach(c => {
      if (c.enhancement === 'holographic') {
        finalDamageToBoss += 12;
      }
      if (c.enhancement === 'polychrome') {
        finalDamageToBoss = Math.round(finalDamageToBoss * 1.5);
      }
    });

    if (finalDamageToBoss > 0) {
      soundManager.playAttack();
      onTriggerShake();
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
      }

      setRoundSummary(`ROUND WON! Inflicted ${finalDamageToBoss} damage!`);
    } else if (result.damageToPlayer > 0) {
      soundManager.playPlayerHit();
      onTriggerShake();
      setConsecutiveWins(0);

      let netDamage = result.damageToPlayer;
      if (playerArmor > 0) {
        const absorbed = Math.min(playerArmor, netDamage);
        setPlayerArmor(prev => prev - absorbed);
        netDamage -= absorbed;
      }

      setPlayerHp(prev => {
        const next = Math.max(0, prev - netDamage);
        if (next === 0) {
          setTimeout(() => {
            onDefeat();
          }, 1200);
        }
        return next;
      });

      addFloatingText(`-${result.damageToPlayer} HP`, '#ef4444', 50, 70);
      setRoundSummary(`ROUND LOST! Took ${result.damageToPlayer} damage!`);
    } else {
      setRoundSummary('PUSH! Hand stalemate.');
    }

    result.bonusSummary.forEach(b => addLog(b));
    setRoundNumber(prev => prev + 1);
  };

  // USE CONSUMABLE
  const useConsumable = (item: Consumable) => {
    if (phase !== 'player_turn') return;
    setConsumables(prev => prev.filter(c => c.id !== item.id));

    if (item.effectType === 'medkit') {
      soundManager.playHeal();
      setPlayerHp(prev => Math.min(playerMaxHp, prev + 25));
      addFloatingText('+25 HP', '#22c55e', 30, 70);
      addLog('Used Medkit Patch: +25 HP.');
    } else if (item.effectType === 'armor_plate') {
      soundManager.playArmor();
      setPlayerArmor(prev => prev + 20);
      addFloatingText('+20 ARMOR', '#00d2ff', 30, 70);
      addLog('Used Armor Plate: +20 Armor.');
    } else if (item.effectType === 'rewind') {
      soundManager.playCardDeal();
      if (playerCards.length > 2) {
        const remaining = [...playerCards];
        remaining.pop();
        let workingDeck = [...deck];
        const replacement = workingDeck.pop()!;
        remaining.push(replacement);
        setPlayerCards(remaining);
        setDeck(workingDeck);
        addLog(`Rewound last card into ${replacement.rank}!`);
      }
    }
  };

  // BUST RISK CALCULATION
  const bustRiskPercent = playerCalc.total <= 11 ? 0 : Math.min(99, Math.round(((playerCalc.total - 11) / 10) * 100));

  return (
    <div className="relative max-w-4xl mx-auto w-full p-3 sm:p-5 flex flex-col justify-between min-h-[85vh]">
      <FloatingCombatText items={floatingTexts} />

      {/* TOP: BOSS STATUS BAR */}
      <div className="pixel-box p-3 sm:p-4 rounded-lg border-2 border-red-900/80 bg-red-950/20 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-900/40 border border-red-500/50 flex items-center justify-center font-pixel text-xl shadow-inner">
              👹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm text-red-400 font-bold">{boss.name}</h2>
                <span className="text-[10px] font-pixel bg-red-950 px-2 py-0.5 rounded text-red-200 border border-red-800">
                  ACT {boss.act}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">{boss.title}</div>
            </div>
          </div>

          {/* BOSS HEALTH BAR */}
          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-red-400 font-bold">DEALER HP</span>
              <span className="text-slate-200">
                {bossHp}/{boss.maxHp} {bossArmor > 0 && <span className="text-cyan-400">({bossArmor} Shield)</span>}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (bossHp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* BOSS PASSIVE PROTOCOL BANNER */}
        <div className="mt-2.5 pt-2 border-t border-red-950 text-xs font-mono text-red-300/80 flex items-center gap-2">
          <span className="text-red-400 font-bold">PROTOCOL:</span> {boss.specialRule}
        </div>
      </div>

      {/* DEALER'S CARDS TABLE */}
      <div className="flex flex-col items-center justify-center my-2 sm:my-4">
        <div className="text-xs font-pixel text-slate-400 mb-2 flex items-center gap-2">
          <span>DEALER HAND:</span>
          <span className="text-red-300 font-bold">
            {phase === 'player_turn' ? `${dealerCalc.total} + ?` : `${dealerCalc.total}`}
          </span>
          {dealerCalc.isBlackjack && <span className="text-yellow-400 font-bold">BLACKJACK!</span>}
          {dealerCalc.isBust && <span className="text-emerald-400 font-bold">BUSTED!</span>}
        </div>
        <div className="flex items-center justify-center gap-3 min-h-[120px]">
          {dealerCards.map(card => (
            <CardView key={card.id} card={card} />
          ))}
        </div>
      </div>

      {/* ROUND SUMMARY & ACTION FEEDBACK */}
      {roundSummary && (
        <div className="mx-auto my-2 px-4 py-2 rounded-lg bg-slate-900/90 border border-yellow-400/50 text-center font-pixel text-xs text-yellow-300 animate-pulse">
          {roundSummary}
          <div className="mt-2">
            <button
              onClick={() => startNewRound()}
              className="pixel-btn px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs rounded border-yellow-200 font-bold"
            >
              NEXT ROUND →
            </button>
          </div>
        </div>
      )}

      {/* PLAYER'S CARDS TABLE */}
      <div className="flex flex-col items-center justify-center my-2 sm:my-4">
        <div className="flex items-center justify-center gap-3 min-h-[120px] mb-2">
          {playerCards.map(card => (
            <CardView key={card.id} card={card} />
          ))}
        </div>

        {/* HAND VALUE & BUST RISK METER */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/50 rounded flex items-center gap-2">
            <span className="text-slate-400">Hand Value:</span>
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
        </div>
      </div>

      {/* PLAYER CONTROLS (HIT / STAND / GEAR) */}
      <div className="pixel-box p-3 sm:p-4 rounded-lg border-2 border-cyan-500/50 bg-slate-900/90">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
          {/* PLAYER HEALTH & ARMOR */}
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">OPERATIVE HEALTH</div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm text-emerald-400">{playerHp}/{playerMaxHp} HP</span>
                {playerArmor > 0 && (
                  <span className="font-pixel text-xs text-cyan-400">+{playerArmor} Armor</span>
                )}
              </div>
            </div>
            <div className="border-l border-slate-700 pl-3">
              <div className="text-[10px] text-slate-400 font-mono">CHIPS</div>
              <div className="font-pixel text-xs text-yellow-400">{playerChips} 🪙</div>
            </div>
          </div>

          {/* COMBAT ACTION BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              disabled={phase !== 'player_turn'}
              onClick={handleHit}
              className={`pixel-btn px-6 py-2.5 font-pixel text-xs sm:text-sm font-bold rounded border ${
                phase === 'player_turn'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              HIT [H]
            </button>
            <button
              disabled={phase !== 'player_turn'}
              onClick={handleStand}
              className={`pixel-btn px-6 py-2.5 font-pixel text-xs sm:text-sm font-bold rounded border ${
                phase === 'player_turn'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              STAND [S]
            </button>
          </div>
        </div>

        {/* EQUIPPED JOKERS & CONSUMABLES TRAY */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2.5 border-t border-slate-800 text-xs">
          {/* Jokers Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-pixel text-slate-400">JOKERS:</span>
            <div className="flex gap-2">
              {playerJokers.map(joker => (
                <div
                  key={joker.id}
                  title={`${joker.name}: ${joker.description}`}
                  className="w-7 h-7 rounded bg-slate-800 border border-yellow-500/50 flex items-center justify-center cursor-help transition-transform hover:scale-110"
                >
                  <span className="text-sm">{joker.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consumables Quick Use */}
          {consumables.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel text-slate-400">GEAR:</span>
              <div className="flex gap-2">
                {consumables.map(item => (
                  <button
                    key={item.id}
                    disabled={phase !== 'player_turn'}
                    onClick={() => useConsumable(item)}
                    title={`Use ${item.name}: ${item.description}`}
                    className="pixel-btn px-2 py-1 bg-emerald-950/60 hover:bg-emerald-800 border border-emerald-500/50 text-emerald-200 text-[10px] font-pixel rounded flex items-center gap-1"
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
