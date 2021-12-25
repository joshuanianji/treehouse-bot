FROM node:16-alpine3.12 as base
# https://turborepo.com/posts/turbo-0-4-0
# Ensure we prine workspace so we don't unnecessarily build so much

RUN apk update && apk add git

## Globally install turbo
RUN npm i -g turbo

# Prune the workspace for the `frontend` app
FROM base as pruner
WORKDIR /app
COPY . .
RUN turbo prune --scope=bot --docker

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
RUN turbo run build --scope=bot

# Start the app
FROM builder as runner
CMD ["yarn", "--cwd", "apps/bot", "start"]
