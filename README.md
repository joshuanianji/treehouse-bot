# Treehouse Bot

A Discord bot with some other apps. Scaffolded from Turborepo Starter.

- **BOT**: The main discord bot, hosted on Digital Ocean via Docker.
- **Server** The server, hosted on Digital Ocean via Docker.
- **Web**: The web app, built with [SvelteKit](https://kit.svelte.dev/) and hosted on [Netlify](https://www.netlify.com/).

## Prerequisites

Make sure you have the following installed on your system:

- [Docker](https://www.docker.com/community-edition)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node v16.6 or higher](https://nodejs.org/en/download/), or [nvm](https://github.com/nvm-sh/nvm) (Discord.js 13 requires Node v16.6+)

## Starter

This runs the server, bot and web all in one go on your computer.

```bash
yarn
yarn dev
```

## Run with Docker

To emulate production, run the Server and Bot in Dockerfiles.

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

The current docker image sizes are quite big (400MB), I'll have to figure out how to slim them down to production lol.

## Run Production with Docker

For actual production servers, use downloaded images from GHCR (Github Container Registry).

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## View Logs of running Containers

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -ft
```
