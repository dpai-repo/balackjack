import * as Tone from 'tone';

class SoundManager {
  private initialized = false;
  private isAudioUnlocked = false;
  private currentTrack: string | null = null;

  // Synths
  private sfxSynth: Tone.PolySynth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private leadSynth: Tone.PolySynth | null = null;
  private chordsSynth: Tone.PolySynth | null = null;

  // Channels & Volume
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  private musicMuted: boolean = false;
  private sfxMuted: boolean = false;

  private bgmLoop: Tone.Loop | null = null;
  private currentPatternStep = 0;

  constructor() {
    // Lazy init on first user interaction
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

    // SFX Synth
    this.sfxSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.05, release: 0.1 },
    }).toDestination();
    this.updateSfxVolume();

    // Noise synth for percussion and card shuffles
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.002, decay: 0.08, sustain: 0 },
    }).toDestination();

    // Lo-fi Chords Synth with Filter
    const filter = new Tone.Filter(1200, 'lowpass').toDestination();
    this.chordsSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.15, decay: 0.4, sustain: 0.3, release: 0.8 },
    }).connect(filter);

    // Lo-fi Bass Synth
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.4 },
    }).toDestination();

    // Melodic Lead Synth
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.2, release: 0.3 },
    }).connect(filter);

    this.updateMusicVolume();
    this.initialized = true;
  }

  public setVolumes(master: number, music: number, sfx: number, musicMute: boolean, sfxMute: boolean) {
    this.masterVolume = master;
    this.musicVolume = music;
    this.sfxVolume = sfx;
    this.musicMuted = musicMute;
    this.sfxMuted = sfxMute;

    Tone.Destination.volume.value = Tone.gainToDb(this.masterVolume);
    this.updateMusicVolume();
    this.updateSfxVolume();
  }

  private updateMusicVolume() {
    const vol = this.musicMuted ? -Infinity : Tone.gainToDb(this.musicVolume * 0.4);
    if (this.chordsSynth) this.chordsSynth.volume.value = vol;
    if (this.bassSynth) this.bassSynth.volume.value = vol;
    if (this.leadSynth) this.leadSynth.volume.value = vol - 4;
  }

  private updateSfxVolume() {
    const vol = this.sfxMuted ? -Infinity : Tone.gainToDb(this.sfxVolume * 0.6);
    if (this.sfxSynth) this.sfxSynth.volume.value = vol;
    if (this.noiseSynth) this.noiseSynth.volume.value = vol - 6;
  }

  // SOUND EFFECTS
  public playCardDeal() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      this.noiseSynth?.triggerAttackRelease('32n', '+0.01');
      this.sfxSynth?.triggerAttackRelease(['C5'], '32n', '+0.03');
    } catch {
      // Audio safety catch
    }
  }

  public playCardFlip() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      this.sfxSynth?.triggerAttackRelease(['E5', 'A5'], '16n');
    } catch {}
  }

  public playHit() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      this.sfxSynth?.triggerAttackRelease(['D4', 'G4'], '16n');
    } catch {}
  }

  public playStand() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      this.sfxSynth?.triggerAttackRelease(['F4', 'C5'], '16n');
    } catch {}
  }

  public playBlackjack() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['C5', 'E5'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['G5', 'B5'], '16n', now + 0.1);
      this.sfxSynth?.triggerAttackRelease(['C6', 'E6'], '8n', now + 0.22);
    } catch {}
  }

  public playBust() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['Eb4', 'Db4'], '16n', now);
      this.sfxSynth?.triggerAttackRelease(['C4', 'Bb3'], '8n', now + 0.12);
      this.noiseSynth?.triggerAttackRelease('16n', now + 0.05);
    } catch {}
  }

  public playAttack() {
    if (!this.isAudioUnlocked || this.sfxMuted) return;
    try {
      const now = Tone.now();
      this.sfxSynth?.triggerAttackRelease(['A4', 'E5'], '32n', now);
      this.sfxSynth?.triggerAttackRelease(['C6'], '16n', now + 0.06);
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
      this.sfxSynth?.triggerAttackRelease(['G5'], '32n');
    } catch {}
  }

  // LO-FI BACKGROUND MUSIC
  public playBgm(track: 'menu' | 'combat' | 'boss' | 'shop' | 'victory') {
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    if (!this.isAudioUnlocked) return;

    this.stopBgm();

    Tone.Transport.bpm.value = track === 'boss' ? 92 : track === 'combat' ? 84 : 76;

    // Harmonic chords progression based on track
    const chordProgressions: Record<string, string[][]> = {
      menu: [
        ['D3', 'F3', 'A3', 'C4'],
        ['G3', 'Bb3', 'D4', 'F4'],
        ['C3', 'E3', 'G3', 'B3'],
        ['A2', 'C3', 'E3', 'G3'],
      ],
      combat: [
        ['C3', 'Eb3', 'G3', 'Bb3'],
        ['Ab2', 'C3', 'Eb3', 'G3'],
        ['Bb2', 'D3', 'F3', 'Ab3'],
        ['G2', 'B2', 'D3', 'F3'],
      ],
      boss: [
        ['F2', 'Ab2', 'C3', 'Eb3'],
        ['Gb2', 'Bb2', 'Db3', 'F3'],
        ['Eb2', 'G2', 'Bb2', 'Db3'],
        ['C2', 'E2', 'G2', 'Bb2'],
      ],
      shop: [
        ['F3', 'A3', 'C4', 'E4'],
        ['E3', 'G3', 'B3', 'D4'],
        ['D3', 'F3', 'A3', 'C4'],
        ['G3', 'B3', 'D4', 'F4'],
      ],
      victory: [
        ['C3', 'E3', 'G3', 'B3'],
        ['F3', 'A3', 'C4', 'E4'],
        ['G3', 'B3', 'D4', 'F4'],
        ['C3', 'E3', 'G3', 'C4'],
      ],
    };

    const chords = chordProgressions[track] || chordProgressions.combat;
    this.currentPatternStep = 0;

    this.bgmLoop = new Tone.Loop(time => {
      if (this.musicMuted) return;

      const chordIdx = Math.floor(this.currentPatternStep / 4) % chords.length;
      const stepInChord = this.currentPatternStep % 4;
      const currentChord = chords[chordIdx];

      // Play pad chord on beat 1
      if (stepInChord === 0) {
        this.chordsSynth?.triggerAttackRelease(currentChord, '2n', time);
        // Play bass note
        this.bassSynth?.triggerAttackRelease(currentChord[0], '2n', time);
      }

      // Arpeggiated melody note on offbeats
      if (stepInChord === 2 && currentChord[2]) {
        this.leadSynth?.triggerAttackRelease([currentChord[2]], '8n', time);
      }

      this.currentPatternStep++;
    }, '4n');

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
