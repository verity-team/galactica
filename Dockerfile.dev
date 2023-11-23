FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD [ "npm", "run", "start:dev" ]
EXPOSE 8000:8000
