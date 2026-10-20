# Implementation Plan: Card Augmentation System, Cyber-Ascension Stakes & Codex Compendium

Building on the foundation of combat, the Joker Matrix, and intensity-adaptive tracker audio, this phase introduces deep deckbuilding manipulation, layered card augmentations, escalating ascension difficulty stakes, unlockable starter decks, and a comprehensive cyber-codex with run histories.

---

## 1. System Architecture & Feature Breakdown

### Phase 1: Full Card Augmentation Engine (Enhancements, Editions & Seals)
*Every card in the player's 52-card deck can be independently customized across three distinct layers (Balatro-style modularity):*

1. **Card Enhancement (Base Material/Function)**
   - `None`: Standard card.
   - `Cyber-Chip` (Bonus): +30 flat chips when scored.
   - `Overclocked` (Mult): +4 base attack mult when scored.
   - `Glass Card` (High Risk): x2.0 attack multiplier, but has a 1-in-4 (25%) chance to shatter permanently from the deck upon scoring.
   - `Steel Card` (Tactical Reserve): +1.5x attack multiplier while held in hand (not played), encouraging disciplined Stand decisions.
   - `Gold Card` (Passive Yield): Grants +$4 bonus chips if held in hand at the end of the round.
   - `Glitch Card` (Quantum Shifter): Dynamically adjusts rank value (1 to 10) to automatically prevent player bust on hit.
   - `Armored Card` (Defensive): Instantly grants +10 Armor to the player when dealt or drawn.
   - `Radioactive Card` (Poison): Inflicts 8 ongoing radiation damage directly to the Dealer's HP upon standing.
   - `Vampiric Card` (Siphon): Restores +6 player HP on round victory.

2. **Card Edition (Holographic Foil Layer)**
   - `Standard`: Clean dark cyberpunk card frame.
   - `Foil`: +50 Chips on score with a cyan metallic gradient sheen.
   - `Holographic`: +10 Mult on score with an iridescent animated shifting shimmer.
   - `Polychrome`: x1.5 Mult on score with a cycling RGB chromatic aberration glow.

3. **Card Seal (Wax/Circuit Microchip Stamp)**
   - `Red Seal` (Retrigger): Scores and triggers all card effects twice.
   - `Gold Seal` (Instant Bounty): Earns +$3 credits immediately when this card is scored.
   - `Blue Seal` (Gear Protocol): Creates a random Tactical Consumable if held in hand at the end of the round (if consumable slot available).
   - `Purple Seal` (Hack Protocol): Spawns a random Cyber-Mod augmentation card when discarded.

4. **Black Market Deck Services & Mod Packs**
   - **Shredder / Card Removal Bay**: Pay credits ($20 base, scaling +$5 per use) to permanently delete weak or clunky cards (e.g. 2s, 3s, or high bust cards) from the active deck.
   - **DNA Cloning Vat / Card Duplication**: Pay credits ($40) to create an exact duplicate of any augmented card in the deck.
   - **Cyber-Mod Booster Packs**: Buyable packs in the shop containing 3 choices of card enhancements, foils, or seals to immediately apply to any card in the deck.

---

### Phase 2: Cyber-Ascension Stakes & Meta-Progression

1. **8 Cyber-Ascension Stakes (Progressive Difficulty Modifiers)**
   - `White Stake` (Street Runner - Standard): Standard baseline gameplay.
   - `Red Stake` (Mercenary): Small blind / minor mob nodes award no credit payout.
   - `Green Stake` (Sub-Net Infiltrator): Required combat score targets scale 20% faster per act.
   - `Blue Stake` (Firewall Protocol): -1 Discard per combat encounter.
   - `Purple Stake` (Corporate Inflation): Shop rerolls and store items increase by +$2 per completed act.
   - `Orange Stake` (Black Market Scarcity): Booster packs cost +$3; Jokers have a chance to be **Perishable** (deactivates after 5 rounds).
   - `Gold Stake` (Syndicate Debt): Jokers have a chance to be **Rental** (costs -$3 chips upkeep at the end of every round).
   - `Cyber-Overdrive Stake` (AI Singularity): Boss abilities trigger on both Hit and Stand, with aggressive glitch debuffs applied to dealt cards.

2. **Unlockable Starter Decks**
   - **Neon Starter Deck**: Standard 52-card balanced deck, default credits.
   - **High-Roller Deck**: Starts with 80 bonus credits, +$2 maximum interest cap, but begins with 1 fewer discard.
   - **Tactical Spec-Ops Deck**: Starts with +1 consumable slot and an EMP Jammer & Medkit in inventory.
   - **Quantum Glitch Deck**: Starts with 4 random face cards pre-augmented with Glitch and Polychrome; begins with 1 fewer starting Joker slot (4/6).
   - **Syndicate Deck**: Starts with 6 unlocked Joker slots, shop rerolls cost half, but debts accrue higher interest penalties on loss.

