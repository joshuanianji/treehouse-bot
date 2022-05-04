FROM node:16 as base 

FROM base AS turboed
RUN yarn global add turbo@1.1.1

# Prune the workspace to get all the package lock files
FROM turboed AS pruner
WORKDIR /app
COPY . . 
RUN npx turbo prune --scope=bot --docker
RUN npx turbo prune --scope=server --docker
RUN npx turbo prune --scope=web --docker

# Add pruned lockfile and package.json's of the pruned subworkspace
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/yarn.lock ./yarn.lock
# Install only the deps needed to build the target
# https://github.com/yarnpkg/yarn/issues/749#issuecomment-344919948
RUN yarn --pure-lockfile --no-cache

# Copy source code of pruned subworkspace and build
FROM installer AS runner
WORKDIR /app
COPY --from=pruner /app/.git ./.git 
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/turbo.json ./turbo.json

# also copy config files 
COPY ./server-config.yml ./server-config.yml
COPY ./bot-config.yml ./bot-config.yml

CMD ["yarn", "dev"]
