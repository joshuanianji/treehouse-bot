# syntax=docker/dockerfile:1

FROM node:16-alpine

ENV NODE_ENV=development

WORKDIR /

ADD [ "package.json", "package-lock.json", "/" ]

RUN npm i

ADD . .

# RUN npm run build

CMD ["npm", "run", "dev" ]
