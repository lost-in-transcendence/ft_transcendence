FROM node:lts-alpine

WORKDIR /usr/src/app

RUN apk add --update --no-cache openssl1.1-compat

COPY . .

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "dev"]

EXPOSE 3000
