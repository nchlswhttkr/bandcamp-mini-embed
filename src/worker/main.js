// TODO: Use Boom for error responses

const bandcamp = require("./bandcamp.js");

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
  const albumId = new URL(event.request.url).searchParams.get("album");
  if (albumId === null) {
    throw new Error("No album");
  }
  const clientIP = event.request.headers.get("CF-Connecting-IP");
  if (clientIP === null) {
    throw new Error("No origin IP");
  }
  const referrer = event.request.headers.get("Referer");
  if (referrer === null) {
    throw new Error("No referrer");
  }

  const data = await bandcamp.getAlbumPlayerData(albumId, clientIP, referrer);

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
    embed = await generateEmbed(url);
  }

  return new Response(generateResponse(embed), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

async function generateEmbed(url) {
  const { albumId, title } = await bandcamp.getAlbumDetails(url);

  return Handlebars.templates["embed.hbs"]({
    albumId,
    title,
    url,
  });
}

function generateResponse(embed) {
  return Handlebars.templates["home.hbs"]({ embed });
}
