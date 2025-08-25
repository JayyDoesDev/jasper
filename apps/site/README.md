# Bulk Delete Web Preview

This is the site used for previewing bulk deleted (purged) messages and their surrounding context!

## Setting Up

Install the dependencies with `npm install` (or `pnpm install` or `yarn`), and then start the development server.

```bash
# install all the packages
pnpm i

# start a development server
pnpm run dev
```

Currently, the site is setup for deployment on Cloudflare. You can change this by changing the adapter in `svelte.config.js`.
If you have a different target environment, you may need to install the specific [adapter](https://svelte.dev/docs/kit/adapters)

You can preview the production build with `npm run preview`.

## Usage

With Jasper's bulk delete logging setup, JSONs of purged messages will be sent in the logging channel. Download the file, and upload it to the site to preview it.

The commands to setup logging are explained in the bot's documentation.
