FROM node:lts-alpine

WORKDIR /usr/src/app

COPY . .

ENTRYPOINT ["./entrypoint.sh"]

CMD ["npm", "run", "dev"]

EXPOSE 3000
