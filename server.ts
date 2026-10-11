import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchmaker } from './src/server/matchmaker';
import { ClientAction } from './src/shared/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = 3000;

app.use(express.json());

// API Endpoints
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/lobbies', (_req, res) => {
  res.json({ lobbies: matchmaker.getPublicLobbies() });
});

// Dedicated /ws upgrade routing
httpServer.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  } catch (err) {
    console.error('Upgrade routing error:', err);
  }
});

// Game WebSocket Handling
wss.on('connection', (ws: WebSocket, req) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const roomCodeParam = url.searchParams.get('room');
    const playerNameParam = url.searchParams.get('name') || 'Operative';
    const charParam = url.searchParams.get('char') || 'card_sharp';
    const isPrivateParam = url.searchParams.get('private') === 'true';

    let room = roomCodeParam
      ? matchmaker.getOrCreateRoom(roomCodeParam, isPrivateParam)
      : matchmaker.findQuickMatchRoom();

    const playerId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    room.addPlayer(playerId, playerNameParam, charParam, ws);

    ws.on('message', (message: string) => {
      try {
        const data: ClientAction = JSON.parse(message.toString());
        room.handleAction(playerId, data);
      } catch (e) {
        console.error('Failed to parse client message:', e);
      }
    });

    ws.on('close', () => {
      room.removePlayer(playerId);
    });

    ws.on('error', (err) => {
      console.error(`Socket error for player ${playerId}:`, err);
      room.removePlayer(playerId);
    });
  } catch (err) {
    console.error('WebSocket connection error:', err);
  }
});

// Vite Middleware for Development / Static files for Production
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Balackjack] Full-stack game server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
