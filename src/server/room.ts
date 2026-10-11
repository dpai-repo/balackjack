import { WebSocket } from 'ws';
import {
  Card,
  NetworkPlayer,
  NetworkRoomState,
  ClientAction,
  HandCalculation,
} from '../shared/types';
import { createStandardDeck, shuffleDeck } from '../shared/deck';
import { calculateHandValue, shouldDealerHit, evaluateCombatRound } from '../shared/rules';
import { BOSSES, getBossByAct } from '../shared/bosses';
import { getCharacterById } from '../shared/characters';
import { getJokerById } from '../shared/jokers';
import { getConsumableById } from '../shared/consumables';

export class GameRoom {
  public code: string;
  public isPrivate: boolean;
  public sockets: Map<string, WebSocket> = new Map();
  public state: NetworkRoomState;
  private deck: Card[] = [];
  private dealerHoleCard: Card | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  private onRoomEmptyCallback?: () => void;

  constructor(code: string, isPrivate: boolean = false) {
    this.code = code;
    this.isPrivate = isPrivate;

    const initialBoss = BOSSES[0];
    this.state = {
      roomCode: code,
      isPrivate,
      boss: initialBoss,
      bossHp: initialBoss.maxHp,
      bossMaxHp: initialBoss.maxHp,
      bossCards: [],
      bossHandCalc: { total: 0, isSoft: false, isBust: false, isBlackjack: false, hardTotal: 0, softTotal: 0 },
      phase: 'lobby',
      turnTimeRemaining: 25,
      turnMaxTime: 25,
      players: {},
      roundNumber: 1,
      actNumber: 1,
      logMessages: [`Room ${code} created. Awaiting operatives.`],
    };
  }

  public setOnEmpty(cb: () => void) {
    this.onRoomEmptyCallback = cb;
  }

  public addPlayer(id: string, name: string, characterId: string, ws?: WebSocket): NetworkPlayer {
    const isFirst = Object.keys(this.state.players).length === 0;
    const char = getCharacterById(characterId);
    const startJoker = getJokerById(char.startingJokerId);
    const startConsumable = getConsumableById(char.startingConsumableId);

    const player: NetworkPlayer = {
      id,
      name: name || `Agent-${id.substring(0, 4)}`,
      isHost: isFirst,
      isReady: false,
      characterId: char.id,
      hp: char.hp,
      maxHp: char.maxHp,
      armor: char.armor,
      chips: char.chips,
      hand: [],
      handCalc: { total: 0, isSoft: false, isBust: false, isBlackjack: false, hardTotal: 0, softTotal: 0 },
      status: 'acting',
      jokers: startJoker ? [startJoker] : [],
      consumables: startConsumable ? [startConsumable] : [],
      lastRoundDamage: 0,
      lastRoundHealing: 0,
    };

    this.state.players[id] = player;
    if (ws) {
      this.sockets.set(id, ws);
    }

    this.addLog(`${player.name} joined the table.`);
    this.broadcastState();
    return player;
  }

  public addBotPlayer() {
    const botCount = Object.values(this.state.players).filter(p => p.isBot).length;
    if (Object.keys(this.state.players).length >= 6) return;

    const botId = `bot-${Date.now().toString(36)}-${botCount + 1}`;
    const botNames = ['Byte-Runner', 'Synth-Samurai', 'Cyber-Doc', 'Deck-Infiltrator'];
    const botName = botNames[botCount % botNames.length] + ' (AI)';
    const botCharId = ['card_sharp', 'cyber_punk', 'field_medic', 'high_roller'][botCount % 4];

    const player = this.addPlayer(botId, botName, botCharId);
    player.isBot = true;
    player.isReady = true;
    this.broadcastState();
  }

  public removePlayer(id: string) {
    const player = this.state.players[id];
    if (player) {
      this.addLog(`${player.name} disconnected.`);
      delete this.state.players[id];
      this.sockets.delete(id);

      // Reassign host if needed
      const remaining = Object.values(this.state.players);
      if (remaining.length > 0 && player.isHost) {
        remaining[0].isHost = true;
      }

      if (remaining.filter(p => !p.isBot).length === 0) {
        if (this.onRoomEmptyCallback) this.onRoomEmptyCallback();
      }
    }
    this.broadcastState();
  }

