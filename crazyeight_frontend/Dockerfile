FROM node AS builder
ARG VITE_SOCKET_URL=ws://localhost:3000
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN echo "VITE_SOCKET_URL=${VITE_SOCKET_URL}" >> .env
RUN npm run build
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]