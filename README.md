# BALACKJACK

> **A blackjack-inspired combat roguelike, deckbuilder, and cooperative multiplayer boss battler.**

Built with **React, TypeScript, Vite, Tailwind CSS, Express, WebSockets, and Tone.js**.

---

## 🎮 Game Concept & Features

### 🃏 Combat Blackjack Engine
- **Deterministic Blackjack Rules:** Full Soft/Hard Ace adjustment, Natural 21 critical damage multipliers (x2.5), dealer bust penalties, push handling, and margin-of-victory strike bonuses.
- **Dynamic Encounter Stakes:** Real-time tension calculation dynamically adapts music intensity and audio cues based on low HP, dealer upcards, and stand decisions.

### ⚡ Joker Matrix & Slot Affinities
- **Slot Capacity & Unlocks:** Runs initialize with **5 of 6 active Joker slots** unlocked. The 6th and final slot is unlocked via a consumable **Matrix Expansion Voucher** card that has a chance to appear in the Black Market Shop.
- **Drag-and-Drop Slot Reordering:** Players can freely drag-and-drop or click to rearrange active Jokers on desktop and mobile touchscreens.
- **Adjacency Synergy Links (Combo Links):** Equipping Jokers with matching affinity tags in adjacent slots activates glowing circuit resonance wires that grant compounded multipliers:
  - ⚔️ **Blade Resonance (+25% Pierce & Attack Surge)**: Stacking physical/blade Jokers.
  - 🪙 **Gilded Circuit (+20% Chip Yield & Gold Scaling)**: Multiplying economy and payout.
  - ⚛️ **Quantum Entanglement (+30% Probability Flux)**: Protecting against busts and bending draw luck.
  - 💉 **Bio-Feedback Loop (+25% Vitality & Armor Shielding)**: Converting margin into shield and health.
  - ⚡ **Overdrive Surge (+35% Critical Multiplier)**: Supercharging natural 21s.
- **In-Store Joker Matrix Display:** Active Jokers, active slots, and combo links are displayed directly inside the Black Market Shop.
- **Side-by-Side Replacement Dialog with Trade-In Refunds:** Purchasing a Joker when all slots are full triggers a dedicated swap prompt where players can decommission an existing Joker for a 50% partial chip refund or cancel the purchase with no chips spent.

### 🎵 Procedural Retro Chiptune & Tracker Audio
- **Dedicated Soothing Title Screen:** A gentle, pre-generated 60 BPM composition featuring soft crystalline music box bell chimes and slow, warm sub-bass chords in D-major/B-minor.
- **Decluttered Adaptive Amiga MOD Tracker Soundtrack:** An extended 64-bar progressive composition (over 3.5 minutes of evolving music) designed with spacious syncopation, open bar rests, and sustained harmonic pad chords to eliminate auditory fatigue.
- **4-Stem Real-Time Dynamic Intensity Modulation:** Sub-bass, chord pads, lyrical pulse leads, and lo-fi percussion smoothly crossfade in real time across four intensity tiers:
  - *Tier 0 (Ambient Lounge/Shop)*: Soft pad resonance, quiet sub-bass, zero percussion clutter.
  - *Tier 1 (Exploration & Play)*: Subtle kick on downbeats, gentle syncopation, mellow lead phrasing.
  - *Tier 2 (Stand Tension & High Stakes)*: Snare backbeats, richer chord presence, active melodic solos.
  - *Tier 3 (Boss Climax & Critical HP)*: Driving groove, full presence, heightened tension.
- **Warm Paula DAC Emulation:** A modeled 2.4 kHz low-pass filter captures authentic 1990s demoscene tracker warmth.
- **Arcade Sound FX:** Procedural pitch-varied audio for card deals, flips, hits, stands, blackjacks, busts, attacks, heals, and combo links.

### 👥 Cooperative Multiplayer Tables (2–6 Players)
- **Authoritative Server:** WebSockets synchronize 2 to 6 players fighting a shared Dealer Boss.
- **Strict Anti-Cheat / Fog of War:** Dealer hole card remains completely server-side until the official dealer reveal phase.
- **Team Combos & Healing:** Field Medics regenerate lowest-health allies, and simultaneous player wins trigger Team Combos.
- **Instant AI Bot Operatives:** Hosts can press "+ Add AI Bot" anytime to test multi-operative mechanics instantly.
- **Matchmaking & Private Codes:** Public matchmaking lobby and 4-letter private room codes (e.g. `#BJ77`).

