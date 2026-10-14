# Chiptune Music Revamp: Melancholic Amiga MOD Tracker & Adaptive Soundtrack

A comprehensive design to overhaul Balackjack's audio engine with authentic, extended 32-to-64-bar retro tracker compositions, replacing short repetitive loops with a chill, melancholic Amiga MOD-inspired groove that seamlessly adapts in real time to game intensity.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following direction has been established from user selections:

- **Confirmed Decision 1 (Style & Mood)**: **Melancholic Lo-Fi Amiga MOD Tracker Groove**. Characterized by relaxed tempos (68–74 BPM), mellow minor 9th and Dorian harmonic voicings, warm low-pass filtered pulse waves (12.5%–25% duty cycle), rounded triangle sub-bass, and subtle swing/shuffle reminiscent of legendary 1990s demoscene tracker modules (ProTracker / FastTracker II / OctaMED).
- **Confirmed Decision 2 (Form & Duration)**: **Extended 32-Bar to 64-Bar Progressive Sections**. Replaces the current 1-bar (16-step) repetitive loop with a multi-pattern tracker arrangement structure (Intro/A-Section -> Development/B-Section -> Melodic Solo/C-Section -> Mellow Breakdown -> Organic Outro/Loop variation), providing minutes of non-fatiguing, cohesive music before any motif returns.
- **Confirmed Decision 3 (Soundtrack Architecture)**: **Single Evolving Adaptive Soundtrack Modulated by Intensity**. Rather than jarring track switches between menus, combat, and shops, a unified harmonic soundtrack smoothly shifts dynamic layers across four intensity tiers (Ambient/Lounge, Exploration/Dealer Ready, Combat Stakes, and Boss Climax).

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades Balackjack’s procedural sound engine into a bona fide 4-to-6-voice retro tracker sequencer. It plays nuanced, extended lo-fi chiptune compositions that stay fresh across long sessions, automatically introducing or stripping musical voices (percussion, arpeggios, lead solos, sub-bass riffs) in response to player choices, dealer hands, and encounter stakes.
- **Target Audience**: Players who spend extended sessions strategizing blackjack hands and deckbuilder builds, demanding non-intrusive, atmospheric, nostalgia-rich background music that enhances immersion rather than inducing ear fatigue.
- **Key Value**: Delivers the calm, iconic sonic warmth of vintage Amiga tracker modules with zero external audio assets, zero loading times, and fluid gameplay-driven musical responsiveness.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Seamless Audio Initiation**:
   - The game launches in silent/standby state; first click or keypress triggers `unlockAudio()` with a clean, low-latency crossfade into the relaxed base groove (Layer 0).
   - A subtle retro tracker channel visualizer / tape indicator in the settings modal and corner audio HUD displays channel activity (Bass, Arp, Lead, Drums) with zero intrusive clutter.
2. **Adaptive Gameplay Intensity Layering**:
   - **Intensity 0 (Calm / Menu / Shop / Idle)**: Filtered triangle sub-bass, soft Rhodes-style pulse arpeggio, and gentle brushed pink-noise shakers.
   - **Intensity 1 (Active Hand / Thinking)**: Mellow Amiga-style square lead melody enters with 32-bar expressive phrasing, subtle vibrato, and pitch bends.
   - **Intensity 2 (High Stakes / Stand / Near Bust / Multiplier Active)**: Kick drum, syncopated tracker snare, and counter-melodic arpeggio lines open up.
   - **Intensity 3 (Boss Critical / Act Finale / Low HP)**: Full 4-voice polyphony with driving baseline octaves, urgent yet melancholic chord suspensions, and heightened dynamics.
3. **Soundtrack Controls & Customization**:
   - Audio settings panel provides independent Master, Music, and SFX sliders, along with an "Amiga DAC Filter Warmth" toggle (warm 2.2kHz low-pass filter vs. crisp arcade sound).

### Visual Identity & Theme

- **Aesthetic Direction**: Neo-retro tracker interface with clean cybernetic accents, reminiscent of vintage sound editors (MilkyTracker, ProTracker) integrated discreetly into the arcade blackjack environment.
- **Color Palette**:
  - Tracker Slate Background: `#08090e`
  - VU Meter Green: `#10b981`
  - Active Channel Amber: `#f59e0b`
  - High Intensity Crimson: `#ff2a6d`
- **Typography & HUD**: Monospaced tabular status (`font-mono tabular-nums`), clean unboxed status indicators, and unobtrusive volume sliders adhering strictly to zero-pill guidelines.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Extended Multi-Pattern Tracker Architecture vs. Algorithmic Random Generation
- **Chosen Approach**: A deterministic 64-bar tracker pattern matrix (4 distinct 16-bar movement patterns: Motif A, Development B, Melodic Bridge C, Ambient Breakdown D) with probabilistic ornamentation and fill variations.
- **Why**: Purely random generation produces aimless, unmusical bleeps. A crafted 64-bar pattern structure captures the emotional nostalgia and melodic hook of classic Amiga tracker modules while generative fills keep it perpetually organic.
- **Alternatives Considered**: Tiny 4-bar or 16-step loops (causes the exact repetition fatigue the user reported) or external streamed MP3/MOD files (incompatible with sandboxed offline deployment and adaptive intensity stems).

