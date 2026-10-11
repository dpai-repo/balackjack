import { GameRoom } from './room';

export class Matchmaker {
  private rooms: Map<string, GameRoom> = new Map();

  public getOrCreateRoom(code: string, isPrivate: boolean = false): GameRoom {
    const cleanCode = code.toUpperCase().trim();
    let room = this.rooms.get(cleanCode);
    if (!room) {
      room = new GameRoom(cleanCode, isPrivate);
      room.setOnEmpty(() => {
        this.rooms.delete(cleanCode);
      });
      this.rooms.set(cleanCode, room);
    }
    return room;
  }

  public findQuickMatchRoom(): GameRoom {
    // Find open public room with < 6 players
    for (const room of this.rooms.values()) {
      if (!room.isPrivate && room.state.phase === 'lobby' && Object.keys(room.state.players).length < 6) {
        return room;
      }
    }
    // Else generate new random code
    const newCode = this.generateRandomCode();
    return this.getOrCreateRoom(newCode, false);
  }

  public getPublicLobbies(): Array<{
    code: string;
    playersCount: number;
    maxPlayers: number;
    bossName: string;
    phase: string;
  }> {
    const list = [];
    for (const room of this.rooms.values()) {
      if (!room.isPrivate) {
        list.push({
          code: room.code,
          playersCount: Object.keys(room.state.players).length,
          maxPlayers: 6,
          bossName: room.state.boss.name,
          phase: room.state.phase,
        });
      }
    }
    return list;
  }

  public generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return this.rooms.has(code) ? this.generateRandomCode() : code;
  }
}

export const matchmaker = new Matchmaker();