  public handleAction(playerId: string, action: ClientAction) {
    const player = this.state.players[playerId];
    if (!player) return;

    switch (action.type) {
      case 'ready':
        if (this.state.phase === 'lobby') {
          player.isReady = !player.isReady;
          this.broadcastState();
        }
        break;

      case 'add_bot':
        if (player.isHost && this.state.phase === 'lobby') {
          this.addBotPlayer();
        }
        break;

      case 'start_game':
        if (player.isHost && this.state.phase === 'lobby') {
          this.startEncounter();
        }
        break;

      case 'hit':
        if (this.state.phase === 'player_turn' && player.status === 'acting') {
          this.playerHit(player);
          this.checkPlayerTurnCompletion();
        }
        break;

      case 'stand':
        if (this.state.phase === 'player_turn' && player.status === 'acting') {
          player.status = 'stood';
          this.addLog(`${player.name} stands on ${player.handCalc.total}.`);
          this.checkPlayerTurnCompletion();
        }
        break;

      case 'use_consumable':
        if (this.state.phase === 'player_turn') {
          this.usePlayerConsumable(player, action.consumableId);
        }
        break;

      case 'send_ping':
        player.pingText = action.text;
        this.addLog(`[PING] ${player.name}: "${action.text}"`);
        this.broadcastState();
        setTimeout(() => {
          if (this.state.players[playerId]) {
            delete this.state.players[playerId].pingText;
            this.broadcastState();
          }
        }, 4000);
        break;

      case 'next_round':
        if (player.isHost && (this.state.phase === 'round_resolution' || this.state.phase === 'reward')) {
          this.startNewRound();
        }
        break;
    }
  }

  private startEncounter() {
    this.deck = shuffleDeck(createStandardDeck());
    this.state.boss = getBossByAct(this.state.actNumber);
    this.state.bossHp = this.state.boss.maxHp;
    this.state.bossMaxHp = this.state.boss.maxHp;
    this.state.roundNumber = 1;
    this.addLog(`Entering Act ${this.state.actNumber}: Encounter against ${this.state.boss.name}!`);
    this.startNewRound();
  }

  private startNewRound() {
    if (this.deck.length < 15) {
      this.deck = shuffleDeck(createStandardDeck());
    }

    this.state.phase = 'player_turn';
    this.state.turnTimeRemaining = 25;
    this.state.turnMaxTime = 25;

    // Reset player round states & hands
    for (const p of Object.values(this.state.players)) {
      if (p.hp > 0) {
        p.status = 'acting';
        p.hand = [this.drawCard(), this.drawCard()];
        p.handCalc = calculateHandValue(p.hand);
        p.lastRoundDamage = 0;
        p.lastRoundHealing = 0;

        // Armored card enhancements check
        p.hand.forEach(c => {
          if (c.enhancement === 'armored') {
            p.armor += 8;
            this.addLog(`${p.name}'s Armored card granted +8 Armor.`);
          }
        });
      } else {
        p.status = 'knocked_out';
      }
    }

    // Dealer cards: 1 visible, 1 secret hole card
    const visibleDealerCard = this.drawCard();
    this.dealerHoleCard = this.drawCard();

    // Client only receives visibleDealerCard + placeholder hidden card!
    this.state.bossCards = [
      visibleDealerCard,
      { id: 'hole-card', suit: 'spades', rank: 'A', hidden: true },
    ];
    this.state.bossHandCalc = calculateHandValue([visibleDealerCard]);

    this.startTimer();
    this.broadcastState();

    // Simulate Bot players taking actions after brief tactical delay
    this.scheduleBotActions();
  }

  private scheduleBotActions() {
    setTimeout(() => {
      if (this.state.phase !== 'player_turn') return;
      const bots = Object.values(this.state.players).filter(p => p.isBot && p.status === 'acting');
      bots.forEach(bot => {
        // AI Blackjack logic: hit if < 16, stand if >= 16
        while (bot.status === 'acting') {
          if (bot.handCalc.total < 16) {
            this.playerHit(bot);
          } else {
            bot.status = 'stood';
            this.addLog(`${bot.name} stands on ${bot.handCalc.total}.`);
          }
        }
      });
      this.checkPlayerTurnCompletion();
    }, 1200);
  }

  private drawCard(): Card {
    if (this.deck.length === 0) {
      this.deck = shuffleDeck(createStandardDeck());
    }
    return this.deck.pop()!;
  }

  private playerHit(player: NetworkPlayer) {
    const card = this.drawCard();
    player.hand.push(card);
    player.handCalc = calculateHandValue(player.hand);

    if (card.enhancement === 'armored') {
      player.armor += 8;
    }

    if (player.handCalc.isBust) {
      // Check for Ghost Hand joker
      const hasGhostHand = player.jokers.some(j => j.id === 'ghost_hand');
      if (hasGhostHand) {
        player.status = 'stood';
        this.addLog(`${player.name}'s Ghost Hand prevented bust! Total locked at 21.`);
      } else {
        player.status = 'busted';
        this.addLog(`${player.name} busts with ${player.handCalc.total}!`);
      }
    } else if (player.handCalc.total === 21) {
      player.status = 'stood';
      this.addLog(`${player.name} hits 21 and stands!`);
    } else {
      this.addLog(`${player.name} hits: +${card.rank} (Total: ${player.handCalc.total})`);
    }
    this.broadcastState();
  }

