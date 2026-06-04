# Tradeverse

Full-stack MERN crypto trading simulator with real-time prices, candlesticks, social features, and chat.

## Highlights

- Real-time prices over WebSockets (tick every 2s) for 25 coins
- Candlestick (OHLC per minute) and line charts, toggle per coin
- Fractional trading with a credit-based economy (1 CR = $5)
- Create your own coin, buy/sell, track PnL and history
- Friends system: search, requests, accept/decline, leaderboard
- Private real-time chat between friends
- JWT auth + hashed passwords

## Tech Stack

- MongoDB + Mongoose
- Express + Socket.io
- React 18 (CRA) + Context API
- Node.js
- lightweight-charts

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local) or MongoDB Atlas

## Quick Start

```bash
# 1) Install all dependencies
npm run install:all

# 2) Set up environment
cp server/.env.example server/.env
# Edit server/.env and set at least MONGO_URI and JWT_SECRET

# 3) Start the app (API + client)
npm run dev
```

Frontend: http://localhost:3000

Backend: http://localhost:5000

## Environment Variables

Create server/.env based on server/.env.example.

```bash
MONGO_URI=mongodb://localhost:27017/tradeverse
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Scripts

From the repo root:

- npm run dev - start API and client with hot reload
- npm run server - start API only
- npm run client - start client only
- npm run install:all - install root, server, and client deps
- npm run build - build the React app

## Project Structure (Core)

```
tradeverse/
├── client/              React app (UI, charts, pages)
├── server/              Express API + Socket.io server
└── package.json         Root scripts
```

## How It Works (High-Level)

- The server seeds a coin list and runs a price engine via Socket.io.
- The client subscribes to real-time price updates and builds charts.
- Trades write to MongoDB and update portfolios and transaction history.
- Social features persist friendships and enable private DM chat.

## Security Notes

- Do not commit real secrets. Keep them in server/.env.
- Use a long, random JWT secret in production.
- For public deployments, set CLIENT_ORIGIN to your production domain.

## Troubleshooting

- If sockets fail, ensure CLIENT_ORIGIN matches the client URL.
- If MongoDB fails, verify MONGO_URI and that the service is running.
- If ports are busy, change PORT in server/.env and update CLIENT_ORIGIN.

## License

MIT