### 📺 Retro CRT Presentation
- **Post-Processing Pipeline:** Scanlines, monitor curvature distortion, chromatic aberration, vignette, CRT flicker, and screen shake on heavy blows.
- **Accessibility & Presets:** Low, Medium, High graphics settings, reduced motion options, and persistent master/music/sfx volume controls.

---

## 🚀 Quickstart & Commands

### Prerequisites
- Node.js 18+
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Full-Stack Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` running Express API, WebSocket room server, and the Vite frontend.

### 3. Run Automated Unit Tests
```bash
npm test
```
Runs the Vitest suite covering hand calculations, soft/hard aces, dealer behaviors, jokers, combo links, bosses, and multiplayer security.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🗂 Architecture Overview

```
├── server.ts                    # Full-stack entrypoint: Express + WebSockets + Vite
├── src/
│   ├── audio/
│   │   └── soundManager.ts      # Tone.js synthesized audio engine (Menu bells & 64-bar tracker)
│   ├── components/
│   │   ├── CardView.tsx         # Pixel playing cards with enhancement badges
│   │   ├── CombatView.tsx       # Single-player combat table vs dealer boss
│   │   ├── JokerSlotTray.tsx    # Drag-and-drop Joker Matrix tray with Combo Link wires
│   │   ├── MultiplayerTable.tsx # 2-6 player synchronized co-op table
│   │   ├── LobbyView.tsx        # Public/private room matchmaking
│   │   ├── RunMapView.tsx       # Roguelike act progression map
│   │   ├── RewardView.tsx       # Post-combat drafting (Cards, Jokers, Heals)
│   │   ├── ShopView.tsx         # Black Market shop, owned Joker tray & replace modal
│   │   ├── CharacterSelectView.tsx # 4 starting operative loadouts
│   │   ├── CollectionView.tsx   # Encyclopedia of cards, jokers, and bosses
│   │   ├── SettingsModal.tsx    # CRT, audio, and accessibility settings
│   │   └── StatsModal.tsx       # Persistent career dossier
│   ├── server/
│   │   ├── room.ts              # Authoritative multiplayer GameRoom
│   │   └── matchmaker.ts        # Room indexing & code generator
│   └── shared/
│       ├── types.ts             # Shared TypeScript interfaces & audio types
│       ├── rules.ts             # Pure blackjack rules, ace handling & combat
│       ├── deck.ts              # 52-card deck generator & shuffle
│       ├── jokers.ts            # 15 original Jokers, affinity tags & combo links
│       ├── enhancements.ts      # 8 card enhancements (Holo, Armored, Glitch, etc.)
│       ├── consumables.ts       # Tactical gear & Matrix Expansion Voucher
│       ├── bosses.ts            # 5 unique bosses up to The Grand Algorithm
│       └── characters.ts        # 4 character loadouts
└── tests/
    └── rules.test.ts            # Vitest unit & multiplayer security tests
```

---

## 🧪 Verified Milestones

- [x] **Milestone 1 — Runnable Foundation:** Full project structure, retro CRT shader pipeline, and Tone.js synthesized sound engine.
- [x] **Milestone 2 — Combat Blackjack Engine:** Soft/hard Aces, natural 21 multipliers, dealer reveals, bust penalties, push handling.
- [x] **Milestone 3 — Roguelike Campaign:** 5 escalating boss Acts, drafting rewards, deck lab enhancements, and 15 passive Jokers.
- [x] **Milestone 4 — Cooperative Multiplayer:** Real-time WebSockets, 2–6 player tables, hidden dealer hole card protection, and instant AI bots.
- [x] **Milestone 5 — Joker Matrix & Combo Links:** 5/6 starting slots, Matrix Expansion Voucher consumable card, drag-and-drop reordering, and affinity synergy wires.
- [x] **Milestone 6 — Shop Inventory & Trade-In UX:** In-store Joker tray visibility, and side-by-side card replacement dialog with 50% partial chip refunds.
- [x] **Milestone 7 — Ambient Audio Revamp:** Dedicated soothing music box title screen track (60 BPM) and decluttered 64-bar Amiga MOD tracker soundtrack with open bar rests and dynamic 4-stem intensity modulation.
- [x] **Milestone 8 — Verification & Packaging:** Automated test suite passes, zero build errors, production ready.
