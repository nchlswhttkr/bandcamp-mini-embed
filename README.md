# bandcamp-mini-embed

A small Svelte client for embedding albums from Bandcamp into your site.

- Handles compilation albums and albums with limited preview tracks
- Embed multiple albums in a single page without conflicts
- Embedded albums only load when scrolled into view

Does this count as a microfrontend?

![Three music players sit side by side - each player shows an album cover, details about the current song, music controls, and a list of tracks](./screenshot.png)

Bandcamp logo is property of [Bandcamp](https://bandcamp.com). Other icons belong to [Feather](https://feathericons.com/).

## Development

If you'd like to try this out, you can clone and run this project locally.

```sh
npm ci
npm run dev
```

## Usage

Before you add the snippet to your site, you'll need a proxy to workaround CORS errors from Bandcamp. Here's an example Cloudflare worker that applies the necessary headers.

> :exclamation: This isn't quite production-ready, use at your own risk.

```js
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const url = new URL(event.request.url);
    const album = url.searchParams.get("album");
    const clientIP = event.request.headers.get("CF-Connecting-IP");
    const origin = event.request.headers.get("Origin");
    const referer = event.request.headers.get("Referer");
    const request = new Request(
      `https://bandcamp.com/EmbeddedPlayer/ref=${encodeURIComponent(
        referer
      )}/album=${album}`,
      event.request
    );
    request.headers.set("X-Forwarded-For", clientIP);
    request.headers.set("Forwarded", `for=${clientIP}`);
    let response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.append("Access-Control-Allow-Origin", origin);
    return response;
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
```

Note down the URL of your worker (like `https://bandcamp-embed-cors-proxy.nchlswhttkr.workers.dev/`), you'll need this later.

Clone, build, and copy build output over to your website.

```
git clone https://github.com/nchlswhttkr/bandcamp-mini-embed.git
cd bandcamp-mini-embed
npm ci
npm build
cp -R public/build /path/to/website/bandcamp-mini-embed
```

You'll need to know the ID of the album you're embedding in advance. You can find it at the bottom of the document for an album's page, or through the share/embed dialog. For example, here's the album ID for [Realign](https://vine.bandcamp.com/album/realign).

```html
  </body>
</html>
<!-- bender18-5 Mon Jan 04 11:00:00 UTC 2021  -->
<!-- album id 2288090894 -->
```

Insert the follow style/script snippet on any page you want. It's 336px tall and its width can vary between 320px and 480px.

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
 -->
