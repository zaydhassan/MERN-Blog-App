# ───────────────────────────────────────────────────────────────────
# Inkwell — single-image deploy: build the client, then serve it + the
# API from the Express server. server.js already serves ../client/build
# and has an SPA fallback, so one process can host both.
# ───────────────────────────────────────────────────────────────────

# Stage 1 — build the client (Vite) into static assets.
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json* ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2 — install server deps and run.
FROM node:20-alpine AS server
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci --omit=dev
COPY server/ ./
# Bring in the built client so server.js can serve ../client/build.
WORKDIR /app
COPY --from=client-build /app/client/build ./client/build
WORKDIR /app/server
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]