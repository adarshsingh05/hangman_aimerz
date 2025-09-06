# Install deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy everything needed for build, including package.json
COPY package.json ./
COPY .env.production .env.local
COPY . .
COPY lib ./lib
COPY models ./models
COPY public ./public
RUN npm run build

# Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/models ./models
EXPOSE 3000
CMD ["npm","start"]
