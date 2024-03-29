# NOTE: the context is the directory that `docker-compose.yml` is in

FROM node:18-alpine3.16 AS base
# https://turborepo.com/posts/turbo-0-4-0
# https://github.com/vercel/turborepo/issues/215
# Ensure we prune workspace so we don't unnecessarily build so much

# Prune the workspace for the `frontend` app
FROM base AS pruner
RUN yarn global add turbo@1.2.6
WORKDIR /app
# Copy everything, but in the directory of docker-compose.yml
COPY . .
RUN turbo prune --scope=bot --docker

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
RUN yarn turbo run build --scope=bot --include-dependencies --no-deps
# Clear dev dependencies (e.g. turbo, tsc)
RUN npm prune --production

# Start the app
# Copy over `build/index.js` 
FROM ghcr.io/joshuanianji/scratch-node-dumb-init:18 as runner
COPY --from=builder /app/apps/bot/build/index.js /index.js
ENV NODE_ENV production

CMD ["node", "index.js"]
