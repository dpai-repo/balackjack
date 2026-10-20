# Balackjack: Rogue Deckbuilder

A cyberpunk roguelike deckbuilding blackjack dungeon crawler. Fuse classic blackjack card counting and push-your-luck risk with deep relic synergies, consumable tactical items, multi-tier combat encounters, full card augmentations (Enhancements, Editions, Seals), Cyber-Ascension difficulty stakes, unlockable starter decks, persistent codex compendium, and procedural tracker chiptune audio.

---

## 🎴 Key Systems & Mechanics

### 1. Full Card Augmentation System
Every card in the player's deck can be independently customized across three distinct layers:
- **Card Enhancements (Material Alterations)**:
  - `Cyber-Chip`: +30 flat attack chips on score.
  - `Overclocked`: +4 attack multiplier on score.
  - `Glass Card`: High-risk x2.0 attack multiplier, with a 25% (1-in-4) chance to shatter permanently from the deck on score.
  - `Steel Card`: Grants +1.5x attack multiplier while held in hand (not played) when standing.
  - `Golden Card`: Awards +15 chips on round victory, plus +$4 credits if held in hand at round end.
  - `Quantum Glitch`: Dynamic card value (1–10) that automatically shifts to prevent busting.
  - `Nanotech Armor`: Instantly grants +10 Armor to the player when drawn or dealt.
  - `Radioactive Isotope`: Inflicts 8 ongoing radiation damage directly to the Dealer's HP upon standing.
  - `Vampiric Drain`: Restores +6 player HP on round victory.
- **Card Editions (Specular Holograms)**:
  - `Foil Edition`: +50 Attack Chips with metallic cyan moving sheen.
  - `Holographic Edition`: +10 Attack Mult with iridescent animated shifting shimmer.
  - `Polychrome Edition`: x1.5 Total Multiplier with cycling RGB chromatic aberration glow.
- **Circuit Seals (Corner Microchip Stamps)**:
  - `Red Circuit Seal`: Retriggers the card, scoring all chip and mult values an extra time.
  - `Gold Mint Seal`: Instantly earns +$3 credits every time the card is scored.
  - `Blue Protocol Seal`: Synthesizes a random Tactical Gear consumable if held in hand at round end.
  - `Purple Glitch Seal`: Generates a random Cyber-Mod Augmentation consumable when discarded.

### 2. Joker Matrix & Adjacency Combo Links
- **Capacity**: Players start every run with **5 out of 6 slots** unlocked in the active Joker Matrix tray.
- **Matrix Expansion Voucher**: The 6th slot is sealed and can be permanently unlocked for the run by purchasing a consumable **Joker Matrix Expansion Voucher** (`50 Chips`) in the Black Market store.
- **Adjacency Combo Links**: Jokers trigger synergistic multipliers or bonus chips when placed adjacent to compatible archetypes. Players can reorder Jokers dynamically with dedicated left/right reordering buttons.
- **Capacity Replacement Dialog**: If purchasing a Joker when all unlocked slots are occupied, the store opens a side-by-side **Joker Swap Modal** showing candidate cards alongside owned Jokers, displaying trade-in chip refunds (50% value) and clean cancellation.

### 3. Black Market Decker Lab & DNA Cloning Vat
- **Multi-Category Deck Workbench**:
  - `Enhancement Bay`: Install any of the 9 neural material enhancements.
  - `Specular Hologram Lab`: Coat cards in Foil (+50 Chips), Holographic (+10 Mult), or Polychrome (x1.5 Mult).
  - `Circuit Seal Bay`: Stamp Red (Retrigger), Gold (Bounty), Blue (Gear), or Purple (Mod) microchips.
  - `DNA Cloning Vat`: Pay 40 🪙 to duplicate any augmented card into your deck with all enhancements intact.
  - `Deck Shredder / Purge`: Permanently delete low-value cards to maximize draw consistency.
- **Deck Matrix Inspector Modal**: Accessible at any time during runs via the `🎴 DECK` header button with suit filters and detailed telemetry previews.

### 4. 8 Cyber-Ascension Stakes & Starter Decks
- **8 Compounding Difficulty Stakes**:
  - `White Stake`: Baseline Street Runner rules.
  - `Red Stake`: Small Mob encounters yield no baseline chip reward.
  - `Green Stake`: Required enemy target HP and damage thresholds scale 25% faster.
  - `Blue Stake`: -1 Discard allowance per combat encounter.
  - `Purple Stake`: Black Market store items, rerolls, and decker services inflate by +$2 per act.
  - `Orange Stake`: Cyber-Mod booster packs cost +$3; Jokers may appear Perishable (deactivates after 5 rounds).
  - `Gold Stake`: Purchased Jokers may be Rental (costs -$3 chips upkeep per round).
  - `Cyber-Overdrive Stake`: AI Singularity. Bosses trigger passive abilities on both Hit and Stand; 1 in 10 dealt cards is secretly glitched.
