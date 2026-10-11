import React, { useState, useEffect, useRef } from 'react';
import { NetworkRoomState, NetworkPlayer, ClientAction } from '../shared/types';
import { CardView } from './CardView';
import { soundManager } from '../audio/soundManager';

interface MultiplayerTableProps {
  roomCode: string;
  playerName: string;
  characterId: string;
  isPrivate: boolean;
  onLeaveTable: () => void;
  onTriggerShake: () => void;
}

export const MultiplayerTable: React.FC<MultiplayerTableProps> = ({
  roomCode,
  playerName,
  characterId,
  isPrivate,
  onLeaveTable,
  onTriggerShake,
}) => {
  const [roomState, setRoomState] = useState<NetworkRoomState | null>(null);
  const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?room=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(
      playerName
    )}&char=${encodeURIComponent(characterId)}&private=${isPrivate}`;

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setErrorMsg(null);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'state_update') {
          const nextState: NetworkRoomState = payload.state;
          setRoomState(nextState);

          // Find local player ID by matching name
          const found = Object.values(nextState.players).find(p => p.name === playerName);
          if (found && !localPlayerId) {
            setLocalPlayerId(found.id);
          }

          if (nextState.phase === 'dealer_turn') {
            soundManager.playCardFlip();
          } else if (nextState.phase === 'round_resolution') {
            soundManager.playAttack();
            onTriggerShake();
          }
        }
      } catch (e) {
        console.error('Error parsing socket event:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setErrorMsg('Connection error encountered with table server.');
    };

    return () => {
      ws.close();
    };
  }, [roomCode, playerName, characterId, isPrivate]);

  const sendAction = (action: ClientAction) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(action));
    }
  };

  if (!roomState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="font-pixel text-cyan-400 text-lg mb-3 animate-pulse">CONNECTING TO CO-OP PROTOCOL...</div>
        <p className="text-xs font-mono text-slate-400 mb-6">Synchronizing neural bridge with Room #{roomCode || 'MATCH'}</p>
        {errorMsg && <div className="text-red-400 font-mono text-xs mb-4">{errorMsg}</div>}
        <button
          onClick={onLeaveTable}
          className="pixel-btn px-4 py-2 bg-slate-800 text-slate-300 text-xs font-pixel rounded"
        >
          CANCEL
        </button>
      </div>
    );
  }

  const playersList = Object.values(roomState.players);
  const me = localPlayerId ? roomState.players[localPlayerId] : playersList[0];
  const isHost = me?.isHost;

  return (
    <div className="max-w-6xl mx-auto w-full p-2 sm:p-4 flex flex-col justify-between min-h-[90vh]">
      {/* TABLE HEADER & BOSS STATUS */}
      <div className="pixel-box p-3 sm:p-4 rounded-lg border-2 border-red-900/80 bg-red-950/20 mb-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-900/40 border border-red-500/50 flex items-center justify-center font-pixel text-xl shadow-inner">
              👹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-xs sm:text-sm text-red-400 font-bold">{roomState.boss.name}</h2>
                <span className="text-[10px] font-pixel bg-red-900 text-red-100 px-2 py-0.5 rounded border border-red-700">
                  ACT {roomState.actNumber}
                </span>
                <span className="text-[10px] font-pixel bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
                  TABLE #{roomState.roomCode}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">{roomState.boss.title}</div>
            </div>
          </div>

          {/* BOSS HEALTH & ACTION TIMER */}
          <div className="flex items-center gap-6 w-full sm:w-auto">
            {roomState.phase === 'player_turn' && (
              <div className="text-center">
                <div className="text-[10px] font-pixel text-yellow-400">TURN TIME</div>
                <div className="font-pixel text-lg text-yellow-300 animate-pulse">
                  {roomState.turnTimeRemaining}s
                </div>
              </div>
            )}

            <div className="w-full sm:w-64 space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-red-400 font-bold">SHARED BOSS HP</span>
                <span className="text-slate-200">
                  {roomState.bossHp}/{roomState.bossMaxHp}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                  style={{ width: `${Math.max(0, (roomState.bossHp / roomState.bossMaxHp) * 100)}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onLeaveTable();
              }}
              className="pixel-btn px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-pixel rounded"
            >
              LEAVE
            </button>
          </div>
        </div>

        {/* BOSS PROTOCOL BANNER */}
        <div className="mt-2.5 pt-2 border-t border-red-950 text-xs font-mono text-red-300/80 flex items-center justify-between">
          <div><span className="text-red-400 font-bold">PROTOCOL:</span> {roomState.boss.specialRule}</div>
          <div className="text-slate-400 font-pixel text-[10px] uppercase">PHASE: {roomState.phase}</div>
        </div>
      </div>

      {/* DEALER TABLE CARDS */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-xs font-pixel text-slate-400 mb-2 flex items-center gap-2">
          <span>DEALER CARDS:</span>
          <span className="text-red-300 font-bold">
            {roomState.phase === 'player_turn'
              ? `${roomState.bossHandCalc.total} + ?`
              : `${roomState.bossHandCalc.total}`}
          </span>
          {roomState.bossHandCalc.isBlackjack && <span className="text-yellow-400 font-bold">BLACKJACK!</span>}
          {roomState.bossHandCalc.isBust && <span className="text-emerald-400 font-bold">DEALER BUST!</span>}
        </div>
        <div className="flex items-center justify-center gap-3 min-h-[110px]">
          {roomState.bossCards.map(card => (
            <CardView key={card.id} card={card} compact={false} />
          ))}
        </div>
      </div>

      {/* LOBBY PRE-GAME SCREEN */}
      {roomState.phase === 'lobby' && (
        <div className="pixel-box p-6 rounded-lg border-2 border-cyan-500/50 bg-slate-900/90 text-center max-w-lg mx-auto my-4 w-full">
          <h3 className="font-pixel text-sm text-cyan-300 mb-2">OPERATIVES IN ASSEMBLY ({playersList.length}/6)</h3>
          <p className="text-xs font-mono text-slate-400 mb-4">
            Invite allies using Room Code <span className="text-yellow-400 font-bold font-pixel">#{roomState.roomCode}</span>.
          </p>

          <div className="space-y-2 mb-6">
            {playersList.map(p => (
              <div key={p.id} className="p-2 bg-black/40 rounded border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200">{p.name} {p.isHost && '(Host)'} {p.isBot && '(AI)'}</span>
                <span className={p.isReady ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {p.isReady ? 'READY' : 'STANDBY'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                sendAction({ type: 'ready' });
              }}
              className="pixel-btn px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs font-bold rounded border-yellow-200"
            >
              TOGGLE READY
            </button>

            {isHost && (
              <>
                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    sendAction({ type: 'add_bot' });
                  }}
                  className="pixel-btn px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs font-bold rounded border-purple-400"
                >
                  + ADD AI BOT
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    sendAction({ type: 'start_game' });
                  }}
                  className="pixel-btn px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs font-bold rounded border-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  START MISSION →
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CO-OP PLAYERS SEATS (2 to 6 Players) */}
      {roomState.phase !== 'lobby' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
          {playersList.map(player => {
            const isMe = player.id === me?.id;
            return (
              <div
                key={player.id}
                className={`pixel-box p-2.5 rounded-lg border-2 transition-all flex flex-col justify-between ${
                  isMe
                    ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                {/* Speech Bubble / Ping */}
                {player.pingText && (
                  <div className="bg-yellow-400 text-black text-[10px] font-pixel p-1 rounded mb-1 text-center animate-bounce">
                    "{player.pingText}"
                  </div>
                )}

                <div>
                  {/* Player Name & Role */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-pixel text-[11px] truncate ${isMe ? 'text-cyan-300 font-bold' : 'text-slate-200'}`}>
                      {player.name}
                    </span>
                    <span className="text-[9px] font-pixel px-1 rounded bg-black/40 text-slate-400">
                      {player.characterId.substring(0, 4)}
                    </span>
                  </div>

                  {/* HP & Armor */}
                  <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                    <span className="text-emerald-400 font-bold">{player.hp}/{player.maxHp} HP</span>
                    {player.armor > 0 && <span className="text-cyan-400">+{player.armor} Arm</span>}
                  </div>

                  {/* Cards Dealt */}
                  <div className="flex items-center justify-center gap-1 my-1 min-h-[60px]">
                    {player.hand.map(card => (
                      <CardView key={card.id} card={card} compact />
                    ))}
                  </div>
                </div>

                {/* Hand Value & Turn Status Badge */}
                <div className="mt-2 pt-1.5 border-t border-slate-800 text-center">
                  <div className="text-[11px] font-pixel text-slate-300">
                    VAL: <span className="text-yellow-400">{player.handCalc.total}</span>
                  </div>
                  <div className={`text-[9px] font-pixel uppercase mt-0.5 ${
                    player.status === 'stood'
                      ? 'text-yellow-400'
                      : player.status === 'busted'
                      ? 'text-red-400'
                      : player.status === 'knocked_out'
                      ? 'text-slate-500'
                      : 'text-cyan-400 animate-pulse'
                  }`}>
                    {player.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOCAL CONTROLS FOR CURRENT PLAYER */}
      {roomState.phase === 'player_turn' && me && (
        <div className="pixel-box p-3 rounded-lg border-2 border-cyan-500/50 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-slate-400 font-mono">YOUR TOTAL</div>
              <div className="font-pixel text-base text-cyan-300 font-bold">
                {me.handCalc.total} {me.handCalc.isSoft && '(Soft)'}
              </div>
            </div>
            {/* Quick Ping Buttons */}
            <div className="flex gap-1.5">
              {['21!', 'Heal!', 'Push!', 'Nice!'].map(ping => (
                <button
                  key={ping}
                  onClick={() => {
                    soundManager.playButtonClick();
                    sendAction({ type: 'send_ping', text: ping });
                  }}
                  className="pixel-btn px-2 py-1 bg-black/60 border border-slate-700 hover:border-yellow-400 text-yellow-300 text-[9px] font-pixel rounded"
                >
                  {ping}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={me.status !== 'acting'}
              onClick={() => {
                soundManager.playHit();
                sendAction({ type: 'hit' });
              }}
              className={`pixel-btn px-6 py-2.5 font-pixel text-xs sm:text-sm font-bold rounded border ${
                me.status === 'acting'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              HIT [H]
            </button>
            <button
              disabled={me.status !== 'acting'}
              onClick={() => {
                soundManager.playStand();
                sendAction({ type: 'stand' });
              }}
              className={`pixel-btn px-6 py-2.5 font-pixel text-xs sm:text-sm font-bold rounded border ${
                me.status === 'acting'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              STAND [S]
            </button>
          </div>
        </div>
      )}

      {/* ROUND RESOLUTION OR REWARD NEXT TURN BUTTON */}
      {(roomState.phase === 'round_resolution' || roomState.phase === 'reward') && isHost && (
        <div className="flex justify-center my-3">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              sendAction({ type: 'next_round' });
            }}
            className="pixel-btn px-8 py-3 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs sm:text-sm font-bold rounded border-yellow-200 animate-pulse shadow-lg"
          >
            {roomState.phase === 'reward' ? 'ADVANCE TO NEXT ENCOUNTER →' : 'COMMENCE NEXT ROUND →'}
          </button>
        </div>
      )}

      {/* COMBAT ACTIVITY LOG */}
      <div className="mt-3 p-2 bg-black/60 rounded border border-slate-800 max-h-24 overflow-y-auto text-[11px] font-mono text-slate-400 space-y-0.5">
        {roomState.logMessages.slice(-5).map((log, i) => (
          <div key={i} className="truncate">{log}</div>
        ))}
      </div>
    </div>
  );
};
