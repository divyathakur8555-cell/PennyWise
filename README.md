# Personal Finance Tracker

MERN application: React/Vite/Tailwind frontend, Express/Mongoose API, JWT authentication, transactions, budgets, charts, filters, CSV and PDF exports.

## Run locally
1. Install Node.js 18+ and start MongoDB.
2. In `server`: `npm install`, copy `.env.example` to `.env`, set `MONGO_URI` and a strong `JWT_SECRET`, then run `npm run dev`.
3. In `client`: `npm install`, copy `.env.example` to `.env`, then run `npm run dev`.
4. Open http://localhost:5173 and register. API default: http://localhost:5000/api.

This is a starter project. Configure HTTPS, rate limiting, secure deployment secrets, backups and production CORS before deployment.
