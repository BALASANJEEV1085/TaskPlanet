FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json frontend/
RUN cd frontend && npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json backend/
RUN cd backend && npm install --legacy-peer-deps --omit=dev
COPY backend/ .

FROM nginx:alpine
RUN apk add --no-cache nodejs npm && \
    mkdir -p /run/nginx /etc/nginx/http.d /etc/nginx/conf.d

COPY --from=backend-builder /app /usr/src/app
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://127.0.0.1:5000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/http.d/default.conf

EXPOSE 80

ENV PORT=5000

CMD ["sh", "-c", "cd /usr/src/app && node server.js & nginx -g 'daemon off;'"]