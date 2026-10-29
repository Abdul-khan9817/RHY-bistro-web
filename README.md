# Rhy Bistro

Full-stack restaurant web app — React + Vite frontend, Express + MongoDB backend.

## Structure

```
rhy-bistro/
├── client/          # React + Vite + Tailwind + shadcn/ui frontend
├── server/          # Express + MongoDB backend API
├── lib/
│   ├── db/          # Drizzle schema (shared)
│   ├── api-zod/     # Zod API types (shared)
│   └── api-client-react/  # React Query API client (shared)
├── package.json
└── pnpm-workspace.yaml
```

## Setup & Running

```bash
# Install dependencies
pnpm install

# Start both frontend & backend concurrently in development mode
pnpm dev

# Or run separately:
pnpm dev:client    # → Frontend at http://localhost:5173
pnpm dev:server    # → Backend API at http://localhost:3001

# Seed initial admin user and database items (tables, default menu)
pnpm seed

# Build for production
pnpm build

# Start production server (serves both API and frontend static assets)
pnpm start
```

## Production & Docker Deployment

### Option 1: Docker (Single command)

```bash
docker compose up -d --build
```
This spins up MongoDB and the full-stack container on `http://localhost:3001`.

### Option 2: Render / Railway / Fly.io / VPS
- **Build command:** `pnpm install && pnpm build`
- **Start command:** `pnpm start`
- Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET` (at least 32 characters), and `PORT`.
- The Express server automatically serves the compiled React application and API from the single unified process!

## Requirements

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)
