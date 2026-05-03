# Connect 4 Game Server

WebSocket server for Connect 4 multiplayer game using NestJS and Socket.IO.

## Quick Start

```bash
# Install dependencies
npm install

# Run server
npm run start
```

Server runs on `http://localhost:3000`.

## Architecture

```
src/game/
├── dto/                 # Data Transfer Objects with class-validator
├── types/               # TypeScript interfaces
├── utils/               # Utilities (coordinates)
├── game.gateway.ts     # WebSocket Gateway (Socket.IO)
├── game.module.ts      # NestJS module
└── game.service.ts     # Game logic (Sets for token tracking)
```

## Features

- **Single room**: Only one game room (max 2 players)
- **Silent validation**: Invalid requests are ignored (no error messages)
- **Token tracking**: Server uses Sets to track player tokens by coordinates
- **Win detection**: Server verifies 4-in-a-row after each move
- **Auto-reset**: Player disconnection resets scores to 0

## API

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ roomId?: string }` | Join game room |
| `makeMove` | `{ col: 0-6, row: 0-5 }` | Place token |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `playerIdAssigned` | `{ id: string }` | Your player ID |
| `gameStateChanged` | `{ players, currentPlayerId, scores }` | Game state |
| `errorOccurred` | `{ message: string }` | Only for connection errors |

## Documentation

See `docs/asyncapi.yaml` for complete AsyncAPI 3.1.0 specification.

## Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Run development server |
| `npm run start:dev` | Run with watch mode |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |