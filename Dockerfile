# syntax = docker/dockerfile:1.2

FROM node:18.12.1-alpine

WORKDIR /usr/app

COPY . .
RUN --mount=type=secret,id=_env_local,dst=/.env.local

# ARG FIREBASE_API_KEY
# ARG FIREBASE_MESSAGING_SENDER_ID
# ARG FIREBASE_APP_ID

# ENV FIREBASE_API_KEY=${FIREBASE_API_KEY}
# ENV FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_API_KEY}
# ENV FIREBASE_APP_ID=${FIREBASE_API_KEY}
# ENV FIREBASE_AUTH_DOMAIN=aicte-diary.firebaseapp.com
# ENV FIREBASE_PROJECT_ID=aicte-diary
# ENV FIREBASE_STORAGE_BUCKET=aicte-diary.appspot.com

# RUN echo ${FIREBASE_API_KEY}
RUN yarn install --frozen-lockfile

RUN yarn build 

CMD ["yarn", "start"]
