#!/bin/sh

if [ ! -f ".env" ]; then
   cp .env.example .env
fi

npm install
npm run migrate:dev
npm run seed

npm run start:debug
