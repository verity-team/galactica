FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN mkdir -p images

CMD [ "npm", "run", "start:dev" ]
EXPOSE 8000:8000