  private usePlayerConsumable(player: NetworkPlayer, consumableId: string) {
    const idx = player.consumables.findIndex(c => c.id === consumableId);
    if (idx === -1) return;
    const [item] = player.consumables.splice(idx, 1);

    if (item.effectType === 'medkit') {
      const heal = Math.min(25, player.maxHp - player.hp);
      player.hp += heal;
      this.addLog(`${player.name} used Medkit Patch (+${heal} HP).`);
    } else if (item.effectType === 'armor_plate') {
      player.armor += 20;
      this.addLog(`${player.name} used Armor Plate (+20 Armor).`);
    } else if (item.effectType === 'rewind') {
      if (player.hand.length > 2) {
        player.hand.pop();
        const replacement = this.drawCard();
        player.hand.push(replacement);
        player.handCalc = calculateHandValue(player.hand);
        this.addLog(`${player.name} rewound last card into ${replacement.rank}!`);
      }
    } else if (item.effectType === 'rigged_die') {
      // Guarantee next card keeps under or at 21 if possible
      const remaining = 21 - player.handCalc.total;
      const safeRank = remaining >= 10 ? '10' : remaining >= 5 ? '5' : 'A';
      const safeCard: Card = {
        id: `rigged-${Date.now()}`,
        suit: 'spades',
        rank: safeRank as any,
      };
      player.hand.push(safeCard);
      player.handCalc = calculateHandValue(player.hand);
      this.addLog(`${player.name} rolled Rigged Die: forced safe ${safeRank}!`);
    }
    this.broadcastState();
  }

  private checkPlayerTurnCompletion() {
    const activePlayers = Object.values(this.state.players).filter(p => p.hp > 0);
    const allDecided = activePlayers.every(p => p.status === 'stood' || p.status === 'busted');

    if (allDecided) {
      this.clearTimer();
      this.resolveDealerTurn();
    } else {
      this.broadcastState();
    }
  }

