# Server

The main brain of the application.

Structure kinda based off of [this blog](https://kentcdodds.com/blog/how-i-structure-express-apps).

## Caveats

I've moved from `tsc` to `@vercel/ncc` for my build tool, so that my docker image sizes will be smaller. Though, there is one notable caveat:

- [Inability for Dynamic Asset imports](https://github.com/vercel/ncc/issues/829)
  `ncc` looks at `__dirname` for the file paths to import as assets.. In my case, I am dyamically importing the files, so this doesn't work.
  My solution is, in the dockerfile, to just copy over the assets folder after copying the `index.js` file.

  This also means there is a discrepancy between the `ncc` app and the `ts-node-dev` app in terms of the relative paths to the `assets` folder. I solved this by an `ASSET_PATH` env variable, but I hope to be able to figure out a better solution to this soon.

- Inability for Import Aliases
  This one is especially annoying because I'm pretty sure relative imports with with ncc, I just haven't figured it out yet.
  I'll use relative imports for now.
