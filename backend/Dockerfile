# Stage 1: Build & Prune
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production Image
FROM node:18-alpine

# Security: Run as non-root user
USER node
WORKDIR /usr/src/app

# Copy production dependencies
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Copy server code
COPY server.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run defaults to 8080
EXPOSE 8080

# Run the backend
CMD ["node", "server.js"]
