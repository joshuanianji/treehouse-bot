# Treehouse Bot

A Discord bot with some other apps. Scaffolded from Turborepo Starter.

- **BOT**: The main discord bot, hosted on Digital Ocean via Docker.
- **Server** The server, hosted on Digital Ocean via Docker.
- **Web**: The web app, built with [SvelteKit](https://kit.svelte.dev/) and hosted on [Netlify](https://www.netlify.com/).

## Starter

This runs the server, bot and web all in one go on your computer.

```bash
yarn
yarn dev
```

## Run with Docker

To emulate production, run the Server and Bot in Dockerfiles.

```bash
docker-compose up
```