3. **Persistent Career Profile (`localStorage`)**
   - Automatically tracks lifetime career statistics: Total Blackjacks, lifetime damage dealt, peak hand score, bosses eliminated, and win/loss ratio.
   - Tracks highest stake beaten for each starter deck with visual completion badges.
   - Unlocks new Jokers, Decks, and Consumables as lifetime milestones are achieved.

---

### Phase 3: Interactive Cyber-Codex & Run History Compendium

1. **Cyber-Codex Database View**
   - **Joker Matrix Catalog**: All 30+ Jokers displayed with discovery silhouettes, rarity frames, affinity links, flavor lore, and lifetime stats (times picked, win rate).
   - **Augmentation & Seal Guide**: Full visual cards showcasing all enhancements, foils, and seals with animated sample previews.
   - **Tactical Gear Catalog**: Deep dive into consumable hacks, vouchers, and deployables.
   - **Boss Dossier**: Complete tactical intel on all bosses (The Cyber-Dealer, Neon Enforcer, Quantum Core, The Syndicate Queen, etc.) and their specific mechanics.

2. **Run History Archive**
   - Stores the 20 most recent runs in persistent storage.
   - Displays character loadout, starter deck, stake level, final act reached, victory/defeat banner, score, equipped Joker Matrix layout, and game-over cause.
   - Ability to review the winning or losing deck state and share/export a run summary.

3. **Visual & Tactile Enhancements**
   - Upgraded `CardView` with dynamic SVG/CSS foil shaders, chromatic glow borders for Polychrome, holographic specular shimmers, and seal icons in the top-right corner.
   - Card Inspection Modal: Clicking cards in the deck viewer, rewards, or shop opens an inspection drawer showing exact scoring breakdowns and tooltips.

---

## 2. File Changes & New Modules

| Path | Action | Description |
|------|--------|-------------|
| `src/shared/types.ts` | Modify | Expand `Card` with `edition`, `seal`, `isShattered`, `perishableTurns`, `isRental`; add `StakeLevel`, `StarterDeck`, `RunHistoryRecord`, `CareerProfile` types. |
| `src/shared/enhancements.ts` | Modify | Define meta, scoring calculations, and visual styles for all enhancements, editions (Foil/Holo/Poly), and seals (Red/Gold/Blue/Purple). |
| `src/shared/stakes.ts` | Create | Define the 8 Cyber-Ascension Stakes, their rule modifiers, and reward unlock requirements. |
| `src/shared/starterDecks.ts` | Create | Define starter decks with custom starting compositions, perks, and unlock conditions. |
| `src/shared/careerManager.ts` | Create | Persistent profile service for tracking career stats, stake completion, codex unlocks, and run archives. |
| `src/components/CardView.tsx` | Modify | Add rendering for foil shaders, holographic animations, polychrome color cycle, seal stamps, and status badges. |
| `src/components/DeckInspectionModal.tsx` | Create | Full deck review modal with filter/sort by suit, rank, and augmentations, plus card inspect tooltips. |
| `src/components/ShopView.tsx` | Modify | Integrate Deck Services (Shredder/Clone) and Cyber-Mod Booster Packs with card selection overlays. |
| `src/components/CombatView.tsx` | Modify | Execute Glass card shatter checks, Steel card passive hand mults, Gold card yields, and Seal retrigger logic. |
| `src/components/CharacterSelectView.tsx` | Modify | Add Starter Deck selection carousel and Ascension Stake selector with unlock requirements. |
| `src/components/CollectionView.tsx` | Modify | Upgrade into the full Cyber-Codex with tabs for Jokers, Augments, Bosses, Gear, Run History, and Career Stats. |
| `src/App.tsx` | Modify | Connect career profile state, stake rules, run history logging upon victory/defeat, and codex routing. |

---

## 3. Verification & Testing Strategy
1. **Compilation & Type Safety**: Ensure all new types (`edition`, `seal`, `StakeLevel`, `StarterDeck`) are strictly typed without `any`. Verify clean `compile_applet` and `lint_applet`.
2. **Combat Scoring Verification**:
   - Verify Red Seal retriggers a scored card's chips and mults exactly twice.
   - Verify Steel cards in hand boost total score multiplier without being played.
   - Verify Glass card triggers 2.0x multiplier and rolls 25% shatter test with sound effect and particle burst.
   - Verify Gold and Blue Seals award credits and consumables at round conclusion.
3. **Store & Deck Services**:
   - Test Card Shredder removing cards down to minimum deck size.
   - Test Card Duplication cloning augmentations, editions, and seals.
   - Test Cyber-Mod booster pack picking and applying to selected card.
4. **Stakes & Persistence**:
   - Verify high stakes enforce modifiers (e.g. -1 Discard on Blue Stake, higher score requirements on Green Stake).
   - Verify Run History persists across browser refreshes and correctly archives defeat or victory states with the equipped Joker build.
