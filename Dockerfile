# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM oven/bun:1 AS build
WORKDIR /app

# Install dependencies (cached unless lockfile/package.json change)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the app
COPY . .
RUN bun run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

# SPA + reverse-proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets produced by the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
