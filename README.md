# bandcamp-mini-embed

A small Svelte client for embedding albums from Bandcamp into your site.

- Handles compilation albums and albums with limited preview tracks
- Embed multiple albums in a single page without conflicts
- Embedded albums only load when scrolled into view

Does this count as a microfrontend?

![Three music players sit side by side - each player shows an album cover, details about the current song, music controls, and a list of tracks](./screenshot.png)

Bandcamp logo is property of [Bandcamp](https://bandcamp.com). Icons belong to [Feather](https://feathericons.com/).

## Usage

Build the player, and then package and deploy it to Cloudflare with the [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler).

```sh
git clone https://github.com/nchlswhttkr/bandcamp-mini-embed.git
cd bandcamp-mini-embed
npm ci
npm run build
wrangler publish
```

From here you can open your deployment, and enter the name of the album you'd like to embed into the form.

After you hit **Generate embed**, you'll see a preview of the embed as well the code snippet powering it. You can use this code wherever you'd like to embed your album.

## Development

To develop locally, you'll need to run development servers for the Svelte app _and_ the Cloudflare worker.

```sh
git clone https://github.com/nchlswhttkr/bandcamp-mini-embed.git
cd bandcamp-mini-embed
npm ci
npm run dev
wrangler dev # in a separate window, or the background
```

<!--
TODO
 - https://botany.bandcamp.com/track/fourteen-45-tails
 - Support tracks rather than only albums
 - Handling play suspending (waiting)
 - Document that player doesn't seem to play nice with constructor API
 - Check compatability with audio/source elements, fix console errors
 - Look for guidance on range input accessibility
 - Investigate dynamically generating/linking caption files
 - Error handling if no tracks are streamable
 - Remove/resolve workaround with inconsistent seeking on Firefox
 - Fix keyboard navigation, disabled elements
 - Fix album artwork appearing distorted on Safari (specify img width)
 - Make player icons look nicer in dark mode
 -->
