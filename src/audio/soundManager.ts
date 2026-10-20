import * as Tone from 'tone';

// Tracker Pattern for the Gameplay Soundtrack
interface TrackerPattern {
  chord: string[];
  bass: string[]; // 16 steps per bar
  lead: (string | null)[]; // 16 steps per bar
  arpNotes: string[];
}

export type MusicIntensity = 0 | 1 | 2 | 3;

class SoundManager {
  private initialized = false;
  private isAudioUnlocked = false;
  private currentTrack: string | null = null;
  private currentIntensity: MusicIntensity = 1;

  // Master Volume Controls
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicMuted: boolean = false;
  private sfxMuted: boolean = false;

  // Dedicated Sound Effects PolySynth
  private sfxSynth: Tone.PolySynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;

  // --- TITLE SCREEN SOOTHING MUSIC BOX ENGINE ---
  private menuLoop: Tone.Loop | null = null;
  private menuStep: number = 0;
  private menuBellSynth: Tone.PolySynth | null = null;
  private menuBellGain: Tone.Gain | null = null;
  private menuBassSynth: Tone.MonoSynth | null = null;
  private menuBassGain: Tone.Gain | null = null;
  private menuFilter: Tone.Filter | null = null;

  // --- GAMEPLAY AMIGA MOD TRACKER ENGINE ---
  private bgmLoop: Tone.Loop | null = null;
  private trackerStep: number = 0;
  private masterDacFilter: Tone.Filter | null = null;

  // Stems for Real-time Intensity Layering
  private bassSynth: Tone.MonoSynth | null = null;
  private bassGain: Tone.Gain | null = null;

  private padSynth: Tone.PolySynth | null = null;
  private padGain: Tone.Gain | null = null;

  private leadSynth: Tone.PolySynth | null = null;
  private leadGain: Tone.Gain | null = null;

  private drumSynth: Tone.MembraneSynth | null = null;
  private drumGain: Tone.Gain | null = null;

  // 64 Bars of composed Amiga MOD tracker score
  private scoreBars: TrackerPattern[] = [];

  constructor() {
    this.buildAmigaScore();
  }

