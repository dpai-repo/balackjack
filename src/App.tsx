import React, { useState, useEffect } from 'react';
import {
  GameSettings,
  CombatStats,
  CharacterLoadout,
  Card,
  Joker,
  Consumable,
  Boss,
  CardEnhancementType,
  CardEditionType,
  CardSealType,
  StarterDeck,
  StakeLevel,
} from './shared/types';
import { RetroCRTWrapper } from './components/RetroCRTWrapper';
import { SettingsModal, DEFAULT_SETTINGS } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { CollectionView } from './components/CollectionView';
import { CharacterSelectView } from './components/CharacterSelectView';
import { RunMapView } from './components/RunMapView';
import { CombatView } from './components/CombatView';
import { RewardView } from './components/RewardView';
import { ShopView } from './components/ShopView';
import { LobbyView } from './components/LobbyView';
import { MultiplayerTable } from './components/MultiplayerTable';
import { DeckInspectionModal } from './components/DeckInspectionModal';
import { soundManager } from './audio/soundManager';
import { createStandardDeck, createRandomEnhancedCard } from './shared/deck';
import { getBossByAct } from './shared/bosses';
import { getJokerById, getRandomJokers } from './shared/jokers';
import { getConsumableById, getRandomConsumables } from './shared/consumables';
import { STARTER_DECKS, modifyDeckForStarter } from './shared/starterDecks';
import { STAKES_MAP } from './shared/stakes';
import { careerManager } from './shared/careerManager';

export type AppView =
  | 'main_menu'
  | 'character_select'
  | 'run_map'
  | 'combat'
  | 'reward'
  | 'shop'
  | 'multiplayer_lobby'
  | 'multiplayer_table'
  | 'collection'
  | 'victory'
  | 'game_over';

