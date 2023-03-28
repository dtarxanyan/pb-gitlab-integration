FROM node:16.3.0
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .