export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type CardEnhancementType =
  | 'bonus_chips' // +30 flat attack chips
  | 'overclocked' // +4 base attack mult
  | 'glass'       // x2.0 mult but 25% chance to shatter on score
  | 'steel'       // +1.5x mult while held in hand
  | 'golden'      // +15 chips on round win or +$4 held in hand
  | 'glitch'      // Quantum shift value to prevent bust
  | 'armored'     // Grants +10 armor on deal
  | 'radioactive' // Deals 8 poison radiation damage to boss on stand
  | 'vampiric'    // Heals +6 HP on round win
  | 'holographic' // Legacy alias for bonus attack
  | 'polychrome'; // Legacy alias for 1.5x mult

export type CardEditionType = 'foil' | 'holographic' | 'polychrome';

export type CardSealType = 'red' | 'gold' | 'blue' | 'purple';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  enhancement?: CardEnhancementType;
  edition?: CardEditionType;
  seal?: CardSealType;
  isShattered?: boolean; // If glass card broke during score
  hidden?: boolean;      // For dealer's hole card
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
  effectType:
    | 'rewind'
    | 'rigged_die'
    | 'emp_jammer'
    | 'medkit'
    | 'armor_plate'
    | 'overcharge'
    | 'splitter'
    | 'joker_slot_voucher'
    | 'cyber_mod_pack'
    | 'card_clone_serum';
  modData?: {
    enhancement?: CardEnhancementType;
    edition?: CardEditionType;
    seal?: CardSealType;
  };
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

// ==========================================
// ASCENSION STAKES & DIFFICULTY MODIFIERS
// ==========================================
export type StakeLevel =
  | 'white'
  | 'red'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'gold'
  | 'cyber_overdrive';

export interface StakeModifiers {
  noSmallBlindReward?: boolean;
  targetScoreMultiplier?: number; // e.g. 1.25 (+25% boss/target HP)
  discardsModifier?: number;       // e.g. -1
  priceInflationPerAct?: number;   // e.g. +$2 per act
  boosterPackCostIncrease?: number;// e.g. +$3
  perishableJokers?: boolean;      // Jokers deactivate after 5 rounds
  rentalJokers?: boolean;          // Jokers cost -$3/round
  bossDoubleAbilities?: boolean;   // Bosses trigger passive on both hit and stand
  glitchedHands?: boolean;         // 1 in 10 dealt cards is secretly glitched
}

export interface StakeConfig {
  id: StakeLevel;
  name: string;
  order: number;
  subtitle: string;
  description: string;
  color: string;
  badge: string;
  modifiers: StakeModifiers;
}

// ==========================================
// STARTER DECKS
// ==========================================
export interface StarterDeck {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bonusChips: number;
  startingJokerSlots: number;
  startingConsumables?: string[];
  perksDescription: string;
  specialRulesDescription: string;
  interestCapBonus?: number;
  discardsModifier?: number;
  unlockCondition?: string;
  isUnlockedDefault?: boolean;
}

// ==========================================
// RUN HISTORY & PERSISTENT CAREER COMPENDIUM
// ==========================================
export interface RunHistoryRecord {
  id: string;
  timestamp: number;
  outcome: 'victory' | 'defeat';
  act: number;
  score: number;
  characterId: string;
  deckId: string;
  stakeId: StakeLevel;
  jokersUsed: string[];
  chipsEarned: number;
  cardsInDeckCount: number;
  enhancedCardCount: number;
  defeatReason?: string;
}

export interface LifetimeStats {
  totalRuns: number;
  runsWon: number;
  blackjacks: number;
  busts: number;
  totalDamageDealt: number;
  highestHandScore: number;
  chipsGambled: number;
  bossesDefeated: number;
  cardsEnhanced: number;
  cardsShredded: number;
}

export interface CareerProfile {
  lifetimeStats: LifetimeStats;
  completedStakes: Record<string, StakeLevel[]>; // deckId -> array of beaten stakeIds
  discoveredJokers: string[];                   // list of discovered joker IDs
  discoveredAugments: string[];                 // list of discovered enhancement/edition/seal IDs
  unlockedDecks: string[];                      // unlocked starter deck IDs
  runHistory: RunHistoryRecord[];
}

