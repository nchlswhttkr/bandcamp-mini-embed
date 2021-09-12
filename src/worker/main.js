// TODO: Use Boom for error responses

global = {};
Handlebars = require("handlebars");
require("../../dist/templates/embed.hbs.js");
require("../../dist/templates/home.hbs.js");

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const { pathname } = new URL(event.request.url);
    switch (pathname) {
      case "/embed/bundle.js":
        return new Response(require("../../dist/embed/bundle.js.txt"), {
          status: 200,
          headers: { "Content-Type": "application/javascript" },
        });
      case "/embed/bundle.css":
        return new Response(require("../../dist/embed/bundle.css.txt"), {
          status: 200,
          headers: { "Content-Type": "text/css" },
        });
      case "/examples/":
        return new Response(require("./examples.html"), {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      case "/robots.txt":
        return new Response(require("./robots.txt"), {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      case "/embed-data":
        return getEmbedData(event);
      case "/":
        return getEmbed(event);
      default:
        return new Response("Page not found", { status: 404 });
    }
  } catch (error) {
    return new Response("Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

async function getEmbedData(event) {
  const album = new URL(event.request.url).searchParams.get("album");
  if (album === null) {
    throw new Error("No album");
  }
  const clientIP = event.request.headers.get("CF-Connecting-IP");
  const referrer = event.request.headers.get("Referer");
  if (referrer === null) {
    throw new Error("No referrer");
  }

  // TODO: Should origins be restricted?

  const request = new Request(
    `https://bandcamp.com/EmbeddedPlayer/ref=${encodeURIComponent(
      referrer
    )}/album=${album}`,
    event.request
  );
  if (clientIP !== null) {
    request.headers.set("X-Forwarded-For", clientIP);
    request.headers.set("Forwarded", `for=${clientIP}`);
  }
  let data = await fetch(request)
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Received ${response.status} from Bandcamp`);
      }
      return response.text();
    })
    .then((text) => {
      // Player data is stored as a data attribute in the document... hmm...
      const match = text.match(/data-player-data="([^"]*)"/);
      if (match === null) {
        throw new Error("Could not read player data from Bandcamp");
      }
      return match[1].replace(/&quot;/g, '"');
    });

  return new Response(data, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": new URL(referrer).origin,
      "Content-Type": "application/json",
    },
  });
}

async function getEmbed(event) {
  const url = new URL(event.request.url).searchParams.get("url");
  let embed;
  if (url !== null) {
    let { origin } = new URL(event.request.url);
    embed = await generateEmbed(url, origin);
  }

  return new Response(generateResponse(embed), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

async function generateEmbed(url, origin) {
  let text = await fetch(url).then((r) => {
    if (r.status !== 200) {
      throw new Error(`Received ${r.status} from Bandcamp`);
    }
    return r.text();
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

  return Handlebars.templates["embed.hbs"]({
    origin,
    albumId,
    title,
    url,
  });
}

function generateResponse(embed) {
  return Handlebars.templates["home.hbs"]({ embed });
}
