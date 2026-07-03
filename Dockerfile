# Build de produccion (no se usa en dev local: ahi se corre `npm run dev`).
# En AWS real, el build de dist/ se sube a S3 + CloudFront (ver seccion 2 del Inception doc).
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
