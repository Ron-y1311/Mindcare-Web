FROM node:20-alpine3.22 AS build-step
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build --configuration=production

FROM nginx:1.17.1-alpine

COPY --from=build-step /app/dist/webproductos /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
