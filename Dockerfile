FROM node:12.6-alpine

RUN mkdir /api
WORKDIR /api

COPY ["package.json", "package-lock.json", "/api/"]
RUN npm install

COPY src/ /api/src
CMD node /api/src/index.js