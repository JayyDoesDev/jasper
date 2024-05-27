FROM node:20

WORKDIR /jasper

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY . .
RUN yarn build

CMD ["yarn", "start"]
