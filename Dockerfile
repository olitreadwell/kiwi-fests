# Multi-stage build: install, compile to standalone output, run slim.
FROM node:22-alpine AS deps
WORKDIR /app
# Native modules (better-sqlite3) need a compiler toolchain on Alpine.
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml* package-lock.json* pnpm-workspace.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --frozen-lockfile; \
    else \
      npm ci; \
    fi

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["node", "server.js"]
