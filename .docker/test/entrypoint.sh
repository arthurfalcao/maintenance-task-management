#!/bin/sh

cp .env.test .env

npm install
npm run migrate:deploy
npm run prisma:generate
npm run test:e2e
