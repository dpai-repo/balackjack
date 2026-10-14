export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardEnhancementType =
  | 'holographic' // +10 base attack damage
  | 'polychrome'  // x1.5 multiplier
  | 'glitch'      // Can be 1 or 10 or auto-shift to avoid bust
  | 'armored'     // Grants +8 armor on deal
  | 'radioactive' // Deals 6 poison damage each round
  | 'golden'      // +15 chips on win
  | 'vampiric'    // Heals +5 HP on win
  | 'overclocked';// Rank value +2 (except Ace)

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  enhancement?: CardEnhancementType;
  hidden?: boolean; // For dealer's hole card
}

export interface HandCalculation {
  total: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean; // Natural 21 with exactly 2 cards
  hardTotal: number;
  softTotal: number;
}

export type TriggerTiming =
  | 'onDeal'
  | 'onHit'
  | 'onStand'
  | 'onScore'
  | 'onBust'
  | 'onRoundWin'
  | 'onRoundLoss'
  | 'onRoundPush'
  | 'onCombatStart';

export type JokerAffinityTag =
  | 'suit_blade'   // Spades & Clubs combat affinities
  | 'high_roller'  // Wealth, Diamonds, streak scaling
  | 'quantum'      // Probability, Dice, Glitch shifts
  | 'medic'        // Hearts, vitality, armor siphon
  | 'overdrive';   // Raw critical attack multipliers

export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  cost: number;
  icon: string;
  effectType: string;
  affinityTags?: JokerAffinityTag[];
}

export interface ComboLink {
  sourceIndex: number;
  targetIndex: number;
  sourceJokerId: string;
  targetJokerId: string;
  synergyTag: JokerAffinityTag;
  synergyName: string;
  synergyBonusText: string;
  multiplier: number;
}

export interface JokerSlotState {
  unlockedSlots: number; // 3 to 5
  slots: (Joker | null)[];
  activeLinks: ComboLink[];
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  shape: 'square' | 'spark' | 'ring';
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  effectType: 'rewind' | 'rigged_die' | 'emp_jammer' | 'medkit' | 'armor_plate' | 'overcharge' | 'splitter';
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  maxHp: number;
  baseDamage: number;
  portrait: string; // pixel art identifier
  specialRule: string;
  ruleType: 'extra_stand_damage' | 'dynamic_stand_threshold' | 'draw_on_soft_17' | 'punish_many_hits' | 'grand_algorithm';
  act: number;
}

export interface CharacterLoadout {
  id: string;
  name: string;
  title: string;
  description: string;
  hp: number;
  maxHp: number;
  armor: number;
  chips: number;
  startingJokerId: string;
  startingConsumableId: string;
  color: string;
}

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  x?: number;
  y?: number;
  timestamp: number;
}

export interface CombatStats {
  damageDealt: number;
  damageTaken: number;
  blackjacksDealt: number;
  bustsOccurred: number;
  roundsWon: number;
  bossesDefeated: number;
  highestSingleHit: number;
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  crtEnabled: boolean;
  crtPreset: 'off' | 'subtle' | 'classic' | 'heavy';
  scanlines: boolean;
  curvature: boolean;
  chromaticAberration: boolean;
  vignette: boolean;
  screenShake: boolean;
  reducedMotion: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  gameSpeed: 'normal' | 'fast';
}

// Multiplayer Types
export interface NetworkPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
  characterId: string;
  hp: number;
  maxHp: number;
  armor: number;
  chips: number;
  hand: Card[];
  handCalc: HandCalculation;
  status: 'acting' | 'stood' | 'busted' | 'knocked_out';
  jokers: Joker[];
  consumables: Consumable[];
  lastRoundDamage: number;
  lastRoundHealing: number;
  pingText?: string;
}

export type NetworkPhase =
  | 'lobby'
  | 'encounter_intro'
  | 'player_turn'
  | 'dealer_turn'
  | 'round_resolution'
  | 'reward'
  | 'game_over'
  | 'victory';

export interface NetworkRoomState {
  roomCode: string;
  isPrivate: boolean;
  boss: Boss;
  bossHp: number;
  bossMaxHp: number;
  bossCards: Card[];
  bossHandCalc: HandCalculation;
  phase: NetworkPhase;
  turnTimeRemaining: number;
  turnMaxTime: number;
  players: Record<string, NetworkPlayer>;
  roundNumber: number;
  actNumber: number;
  logMessages: string[];
  winnerTeam?: boolean;
}

export type ClientAction =
  | { type: 'join'; name: string; characterId: string }
  | { type: 'ready' }
  | { type: 'start_game' }
  | { type: 'hit' }
  | { type: 'stand' }
  | { type: 'use_consumable'; consumableId: string }
  | { type: 'send_ping'; text: string }
  | { type: 'add_bot' }
  | { type: 'next_round' };
