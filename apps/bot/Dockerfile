# NOTE: the context is the directory that `docker-compose.yml` is in

FROM node:16-alpine3.12 as base
# https://turborepo.com/posts/turbo-0-4-0
# https://github.com/vercel/turborepo/issues/215
# Ensure we prune workspace so we don't unnecessarily build so much

FROM base as turboed
RUN yarn global add turbo

# Prune the workspace for the `frontend` app
FROM turboed as pruner
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
FROM installer as builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --scope=bot --includeDependencies --no-deps
# Clear dev dependencies (e.g. turbo, tsc)
RUN npm prune --production
RUN npm cache clean --force

# Start the app
# use installer so we can filter out the unbuilt deps
FROM installer as runner
USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/apps/bot/build/ ./apps/bot/build/
CMD ["yarn", "--cwd", "apps/bot", "start"]
