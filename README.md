# Knight — multiplayer chess

Two-player chess built with React, chess.js, Node.js, and WebSockets. The server owns the board state: it matches players, validates every move, and broadcasts the resulting position. The client supports both board orientations, legal-move highlights, move history, and check and game-end messages. If the connection drops, it reconnects and lets players start a new match.

## Run locally

Use Node.js 20 or newer. In two terminals:

```sh
cd backend1
npm ci
npm start
```

```sh
cd frontend
npm ci
npm run dev
```

Open the Vite URL in two browser windows and click **Find a match** in each. The API health check is at `http://localhost:8080/health`.

Run `npm test` in `backend1` to check matchmaking, move validation, synchronization, and disconnect recovery. Run `npm run lint` and `npm run build` in `frontend`.

## Deploy

The frontend is ready for Vercel with **Root Directory** set to `frontend`. Set `VITE_WS_URL` to the public `wss://` URL of the backend before building. The backend uses `PORT` and can run on a Node host with WebSocket support. Matchmaking is currently held in one server process, so a multi-instance deployment needs shared state or routing that keeps all players on one instance. Do not point the frontend at `localhost` in production.
