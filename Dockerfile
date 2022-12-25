FROM node:19-alpine AS depender
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --save

FROM node:19-alpine AS builder
WORKDIR /app
COPY --from=depender /app/node_modules ./node_modules
COPY . .
RUN npm run build

CMD [ "node", "dist/index.js" ]
