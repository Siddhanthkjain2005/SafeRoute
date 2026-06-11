# ── Production multi-stage build (Next.js standalone) ────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* are inlined at build time — must be present before `next build`.
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/stream
ARG NEXT_PUBLIC_API_TOKEN=dev-operator-token
ARG NEXT_PUBLIC_MAP_CENTER_LAT=12.9716
ARG NEXT_PUBLIC_MAP_CENTER_LNG=77.5946
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_API_TOKEN=$NEXT_PUBLIC_API_TOKEN \
    NEXT_PUBLIC_MAP_CENTER_LAT=$NEXT_PUBLIC_MAP_CENTER_LAT \
    NEXT_PUBLIC_MAP_CENTER_LNG=$NEXT_PUBLIC_MAP_CENTER_LNG \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
