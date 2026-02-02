#  Socket.IO Game Server - Event Documentation

##  Overview
This is a real-time multiplayer Crazy Eight card game server built with Socket.IO and Redis. The game follows classic Crazy Eight rules for exactly 2 players per room, featuring real-time gameplay, card validation, scoring, and room management.
## Stack.
Node.js with TypeScript
Socket.IO with Redis Adapter
ioredis - Redis client for Node.js
Express  - HTTP server
React - for frontend
Docker - for container 
## ENV
- create one .env in backend with following 
- port=3000
- redis_url=''
- redis_port=
- redis_username=''
- redis_password=''
- and  create one .env in frontend with following 
- VITE_SOCKET_URL=http://localhost:3000
### **Incoming Events (Client → Server)**

| Event | Parameters | Description | Acknowledgment |
|-------|------------|-------------|----------------|
| `create_room` | `{ roomid: string, username: string }` | Create or join a room |  Returns `{ ok: boolean, roomid?: string, error?: string }` |
| `get_rooms` | None | Get list of all available rooms | Returns `{ ok: boolean, rooms: Array<{name: string, playercount: number}> }` |
| `get_total_player_count` | None | Get total players across all rooms |  Returns `{ ok: boolean, totalplayers?: number, error?: string }` |
| `get_playersinlobby` | None | Get count of players in lobby |  Returns `{ ok: boolean, playercount: number }` |

### **Outgoing Events (Server → Client)**

| Event | Data | Description | Target |
|-------|------|-------------|--------|
| `room_added` | `{ playercount: number, name: string }` | Broadcast when a player joins/creates a room | All clients except sender |
| `playersinlobby` | `number` | Update lobby player count | All connected clients |

### **Internal Socket.IO Events**
- `disconnecting` - Triggered when socket is about to disconnect
- `disconnect` - Triggered when socket disconnects

##  Game Logic Service Events

### **Incoming Events (Client → Server)**

| Event | Parameters | Description | Acknowledgment |
|-------|------------|-------------|----------------|
| `get_game_phase` | `{ roomid: string }` | Get current game phase of a room |  Returns `{ ok: boolean, phase: phases }` |
| `game_disconnect` | None | Player disconnects from game |  No acknowledgment |
| `player_joined_room` | None | Player joins room (triggers game start) |  No acknowledgment |
| `card_spawn` | `{ username: string, data: string }` | Player plays a card |  No acknowledgment |
| `draw_a_card` | `{ username: string }` | Player draws a card from deck | No acknowledgment |
| `card_selected` | `{ username: string, data: string }` | Player selects a card (for highlighting) |  No acknowledgment |

### **Outgoing Events (Server → Client)**

| Event | Data | Description | Target |
|-------|------|-------------|--------|
| `game_start` | `string` (JSON state) | Start or resume game with current state | Room members or specific client |
| `game_end` | `{ winner: string }` | Game ended with winner information | All room members |
| `game_status` | `{ winner: string }` | Game status update (rarely used) | Room members |
| `state_update` | `string` (JSON state) | Update game state after move | All room members |
| `highlight_card` | `string` (card data) | Highlight selected card for opponents | All room members except sender |
| `playersinlobby` | `number` | Update lobby player count | All connected clients |






##  Event Categories

### **Room Management**
- `create_room`, `get_rooms`, `get_total_player_count`
- Used for creating, joining, and listing rooms

### **Game State Management**
- `get_game_phase`, `player_joined_room`, `game_start`, `state_update`
- Handle game initialization and state synchronization

### **Player Actions**
- `card_spawn`, `draw_a_card`, `card_selected`
- Player moves and interactions during gameplay

### **Status & Monitoring**
- `get_playersinlobby`, `playersinlobby`, `game_status`
- Real-time status updates and monitoring

### **Connection Management**
- `game_disconnect`, `disconnecting`, `disconnect`
- Handle player connections and disconnections

##  Important Notes

1. **Room Capacity**: Maximum 2 players per room
2. **Game Phases**: `waiting` → `playing` → `done`
3. **Locking Mechanism**: Redis locks prevent race conditions during game setup
4. **State Synchronization**: All game state is stored in Redis and broadcast on changes
5. **Acknowledgment**: Some events expect callback responses, others are fire-and-forget

##  Redis Keys Used

### **Room Management**
- `rooms` - Set of all room IDs
- `room:{roomid}` - Room metadata hash
- `room:{roomid}:players` - Set of player socket IDs
- `room:{roomid}:usernames` - Set of usernames
- `room:{roomid}:state` - Game state JSON

### **Socket Mapping**
- `socket:{socketid}:room` - Room ID for each socket
- `active:lobby:players` - Lobby player count

### **Game Locks**
- `room:{roomid}:deck:started` - Lock for game initialization


--i used ai for the readme (deepseek)