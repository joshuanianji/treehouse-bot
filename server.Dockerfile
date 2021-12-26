FROM node:16-alpine3.12 as base
# https://turborepo.com/posts/turbo-0-4-0
# https://github.com/vercel/turborepo/issues/215
# Ensure we prune workspace so we don't unnecessarily build so much

## Globally install turbo
RUN yarn global add turbo

# Prune the workspace for the `frontend` app
FROM base as pruner
WORKDIR /app
# COPY EVERYTHING, SO FAR UP THE DOCKERFILE????
COPY . . 
RUN turbo prune --scope=server --docker

# Add pruned lockfile and package.json's of the pruned subworkspace
FROM pruner AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
# Install only the deps needed to build the target
RUN yarn install

# Copy source code of pruned subworkspace and build
FROM installer as builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --scope=server --includeDependencies --no-deps

# Start the app
FROM builder as runner
EXPOSE 3001
CMD ["yarn", "--cwd", "apps/server", "start"]