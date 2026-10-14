import * as Tone from 'tone';

// 64-Bar Extended Amiga MOD Tracker Score Data
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

  // Synths (4-Voice Procedural Chiptune Tracker Engine)
  private sfxSynth: Tone.PolySynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private masterDacFilter: Tone.Filter | null = null;

  // Individual Stems with Gain Nodes for Real-time Intensity Layering
  private bassSynth: Tone.MonoSynth | null = null;
  private bassGain: Tone.Gain | null = null;

  private arpSynth: Tone.PolySynth | null = null;
  private arpGain: Tone.Gain | null = null;

  private leadSynth: Tone.PolySynth | null = null;
  private leadGain: Tone.Gain | null = null;

  private drumSynth: Tone.MembraneSynth | null = null;
  private drumGain: Tone.Gain | null = null;

  // Master Volume Controls
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicMuted: boolean = false;
  private sfxMuted: boolean = false;

  private bgmLoop: Tone.Loop | null = null;
  private trackerStep: number = 0;

  // 64 Bars of composed Amiga MOD tracker score (16 steps per bar = 1024 total steps)
  private scoreBars: TrackerPattern[] = [];

  constructor() {
    this.buildAmigaScore();
  }

  // Pre-generate the 64-bar progressive Amiga MOD tracker composition
  private buildAmigaScore() {
    const bars: TrackerPattern[] = [];

    // Helper to generate 4 bars of a harmony segment
    const createChordSection = (
      chord: string[],
      bassRoot: string,
      bassOctave: string,
      leadPhrases: (string | null)[][],
      arpTones: string[]
    ) => {
      for (let bar = 0; bar < 4; bar++) {
        // Tracker syncopated sub-bass line
        const bass: string[] = new Array(16).fill('');
        bass[0] = `${bassRoot}1`;
        bass[4] = bar % 2 === 1 ? `${bassOctave}2` : `${bassRoot}1`;
        bass[8] = `${bassRoot}1`;
        bass[10] = `${bassOctave}2`;
        bass[14] = `${bassRoot}1`;

        const lead = leadPhrases[bar % leadPhrases.length] || new Array(16).fill(null);
        bars.push({
          chord,
          bass,
          lead,
          arpNotes: arpTones,
        });
      }
    };

    // --- MOVEMENT 1: "The Shadow Felt" (Bars 1-16) - Melancholic D-Minor Intro ---
    // Bar 1-4: Dm9
    createChordSection(
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      'D', 'D',
      [
        ['A4', null, null, 'C5', null, null, 'E5', null, 'D5', null, null, null, null, null, null, null],
        [null, null, 'F5', null, 'E5', null, 'D5', 'C5', 'D5', null, null, null, 'A4', null, null, null],
        ['F4', null, null, 'A4', null, 'C5', null, 'D5', 'E5', null, 'D5', null, 'C5', null, null, null],
        [null, null, 'A4', null, 'G4', null, 'F4', null, 'E4', null, 'F4', null, 'D4', null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 5-8: Bbmaj7
    createChordSection(
      ['Bb2', 'D3', 'F3', 'A3', 'D4'],
      'Bb', 'F',
      [
        ['D5', null, null, 'F5', null, null, 'A5', null, 'G5', null, null, null, null, null, null, null],
        [null, null, 'F5', null, 'E5', null, 'D5', 'C5', 'Bb4', null, null, null, 'D5', null, null, null],
        ['F4', null, 'Bb4', null, 'D5', null, 'F5', null, 'G5', null, 'F5', null, 'D5', null, null, null],
        [null, null, 'C5', null, 'Bb4', null, 'A4', null, 'F4', null, 'G4', null, 'A4', null, null, null],
      ],
      ['Bb2', 'D3', 'F3', 'A3']
    );

    // Bar 9-12: Fmaj7
    createChordSection(
      ['F2', 'A3', 'C4', 'E4', 'G4'],
      'F', 'C',
      [
        ['C5', null, null, 'E5', null, null, 'G5', null, 'F5', null, null, null, null, null, null, null],
        [null, null, 'A5', null, 'G5', null, 'F5', 'E5', 'C5', null, null, null, 'E5', null, null, null],
        ['A4', null, 'C5', null, 'E5', null, 'F5', null, 'G5', null, 'A5', null, 'G5', null, null, null],
        [null, null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, 'C5', null, 'D5', null, null, null],
      ],
      ['F2', 'A3', 'C4', 'E4']
    );

    // Bar 13-16: Csus4 -> C
    createChordSection(
      ['C3', 'E3', 'G3', 'B3', 'D4'],
      'C', 'G',
      [
        ['E5', null, null, 'D5', null, null, 'C5', null, 'B4', null, null, null, null, null, null, null],
        [null, null, 'C5', null, 'D5', null, 'E5', null, 'D5', null, 'C5', null, 'B4', null, null, null],
        ['G4', null, 'C5', null, 'D5', null, 'E5', null, 'F5', null, 'E5', null, 'D5', null, null, null],
        [null, null, 'C5', null, 'B4', null, 'A4', null, 'G4', null, 'A4', null, 'C5', null, null, null],
      ],
      ['C3', 'E3', 'G3', 'B3']
    );

    // --- MOVEMENT 2: "Neon Drizzle" (Bars 17-32) - Melodic Expansion ---
    // Bar 17-20: Gm7
    createChordSection(
      ['G2', 'Bb3', 'D4', 'F4'],
      'G', 'D',
      [
        ['Bb4', null, 'D5', null, 'F5', null, 'G5', null, 'F5', null, 'D5', null, 'Bb4', null, null, null],
        [null, null, 'C5', null, 'D5', null, 'Eb5', 'D5', 'C5', null, 'Bb4', null, 'A4', null, null, null],
        ['G4', null, 'Bb4', null, 'D5', null, 'F5', null, 'G5', null, 'F5', 'D5', 'C5', null, null, null],
        [null, null, 'D5', null, 'Bb4', null, 'A4', null, 'G4', null, 'F4', null, 'G4', null, null, null],
      ],
      ['G2', 'Bb3', 'D4', 'F4']
    );

    // Bar 21-24: Dm9 (Deepen theme)
    createChordSection(
      ['D3', 'F3', 'A3', 'C4', 'E4'],
      'D', 'A',
      [
        ['A4', null, 'C5', null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, 'F4', null, null, null],
        [null, null, 'G4', null, 'A4', null, 'C5', null, 'D5', null, 'E5', 'F5', 'D5', null, null, null],
        ['F5', null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, 'C5', null, 'D5', null, null, null],
        [null, null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, 'G4', null, 'A4', null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 25-28: Ebmaj7
    createChordSection(
      ['Eb2', 'G3', 'Bb3', 'D4'],
      'Eb', 'Bb',
      [
        ['G4', null, 'Bb4', null, 'D5', null, 'Eb5', null, 'D5', null, 'Bb4', null, 'G4', null, null, null],
        [null, null, 'F4', null, 'G4', null, 'Bb4', null, 'C5', null, 'D5', null, 'Bb4', null, null, null],
        ['Eb5', null, 'D5', null, 'C5', null, 'Bb4', null, 'G4', null, 'Bb4', null, 'C5', null, null, null],
        [null, null, 'D5', null, 'C5', null, 'Bb4', null, 'A4', null, 'F4', null, 'G4', null, null, null],
      ],
      ['Eb2', 'G3', 'Bb3', 'D4']
    );

    // Bar 29-32: Asus4 -> A7
    createChordSection(
      ['A2', 'C#3', 'E3', 'G3', 'A3'],
      'A', 'E',
      [
        ['E4', null, 'A4', null, 'C#5', null, 'E5', null, 'G5', null, 'F#5', null, 'E5', null, null, null],
        [null, null, 'D5', null, 'C#5', null, 'B4', null, 'A4', null, 'G4', null, 'E4', null, null, null],
        ['C#5', null, 'D5', null, 'E5', null, 'G5', null, 'F#5', null, 'E5', null, 'C#5', null, null, null],
        [null, null, 'E5', null, 'D5', null, 'C#5', null, 'A4', null, 'B4', null, 'C#5', null, null, null],
      ],
      ['A2', 'C#3', 'E3', 'G3']
    );

    // --- MOVEMENT 3: "Midnight High Roller" (Bars 33-48) - Emotional Solo Climax ---
    // Bar 33-36: Dm11
    createChordSection(
      ['D3', 'F3', 'G3', 'C4', 'E4'],
      'D', 'D',
      [
        ['D5', null, null, 'E5', 'F5', null, 'G5', null, 'A5', null, null, null, 'G5', null, 'F5', null],
        ['E5', null, 'D5', null, 'C5', null, 'A4', null, 'C5', null, 'D5', null, 'E5', null, null, null],
        ['F5', null, null, 'G5', 'A5', null, 'C6', null, 'A5', null, null, null, 'G5', null, 'F5', null],
        ['E5', null, 'F5', 'E5', 'D5', null, 'C5', null, 'D5', null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'C4']
    );

    // Bar 37-40: Bbmaj9
    createChordSection(
      ['Bb2', 'D3', 'F3', 'A3', 'C4'],
      'Bb', 'F',
      [
        ['F5', null, null, 'G5', 'A5', null, 'Bb5', null, 'A5', null, null, null, 'F5', null, 'D5', null],
        ['C5', null, 'D5', null, 'F5', null, 'G5', null, 'F5', null, 'D5', null, 'C5', null, null, null],
        ['D5', null, null, 'F5', 'G5', null, 'A5', null, 'G5', null, null, null, 'F5', null, 'D5', null],
        ['C5', null, 'Bb4', null, 'A4', null, 'G4', null, 'A4', null, 'Bb4', null, 'C5', null, null, null],
      ],
      ['Bb2', 'D3', 'F3', 'A3']
    );

    // Bar 41-44: Em7b5 -> A7alt
    createChordSection(
      ['E2', 'G3', 'Bb3', 'D4', 'C#4'],
      'E', 'A',
      [
        ['G5', null, null, 'F5', 'E5', null, 'D5', null, 'C#5', null, null, null, 'Bb4', null, 'A4', null],
        ['G4', null, 'Bb4', null, 'C#5', null, 'E5', null, 'F5', null, 'E5', null, 'C#5', null, null, null],
        ['E5', null, null, 'F5', 'G5', null, 'Bb5', null, 'A5', null, null, null, 'G5', null, 'E5', null],
        ['C#5', null, 'D5', null, 'E5', null, 'G5', null, 'F5', null, 'E5', null, 'C#5', null, null, null],
      ],
      ['E2', 'G3', 'Bb3', 'C#4']
    );

    // Bar 45-48: Dm -> Dm/C -> Bb -> A7
    createChordSection(
      ['D3', 'F3', 'A3', 'C4'],
      'D', 'C',
      [
        ['A5', null, 'G5', null, 'F5', null, 'E5', null, 'D5', null, 'C5', null, 'Bb4', null, 'A4', null],
        ['F4', null, 'G4', null, 'A4', null, 'C5', null, 'D5', null, 'E5', null, 'D5', null, null, null],
        ['D5', null, null, 'F5', 'A5', null, 'G5', null, 'F5', null, 'E5', null, 'D5', null, 'C#5', null],
        ['D5', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'D4']
    );

    // --- MOVEMENT 4: "Demoscene Dawn" (Bars 49-64) - Ambient Breakdown & Re-entry ---
    // Bar 49-52: Dm(add9) Ambient
    createChordSection(
      ['D3', 'F3', 'A3', 'E4'],
      'D', 'D',
      [
        ['E5', null, null, null, null, null, null, null, 'D5', null, null, null, null, null, null, null],
        [null, null, null, null, 'A4', null, null, null, 'C5', null, null, null, null, null, null, null],
        ['F4', null, null, null, 'A4', null, null, null, 'D5', null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'A3', 'E4']
    );

    // Bar 53-56: C6/D
    createChordSection(
      ['D3', 'E3', 'G3', 'A3', 'C4'],
      'D', 'C',
      [
        ['C5', null, null, null, null, null, null, null, 'B4', null, null, null, null, null, null, null],
        [null, null, null, null, 'G4', null, null, null, 'A4', null, null, null, null, null, null, null],
        ['E4', null, null, null, 'G4', null, null, null, 'C5', null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      ],
      ['D3', 'E3', 'G3', 'A3']
    );

    // Bar 57-60: Bb/D
    createChordSection(
      ['D3', 'F3', 'Bb3', 'D4'],
      'D', 'Bb',
      [
        ['D5', null, null, null, null, null, null, null, 'C5', null, null, null, null, null, null, null],
        [null, null, null, null, 'F4', null, null, null, 'Bb4', null, null, null, null, null, null, null],
        ['D4', null, null, null, 'F4', null, null, null, 'Bb4', null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
      ],
      ['D3', 'F3', 'Bb3', 'D4']
    );

    // Bar 61-64: Csus2/D building back into Bar 1
    createChordSection(
      ['D3', 'G3', 'C4', 'D4'],
      'D', 'G',
      [
        ['C5', null, null, null, null, null, null, null, 'D5', null, null, null, null, null, null, null],
        [null, null, null, null, 'E4', null, 'G4', null, 'A4', null, 'C5', null, 'D5', null, null, null],
        ['E5', null, null, 'F5', 'G5', null, null, null, 'A5', null, null, null, null, null, null, null],
        ['F5', null, 'E5', null, 'D5', null, 'C5', null, 'A4', null, 'C5', null, 'D5', null, null, null],
      ],
      ['D3', 'G3', 'C4', 'E4']
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

    // Master Amiga Paula DAC low-pass filter (2300Hz gives warm 12-bit Amiga demoscene color)
    this.masterDacFilter = new Tone.Filter({
      frequency: 2300,
      type: 'lowpass',
      rolloff: -12,
    }).toDestination();

    // Channel 1: Sub-Bass (Deep rounded triangle)
    this.bassGain = new Tone.Gain(0.7).connect(this.masterDacFilter);
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { Q: 1.2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.025, decay: 0.35, sustain: 0.5, release: 0.35 },
    }).connect(this.bassGain);

    // Channel 2: Arpeggiator (Filtered square wave for classic tracker chord broken arp)
    this.arpGain = new Tone.Gain(0.4).connect(this.masterDacFilter);
    this.arpSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.008, decay: 0.14, sustain: 0.12, release: 0.22 },
    }).connect(this.arpGain);

    // Channel 3: Melodic Lead (Expressive pulse wave, 20% width with subtle warmth)
    this.leadGain = new Tone.Gain(0.0).connect(this.masterDacFilter);
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'pulse', width: 0.2 },
      envelope: { attack: 0.03, decay: 0.28, sustain: 0.35, release: 0.45 },
    }).connect(this.leadGain);

    // Channel 4: Lo-Fi Tracker Percussion (Membrane kick & pink noise shaker/snare)
    this.drumGain = new Tone.Gain(0.2).connect(this.masterDacFilter);
    this.drumSynth = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 3.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 0.22, sustain: 0.01, release: 0.3 },
    }).connect(this.drumGain);

    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.003, decay: 0.08, sustain: 0 },
    }).connect(this.drumGain);

    // Dedicated Sound Effects Engine (Direct to destination for crisp responsiveness)
    this.sfxSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.004, decay: 0.14, sustain: 0.08, release: 0.16 },
    }).toDestination();

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

    this.applyIntensityStems(this.currentIntensity, false);
  }

  // Smoothly ramps channel stems based on game intensity (0: Lounge/Shop, 1: Exploration, 2: High Stakes, 3: Boss Climax)
  public setGameIntensity(level: MusicIntensity) {
    if (this.currentIntensity === level) return;
    this.currentIntensity = level;
    this.applyIntensityStems(level, true);
  }

  private applyIntensityStems(level: MusicIntensity, smooth: boolean) {
    if (!this.initialized) return;

    const baseMusicGain = this.musicMuted ? 0 : Math.max(0, this.musicVolume);
    const rampTime = smooth ? 0.8 : 0.05;

    // Intensity Matrix:
    // Level 0: Ambient chill (Gentle bass, quiet chord arps, soft ticking shakers, lead silent)
    // Level 1: Standard play (Bass, arps, mellow lead melodies, soft kick)
    // Level 2: High stakes (Full bass groove, energetic arps, melodic phrases, active drums)
    // Level 3: Boss climax (Driving bass, high-presence arps, expressive solos, driving groove)
    let targetBass = 0.7;
    let targetArp = 0.35;
    let targetLead = 0.0;
    let targetDrum = 0.15;

    if (level === 1) {
      targetBass = 0.8;
      targetArp = 0.5;
      targetLead = 0.45;
      targetDrum = 0.45;
    } else if (level === 2) {
      targetBass = 0.95;
      targetArp = 0.7;
      targetLead = 0.75;
      targetDrum = 0.75;
    } else if (level === 3) {
      targetBass = 1.0;
      targetArp = 0.85;
      targetLead = 0.95;
      targetDrum = 0.95;
    }

    try {
      this.bassGain?.gain.rampTo(targetBass * baseMusicGain, rampTime);
      this.arpGain?.gain.rampTo(targetArp * baseMusicGain, rampTime);
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
      this.noiseSynth?.triggerAttackRelease('32n', '+0.01');
      this.sfxSynth?.triggerAttackRelease([pitch], '32n', '+0.02');
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
      this.noiseSynth?.triggerAttackRelease('16n', now + 0.05);
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
      this.noiseSynth?.triggerAttackRelease('16n', now);
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

  // UNIFIED EVOLVING ADAPTIVE CHIPTUNE SOUNDTRACK (EXTENDED 64-BAR AMIGA MOD TRACKER)
  public playBgm(track?: 'menu' | 'combat' | 'boss' | 'shop' | 'victory') {
    if (track) {
      this.currentTrack = track;
      if (track === 'menu' || track === 'shop') {
        this.setGameIntensity(0);
      } else if (track === 'combat') {
        this.setGameIntensity(1);
      } else if (track === 'boss') {
        this.setGameIntensity(2);
      } else if (track === 'victory') {
        this.setGameIntensity(1);
      }
    }

    if (this.bgmLoop) return; // Keep continuously playing without resetting the pattern cycle!
    if (!this.isAudioUnlocked) return;

    // Chill, melancholic tracker tempo (72 BPM)
    Tone.Transport.bpm.value = 72;
    this.trackerStep = 0;

    // 16th-note Tracker Sequencer Engine (1024 steps per 64-bar progressive cycle)
    this.bgmLoop = new Tone.Loop(time => {
      if (this.musicMuted || !this.scoreBars.length) return;

      const totalSteps = this.scoreBars.length * 16;
      const currentGlobalStep = this.trackerStep % totalSteps;
      const barIndex = Math.floor(currentGlobalStep / 16);
      const step16 = currentGlobalStep % 16;

      const currentPattern = this.scoreBars[barIndex];
      if (!currentPattern) return;

      // Channel 4: RHYTHM SECTION (Amiga Paula Drum Synthesis)
      // Level 0: Only soft shaker ticks; Level 1+: Kick & Snare active
      const isDownbeatKick = step16 === 0 || (this.currentIntensity >= 2 && step16 === 8);
      const isSnareBackbeat = (step16 === 4 || step16 === 12) && this.currentIntensity >= 1;

      if (isDownbeatKick && this.currentIntensity >= 1) {
        this.drumSynth?.triggerAttackRelease('C1', '16n', time, 0.4);
      } else if (isSnareBackbeat) {
        this.noiseSynth?.triggerAttackRelease('24n', time);
      } else if (step16 % 2 === 0) {
        // Mellow 8th/16th shaker pulse with subtle velocity variation
        const shakerVol = step16 % 4 === 0 ? 0.25 : 0.12;
        this.noiseSynth?.triggerAttackRelease('64n', time);
      }

      // Channel 1: SUB-BASS (Triangle MonoSynth syncopated bassline)
      const bassNote = currentPattern.bass[step16];
      if (bassNote && bassNote.trim() !== '') {
        this.bassSynth?.triggerAttackRelease(bassNote, '16n', time);
      }

      // Channel 2: CHORD ARPEGGIATOR (Amiga broken arpeggio across chord tones)
      if (currentPattern.arpNotes.length > 0) {
        // Fast broken tracker arp note selection on 16th steps
        const arpIndex = (step16 * 2) % currentPattern.arpNotes.length;
        const arpNote = currentPattern.arpNotes[arpIndex];
        if (arpNote) {
          this.arpSynth?.triggerAttackRelease([arpNote], '32n', time);
        }
      }

      // Channel 3: MELODIC LEAD (Expressive Amiga pulse wave solo)
      const leadNote = currentPattern.lead[step16];
      if (leadNote) {
        this.leadSynth?.triggerAttackRelease([leadNote], '16n', time);
      }

      this.trackerStep++;
    }, '16n');

    this.bgmLoop.start(0);
    Tone.Transport.start();
  }

  public stopBgm() {
    if (this.bgmLoop) {
      this.bgmLoop.stop();
      this.bgmLoop.dispose();
      this.bgmLoop = null;
    }
  }
}

export const soundManager = new SoundManager();