- **5 Unlockable Starter Decks**:
  - `Neon Standard`: Balanced 52-card baseline deck.
  - `High-Roller Vault`: +80 Starting Chips, +$2 interest cap, -1 Discard.
  - `Tactical Spec-Ops`: Starts equipped with EMP Jammer and Military Medkit.
  - `Quantum Glitch`: 4 Face cards start pre-augmented with Quantum Glitch and Polychrome; starts with 4/6 Joker slots.
  - `Syndicate VIP`: All 6 Joker slots unlocked from Round 1; store rerolls cost 50% less.

### 5. Interactive Cyber-Codex & Career Compendium
- **Joker Matrix Database**: Full catalog of all 30+ Jokers with discovery silhouettes, rarity frames, and lifetime telemetry.
- **Augment & Seal Lab**: Interactive showcase of all Enhancements, Editions, and Seals with live CardView rendering.
- **Decks & Stakes Directory**: Detailed dossiers on all 5 Starter Decks and 8 Cyber-Ascension Stakes.
- **Boss Dossier**: Tactical intelligence on all syndicate bosses and special countermeasures.
- **Career Archive & Telemetry**: Persistent lifetime stats (Blackjacks scored, highest hand score, bosses defeated) and a 20-run expedition log saved across sessions via `localStorage`.

### 6. Cyberpunk Lo-Fi Chiptune Audio Engine
- **Soothing Music Box Title Theme (60 BPM)**: Custom procedural FM bell synth (`Tone.PolySynth`) producing crystalline music box chimes with deep sub-bass triangle pads (Dmaj9, F#m7, Bm7, Gmaj7) for a relaxed title screen experience.
- **Decluttered Adaptive Combat & Exploration Soundtrack (108 BPM)**: Melancholic Amiga MOD tracker groove with spacious multi-bar rests between lead phrases, unhurried basslines, and 4-tier intensity modulation (0: Rest/Map, 1: Combat, 2: Elite/Shop, 3: Boss Overdrive).

---

## 🏗️ Architecture & Component Hierarchy

```
src/
├── audio/
│   └── soundManager.ts          # Tone.js procedural audio engine: Title music box & intensity-adaptive BGM
├── components/
│   ├── CardView.tsx             # Card renderer with Foil/Holo/Poly shaders, seal stamps, and inspect tooltips
│   ├── CharacterSelectView.tsx  # Operative loadout, Starter Deck carousel, and Ascension Stake selector
│   ├── CollectionView.tsx       # Cyber-Codex: Jokers, Augments, Decks, Stakes, Bosses, and Run Archive
│   ├── CombatView.tsx           # Blackjack combat table, Glass shattering, Seals, and combo multipliers
│   ├── DeckInspectionModal.tsx  # Full 52-card deck inspection drawer with suit filters and telemetry
│   ├── JokerSlotTray.tsx        # 6-slot Joker Matrix with reordering and Combo Link indicators
│   ├── ShopView.tsx             # Black Market store, owned Joker tray, swap modal, and Deck Workbench
│   ├── RunMapView.tsx           # Node-based sector map navigation
│   └── RewardView.tsx           # Post-encounter loot drafts with card augment tooltips
├── shared/
│   ├── careerManager.ts         # Persistent profile manager for lifetime statistics, unlocks, and run archive
│   ├── starterDecks.ts          # 5 Starter Deck configurations, perks, and custom deck modifiers
│   ├── stakes.ts                # 8 Cyber-Ascension difficulty stakes with escalating modifiers
│   ├── enhancements.ts          # Metadata and score multipliers for Enhancements, Editions, and Seals
│   ├── jokers.ts                # Joker definitions, archetype triggers, and Combo Link matrix
│   ├── consumables.ts           # Tactical items, Booster Packs, and Joker Matrix Expansion Voucher
│   ├── deck.ts                  # Standard deck generator, shuffle algorithms, and enhanced card builders
│   ├── bosses.ts                # Syndicate boss stats, portraits, and special protocols
│   ├── rules.ts                 # Blackjack scoring, dealer hit thresholds, and combo calculations
│   └── types.ts                 # Comprehensive TypeScript definitions
└── App.tsx                      # Root state machine: run lifecycle, inventory, and scene router
```
