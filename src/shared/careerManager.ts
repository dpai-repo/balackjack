import { CareerProfile, LifetimeStats, RunHistoryRecord, StakeLevel } from './types';
import { STAKES_LIST } from './stakes';
import { STARTER_DECKS } from './starterDecks';

const STORAGE_KEY = 'balackjack_career_profile';

const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  totalRuns: 0,
  runsWon: 0,
  blackjacks: 0,
  busts: 0,
  totalDamageDealt: 0,
  highestHandScore: 0,
  chipsGambled: 0,
  bossesDefeated: 0,
  cardsEnhanced: 0,
  cardsShredded: 0,
};

const DEFAULT_CAREER_PROFILE: CareerProfile = {
  lifetimeStats: DEFAULT_LIFETIME_STATS,
  completedStakes: {
    neon_standard: [],
    high_roller: [],
    tactical_ops: [],
    quantum_glitch: [],
    syndicate_vip: [],
  },
  discoveredJokers: ['cyber_dealer', 'chip_multiplier', 'quantum_splitter', 'matrix_hacker', 'neon_blade'],
  discoveredAugments: ['bonus_chips', 'overclocked', 'foil', 'red'],
  unlockedDecks: ['neon_standard', 'high_roller'],
  runHistory: [],
};

class CareerManager {
  private profile: CareerProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  private loadProfile(): CareerProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_CAREER_PROFILE;
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CAREER_PROFILE,
        ...parsed,
        lifetimeStats: {
          ...DEFAULT_LIFETIME_STATS,
          ...(parsed.lifetimeStats || {}),
        },
        completedStakes: {
          ...DEFAULT_CAREER_PROFILE.completedStakes,
          ...(parsed.completedStakes || {}),
        },
        discoveredJokers: Array.from(new Set([...DEFAULT_CAREER_PROFILE.discoveredJokers, ...(parsed.discoveredJokers || [])])),
        discoveredAugments: Array.from(new Set([...DEFAULT_CAREER_PROFILE.discoveredAugments, ...(parsed.discoveredAugments || [])])),
        unlockedDecks: Array.from(new Set([...DEFAULT_CAREER_PROFILE.unlockedDecks, ...(parsed.unlockedDecks || [])])),
        runHistory: parsed.runHistory || [],
      };
    } catch (e) {
      console.warn('Failed to load career profile, using defaults:', e);
      return DEFAULT_CAREER_PROFILE;
    }
  }

  public saveProfile(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      console.warn('Failed to save career profile:', e);
    }
  }

  public getProfile(): CareerProfile {
    return this.profile;
  }

  public getLifetimeStats(): LifetimeStats {
    return this.profile.lifetimeStats;
  }

  public recordJokerDiscovered(jokerId: string): void {
    if (!this.profile.discoveredJokers.includes(jokerId)) {
      this.profile.discoveredJokers.push(jokerId);
      this.saveProfile();
    }
  }

  public recordAugmentDiscovered(augmentKey: string): void {
    if (!this.profile.discoveredAugments.includes(augmentKey)) {
      this.profile.discoveredAugments.push(augmentKey);
      this.saveProfile();
    }
  }

  public recordCombatStats(params: {
    blackjacks?: number;
    busts?: number;
    damageDealt?: number;
    highestHandScore?: number;
    chipsGambled?: number;
    bossDefeated?: boolean;
    cardEnhanced?: boolean;
    cardShredded?: boolean;
  }): void {
    const stats = this.profile.lifetimeStats;
    if (params.blackjacks) stats.blackjacks += params.blackjacks;
    if (params.busts) stats.busts += params.busts;
    if (params.damageDealt) stats.totalDamageDealt += params.damageDealt;
    if (params.highestHandScore && params.highestHandScore > stats.highestHandScore) {
      stats.highestHandScore = params.highestHandScore;
    }
    if (params.chipsGambled) stats.chipsGambled += params.chipsGambled;
    if (params.bossDefeated) stats.bossesDefeated += 1;
    if (params.cardEnhanced) stats.cardsEnhanced += 1;
    if (params.cardShredded) stats.cardsShredded += 1;

    // Check deck unlock triggers
    this.checkUnlockTriggers();
    this.saveProfile();
  }

  public recordRunCompletion(record: RunHistoryRecord): void {
    const stats = this.profile.lifetimeStats;
    stats.totalRuns += 1;
    if (record.outcome === 'victory') {
      stats.runsWon += 1;

      // Mark stake as completed for this deck
      if (!this.profile.completedStakes[record.deckId]) {
        this.profile.completedStakes[record.deckId] = [];
      }
      if (!this.profile.completedStakes[record.deckId].includes(record.stakeId)) {
        this.profile.completedStakes[record.deckId].push(record.stakeId);
      }
    }

    // Add run to history (capped at 20)
    this.profile.runHistory = [record, ...this.profile.runHistory.slice(0, 19)];

    // Record jokers used
    record.jokersUsed.forEach(jId => this.recordJokerDiscovered(jId));

    this.checkUnlockTriggers();
    this.saveProfile();
  }

  public isStakeUnlocked(deckId: string, stakeId: StakeLevel): boolean {
    if (stakeId === 'white') return true;
    const completed = this.profile.completedStakes[deckId] || [];
    const targetStakeIndex = STAKES_LIST.findIndex(s => s.id === stakeId);
    if (targetStakeIndex <= 0) return true;
    // Must have beaten previous stake on this deck
    const previousStake = STAKES_LIST[targetStakeIndex - 1];
    return completed.includes(previousStake.id);
  }

  public isDeckUnlocked(deckId: string): boolean {
    const deck = STARTER_DECKS.find(d => d.id === deckId);
    if (!deck) return false;
    if (deck.isUnlockedDefault) return true;
    return this.profile.unlockedDecks.includes(deckId);
  }

  private checkUnlockTriggers(): void {
    const stats = this.profile.lifetimeStats;
    // Tactical ops: Win 1 Run
    if (stats.runsWon >= 1 && !this.profile.unlockedDecks.includes('tactical_ops')) {
      this.profile.unlockedDecks.push('tactical_ops');
    }
    // Quantum glitch: Score 5 Blackjacks total
    if (stats.blackjacks >= 5 && !this.profile.unlockedDecks.includes('quantum_glitch')) {
      this.profile.unlockedDecks.push('quantum_glitch');
    }
    // Syndicate VIP: Defeat Act 3 Boss on Red Stake or higher
    const redStakeWins = Object.values(this.profile.completedStakes).some(stakes =>
      stakes.some(s => s !== 'white')
    );
    if (redStakeWins && !this.profile.unlockedDecks.includes('syndicate_vip')) {
      this.profile.unlockedDecks.push('syndicate_vip');
    }
  }
}

export const careerManager = new CareerManager();
