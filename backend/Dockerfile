FROM node:20-alpine

RUN apk add --no-cache iperf3

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3000
CMD ["node", "src/index.js"]
