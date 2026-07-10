# Multi-stage build for the NestJS API.
# Runtime keeps tsx + src/ + fixtures because db:migrate and seed run .ts
# directly (tsx), while the app itself runs the compiled dist/main.js.

# ---- deps: install all deps (incl. dev) for the build ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: compile TypeScript -> dist/ ----
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runtime: prod deps + compiled output + ts sources needed by tsx ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Postgres client for the entrypoint's readiness wait.
RUN apk add --no-cache postgresql16-client

# Prod dependencies only. tsx is a runtime dep (used by migrate + seed), so it
# survives `npm ci --omit=dev`; drizzle-kit is not needed at runtime (SQL
# migrations are applied by tsx src/db/migrate.ts, not by drizzle-kit generate).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# The node:*-alpine image ships an unprivileged `node` user — own the app files
# to it and drop root so the runtime process has no unnecessary privileges.
COPY --chown=node:node --from=build /app/dist ./dist
# tsx entrypoints + their inputs (migrate/seed read src + fixtures at runtime).
COPY --chown=node:node src ./src
COPY --chown=node:node seed-fixtures ./seed-fixtures
COPY --chown=node:node drizzle.config.ts tsconfig.json ./
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER node
EXPOSE 3210
ENTRYPOINT ["./docker-entrypoint.sh"]
