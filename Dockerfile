# Multi-stage production build for BlindSpot SaaS Platform
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm --prefix backend install --omit=dev
RUN npm --prefix frontend install

# Copy source files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build optimized production frontend SPA
RUN npm --prefix frontend run build

# Stage 2: Minimal runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend and built frontend dist
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package.json ./

EXPOSE 5000

CMD ["node", "backend/src/server.js"]
