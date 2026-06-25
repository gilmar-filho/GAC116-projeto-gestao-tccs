FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Imagem local (docker-compose): usa a config de desenvolvimento,
# cuja apiUrl aponta para http://localhost:8000.
RUN npm run build -- --configuration development

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
