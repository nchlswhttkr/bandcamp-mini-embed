# bandcamp-mini-embed

A music player embed for Bandcamp albums

- Can display compilation albums and albums with limited preview tracks
- Embed multiple albums in a single page without conflicts
- Lazy-loaded player, and no tracks are downloaded until you hit "Play"
- Dark mode friendly, keyboard friendly, and compatible with system media controls

Does this count as a microfrontend?

![Three music players sit side by side - each player shows an album cover, details about the current song, music controls, and a list of tracks](./screenshots/albums.png)

Bandcamp logo is property of [Bandcamp](https://bandcamp.com). Icons belong to [Feather](https://feathericons.com/).

## Usage

To set up your own deployment, clone this repository and deploy your own copy of the worker.

```sh
nvm use
npm ci
npm run deploy
```

![A preview embed, alongside a code block containing this embed's code](./screenshots/generate-embed.png)

## Development

To get started, clone this project and install dependencies. After that you can run the local development server.

```sh
nvm use
npm ci
npm run dev
```

Changes you make to the embed and the worker itself will trigger a rebuild of the worker, but you'll need to reload the page to access them.
