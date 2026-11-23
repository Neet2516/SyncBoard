# ==============================================================================
# SyncBoard - Unified Multi-Stage Production Dockerfile
# ==============================================================================
# Targets available:
#   1. fullstack (default) : Runs entire SyncBoard (Express API + WebSockets + Client SPA)
#   2. server             : Microservice Node.js API & Yjs WebSocket server
#   3. client             : Microservice Nginx static web server
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Base Workspace Dependencies
# ------------------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

# ------------------------------------------------------------------------------
# Stage 2: Build Frontend (Vite + React + Tailwind)
# ------------------------------------------------------------------------------
FROM base AS client-builder
RUN npm ci --workspace client

COPY client/tsconfig.json ./client/tsconfig.json
COPY client/vite.config.ts ./client/vite.config.ts
COPY client/tailwind.config.js ./client/tailwind.config.js
COPY client/postcss.config.js ./client/postcss.config.js
COPY client/index.html ./client/index.html
COPY client/public ./client/public
COPY client/src ./client/src

ARG VITE_API_URL=""
ARG VITE_WS_URL=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build --workspace client

# ------------------------------------------------------------------------------
# Stage 3: Build Backend (TypeScript -> JavaScript)
# ------------------------------------------------------------------------------
FROM base AS server-builder
RUN npm ci --workspace server

COPY server/tsconfig.json ./server/tsconfig.json
COPY server/src ./server/src

RUN npm run build --workspace server

# ------------------------------------------------------------------------------
# Target: Server (Standalone API & WebSocket microservice)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS server
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace server --omit=dev && npm cache clean --force

COPY --from=server-builder /app/server/dist ./server/dist

ENV NODE_ENV=production
ENV PORT=4000
ENV YPERSISTENCE=/app/server/yjs-leveldb

WORKDIR /app/server
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]

# ------------------------------------------------------------------------------
# Target: Client (Standalone Nginx static server)
# ------------------------------------------------------------------------------
FROM nginx:alpine AS client
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# ------------------------------------------------------------------------------
# Target: Fullstack (Default - Single unified all-in-one container)
# Serves Express REST API, Yjs WebSockets, and built Client SPA on PORT 4000
# ------------------------------------------------------------------------------
FROM node:20-alpine AS fullstack
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace server --omit=dev && npm cache clean --force

COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=client-builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=4000
ENV CLIENT_DIST_PATH=/app/client/dist
ENV YPERSISTENCE=/app/server/yjs-leveldb

WORKDIR /app/server
EXPOSE 4000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
