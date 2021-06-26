// TODO: Move to Boom

import { VercelRequest, VercelResponse } from "@vercel/node";
import got from "got";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const url = req.query.url;
    if (typeof url === "object") {
      throw new Error("Invalid URL");
    }

    let embed = "";
    if (url !== undefined) {
      let origin = "https://" + req.headers.host;

      // Vercel messes with the host header in local dev, discard the hostname
      if (req.headers.host!.startsWith("localhost:")) {
        origin = "";
      }

      embed = await generateEmbed(url, origin);
    }

    res.status(200);
    res.send(generateResponse(embed));
  } catch (error) {
    console.error(error);
    res.status(500);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("Error");
  }
};

async function generateEmbed(url: string, origin: string) {
  let text = await got(url).then((r) => {
    if (r.statusCode !== 200) {
      throw new Error(`Received ${r.statusCode} from Bandcamp`);
    }
    return r.body;
  });

  let albumId;
  const matchAlbumId = text.match(/<!-- album id ([0-9]*) -->\n$/);
  if (matchAlbumId === null) {
    throw new Error("Could not find album ID");
  }
  albumId = matchAlbumId[1];

  let title;
  let matchTitle = text.match(/<meta name="title" content="(.*)">/);
  if (matchTitle === null) {
    throw new Error("Could not find album title");
  }
  title = matchTitle[1];

  return `<!-- bandcamp-mini-embed https://github.com/nchlswhttkr/bandcamp-mini-embed -->
<link rel="stylesheet" href="${origin}/build/bundle.css"/>
<div class="bandcamp-mini-embed" style="height: 336px"></div>
<script
    data-album-id="${albumId}"
    data-fallback-text="${title}"
    data-fallback-url="${url}"
    src="${origin}/build/bundle.js"
></script>
<noscript>
    <a href="${url}">Listen to ${title} on Bandcamp</a>
</noscript>
`;
}

function generateResponse(embed?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
    <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <title>bandcamp-mini-embed</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
        main { color: #333; margin: 0 auto; max-width: 600px; font-family: monospace; }

        h1, p { text-align: center; }

        label { display: flex; justify-content: center; align-items: center; }

        input { margin-left: 8px; }

        button { display: block; margin: 16px auto; background-color: #fff; font-family: monospace; padding: 4px; border: 2px solid #333; }

        pre { background-color: #333; color: #fff; padding: 8px; line-height: 1.2rem; overflow-x: scroll; }

        .bandcamp-mini-embed { max-width: 400px; margin: 0 auto; }
    </style>
    </head>
    <body>
    <main>
        <h1>bandcamp-mini-embed</h1>
        <p>A small Svelte client for embedding albums from <a href="https://bandcamp.com/">Bandcamp</a> into your site</p>
        <form>
            <label>Album URL <input type="text" name="url" /></label>
            <button>Generate embed</button>
        </form>
        ${
          embed &&
          `
            <pre><code id="embed-snippet">${embed
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</code></pre>
            <button onclick="copyEmbed()">Copy embed</button>
            ${embed}
            <script>
                function copyEmbed() {
                    navigator.clipboard.writeText(document.getElementById("embed-snippet").innerText);
                }
            </script>
            `
        }
        <p>
            <a href="https://github.com/nchlswhttkr/bandcamp-mini-embed/">Source code</a>
            &bull;
            <a href="/examples/">Example albums</a>
        </p>
    </main>
    </body>
</html>  
`;
}
