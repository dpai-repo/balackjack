import React, { useState, useEffect } from 'react';
import { CHARACTERS } from '../shared/characters';
import { CharacterLoadout } from '../shared/types';
import { soundManager } from '../audio/soundManager';

interface LobbyViewProps {
  onJoinTable: (roomCode: string, playerName: string, characterId: string, isPrivate: boolean) => void;
  onBack: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ onJoinTable, onBack }) => {
  const [playerName, setPlayerName] = useState<string>(() => `Agent-${Math.floor(1000 + Math.random() * 9000)}`);
  const [characterId, setCharacterId] = useState<string>(CHARACTERS[0].id);
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [publicLobbies, setPublicLobbies] = useState<Array<{
    code: string;
    playersCount: number;
    maxPlayers: number;
    bossName: string;
    phase: string;
  }>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLobbies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lobbies');
      if (res.ok) {
        const data = await res.json();
        setPublicLobbies(data.lobbies || []);
      }
    } catch {
      // Offline / dev fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickMatch = () => {
    soundManager.playButtonClick();
    onJoinTable('', playerName, characterId, false);
  };

  const handleCreatePrivate = () => {
    soundManager.playButtonClick();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    onJoinTable(code, playerName, characterId, true);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    soundManager.playButtonClick();
    onJoinTable(roomCodeInput.trim().toUpperCase(), playerName, characterId, false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 text-slate-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="font-pixel text-xl sm:text-2xl text-cyan-400 glow-cyan flex items-center gap-2">
            <span>🌐</span> CO-OP NETWORK MATCHMAKING
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            2 to 6 Operatives team up against the Syndicate Dealer Bosses.
          </p>
        </div>
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onBack();
          }}
          className="pixel-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-pixel rounded"
        >
          ← MAIN MENU
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* OPERATIVE IDENTITY */}
        <div className="pixel-box p-4 rounded-lg border border-slate-800 bg-slate-900/80">
          <h2 className="font-pixel text-xs text-yellow-400 mb-3 flex items-center gap-1.5">
            <span>👤</span> Operative Identity
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Callsign / Name:</label>
              <input
                type="text"
                maxLength={14}
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded font-pixel text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">Specialization Class:</label>
              <div className="space-y-1.5">
                {CHARACTERS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      soundManager.playButtonClick();
                      setCharacterId(c.id);
                    }}
                    className={`w-full p-2 text-left rounded border transition-all flex items-center justify-between ${
                      characterId === c.id
                        ? 'border-cyan-400 bg-cyan-950/40 text-white'
                        : 'border-slate-800 bg-black/30 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-pixel text-[11px] text-cyan-300">{c.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{c.title}</div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: c.color }}>•</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* QUICK MATCH & PRIVATE ROOM */}
        <div className="pixel-box p-4 rounded-lg border border-slate-800 bg-slate-900/80 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="font-pixel text-xs text-cyan-400 mb-3 flex items-center gap-1.5">
              <span>🚀</span> Instant Deployment
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-pixel text-xs text-cyan-300 mb-1">QUICK MATCH</h3>
                  <p className="text-xs text-slate-400 font-mono mb-4">
                    Instantly enter the nearest public table or spin up an automated session.
                  </p>
                </div>
                <button
                  onClick={handleQuickMatch}
                  className="w-full pixel-btn py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-pixel text-xs font-bold rounded border-cyan-300"
                >
                  DEPLOY TO TABLE →
                </button>
              </div>

              <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-500/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-pixel text-xs text-purple-300 mb-1">CREATE PRIVATE TABLE</h3>
                  <p className="text-xs text-slate-400 font-mono mb-4">
                    Generates a 4-letter secret code (e.g. ACES) to invite friends.
                  </p>
                </div>
                <button
                  onClick={handleCreatePrivate}
                  className="w-full pixel-btn py-2 bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs font-bold rounded border-purple-400"
                >
                  GENERATE PRIVATE CODE →
                </button>
              </div>
            </div>

            {/* JOIN BY CODE FORM */}
            <form onSubmit={handleJoinByCode} className="p-3 bg-black/40 rounded border border-slate-800 flex items-center gap-3">
              <span className="text-xs font-pixel text-slate-400 whitespace-nowrap">JOIN BY CODE:</span>
              <input
                type="text"
                placeholder="ROOM CODE"
                maxLength={6}
                value={roomCodeInput}
                onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full px-3 py-1 bg-slate-900 border border-slate-700 rounded font-pixel text-xs text-yellow-300 tracking-widest focus:outline-none focus:border-yellow-400 uppercase"
              />
              <button
                type="submit"
                className="pixel-btn px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-pixel text-xs font-bold rounded border-yellow-300 whitespace-nowrap"
              >
                JOIN
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Co-op Support: 2 to 6 Players</span>
            <span>Shared Dealer Boss • Individual HP</span>
          </div>
        </div>
      </div>

      {/* PUBLIC LOBBIES LIST */}
      <div className="pixel-box p-4 rounded-lg border border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-pixel text-xs text-emerald-400 flex items-center gap-1.5">
            <span>📡</span> Active Public Tables {loading && '(Scanning...)'}
          </h2>
          <button
            onClick={fetchLobbies}
            className="text-xs text-slate-400 hover:text-white font-mono underline"
          >
            Refresh List
          </button>
        </div>

        {publicLobbies.length === 0 ? (
          <div className="p-6 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded">
            No public rooms currently broadcasting. Click <span className="text-cyan-400">Quick Match</span> or <span className="text-purple-400">Create Private Table</span> above to start a session!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {publicLobbies.map(lobby => (
              <div
                key={lobby.code}
                onClick={() => {
                  soundManager.playButtonClick();
                  onJoinTable(lobby.code, playerName, characterId, false);
                }}
                className="p-3 bg-black/50 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 rounded cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-pixel text-xs text-yellow-300">TABLE #{lobby.code}</div>
                  <div className="text-[11px] font-mono text-slate-400">Boss: {lobby.bossName}</div>
                </div>
                <div className="text-right">
                  <div className="font-pixel text-xs text-emerald-400">{lobby.playersCount}/{lobby.maxPlayers}</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{lobby.phase}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
