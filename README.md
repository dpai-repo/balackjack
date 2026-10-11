# BALACKJACK

> **A blackjack-inspired combat roguelike, deckbuilder, and cooperative multiplayer boss battler.**

Built with **React, TypeScript, Vite, Tailwind CSS, Express, WebSockets, and Tone.js**.

---

## 🎮 Game Concept & Features

- **Combat Blackjack Engine:** Pure, deterministic blackjack rules featuring full Soft/Hard Ace adjustments, Natural 21 critical multipliers, bust penalties, push handling, and dynamic margin bonuses.
- **Single-Player Roguelike Campaign:** 
  - 5 escalating boss Acts ending at **The Grand Algorithm**.
  - Encounter drafting: acquire enhanced cards, equip up to 15 unique **Jokers**, consume tactical gear, or visit the Black Market Shop.
  - Deck Lab: permanently enhance cards with cyber attributes (Holographic, Polychrome, Armored, Radioactive, Glitch, Vampiric, etc.) or shred weak cards.
  - 4 playable Operatives: *Card Sharp*, *Cyber Punk*, *High Roller*, and *Field Medic*.
- **Cooperative Multiplayer Tables (2–6 Players):**
  - Real-time authoritative server syncing 2 to 6 players fighting a shared Dealer Boss.
  - Public matchmaking lobby & private tables with 4-letter room codes (e.g. `#BJ77`).
  - Strict security: Dealer's hole card is kept completely hidden on the server until the dealer reveal phase.
  - Co-op synergies: Field Medics regenerate lowest-health allies, players can trigger Team Combos when multiple operatives beat the dealer in the same round, and armor protects teammates.
  - Instant Co-op AI Bots: Host can press "+ Add AI Bot" anytime to test multi-operative mechanics instantly even when playing solo.
  - Fast-paced 25-second shared action windows with auto-stand timeouts and ping reactions.
- **Retro CRT Presentation:**
  - Shader pipeline featuring scanlines, monitor curvature distortion, chromatic aberration, vignette, CRT flicker, and screen shake on heavy blows.
  - Graphics presets: Low, Medium, High.
  - Full accessibility options: reduced motion, game speed toggles, persistent volume settings.
- **Lo-Fi Chiptune Audio Engine:**
  - Synthesized lo-fi soundtrack programmed with Tone.js (ambient chords, arpeggios, mellow bass, retro noise sweeps).
  - Procedural sound effects for card draws, flips, hits, stands, blackjacks, busts, and damage.

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
The server will start on `http://localhost:3000` running both the Express API, the WebSocket room server, and the Vite frontend.

### 3. Run Automated Unit Tests
```bash
npm test
```
Runs the Vitest suite covering hand calculations, aces, dealer behaviors, jokers, bosses, and multiplayer security.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🗂 Architecture Overview

```
├── server.ts                  # Full-stack entrypoint: Express + WebSockets + Vite
├── src/
│   ├── audio/
│   │   └── soundManager.ts    # Tone.js synthesized sound engine & lo-fi BGM
│   ├── components/
│   │   ├── CardView.tsx       # Pixel playing cards with enhancement badges
│   │   ├── CombatView.tsx     # Single-player combat table vs dealer boss
│   │   ├── MultiplayerTable.tsx # 2-6 player synchronized co-op table
│   │   ├── LobbyView.tsx      # Public/private room matchmaking
│   │   ├── RunMapView.tsx     # Roguelike act progression map
│   │   ├── RewardView.tsx     # Post-combat drafting (Cards, Jokers, Heals)
│   │   ├── ShopView.tsx       # Black Market shop and deck lab
│   │   ├── CharacterSelectView.tsx # 4 starting operative loadouts
│   │   ├── CollectionView.tsx # Encyclopedia of all cards, jokers, and bosses
│   │   ├── SettingsModal.tsx  # CRT, audio, and accessibility settings
│   │   └── StatsModal.tsx     # Persistent career dossier
│   ├── server/
│   │   ├── room.ts            # Authoritative multiplayer GameRoom
│   │   └── matchmaker.ts      # Room indexing & code generator
│   └── shared/
│       ├── types.ts           # Shared TypeScript interfaces
│       ├── rules.ts           # Pure blackjack rules, ace handling & combat
│       ├── deck.ts            # 52-card deck generator & shuffle
│       ├── jokers.ts          # 15 original functional Jokers
│       ├── enhancements.ts    # 8 card enhancements
│       ├── consumables.ts     # 7 active consumables
│       ├── bosses.ts          # 5 unique bosses
│       └── characters.ts      # 4 character loadouts
└── tests/
    └── rules.test.ts          # Comprehensive unit & multiplayer tests
```

---

## 🧪 Verified Milestones

- [x] **Milestone 1 — Runnable foundation:** Full project structure, styling, audio synths, and retro CRT engine.
- [x] **Milestone 2 — Playable combat MVP:** Hit, Stand, soft/hard Aces, natural blackjack multipliers, dealer reveals, bust penalties.
- [x] **Milestone 3 — Roguelike run:** 5 escalating bosses, draft rewards, Black Market shop, deck card modifications, 15 Jokers.
- [x] **Milestone 4 — Multiplayer foundation:** WebSocket server, authoritative state syncing, room codes, hidden hole card protection.
- [x] **Milestone 5 — Cooperative combat & effects:** 2–6 player tables, shared boss HP, cross-player combos, ally healing, bot test slots.
- [x] **Milestone 6 — Audio, visual polish & settings:** CRT curvature/scanlines/aberration, Tone.js lo-fi music, persistent audio controls.
- [x] **Milestone 7 — Validation & packaging:** Automated test suite passes, zero build errors.
