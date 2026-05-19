FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

RUN npm ci --workspace server

COPY server/tsconfig.json ./server/tsconfig.json
COPY server/src ./server/src

RUN npm run build --workspace server

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app/server

EXPOSE 4000

CMD ["node", "dist/index.js"]