  // Pre-generate the uncluttered 64-bar progressive Amiga MOD score with open bar rests and sustained chords
  private buildAmigaScore() {
    const bars: TrackerPattern[] = [];

    // Helper to generate 4 bars with intentional space and open rests
    const createChordSection = (
      chord: string[],
      bassRoot: string,
      bassOctave: string,
      leadBars: (string | null)[][], // Bar 0 and Bar 1 have phrases; Bar 2 and 3 rest!
      chordNotes: string[]
    ) => {
      for (let bar = 0; bar < 4; bar++) {
        // Sparser syncopated sub-bass line: Root on 0, syncopated pocket on 10, resting on other steps
        const bass: string[] = new Array(16).fill('');
        bass[0] = `${bassRoot}1`;
        if (bar % 2 === 1) {
          bass[10] = `${bassOctave}2`;
        }

        // Open bar rests: Bars 2 and 3 give the lead complete silence for harmonic breathing room
        const lead = bar < leadBars.length ? leadBars[bar] : new Array(16).fill(null);

        bars.push({
          chord,
          bass,
          lead,
          arpNotes: chordNotes,
        });
      }
    };

    // --- MOVEMENT 1: "The Shadow Felt" (Bars 1-16) - Melancholic D-Minor ---
    // Bar 1-4: Dm9 (Lush, sustained, spacious phrasing)
    createChordSection(
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      'D', 'A',
      [
        ['A4', null, null, null, 'C5', null, null, null, 'E5', null, 'D5', null, null, null, null, null],
        [null, null, 'F5', null, null, null, 'E5', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 5-8: Bbmaj7
    createChordSection(
      ['Bb2', 'D3', 'F3', 'A3', 'D4'],
      'Bb', 'F',
      [
        ['D5', null, null, null, 'F5', null, null, null, 'A5', null, 'G5', null, null, null, null, null],
        [null, null, 'F5', null, null, null, 'E5', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['Bb2', 'D3', 'F3', 'A3']
    );

    // Bar 9-12: Fmaj7
    createChordSection(
      ['F2', 'A3', 'C4', 'E4', 'G4'],
      'F', 'C',
      [
        ['C5', null, null, null, 'E5', null, null, null, 'G5', null, 'F5', null, null, null, null, null],
        [null, null, 'E5', null, null, null, 'D5', null, 'C5', null, null, null, null, null, null, null],
      ],
      ['F2', 'A3', 'C4', 'E4']
    );

    // Bar 13-16: Csus4 -> C
    createChordSection(
      ['C3', 'E3', 'G3', 'B3', 'D4'],
      'C', 'G',
      [
        ['E5', null, null, null, 'D5', null, null, null, 'C5', null, 'B4', null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'G4', null, 'A4', null, null, null, null, null, null, null],
      ],
      ['C3', 'E3', 'G3', 'B3']
    );

    // --- MOVEMENT 2: "Neon Drizzle" (Bars 17-32) - Melodic Expansion ---
    // Bar 17-20: Gm7
    createChordSection(
      ['G2', 'Bb3', 'D4', 'F4'],
      'G', 'D',
      [
        ['Bb4', null, null, null, 'D5', null, null, null, 'F5', null, 'G5', null, null, null, null, null],
        [null, null, 'D5', null, null, null, 'C5', null, 'Bb4', null, null, null, null, null, null, null],
      ],
      ['G2', 'Bb3', 'D4', 'F4']
    );

    // Bar 21-24: Dm9
    createChordSection(
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      'D', 'A',
      [
        ['F5', null, null, null, 'E5', null, null, null, 'D5', null, 'C5', null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'C5', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 25-28: Ebmaj7#11
    createChordSection(
      ['Eb2', 'G3', 'Bb3', 'D4', 'A4'],
      'Eb', 'Bb',
      [
        ['G5', null, null, null, 'Bb5', null, null, null, 'A5', null, 'G5', null, null, null, null, null],
        [null, null, 'F5', null, null, null, 'Eb5', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['Eb2', 'G3', 'Bb3', 'D4']
    );

    // Bar 29-32: A7alt -> Dm
    createChordSection(
      ['A2', 'C#3', 'E3', 'G3', 'Bb3'],
      'A', 'E',
      [
        ['E5', null, null, null, 'F5', null, null, null, 'E5', null, 'C#5', null, null, null, null, null],
        [null, null, 'Bb4', null, null, null, 'A4', null, 'G4', null, null, null, null, null, null, null],
      ],
      ['A2', 'C#3', 'E3', 'G3']
    );

    // --- MOVEMENT 3: "Midnight High Roller" (Bars 33-48) ---
    // Bar 33-36: Dm
    createChordSection(
      ['D3', 'F3', 'A3', 'D4'],
      'D', 'D',
      [
        ['D5', null, null, null, 'F5', null, null, null, 'A5', null, null, null, null, null, null, null],
        [null, null, 'G5', null, null, null, 'F5', null, 'E5', null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'D4']
    );

    // Bar 37-40: Gm
    createChordSection(
      ['G2', 'Bb3', 'D4', 'G4'],
      'G', 'G',
      [
        ['D5', null, null, null, 'C5', null, null, null, 'Bb4', null, null, null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'Bb4', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['G2', 'Bb3', 'D4', 'G4']
    );

    // Bar 41-44: Bbm6
    createChordSection(
      ['Bb2', 'Db3', 'F3', 'G3', 'Db4'],
      'Bb', 'F',
      [
        ['Db5', null, null, null, 'F5', null, null, null, 'G5', null, 'F5', null, null, null, null, null],
        [null, null, 'Db5', null, null, null, 'C5', null, 'Bb4', null, null, null, null, null, null, null],
      ],
      ['Bb2', 'Db3', 'F3', 'G3']
    );

    // Bar 45-48: Asus4 -> A
    createChordSection(
      ['A2', 'D3', 'E3', 'A3'],
      'A', 'E',
      [
        ['E5', null, null, null, 'D5', null, null, null, 'C#5', null, null, null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'G4', null, 'F4', null, null, null, null, null, null, null],
      ],
      ['A2', 'D3', 'E3', 'A3']
    );

    // --- MOVEMENT 4: "Dawn in the Algorithm" (Bars 49-64) - Resolution ---
    // Bar 49-52: Dm9
    createChordSection(
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      'D', 'A',
      [
        ['A5', null, null, null, 'E5', null, null, null, 'F5', null, 'D5', null, null, null, null, null],
        [null, null, 'C5', null, null, null, 'A4', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 53-56: Cmaj7
    createChordSection(
      ['C3', 'E3', 'G3', 'B3'],
      'C', 'G',
      [
        ['G5', null, null, null, 'E5', null, null, null, 'D5', null, 'C5', null, null, null, null, null],
        [null, null, 'B4', null, null, null, 'C5', null, 'E5', null, null, null, null, null, null, null],
      ],
      ['C3', 'E3', 'G3', 'B3']
    );

    // Bar 57-60: Bbmaj7#11
    createChordSection(
      ['Bb2', 'D3', 'F3', 'A3', 'E4'],
      'Bb', 'F',
      [
        ['F5', null, null, null, 'D5', null, null, null, 'E5', null, 'D5', null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'Bb4', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['Bb2', 'D3', 'F3', 'A3']
    );

    // Bar 61-64: A7sus4 -> Dm (Turnaround into loop)
    createChordSection(
      ['A2', 'D3', 'E3', 'G3', 'A3'],
      'A', 'D',
      [
        ['E5', null, null, null, 'D5', null, null, null, 'C#5', null, 'D5', null, null, null, null, null],
        [null, null, 'A4', null, null, null, 'F4', null, 'E4', null, null, null, null, null, null, null],
      ],
      ['A2', 'D3', 'E3', 'G3']
    );

    this.scoreBars = bars;
  }

  public async unlockAudio(): Promise<boolean> {
    if (this.isAudioUnlocked) return true;
    try {
      await Tone.start();
      this.isAudioUnlocked = true;
      this.initSynths();
      return true;
    } catch {
      return false;
    }
  }

  private initSynths() {
    if (this.initialized) return;

    // --- SFX SYNTHS ---
    this.sfxSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.004, decay: 0.14, sustain: 0.08, release: 0.16 },
    }).toDestination();

    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.003, decay: 0.08, sustain: 0 },
    }).toDestination();

    // --- TITLE SCREEN SOOTHING MUSIC BOX SYNTHS ---
    this.menuFilter = new Tone.Filter({
      frequency: 1800,
      type: 'lowpass',
      rolloff: -12,
    }).toDestination();

    this.menuBellGain = new Tone.Gain(0.4).connect(this.menuFilter);
    this.menuBellSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 1.8, sustain: 0.08, release: 1.8 },
    }).connect(this.menuBellGain);

    this.menuBassGain = new Tone.Gain(0.45).connect(this.menuFilter);
    this.menuBassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { Q: 1.0, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.04, decay: 2.2, sustain: 0.4, release: 1.8 },
    }).connect(this.menuBassGain);

    // --- GAMEPLAY TRACKER SYNTHS ---
    this.masterDacFilter = new Tone.Filter({
      frequency: 2400,
      type: 'lowpass',
      rolloff: -12,
    }).toDestination();

    // Channel 1: Sub-Bass (Deep rounded triangle)
    this.bassGain = new Tone.Gain(0.65).connect(this.masterDacFilter);
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { Q: 1.2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.03, decay: 0.4, sustain: 0.5, release: 0.4 },
    }).connect(this.bassGain);

    // Channel 2: Sustained Chords (Warm pad chord resonance, replacing rapid 16th arps)
    this.padGain = new Tone.Gain(0.35).connect(this.masterDacFilter);
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.08, decay: 1.4, sustain: 0.6, release: 1.2 },
    }).connect(this.padGain);

    // Channel 3: Melodic Lead (Expressive pulse wave with warm envelope)
    this.leadGain = new Tone.Gain(0.0).connect(this.masterDacFilter);
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'pulse', width: 0.25 },
      envelope: { attack: 0.04, decay: 0.4, sustain: 0.4, release: 0.6 },
    }).connect(this.leadGain);

