FROM node:lts-alpine3.10

WORKDIR /usr/src/app

COPY package.json .

RUN apk add --no-cache --update git \
  && npm i --only=production --verbose

# Bundle app source
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD [ "npm", "start" ]
