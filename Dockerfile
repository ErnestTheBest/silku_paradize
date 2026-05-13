FROM node:22-alpine

WORKDIR /app

ENV ASTRO_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