    // Channel 4: Lo-Fi Tracker Percussion (Membrane kick & pink noise snare)
    this.drumGain = new Tone.Gain(0.2).connect(this.masterDacFilter);
    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 3.0,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.2, sustain: 0.01, release: 0.25 },
    }).connect(this.drumGain);

    this.applyMasterGain();
    this.applyIntensityStems(this.currentIntensity, false);
    this.initialized = true;
  }

  public setVolumes(master: number, music: number, sfx: number, musicMute: boolean, sfxMute: boolean) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.musicMuted = musicMute;
    this.sfxMuted = sfxMute;

    this.applyMasterGain();
  }

  private applyMasterGain() {
    Tone.Destination.volume.value = Tone.gainToDb(Math.max(0.001, this.masterVolume));

    const sfxVolDb = this.sfxMuted ? -Infinity : Tone.gainToDb(Math.max(0.001, this.sfxVolume * 0.7));
    if (this.sfxSynth) this.sfxSynth.volume.value = sfxVolDb;
    if (this.noiseSynth) this.noiseSynth.volume.value = sfxVolDb;

    const musicGain = this.musicMuted ? 0 : Math.max(0, this.musicVolume);
    if (this.menuBellGain) this.menuBellGain.gain.value = 0.4 * musicGain;
    if (this.menuBassGain) this.menuBassGain.gain.value = 0.45 * musicGain;

    this.applyIntensityStems(this.currentIntensity, false);
  }

  // Smoothly ramps channel stems based on game intensity (0: Lounge/Shop, 1: Exploration, 2: High Stakes, 3: Boss Climax)
  public setGameIntensity(level: MusicIntensity) {
    if (this.currentIntensity === level) return;
    this.currentIntensity = level;
    this.applyIntensityStems(level, true);
  }

  public setIntensity(level: MusicIntensity) {
    this.setGameIntensity(level);
  }

  private applyIntensityStems(level: MusicIntensity, smooth: boolean) {
    if (!this.initialized) return;

    const baseMusicGain = this.musicMuted ? 0 : Math.max(0, this.musicVolume);
    const rampTime = smooth ? 0.8 : 0.05;

    // Decluttered Intensity Matrix:
    // Level 0: Ambient chill (Quiet pad chords, gentle sub-bass, zero drums, lead silent)
    // Level 1: Standard play (Sub-bass, sustained chords, mellow lead phrases, downbeat kick)
    // Level 2: High stakes (Full bass groove, richer pad presence, lead phrases, kick & snare backbeat)
    // Level 3: Boss climax (Driving sub-bass, heightened pad, full expressive lead, driving groove)
    let targetBass = 0.65;
    let targetPad = 0.35;
    let targetLead = 0.0;
    let targetDrum = 0.0;

    if (level === 1) {
      targetBass = 0.75;
      targetPad = 0.45;
      targetLead = 0.4;
      targetDrum = 0.35;
    } else if (level === 2) {
      targetBass = 0.9;
      targetPad = 0.6;
      targetLead = 0.65;
      targetDrum = 0.6;
    } else if (level === 3) {
      targetBass = 1.0;
      targetPad = 0.75;
      targetLead = 0.85;
      targetDrum = 0.8;
    }

    try {
      this.bassGain?.gain.rampTo(targetBass * baseMusicGain, rampTime);
      this.padGain?.gain.rampTo(targetPad * baseMusicGain, rampTime);
      this.leadGain?.gain.rampTo(targetLead * baseMusicGain, rampTime);
      this.drumGain?.gain.rampTo(targetDrum * baseMusicGain, rampTime);
    } catch {}
  }

  // ARCADE-INSPIRED GAMEPLAY SOUND EFFECTS WITH PITCH VARIATION
  public playCardDeal() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const pitches = ['C5', 'D5', 'E5', 'G5', 'A5'];
      const pitch = pitches[Math.floor(Math.random() * pitches.length)];
      this.sfxSynth?.triggerAttackRelease([pitch], '32n', '+0.01');
    } catch {}
  }

  public playCardSelect() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const pitches = ['E5', 'G5', 'B5', 'D6'];
      const pitch = pitches[Math.floor(Math.random() * pitches.length)];
      this.sfxSynth?.triggerAttackRelease([pitch], '32n', '+0.01');
    } catch {}
  }

  public playCardFlip() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const notes = Math.random() > 0.5 ? ['E5', 'B5'] : ['F5', 'C6'];
      this.sfxSynth?.triggerAttackRelease(notes, '24n');
    } catch {}
  }

  public playHit() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const variants = [
        ['D4', 'A4'],
        ['E4', 'B4'],
        ['G4', 'D5'],
        ['A4', 'E5'],
      ];
      const chords = variants[Math.floor(Math.random() * variants.length)];
      this.sfxSynth?.triggerAttackRelease(chords, '16n');
    } catch {}
  }

  public playStand() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['F4', 'C5'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['G4', 'D5'], '16n', now + 0.08);
    } catch {}
  }

  public playComboLink() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['C5', 'G5'], '32n', now);
      this.sfxSynth?.triggerAttackRelease(['E5', 'B5'], '32n', now + 0.07);
      this.sfxSynth?.triggerAttackRelease(['G5', 'E6'], '16n', now + 0.14);
    } catch {}
  }

  public playSlotUnlock() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['C5'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['E5'], '16n', now + 0.1);
      this.sfxSynth?.triggerAttackRelease(['G5'], '16n', now + 0.2);
      this.sfxSynth?.triggerAttackRelease(['C6', 'G6'], '8n', now + 0.32);
    } catch {}
  }

  public playBlackjack() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['C5', 'E5'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['G5', 'C6'], '16n', now + 0.1);
      this.sfxSynth?.triggerAttackRelease(['E6', 'G6'], '8n', now + 0.22);
    } catch {}
  }

  public playBust() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['Eb4', 'Db4'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['C4', 'Gb3'], '8n', now + 0.1);
    } catch {}
  }

  public playAttack() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      const pitchVariants = [
        { p1: ['A4', 'E5'], p2: ['C6'] },
        { p1: ['G4', 'D5'], p2: ['B5'] },
        { p1: ['B4', 'F#5'], p2: ['D6'] },
      ];
      const chosen = pitchVariants[Math.floor(Math.random() * pitchVariants.length)];
      this.sfxSynth?.triggerAttackRelease(chosen.p1, '32n', now);
      this.sfxSynth?.triggerAttackRelease(chosen.p2, '16n', now + 0.06);
    } catch {}
  }

  public playPlayerHit() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['F3', 'B2'], '8n', now);
    } catch {}
  }

  public playHeal() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['G4', 'B4'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['D5', 'G5'], '8n', now + 0.1);
    } catch {}
  }

  public playArmor() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      this.sfxSynth?.triggerAttackRelease(['E4', 'B4'], '16n');
    } catch {}
  }

  public playButtonClick() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const pitches = ['G5', 'A5', 'F5'];
      const p = pitches[Math.floor(Math.random() * pitches.length)];
      this.sfxSynth?.triggerAttackRelease([p], '32n');
    } catch {}
  }

  // --- SOOTHING TITLE SCREEN COMPOSITION ---
  // Soft music box bells with slow sub-bass chords at 60 BPM
  private startMenuMusic() {
    this.stopGameMusic();

    if (this.menuLoop) return;
    if (!this.isAudioUnlocked) return;

    Tone.Transport.bpm.value = 60;
    this.menuStep = 0;

    // 16-bar soothing music box cycle: Dmaj9 -> F#m7 -> Bm9 -> Gmaj7
    const menuProgression = [
      { bass: 'D2', bellArp: ['F#5', null, 'A5', null, 'C#6', null, 'E6', null] },
      { bass: 'D2', bellArp: [null, 'A5', null, 'F#5', null, null, 'C#6', null] },
      { bass: 'F#2', bellArp: ['A5', null, 'C#6', null, 'E6', null, 'F#6', null] },
      { bass: 'F#2', bellArp: [null, 'C#6', null, 'A5', null, null, 'E6', null] },
      { bass: 'B1', bellArp: ['D5', null, 'F#5', null, 'A5', null, 'C#6', null] },
      { bass: 'B1', bellArp: [null, 'F#5', null, 'D5', null, null, 'A5', null] },
      { bass: 'G2', bellArp: ['B5', null, 'D6', null, 'F#6', null, 'A6', null] },
      { bass: 'G2', bellArp: [null, 'D6', null, 'B5', null, null, 'F#6', null] },
    ];

    this.menuLoop = new Tone.Loop(time => {
      if (this.musicMuted) return;

      const currentBar = Math.floor(this.menuStep / 8) % menuProgression.length;
      const step8 = this.menuStep % 8;
      const barData = menuProgression[currentBar];

      // Slow sustained sub-bass on the first step of each bar
      if (step8 === 0 && barData.bass) {
        this.menuBassSynth?.triggerAttackRelease(barData.bass, '1m', time);
      }

      // Soft music box bell chimes
      const bellNote = barData.bellArp[step8];
      if (bellNote) {
        this.menuBellSynth?.triggerAttackRelease([bellNote], '8n', time);
      }

      this.menuStep++;
    }, '8n');

    this.menuLoop.start(0);
    Tone.Transport.start();
  }

  private stopMenuMusic() {
    if (this.menuLoop) {
      this.menuLoop.stop();
      this.menuLoop.dispose();
      this.menuLoop = null;
    }
  }

  // --- UNCLUTTERED GAMEPLAY SOUNDTRACK ---
  private startGameMusic() {
    this.stopMenuMusic();

    if (this.bgmLoop) return;
    if (!this.isAudioUnlocked) return;

    Tone.Transport.bpm.value = 72;
    this.trackerStep = 0;

    // 16th-note Tracker Sequencer Engine with open bar rests and sustained chords
    this.bgmLoop = new Tone.Loop(time => {
      if (this.musicMuted || !this.scoreBars.length) return;

      const totalSteps = this.scoreBars.length * 16;
      const currentGlobalStep = this.trackerStep % totalSteps;
      const barIndex = Math.floor(currentGlobalStep / 16);
      const step16 = currentGlobalStep % 16;

      const currentPattern = this.scoreBars[barIndex];
      if (!currentPattern) return;

      // Channel 4: SPARSER RHYTHM SECTION (Kick on downbeat 0, soft snare on 8 when active)
      if (this.currentIntensity >= 1) {
        if (step16 === 0) {
          this.drumSynth?.triggerAttackRelease('C1', '16n', time, 0.4);
        } else if (step16 === 8 && this.currentIntensity >= 2) {
          this.noiseSynth?.triggerAttackRelease('24n', time);
        } else if (step16 === 4 || step16 === 12) {
          // Delicate ghost shaker tick
          this.noiseSynth?.triggerAttackRelease('64n', time);
        }
      }

      // Channel 1: SUB-BASS (Sparse syncopation with open pockets)
      const bassNote = currentPattern.bass[step16];
      if (bassNote && bassNote.trim() !== '') {
        this.bassSynth?.triggerAttackRelease(bassNote, '8n', time);
      }

      // Channel 2: SUSTAINED PAD CHORDS (Held warm harmony instead of relentless 16th arps)
      if (step16 === 0 && currentPattern.arpNotes.length > 0) {
        this.padSynth?.triggerAttackRelease(currentPattern.arpNotes, '2n', time);
      } else if (step16 === 8 && this.currentIntensity >= 2 && currentPattern.arpNotes.length > 0) {
        this.padSynth?.triggerAttackRelease(currentPattern.arpNotes, '4n', time);
      }

      // Channel 3: MELODIC LEAD (Open bar rests + spacious lyrical phrasing)
      const leadNote = currentPattern.lead[step16];
      if (leadNote) {
        this.leadSynth?.triggerAttackRelease([leadNote], '8n', time);
      }

      this.trackerStep++;
    }, '16n');

    this.bgmLoop.start(0);
    Tone.Transport.start();
  }

  private stopGameMusic() {
    if (this.bgmLoop) {
      this.bgmLoop.stop();
      this.bgmLoop.dispose();
      this.bgmLoop = null;
    }
  }

  // PUBLIC BGM DISPATCHER
  public playBgm(track?: 'menu' | 'combat' | 'boss' | 'shop' | 'victory') {
    this.currentTrack = track || this.currentTrack;

    if (track === 'menu') {
      this.startMenuMusic();
    } else {
      if (track === 'shop') {
        this.setGameIntensity(0);
      } else if (track === 'combat') {
        this.setGameIntensity(1);
      } else if (track === 'boss') {
        this.setGameIntensity(2);
      } else if (track === 'victory') {
        this.setGameIntensity(1);
      }
      this.startGameMusic();
    }
  }

  public stopBgm() {
    this.stopMenuMusic();
    this.stopGameMusic();
  }
}

export const soundManager = new SoundManager();
