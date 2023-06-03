# NOTE: the context is the directory that `docker-compose.yml` is in 

FROM node:18-alpine3.18 AS base
# https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/
# https://turborepo.com/posts/turbo-0-4-0
# https://github.com/vercel/turborepo/issues/215
# Ensure we prune workspace so we don't unnecessarily build so much

FROM base AS turboed
RUN yarn global add turbo@1.2.6

# Prune the workspace for the `frontend` app
# Use the turboed image to use the `turbo` command before we install dependencies.
FROM turboed AS pruner
WORKDIR /app
# Copy everything, but in the directory of docker-compose.yml
COPY . . 
RUN turbo prune --scope=server --docker

# Add pruned lockfile and package.json's of the pruned subworkspace
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
# Install only the deps needed to build the target
# https://github.com/yarnpkg/yarn/issues/749#issuecomment-344919948
RUN yarn --pure-lockfile --no-cache

# Copy source code of pruned subworkspace and build
FROM installer AS builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/turbo.json ./turbo.json
RUN yarn turbo run build --scope=server --include-dependencies --no-deps

# Copy over `build/index.js` and assets folder
FROM ghcr.io/joshuanianji/scratch-node-dumb-init:18.16.0 as runner
COPY --from=builder /app/apps/server/build/index.js /index.js
COPY --from=builder /app/apps/server/assets/ /assets/
EXPOSE 3001
ENV NODE_ENV production
CMD ["node", "index.js"]

HEALTHCHECK CMD curl --fail http://localhost:3001 || exit 1
