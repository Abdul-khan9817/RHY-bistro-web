FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package descriptors
COPY package.json pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/

# Install all dependencies
RUN pnpm install --frozen-lockfile=false

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY lib/ ./lib/

# Build client and server
RUN pnpm build

# --- Production Runner ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy build output and necessary files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3001

CMD ["node", "./server/dist/index.mjs"]
