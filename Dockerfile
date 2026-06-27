#stage 1
FROM node:22-alpine as node
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod
#stage 2
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=node /app/dist/typeschema-sandbox/browser /usr/share/nginx/html
