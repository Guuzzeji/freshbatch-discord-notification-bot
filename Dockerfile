FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY server.ts discord-webhook.ts utils.ts types.ts tsconfig.json ./

EXPOSE 3232
USER bun

CMD ["bun", "run", "server"]
