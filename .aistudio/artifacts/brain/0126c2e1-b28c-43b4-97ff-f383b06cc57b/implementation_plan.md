# Implementation Plan: Joker Slot Mechanics, Soothing Audio Overhaul & README Documentation

Refining the Joker inventory lifecycle, store integration, musical atmosphere, and project documentation to reflect the current state of Balackjack.

---

## 1. Joker Slot Mechanics & Store Overhaul

### 1.1 Capacity & Initial State (5 of 6 Slots)
- **Starting Capacity**: Update default run state in `src/App.tsx` and character definitions so players start with **5 unlocked Joker slots** out of a maximum of **6**.
- **Joker Slot Upgrade Card ("Matrix Expansion Voucher")**:
  - Introduce a special Consumable item: `joker_slot_voucher` ("Joker Matrix Expansion Voucher").
  - Description: *"Consumable. Permanently unlocks the 6th and final Joker slot. Consumed on activation."*
  - **Store Spawn Probability**: When rolling shop items in `generateShopConsumables()`, if `unlockedJokerSlots < 6`, give this expansion voucher a weighted chance (~40–50%) to spawn in the store. Once 6 slots are unlocked, it is removed from future shop pools.
  - **Consumption Flow**: Purchasing/using the voucher plays `soundManager.playSlotUnlock()`, increments `unlockedJokerSlots` to 6, and is consumed.

### 1.2 Owned Jokers Display in Shop
- Integrate the player's active Joker tray directly into `src/components/ShopView.tsx`.
- Visual cues: Display currently slotted Jokers, their active positions, and adjacency synergy indicators so players can inspect current combos before making a purchase.
- Provide quick stats: Current slots used (`X / 5` or `X / 6`) and instant visibility into which Jokers are equipped.

### 1.3 Joker Capacity Replacement Modal (with Partial Refund)
- **Trigger**: When the player attempts to purchase a Joker from the shop and `playerJokers.length >= unlockedJokerSlots`:
  - Instead of blocking the purchase or automatically failing, open an interactive **Joker Swap Modal**.
- **Modal Features**:
  - Displays the **New Joker** being considered on the left.
  - Displays all **Currently Equipped Jokers** on the right with a "Select to Replace" action.
  - **Partial Chip Refund**: Each equipped Joker displays its trade-in value (50% of base rarity cost). Replacing an equipped Joker refunds those chips to offset the purchase price!
  - **Cancel Option**: "Keep Current Roster (Cancel Purchase)" cleanly dismisses the modal with zero chips spent and no state changes.
  - **Confirmation Action**: Swaps the selected Joker with the new Joker, applies net chip calculation, plays `playCardFlip()` / `playComboLink()`, and updates the roster.

---

## 2. Audio Revamp: Soothing Title Theme & Decluttered Soundtrack

### 2.1 Dedicated Soothing Title Screen Theme
- **Thematic Sound**: Soft music box chime / bell synth combined with deep, warm sub-bass chords in a slow, peaceful 60 BPM tempo.
- **Synthesizer Implementation**:
  - High-register FM synth voice with bell-like attack and gentle release (`Tone.PolySynth` with custom FM modulation).
  - Slow, sustained triangle sub-bass voice that anchors the harmony with warm 7th chords (Dmaj9, F#m7, Bm7, Gmaj7).
  - Soft tape flutter emulation with low-pass filtering (1.8 kHz) for cozy, nostalgic warmth.
  - Dedicated trigger: `soundManager.playBgm('menu')` runs this pre-generated peaceful composition, immediately soothing the player on app load.

### 2.2 Gameplay Soundtrack Decluttering ("Less Busy Overall")
- **Open Bar Rests & Breathing Room**:
  - Eliminate relentless 16th-note tracker runs.
  - Rewrite lead patterns to use spaced 8th-note and dotted quarter phrases with full-measure pauses, allowing the groove and ambience to shine.
- **Sustained Harmony**:
  - Replace rapid tracker arpeggio rolls with sustained, warm pad chords that hold over 2–4 bars.
- **Sparser Rhythm Section**:
  - Clean kick and snare accents on downbeats only, with delicate ghost percussion.
  - Reduced percussion density across intensity tiers so combat remains tension-filled without causing auditory fatigue.
- **Seamless Intensity Modulation**:
  - Maintain the 4 dynamic intensity tiers (calm shop, focused combat, stand tension, boss stakes) but ensure stems layer gracefully on top of the relaxed foundational groove.

---

## 3. README.md Documentation Update

### 3.1 Synchronize Features & Project Architecture
- **Joker Matrix System**:
  - Document the slot capacity mechanics (starts with 5 slots, expandable to 6 via shop-spawned consumable expansion vouchers).
  - Document drag-and-drop slot reordering and Joker adjacency synergy multipliers (Combo Links).
  - Document the Black Market trade-in and replacement dialog with partial chip refunds.
- **Amiga MOD Tracker Audio Architecture**:
  - Detail the procedural synthesizer engine: Paula DAC filter emulation, 64-bar progressive compositions, 4-tier real-time dynamic intensity stem crossfading.
  - Highlight the dedicated soothing music box and sub-bass title screen theme.
- **Directory Structure & Components**:
  - Update the file tree in `README.md` to include recently added core components (`JokerSlotTray.tsx`, expanded sound manager stems, enhancement systems).
- **Verified Milestones**:
  - Add completed milestones covering Phase 2 & 3 evolutions: Adjacency Combo Links, Tracker Audio Revamp, Matrix Expansion Vouchers, and Adaptive UI.

---

## 4. Verification & Testing Plan

1. **Joker Slot Verification**:
   - Verify starting a new run initializes with 5 active slots out of 6.
   - Verify `JokerSlotTray` renders 5 enabled slots and 1 locked 6th slot.
   - Verify store has a chance to generate the Matrix Expansion Voucher.
   - Purchasing the voucher unlocks slot 6, consumes the voucher, and disables further voucher spawns.
2. **Store Joker Swap Modal Verification**:
   - Fill 5 Joker slots, attempt to purchase a 6th Joker.
   - Verify the swap modal appears with side-by-side comparison, refund value calculation, and cancel button.
   - Test both "Cancel" (no chips spent) and "Replace" (chips deducted with refund offset, new Joker equipped).
3. **Audio Quality & Balance Verification**:
   - Launch app: Verify the title screen plays the soothing music box bells with slow sub-bass chords.
   - Enter combat: Verify the gameplay soundtrack transitions smoothly, feeling spacious, chill, and uncluttered.
   - Test volume sliders and mute toggles in settings.
4. **README & Build Integrity**:
   - Verify `README.md` formatting, links, code blocks, and accuracy.
   - Run `npm test`, `lint_applet`, and `compile_applet` to ensure zero compilation or type errors.
