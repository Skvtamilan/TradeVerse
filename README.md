# Tradeverse — Full-Stack MERN Crypto Trading Simulator

A feature-complete cryptocurrency trading simulator built with MongoDB, Express, React, and Node.js.

## Features
- 25 real-world crypto coins with real-time prices via WebSockets (every 2s)
- **Candlestick charts** (OHLC per minute) + line charts — toggle between both on any coin
- Buy / sell full coins or fractional amounts
- Credit-based economy (50 credits to start, 1 CR = $5 USD)
- Launch your own custom cryptocurrency
- Portfolio tracking with P&L and transaction history
- **Add friends** — search by username, send/accept/decline requests
- **Friends leaderboard** — ranked net worth across you and your friends
- **Real-time chat** — private DMs between friends via WebSockets
- JWT authentication

## Project Structure

```
tradeverse/
├── server/
│   ├── config/          coins.js (master list + credit helpers), db.js
│   ├── controllers/     auth, coin, trade, portfolio, friends, chat, candle
│   ├── middleware/       auth.js (JWT), errorHandler.js
│   ├── models/          User, Coin, Portfolio, Transaction, Friendship, Message, Candle
│   ├── routes/          auth, coins, trade, portfolio, friends, chat, candles
│   ├── sockets/         priceEngine.js (prices + candle builder + chat socket)
│   ├── .env.example
│   ├── package.json
│   └── index.js
│
└── client/
    └── src/
        ├── components/
        │   ├── Auth/          Login, Register
        │   ├── Layout/        Navbar (with unread badge), Layout
        │   ├── Market/        MarketTable, CoinRow, MiniChart
        │   ├── Trade/         TradePanel, CoinChart (line), CandlestickChart
        │   ├── Portfolio/     PortfolioView, HoldingRow, TxHistory
        │   ├── CreateCoin/    CreateCoinForm
        │   ├── Social/        FriendsPanel (search, add, pending, remove)
        │   ├── Chat/          ChatWindow (real-time DMs)
        │   ├── Leaderboard/   Leaderboard (friends net worth ranking)
        │   └── common/        Toast, StatCard
        ├── context/       AuthContext, MarketContext (prices + candles + socket)
        ├── hooks/         usePortfolio, useSocket
        ├── pages/         Market, Portfolio, Trade, Create, Social, Chat, Login, Register
        ├── services/      api.js (all REST calls)
        ├── styles/        globals.css
        └── utils/         formatters.js
```

## Quick Start

```bash
# 1. Unzip and install
unzip tradeverse.zip
cd tradeverse
npm run install:all

# 2. Set up environment
cp server/.env.example server/.env
# Edit server/.env — set MONGO_URI and JWT_SECRET

# 3. Start MongoDB (skip if using Atlas)
mongod

# 4. Run both servers
npm run dev
# → Frontend: http://localhost:3000
# → Backend:  http://localhost:5000
```

## Environment Variables (server/.env)

```
MONGO_URI=mongodb://localhost:27017/tradeverse
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Tech Stack
- **MongoDB** — users, coins, portfolio, transactions, friendships, messages, candles
- **Express.js** — REST API
- **React 18** — SPA with Context API
- **Node.js** — runtime
- **Socket.io** — real-time prices, candlestick ticks, live chat
- **lightweight-charts** — professional candlestick charts
- **JWT + bcryptjs** — authentication
