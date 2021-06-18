# bandcamp-mini-embed

A small Svelte client for embedding albums from Bandcamp into your site.

- Handles compilation albums and albums with limited preview tracks
- Embed multiple albums in a single page without conflicts
- Embedded albums only load when scrolled into view

Does this count as a microfrontend?

![Three music players sit side by side - each player shows an album cover, details about the current song, music controls, and a list of tracks](./screenshot.png)

Bandcamp logo is property of [Bandcamp](https://bandcamp.com). Icons belong to [Feather](https://feathericons.com/).

## Development

If you'd like to try this out, you can clone this project and run it locally.

```sh
npm ci
npm run dev
```

## Usage

Clone, build, and copy build output over to a path on your website (like `/bandcamp-mini-embed/...`).

```
git clone https://github.com/nchlswhttkr/bandcamp-mini-embed.git
cd bandcamp-mini-embed
npm ci
npm run build
cp -R public/build /path/to/website/bandcamp-mini-embed
```

In production, you'll need a proxy to workaround CORS errors with Bandcamp. You should deploy this yourself, but feel free to use [my code](https://github.com/nchlswhttkr/workers/blob/HEAD/workers/bandcamp-embed-cors-proxy/index.js) a basis for this. Keep a note of this proxy, you'll need it later.

You'll also need to know the ID of the album you're embedding in advance. You can find it at the bottom of the document for an album's page, or through the share/embed dialog. For example, here's the album ID for [Realign](https://vine.bandcamp.com/album/realign).

```html
  </body>
</html>
<!-- bender18-5 Mon Jan 04 11:00:00 UTC 2021  -->
<!-- album id 2288090894 -->
```

Insert the follow style/script snippet on any page you want. It's 336px tall and requires a minimum width of 280px.

Specify the album to load with the `data-album-id` attribute on the script, as well as the URL of your CORS proxy from earlier with the `data-proxy-root` attribute.

```
<head>
    ...
    <link rel="stylesheet" href="/bandcamp-mini-embed/bundle.css" />
    ...
</head>
<body>
    ...
    <div style="height: 336px"></div>
    <script async
        data-album-id="2288090894"
        data-proxy-root="https://bandcamp-embed-cors-proxy.nchlswhttkr.workers.dev/"
        src="/bandcamp-mini-embed/bundle.js"
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
