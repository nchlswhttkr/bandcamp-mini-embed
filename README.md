# bandcamp-mini-embed

A small Svelte client for embedding albums from Bandcamp into your site.

- Handles compilation albums and albums with limited preview tracks
- Embed multiple albums in a single page without conflicts
- Embedded albums only load when scrolled into view

Does this count as a microfrontend?

![Three music players sit side by side - each player shows an album cover, details about the current song, music controls, and a list of tracks](./screenshot.png)

Bandcamp logo is property of [Bandcamp](https://bandcamp.com). Icons belong to [Feather](https://feathericons.com/).

## Development

If you'd like to try this out, you can clone this project and run it locally. You'll need the [Vercel CLI](https://vercel.com/docs/cli) installed.

```sh
npm ci
(cd api && npm ci)
vercel dev
```

## Usage

Clone, build, and deploy the artifacts and serverless functions to Vercel.

```
git clone https://github.com/nchlswhttkr/bandcamp-mini-embed.git
cd bandcamp-mini-embed
npm ci
(cd api && npm ci)
npm run build
vercel
```

You'll need to know the ID of the album you're embedding in advance. You can find it at the bottom of the document for an album's page, or through the share/embed dialog. For example, here's the album ID for [Realign](https://vine.bandcamp.com/album/realign).

```html
  </body>
</html>
<!-- bender18-5 Mon Jan 04 11:00:00 UTC 2021  -->
<!-- album id 2288090894 -->
```

Insert the follow style/script snippet on any page you want. It's 336px tall and requires a minimum width of 280px. You can specify the album to show using the `data-album-id` attribute on the script.

```
<head>
    ...
    <link rel="stylesheet" href="https://bandcamp-mini-embed.vercel.app/build/bundle.css" />
    ...
</head>
<body>
    ...
    <div style="height: 336px"></div>
    <script async
        data-album-id="2288090894"
        src="https://bandcamp-mini-embed.vercel.app/build/bundle.js"
    ></script>
    ...
</body>
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
