# -----------------------
# Stage 1: Install dependencies
# -----------------------
    FROM node:20-alpine AS deps
    WORKDIR /app
    
    # Copy package files and install dependencies
    COPY package.json package-lock.json* ./
    RUN npm ci
    
    # -----------------------
    # Stage 2: Build the app
    # -----------------------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Copy installed node_modules
    COPY --from=deps /app/node_modules ./node_modules
    
    # Copy everything needed for the build
    COPY package.json ./
    COPY . .
    
    # Copy env file for build
    ARG NODE_ENV=production
    ENV NODE_ENV=${NODE_ENV}
    COPY .env.production .env
    
    # Build Next.js app
    RUN npm run build
    
    # -----------------------
    # Stage 3: Create runtime image
    # -----------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy build and node_modules from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/src ./src
    COPY --from=builder /app/lib ./lib
    COPY --from=builder /app/models ./models
    
    # Copy env file for runtime
    COPY --from=builder /app/.env .env
    
    # Expose port
    EXPOSE 3000
    
    # Start app
    CMD ["npm", "start"]
    