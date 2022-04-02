# Maintenance Task Management

## Description

Application to account for maintenance tasks performed during working day

## :rocket: Technologies

- [TypeScript](https://www.typescriptlang.org/)
- [NestJS](https://nestjs.com/)
- [Prisma](https://prisma.io/)
- [Docker](https://www.docker.com/)
- [MySQL](https://www.mysql.com/)
- [RabbitMQ](https://www.rabbitmq.com/)

## 🖐 Prerequisites

- [Node.js (LTS)](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## :notebook: Running the project

```sh
docker-compose up
```

## Usage (development only)

After running the project, it will be created two users with the following credentials:

### :technologist: Technician

```sh
curl --request POST \
  --url http://localhost:3000/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
 "email": "technician@example.com",
 "password": "super-secret-password"
}'
```

### :office_worker: Manager

```sh
curl --request POST \
  --url http://localhost:3000/auth/login \
  --header 'Content-Type: application/json' \
  --data '{
 "email": "manager@example.com",
 "password": "super-secret-password"
}'
```

It can be changed in `prisma/seed.ts`

## Test

```sh
# unit tests
$ npm run test

# e2e tests
$ npm run test:docker:up

# test coverage
$ npm run test:cov
```