  private startTimer() {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      this.state.turnTimeRemaining--;
      if (this.state.turnTimeRemaining <= 0) {
        this.clearTimer();
        // Auto-stand any remaining players
        Object.values(this.state.players).forEach(p => {
          if (p.status === 'acting' && p.hp > 0) {
            p.status = 'stood';
            this.addLog(`${p.name} timed out and stood on ${p.handCalc.total}.`);
          }
        });
        this.resolveDealerTurn();
      } else {
        this.broadcastState();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private resolveDealerTurn() {
    this.state.phase = 'dealer_turn';

    // Reveal hidden dealer hole card!
    if (this.dealerHoleCard) {
      this.state.bossCards = [this.state.bossCards[0], this.dealerHoleCard];
      this.dealerHoleCard = null;
    }
    this.state.bossHandCalc = calculateHandValue(this.state.bossCards);
    this.addLog(`Dealer reveals hole card. Total: ${this.state.bossHandCalc.total}`);
    this.broadcastState();

    // Dealer hits according to boss rules
    const threshold = this.state.boss.ruleType === 'dynamic_stand_threshold'
      ? (16 + Math.floor(Math.random() * 3))
      : 17;

    const dealerPlayStep = () => {
      if (shouldDealerHit(this.state.bossHandCalc, this.state.boss.ruleType, threshold)) {
        const newCard = this.drawCard();
        this.state.bossCards.push(newCard);
        this.state.bossHandCalc = calculateHandValue(this.state.bossCards);
        this.addLog(`Dealer hits: +${newCard.rank} (Total: ${this.state.bossHandCalc.total})`);
        this.broadcastState();
        setTimeout(dealerPlayStep, 700);
      } else {
        setTimeout(() => this.resolveRoundCombat(), 800);
      }
    };

    setTimeout(dealerPlayStep, 800);
  }

  private resolveRoundCombat() {
    this.state.phase = 'round_resolution';
    const activePlayers = Object.values(this.state.players).filter(p => p.hp > 0);
    let totalTeamDamageDealt = 0;
    let winningPlayerCount = 0;

    for (const player of activePlayers) {
      const hasLoadedAce = player.jokers.some(j => j.id === 'loaded_ace');
      const hasTwinEcho = player.jokers.some(j => j.id === 'twin_echo');
      const hasLuckyStatic = player.jokers.some(j => j.id === 'lucky_static');
      const hasRedline = player.jokers.some(j => j.id === 'redline');
      const hasFriendlyFire = player.jokers.some(j => j.id === 'friendly_fire');
      const hasNeonFlush = player.jokers.some(j => j.id === 'neon_flush');
      const hasHouseThief = player.jokers.some(j => j.id === 'house_thief');
      const hasHeartPulse = player.jokers.some(j => j.id === 'heart_pulse');

      const result = evaluateCombatRound(
        player.handCalc,
        this.state.bossHandCalc,
        22,
        this.state.boss.baseDamage,
        {
          standPenalty: this.state.boss.ruleType === 'extra_stand_damage',
          hasLoadedAce,
          hasTwinEcho,
          hasLuckyStatic,
          hasRedline,
          hasFriendlyFire,
          hasNeonFlush,
          playerHand: player.hand,
        }
      );

      // Siphon / Heart pulse checks
      if (result.damageToDealer > 0) {
        winningPlayerCount++;
        if (hasHouseThief) {
          player.armor += 12;
          this.addLog(`${player.name}'s House Thief stole 12 Armor.`);
        }
        if (hasHeartPulse) {
          const hearts = player.hand.filter(c => c.suit === 'hearts').length;
          if (hearts > 0) {
            const heal = hearts * 5;
            player.hp = Math.min(player.maxHp, player.hp + heal);
            player.lastRoundHealing = heal;
            this.addLog(`${player.name}'s Heart Pulse healed +${heal} HP.`);
          }
        }
      }

      // Damage player taking armor into account
      if (result.damageToPlayer > 0) {
        let remaining = result.damageToPlayer;
        if (player.armor > 0) {
          const absorbed = Math.min(player.armor, remaining);
          player.armor -= absorbed;
          remaining -= absorbed;
        }
        player.hp = Math.max(0, player.hp - remaining);
        if (player.hp === 0) {
          player.status = 'knocked_out';
          this.addLog(`💀 ${player.name} has been knocked out!`);
        }
      }

      totalTeamDamageDealt += result.damageToDealer;
      player.lastRoundDamage = result.damageToDealer;
      result.bonusSummary.forEach(b => this.addLog(`[${player.name}] ${b}`));
    }

    // Co-op Synergy: Team Combo if 2+ players beat the dealer in same round!
    if (winningPlayerCount >= 2) {
      const synergyBonus = winningPlayerCount * 15;
      totalTeamDamageDealt += synergyBonus;
      this.addLog(`🔥 TEAM COMBO! ${winningPlayerCount} players struck together (+${synergyBonus} Synergy Damage)!`);
    }

    // Co-op Medic passive: If a player is Field Medic, heal lowest HP ally
    const medics = activePlayers.filter(p => p.characterId === 'field_medic');
    if (medics.length > 0) {
      const lowestHpAlly = activePlayers.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev), activePlayers[0]);
      if (lowestHpAlly && lowestHpAlly.hp > 0 && lowestHpAlly.hp < lowestHpAlly.maxHp) {
        lowestHpAlly.hp = Math.min(lowestHpAlly.maxHp, lowestHpAlly.hp + 12);
        this.addLog(`💉 Field Medic regenerated +12 HP for ${lowestHpAlly.name}.`);
      }
    }

    // Apply total team damage to shared Boss HP!
    this.state.bossHp = Math.max(0, this.state.bossHp - totalTeamDamageDealt);
    this.addLog(`Total Team Attack: ${totalTeamDamageDealt} damage to ${this.state.boss.name}!`);

    // Check Boss Defeat
    if (this.state.bossHp === 0) {
      this.addLog(`🎉 BOSS DEFEATED! ${this.state.boss.name} has fallen!`);
      if (this.state.actNumber >= 5) {
        this.state.phase = 'victory';
        this.state.winnerTeam = true;
      } else {
        this.state.phase = 'reward';
        this.state.actNumber++;
        // Grant rewards to all surviving players
        Object.values(this.state.players).forEach(p => {
          p.chips += 40;
          p.hp = Math.min(p.maxHp, p.hp + 20); // Post-boss victory rest
        });
      }
    } else {
      // Check Team Wipe
      const surviving = Object.values(this.state.players).filter(p => p.hp > 0);
      if (surviving.length === 0) {
        this.state.phase = 'game_over';
        this.state.winnerTeam = false;
        this.addLog('💀 Entire operative team eliminated! Game Over.');
      } else {
        this.state.roundNumber++;
      }
    }

    this.broadcastState();
  }

  private addLog(msg: string) {
    this.state.logMessages.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (this.state.logMessages.length > 40) {
      this.state.logMessages.shift();
    }
  }

  public broadcastState() {
    const payload = JSON.stringify({ type: 'state_update', state: this.state });
    for (const ws of this.sockets.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  }
}
