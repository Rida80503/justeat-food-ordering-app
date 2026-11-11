
# ==========================================
# STAGE 1: BUILD REACT FRONTEND
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy complete frontend source
COPY . .

# API base URL
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

# Build production frontend
RUN npm run build


# ==========================================
# STAGE 2: NGINX PRODUCTION SERVER
# ==========================================
FROM nginx:1.27-alpine

# Copy Nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy React production build
COPY --from=build /app/dist /usr/share/nginx/html

# Default local port
ENV PORT=80

# Default local backend URL
ENV BACKEND_URL=http://backend:8000

# Expose Nginx port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