### Decision 2: Stem-Based Dynamic Channel Automation vs. Track Discontinuation
- **Chosen Approach**: All channels run locked to a single master transport BPM (72 BPM) with Tone.js gain envelopes modulating individual channel stems based on the encounter's intensity score.
- **Why**: Eliminates jarring stops and restarts when moving between shop, combat, and resolution screens. The music breathes and flows continuously like modern narrative game scores.
- **Alternatives Considered**: Stopping and playing separate BGM tracks on every view transition (causes click pops and abrupt silence).

### Decision 3: Authentic Tracker Sound Synthesis (Amiga Paula / Commodore 64 Timbre)
- **Chosen Approach**:
  - **Voice 1 (Lead)**: Asymmetric pulse wave with slight portamento/glide and slow LFO vibrato (0.02s attack, warm decaying release).
  - **Voice 2 (Sub-Bass)**: Rich triangle wave with mild 24dB low-pass filter envelope for round, fat, non-muddy low end.
  - **Voice 3 (Arp / Harmony)**: Rapid 3-note broken chord arpeggios simulating classic hardware chiptune chord multiplexing (16th and 32nd note arps).
  - **Voice 4 (Rhythm / Noise)**: Short burst pink noise for hi-hats, pitched sine drops for 808/Amiga kicks, and gated noise bursts for vintage snare claps.
- **Why**: Perfectly embodies the requested "melancholic lo-fi Amiga MOD tracker groove" without harsh piercing high-frequencies.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ADAPTIVE TRACKER AUDIO ENGINE                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │   Game State / HUD    │             │   Intensity Evaluator      │  │
│  │  - View (Combat/Shop) │────►───────►│  - Boss HP % / Player HP % │  │
│  │  - Active Round State │             │  - Hand Value / Multiplier │  │
│  └───────────────────────┘             └─────────────┬──────────────┘  │
│                                                      │ (Intensity 0-3) │
│                                                      ▼                 │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   SoundManager Sequencer Master                  │  │
│  │  - Tone.Transport (72 BPM, 16th-Note Clock)                      │  │
│  │  - Pattern Matrix: 64 Bars (Patterns 00, 01, 02, 03)             │  │
│  │  - Stem Gain Nodes & Cross-Fade Smoothing                        │  │
│  └───────────┬──────────────┬──────────────┬──────────────┬─────────┘  │
│              │              │              │              │            │
│              ▼              ▼              ▼              ▼            │
│       ┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐ │
│       │ Lead Synth   ││ Bass Synth   ││ Arp Synth    ││ Rhythm Synth │ │
│       │ (Amiga Pulse)││(Sub Triangle)││(Filter Square││(Noise/Kick)  │ │
│       └──────┬───────┘└──────┬───────┘└──────┬───────┘└──────┬───────┘ │
│              │               │               │               │         │
│              └───────────────┼───────────────┴───────────────┘         │
│                              ▼                                         │
│                ┌───────────────────────────┐                           │
│                │  Amiga Master DAC Filter  │                           │
│                │ (2.4 kHz Warm Low-Pass)   │                           │
│                └─────────────┬─────────────┘                           │
│                              ▼                                         │
│                ┌───────────────────────────┐                           │
│                │  Tone.Destination Output  │                           │
│                └───────────────────────────┘                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Pattern Composition Matrix**:
  - `Pattern`: 16 steps per bar, 16 bars per pattern = 256 steps per pattern.
  - Four progressive patterns:
    - `PATTERN_A` (Bars 1–16): Moody introductory D minor / F major / C major / G minor changes. Gentle sub-bass and sparse, drifting lead phrases.
    - `PATTERN_B` (Bars 17–32): Harmonic expansion into Bb major 7 / A minor 7 with cascading tracker arpeggios and rhythmic syncopation.
    - `PATTERN_C` (Bars 33–48): Melodic climax; poignant expressive lead solo with emotional pitch bends and counter-point arpeggios.
    - `PATTERN_D` (Bars 49–64): Atmospheric breakdown; percussion drops out into reflective ambient chords, slowly building back to resolve into `PATTERN_A`.
- **Adaptive Channels & Volume Automation**:
  - Dynamic envelope transitions over 0.5s–1.2s when intensity shifts, preventing abrupt cuts.
  - Public interface method: `soundManager.setGameIntensity(level: 0 | 1 | 2 | 3)`.
  - Scene triggers automatically modulate intensity:
    - Main Menu / Title: Level 0 (Ambient Lounge)
    - Shop / Rest: Level 0 (Warm Downtempo)
    - Combat Normal Hand: Level 1 (Engaged Exploration)
    - Combat High Stakes / Stand: Level 2 (Focused Tension)
    - Boss Encounters / Sub-30% Player HP: Level 3 (Melancholic Climax)

### Interactive Component & State Mapping

- `src/audio/soundManager.ts`: Complete reimplementation of tracker sequencer with 64-bar score, 4-stem gain architecture, low-pass Amiga filter, and `setGameIntensity()`.
- `src/components/CombatView.tsx`: Calls `soundManager.setGameIntensity()` dynamically as hand values climb and combat stages progress.
- `src/components/ShopView.tsx`: Automatically eases music intensity to Level 0 for a calming merchant experience.
- `src/components/SettingsModal.tsx`: Controls for music volume, master volume, and sound feedback.
