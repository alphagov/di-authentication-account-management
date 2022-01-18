FROM node:16.13.0-alpine as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./static ./static
COPY ./@types ./@types
RUN yarn install --production=true

FROM node:16.13.0-alpine as final
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/ node_modules

ENV NODE_ENV "development"
ENV PORT 6001

EXPOSE $PORT

CMD yarn start
