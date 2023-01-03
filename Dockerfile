FROM node:18.12.1-alpine

WORKDIR /usr/app

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build 

CMD ["yarn", "start"]
