FROM node:16-alpine3.12 as base
# https://turborepo.com/posts/turbo-0-4-0
# https://github.com/vercel/turborepo/issues/215
# Ensure we prune workspace so we don't unnecessarily build so much
LABEL name="server"

FROM base as turboed
RUN yarn global add turbo

# Prune the workspace for the `frontend` app
# Use the turboed image to use the `turbo` command before we install dependencies.
FROM turboed as pruner
WORKDIR /app
# COPY EVERYTHING, SO FAR UP THE DOCKERFILE????
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
FROM installer as builder
WORKDIR /app
COPY --from=pruner /app/out/full/ .
RUN yarn turbo run build --scope=server --includeDependencies --no-deps
# Clear dev dependencies (e.g. turbo, tsc)
RUN npm prune --production


# Start the app
# use installer so we can filter out the unbuilt deps
FROM installer as runner
WORKDIR /app
COPY --chown=node:node --from=builder /app/apps/server/build/ ./apps/server/build/
COPY --chown=node:node --from=builder /app/apps/server/assets/ ./apps/server/assets/
EXPOSE 3001
USER node
CMD ["yarn", "--cwd", "apps/server", "start"]

HEALTHCHECK CMD curl --fail http://localhost:3001 || exit 1   