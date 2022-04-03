#!/bin/sh

npm install
npm run migrate:deploy
npm run prisma:generate
npm run test:e2e