export default function App() {
  // SETTINGS STATE & LOCALSTORAGE
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('balackjack_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [stats, setStats] = useState<CombatStats>(() => {
    try {
      const saved = localStorage.getItem('balackjack_stats');
      return saved
        ? JSON.parse(saved)
        : {
            damageDealt: 0,
            damageTaken: 0,
            blackjacksDealt: 0,
            bustsOccurred: 0,
            roundsWon: 0,
            bossesDefeated: 0,
            highestSingleHit: 0,
          };
    } catch {
      return {
        damageDealt: 0,
        damageTaken: 0,
        blackjacksDealt: 0,
        bustsOccurred: 0,
        roundsWon: 0,
        bossesDefeated: 0,
        highestSingleHit: 0,
      };
    }
  });

  // UI MODALS
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // NAVIGATION VIEW
  const [currentView, setCurrentView] = useState<AppView>('main_menu');

  // SINGLE PLAYER CAMPAIGN RUN STATE
  const [act, setAct] = useState<number>(1);
  const [stageType, setStageType] = useState<'combat' | 'elite' | 'shop' | 'boss'>('combat');
  const [currentBoss, setCurrentBoss] = useState<Boss>(getBossByAct(1));
  const [playerCharacter, setPlayerCharacter] = useState<CharacterLoadout | null>(null);
  const [activeDeck, setActiveDeck] = useState<StarterDeck>(STARTER_DECKS[0]);
  const [activeStake, setActiveStake] = useState<StakeLevel>('white');

  // Boss stats scaled dynamically by active Cyber-Ascension Stake
  const currentBossWithStake = React.useMemo(() => {
    const stakeConfig = STAKES_MAP[activeStake];
    const hpMult = stakeConfig?.modifiers?.targetScoreMultiplier || 1.0;
    const scaledMaxHp = Math.round(currentBoss.maxHp * hpMult);
    return {
      ...currentBoss,
      maxHp: scaledMaxHp,
      hp: scaledMaxHp,
    };
  }, [currentBoss, activeStake]);
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(100);
  const [playerArmor, setPlayerArmor] = useState<number>(10);
  const [playerChips, setPlayerChips] = useState<number>(35);
  const [playerJokers, setPlayerJokers] = useState<Joker[]>([]);
  const [unlockedJokerSlots, setUnlockedJokerSlots] = useState<number>(5);
  const [playerConsumables, setPlayerConsumables] = useState<Consumable[]>([]);

  // REWARDS OFFERED
  const [offeredCards, setOfferedCards] = useState<Card[]>([]);
  const [offeredJokers, setOfferedJokers] = useState<Joker[]>([]);

  // SHOP OFFERED
  const [shopJokers, setShopJokers] = useState<Joker[]>([]);
  const [shopConsumables, setShopConsumables] = useState<Consumable[]>([]);

  // MULTIPLAYER ROOM JOIN STATE
  const [mpRoomCode, setMpRoomCode] = useState<string>('');
  const [mpPlayerName, setMpPlayerName] = useState<string>('Operative');
  const [mpCharId, setMpCharId] = useState<string>('card_sharp');
  const [mpIsPrivate, setMpIsPrivate] = useState<boolean>(false);

  // SCREEN SHAKE TRIGGER
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 250);
  };

  // SAVE PERSISTENCE
  useEffect(() => {
    localStorage.setItem('balackjack_settings', JSON.stringify(settings));
    soundManager.setVolumes(
      settings.masterVolume,
      settings.musicVolume,
      settings.sfxVolume,
      settings.musicMuted,
      settings.sfxMuted
    );
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('balackjack_stats', JSON.stringify(stats));
  }, [stats]);

  // UNLOCK AUDIO ON FIRST GESTURE
  const handleUserAudioGesture = async () => {
    if (!audioUnlocked) {
      const ok = await soundManager.unlockAudio();
      if (ok) {
        setAudioUnlocked(true);
        if (currentView === 'main_menu') {
          soundManager.playBgm('menu');
        }
      }
    }
  };

  // START NEW RUN WITH LOADOUT
  const handleStartRun = (char: CharacterLoadout, deck: StarterDeck, stake: StakeLevel) => {
    setActiveDeck(deck);
    setActiveStake(stake);
    setPlayerCharacter(char);
    setPlayerHp(char.hp);
    setPlayerMaxHp(char.maxHp);
    setPlayerArmor(char.armor);
    setPlayerChips(char.chips + deck.bonusChips);

    const startJoker = getJokerById(char.startingJokerId);
    setPlayerJokers(startJoker ? [startJoker] : []);
    setUnlockedJokerSlots(deck.startingJokerSlots);

    const startItem = getConsumableById(char.startingConsumableId);
    const initialItems: Consumable[] = startItem ? [startItem] : [];
    if (deck.startingConsumables) {
      deck.startingConsumables.forEach(cId => {
        const item = getConsumableById(cId);
        if (item) initialItems.push(item);
      });
    }
    setPlayerConsumables(initialItems);

    const baseDeck = createStandardDeck();
    setPlayerDeck(modifyDeckForStarter(baseDeck, deck.id));
    setAct(1);
    setStageType('combat');
    setCurrentBoss(getBossByAct(1));
    setCurrentView('run_map');
    soundManager.playBgm('combat');
    soundManager.setIntensity(0);
  };

  // ENTER ENCOUNTER NODE
  const handleEnterNode = () => {
    if (stageType === 'shop') {
      const jPool = getRandomJokers(3, playerJokers.map(j => j.id));
      const cPool = getRandomConsumables(3, unlockedJokerSlots);
      setShopJokers(jPool);
      setShopConsumables(cPool);
      soundManager.playBgm('shop');
      setCurrentView('shop');
    } else {
      soundManager.playBgm('boss');
      soundManager.setIntensity(2);
      setCurrentView('combat');
    }
  };

  // COMBAT VICTORY
  const handleCombatVictory = (remainingHp: number, remainingArmor: number, chipsEarned: number) => {
    setPlayerHp(remainingHp);
    setPlayerArmor(remainingArmor);
    setPlayerChips(prev => prev + chipsEarned);

    // Update Dossier Stats
    setStats(prev => ({
      ...prev,
      bossesDefeated: prev.bossesDefeated + 1,
      roundsWon: prev.roundsWon + 1,
      damageDealt: prev.damageDealt + currentBossWithStake.maxHp,
    }));

    careerManager.recordCombatStats({
      bossDefeated: true,
      damageDealt: currentBossWithStake.maxHp,
    });

    if (act >= 5) {
      careerManager.recordRunCompletion({
        id: `run-${Date.now()}`,
        timestamp: Date.now(),
        outcome: 'victory',
        act: 5,
        score: stats.damageDealt + 500,
        characterId: playerCharacter?.id || 'operative',
        deckId: activeDeck.id,
        stakeId: activeStake,
        jokersUsed: playerJokers.map(j => j.id),
        chipsEarned: playerChips + chipsEarned,
        cardsInDeckCount: playerDeck.length,
        enhancedCardCount: playerDeck.filter(c => c.enhancement || c.edition || c.seal).length,
      });
      setCurrentView('victory');
      soundManager.playBgm('victory');
    } else {
      // Generate reward choices
      const draftCards = [
        createRandomEnhancedCard(),
        createRandomEnhancedCard(),
        createRandomEnhancedCard(),
      ];
      const draftJokers = getRandomJokers(3, playerJokers.map(j => j.id));
      setOfferedCards(draftCards);
      setOfferedJokers(draftJokers);
      setCurrentView('reward');
    }
  };

  // COMBAT DEFEAT
  const handleCombatDefeat = () => {
    soundManager.playBust();
    setStats(prev => ({
      ...prev,
      bustsOccurred: prev.bustsOccurred + 1,
    }));
    careerManager.recordRunCompletion({
      id: `run-${Date.now()}`,
      timestamp: Date.now(),
      outcome: 'defeat',
      act,
      score: stats.damageDealt,
      characterId: playerCharacter?.id || 'operative',
      deckId: activeDeck.id,
      stakeId: activeStake,
      jokersUsed: playerJokers.map(j => j.id),
      chipsEarned: playerChips,
      cardsInDeckCount: playerDeck.length,
      enhancedCardCount: playerDeck.filter(c => c.enhancement || c.edition || c.seal).length,
      defeatReason: `Overpowered by ${currentBoss.name} in Act ${act}`,
    });
    setCurrentView('game_over');
  };

  // REWARD SELECTIONS
  const handlePickCard = (card: Card) => {
    setPlayerDeck(prev => [...prev, card]);
    advanceAfterReward();
  };

  const handlePickJoker = (joker: Joker) => {
    setPlayerJokers(prev => {
      if (prev.length >= unlockedJokerSlots) {
        // Swap oldest or replace
        return [...prev.slice(1), joker];
      }
      return [...prev, joker];
    });
    advanceAfterReward();
  };

  const handleRestHeal = () => {
    setPlayerHp(prev => Math.min(playerMaxHp, prev + 25));
    advanceAfterReward();
  };

  const advanceAfterReward = () => {
    const nextAct = act + 1;
    setAct(nextAct);
    setCurrentBoss(getBossByAct(nextAct));
    // Alternating node between Shop and Combat
    const nextType = nextAct % 2 === 0 ? 'shop' : 'combat';
    setStageType(nextType);
    setCurrentView('run_map');
    soundManager.playBgm('combat');
    soundManager.setIntensity(0);
  };

  return (
    <RetroCRTWrapper settings={settings} isShaking={isScreenShaking}>
      <div onClick={handleUserAudioGesture} className="min-h-screen flex flex-col justify-between">
        {/* TOP STATUS BAR */}
        <header className="px-4 py-2 border-b border-cyan-500/30 bg-black/70 backdrop-blur flex items-center justify-between text-xs z-30">
          <div className="flex items-center gap-3">
            <span
              onClick={() => {
                soundManager.playButtonClick();
                soundManager.playBgm('menu');
                setCurrentView('main_menu');
              }}
              className="font-pixel text-cyan-400 font-bold tracking-wider cursor-pointer hover:text-cyan-300 flex items-center gap-1.5"
            >
              <span>♠</span> BALACKJACK
            </span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 font-mono hidden sm:inline">ROGUELIKE PROTOCOL v1.0</span>
          </div>

          <div className="flex items-center gap-2">
            {!audioUnlocked && (
              <button
                onClick={handleUserAudioGesture}
                className="pixel-btn px-2.5 py-1 bg-yellow-400 text-black text-[10px] font-pixel rounded font-bold animate-pulse"
              >
                🔊 CLICK FOR AUDIO
              </button>
            )}

            {['run_map', 'combat', 'shop', 'reward'].includes(currentView) && (
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowDeckModal(true);
                }}
                className="pixel-btn px-2.5 py-1 bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400 text-cyan-300 text-[10px] font-pixel rounded flex items-center gap-1 shadow-sm"
              >
                <span>🎴</span> DECK ({playerDeck.length})
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowStats(true);
              }}
              className="pixel-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-pixel rounded"
            >
              🏆 DOSSIER
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setShowSettings(true);
              }}
              className="pixel-btn px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-pixel rounded flex items-center gap-1"
            >
              <span>⚙️</span> CONFIG
            </button>
          </div>
        </header>

        {/* MAIN BODY SCENES */}
        <main className="flex-1 flex flex-col justify-center items-center p-2 sm:p-4 z-20">
          {/* MAIN MENU */}
          {currentView === 'main_menu' && (
            <div className="max-w-md w-full p-6 text-center space-y-6">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded text-[11px] font-pixel text-cyan-300 tracking-widest uppercase animate-pulse">
                  NEURAL BLACKJACK COMBAT
                </div>
                <h1 className="font-pixel text-3xl sm:text-4xl text-cyan-400 glow-cyan tracking-wider">
                  BALACKJACK
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  Stack 21s, trigger cyber Jokers, augment cards, and conquer Cyber-Ascension stakes.
                </p>
                {/* Career stats summary strip */}
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-slate-800 rounded text-[10px] font-mono text-slate-400">
                  <span>Victories: <span className="text-emerald-400 font-bold font-pixel">{careerManager.getLifetimeStats().runsWon}</span></span>
                  <span>•</span>
                  <span>Blackjacks: <span className="text-yellow-400 font-bold font-pixel">{careerManager.getLifetimeStats().blackjacks}</span></span>
                  <span>•</span>
                  <span>Bosses: <span className="text-rose-400 font-bold font-pixel">{careerManager.getLifetimeStats().bossesDefeated}</span></span>
                </div>
              </div>

              {/* MENU BUTTONS */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setCurrentView('character_select');
                  }}
                  className="w-full pixel-btn py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs sm:text-sm font-bold rounded border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  SINGLE PLAYER CAMPAIGN [SOLO]
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setCurrentView('multiplayer_lobby');
                  }}
                  className="w-full pixel-btn py-3 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs sm:text-sm font-bold rounded border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  CO-OP MULTIPLAYER TABLES (2-6P)
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setCurrentView('collection');
                  }}
                  className="w-full pixel-btn py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-pixel text-xs rounded border border-cyan-500/40 shadow-sm"
                >
                  📚 CYBER-CODEX & RUN ARCHIVE
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowSettings(true);
                  }}
                  className="w-full pixel-btn py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-pixel text-xs rounded border-slate-700"
                >
                  CRT & AUDIO SETTINGS
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-500">
                Playable standalone browser game • Full-Stack server & client • Zero third-party runtime assets
              </div>
            </div>
          )}

          {/* CHARACTER SELECT */}
          {currentView === 'character_select' && (
            <CharacterSelectView
              onSelectLoadout={handleStartRun}
              onBack={() => setCurrentView('main_menu')}
            />
          )}

          {/* RUN MAP */}
          {currentView === 'run_map' && (
            <RunMapView
              currentAct={act}
              stageType={stageType}
              onEnterNode={handleEnterNode}
            />
          )}

          {/* SINGLE PLAYER COMBAT */}
          {currentView === 'combat' && (
            <CombatView
              boss={currentBossWithStake}
              playerDeck={playerDeck}
              playerHp={playerHp}
              playerMaxHp={playerMaxHp}
              playerArmor={playerArmor}
              playerChips={playerChips}
              playerJokers={playerJokers}
              unlockedJokerSlots={unlockedJokerSlots}
              onUpdateJokers={setPlayerJokers}
              onUpdateDeck={setPlayerDeck}
              playerConsumables={playerConsumables}
              stakeLevel={activeStake}
              onVictory={handleCombatVictory}
              onDefeat={handleCombatDefeat}
              onTriggerShake={triggerScreenShake}
            />
          )}

          {/* REWARD SCREEN */}
          {currentView === 'reward' && (
            <RewardView
              act={act}
              offeredCards={offeredCards}
              offeredJokers={offeredJokers}
              chipsReward={40}
              onPickCard={handlePickCard}
              onPickJoker={handlePickJoker}
              onSkipReward={advanceAfterReward}
              onRestHeal={handleRestHeal}
            />
          )}

          {/* SHOP SCREEN */}
          {currentView === 'shop' && (
            <ShopView
              playerChips={playerChips}
              playerDeck={playerDeck}
              shopJokers={shopJokers}
              shopConsumables={shopConsumables}
              unlockedSlots={unlockedJokerSlots}
              playerJokers={playerJokers}
              onReorderJokers={(newSlots) => {
                setPlayerJokers(newSlots.filter(Boolean) as Joker[]);
              }}
              onBuyJoker={(joker) => {
                setPlayerChips(prev => prev - joker.cost);
                setPlayerJokers(prev => [...prev, joker]);
                setShopJokers(prev => prev.filter(j => j.id !== joker.id));
              }}
              onReplaceJoker={(replacedJokerId, newJoker, refund) => {
                setPlayerChips(prev => prev - newJoker.cost + refund);
                setPlayerJokers(prev => prev.map(j => (j.id === replacedJokerId ? newJoker : j)));
                setShopJokers(prev => prev.filter(j => j.id !== newJoker.id));
                soundManager.playCardFlip();
                soundManager.playComboLink();
              }}
              onBuyConsumable={(item) => {
                setPlayerChips(prev => prev - item.cost);
                if (item.effectType === 'joker_slot_voucher') {
                  soundManager.playSlotUnlock();
                  setUnlockedJokerSlots(6);
                } else {
                  setPlayerConsumables(prev => [...prev, item]);
                }
                setShopConsumables(prev => prev.filter(c => c.id !== item.id));
              }}
              onEnhanceCard={(cardId, enhancement, cost) => {
                setPlayerChips(prev => prev - cost);
                setPlayerDeck(prev =>
                  prev.map(c => (c.id === cardId ? { ...c, enhancement } : c))
                );
                careerManager.recordCombatStats({ cardEnhanced: true });
              }}
              onApplyEdition={(cardId, edition, cost) => {
                setPlayerChips(prev => prev - cost);
                setPlayerDeck(prev =>
                  prev.map(c => (c.id === cardId ? { ...c, edition } : c))
                );
                careerManager.recordCombatStats({ cardEnhanced: true });
              }}
              onApplySeal={(cardId, seal, cost) => {
                setPlayerChips(prev => prev - cost);
                setPlayerDeck(prev =>
                  prev.map(c => (c.id === cardId ? { ...c, seal } : c))
                );
                careerManager.recordCombatStats({ cardEnhanced: true });
              }}
              onCloneCard={(cardId, cost) => {
                const target = playerDeck.find(c => c.id === cardId);
                if (target) {
                  setPlayerChips(prev => prev - cost);
                  setPlayerDeck(prev => [
                    ...prev,
                    { ...target, id: `card-clone-${Date.now()}-${Math.floor(Math.random() * 1000)}` },
                  ]);
                }
              }}
              onRemoveCard={(cardId, cost) => {
                setPlayerChips(prev => prev - cost);
                setPlayerDeck(prev => prev.filter(c => c.id !== cardId));
                careerManager.recordCombatStats({ cardShredded: true });
              }}
              onLeaveShop={() => {
                setStageType('combat');
                setCurrentView('run_map');
                soundManager.playBgm('combat');
                soundManager.setIntensity(0);
              }}
            />
          )}

          {/* MULTIPLAYER LOBBY */}
          {currentView === 'multiplayer_lobby' && (
            <LobbyView
              onJoinTable={(code, pName, cId, isPriv) => {
                setMpRoomCode(code);
                setMpPlayerName(pName);
                setMpCharId(cId);
                setMpIsPrivate(isPriv);
                setCurrentView('multiplayer_table');
              }}
              onBack={() => setCurrentView('main_menu')}
            />
          )}

          {/* MULTIPLAYER TABLE */}
          {currentView === 'multiplayer_table' && (
            <MultiplayerTable
              roomCode={mpRoomCode}
              playerName={mpPlayerName}
              characterId={mpCharId}
              isPrivate={mpIsPrivate}
              onLeaveTable={() => setCurrentView('multiplayer_lobby')}
              onTriggerShake={triggerScreenShake}
            />
          )}

          {/* COLLECTION DATABASE */}
          {currentView === 'collection' && (
            <CollectionView onBack={() => setCurrentView('main_menu')} />
          )}

          {/* CAMPAIGN VICTORY SCREEN */}
          {currentView === 'victory' && (
            <div className="max-w-md w-full p-6 text-center pixel-box border-2 border-yellow-400 bg-slate-900/90 rounded-lg space-y-4">
              <div className="text-4xl animate-bounce">🏆</div>
              <h1 className="font-pixel text-xl sm:text-2xl text-yellow-400 glow-gold">
                THE GRAND ALGORITHM COMPROMISED!
              </h1>
              <p className="text-xs font-mono text-slate-300">
                You shattered the Syndicate dealer bosses, conquered all 5 Acts, and claimed the cyber casino throne.
              </p>
              <div className="p-3 bg-black/40 rounded border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
                <div>Final Deck Size: {playerDeck.length} Cards</div>
                <div>Equipped Jokers: {playerJokers.length} Jokers</div>
                <div>Remaining Chips: {playerChips} 🪙</div>
              </div>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  soundManager.playBgm('menu');
                  setCurrentView('main_menu');
                }}
                className="w-full pixel-btn py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs font-bold rounded border-yellow-200"
              >
                RETURN TO MAIN TERMINAL
              </button>
            </div>
          )}

          {/* GAME OVER SCREEN */}
          {currentView === 'game_over' && (
            <div className="max-w-md w-full p-6 text-center pixel-box border-2 border-red-500 bg-red-950/40 rounded-lg space-y-4">
              <div className="text-4xl">💀</div>
              <h1 className="font-pixel text-xl sm:text-2xl text-red-400">
                OPERATIVE ELIMINATED
              </h1>
              <p className="text-xs font-mono text-slate-300">
                The Syndicate dealer crushed your hand in Act {act}. Reset your deck and attempt infiltration again.
              </p>
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  soundManager.playBgm('menu');
                  setCurrentView('main_menu');
                }}
                className="w-full pixel-btn py-2.5 bg-red-600 hover:bg-red-500 text-white font-pixel text-xs font-bold rounded border-red-400"
              >
                TRY AGAIN →
              </button>
            </div>
          )}
        </main>

        {/* FOOTER */}
        <footer className="px-4 py-2 border-t border-slate-800/80 bg-black/40 text-center text-[10px] font-mono text-slate-600 z-10">
          BALACKJACK • RETRO 21 ROGUELIKE & MULTIPLAYER TABLE CO-OP • AUTONOMOUS WEB ENGINE
        </footer>

        {/* MODALS */}
        {showSettings && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showStats && (
          <StatsModal
            stats={stats}
            onClose={() => setShowStats(false)}
          />
        )}

        {showDeckModal && (
          <DeckInspectionModal
            deck={playerDeck}
            onClose={() => setShowDeckModal(false)}
          />
        )}
      </div>
    </RetroCRTWrapper>
  );
}
