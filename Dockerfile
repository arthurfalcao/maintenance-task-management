FROM node:lts-alpine3.14

RUN apk add --no-cache bash curl && \
    curl https://raw.githubusercontent.com/eficode/wait-for/v2.1.3/wait-for --output /usr/bin/wait-for && \
    chmod +x /usr/bin/wait-for

USER node

WORKDIR /home/node/app
