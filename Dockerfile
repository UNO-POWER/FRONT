# Build de produccion (no se usa en dev local: ahi se corre `npm run dev`).
# En AWS real, el build de dist/ se sube a S3 + CloudFront (ver seccion 2 del Inception doc);
# este contenedor nginx replica ese hosting estatico para docker-compose/EC2.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# URLs del gateway y del WebSocket inyectadas en build-time (Vite las congela en el bundle)
ARG VITE_API_URL=http://localhost:18080
ARG VITE_GAME_SERVICE_WS_URL=http://localhost:8083/ws-game
ENV VITE_API_URL=$VITE_API_URL VITE_GAME_SERVICE_WS_URL=$VITE_GAME_SERVICE_WS_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://localhost/ || exit 1
