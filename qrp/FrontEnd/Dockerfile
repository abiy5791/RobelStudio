# Frontend (Vite -> static) Dockerfile
# Multi-stage: build with Node, serve with nginx.

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* /app/
RUN npm ci

COPY . /app

# Build-time envs (Vite reads these at build time)
ARG VITE_API_BASE
ARG VITE_DEVELOPER_NAME
ARG VITE_DEVELOPER_PHONE
ENV VITE_DEVELOPER_NAME=${VITE_DEVELOPER_NAME}
ENV VITE_DEVELOPER_PHONE=${VITE_DEVELOPER_PHONE}
ENV VITE_API_BASE=${VITE_API_BASE}

RUN npm run build


FROM nginx:1.27-alpine

# Nginx config proxies /api and /media to backend service
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static build output
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
