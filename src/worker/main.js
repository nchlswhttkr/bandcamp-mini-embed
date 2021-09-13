Buffer = undefined;
const Boom = require("@hapi/boom");

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
    }

    throw Boom.notFound();
  } catch (error) {
    if (error.isBoom) {
      console.error(error.output.payload.message);
      return new Response(error.output.payload.error, {
        status: error.output.payload.statusCode,
      });
    }

    console.error(error);
    return new Response("Interal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

async function getEmbedData(event) {
  const albumId = new URL(event.request.url).searchParams.get("album");
  if (albumId === null) {
    throw Boom.badRequest("No album");
  }
  const clientIP = event.request.headers.get("CF-Connecting-IP");
  if (clientIP === null) {
    throw Boom.badRequest("No origin IP");
  }
  const referrer = event.request.headers.get("Referer");
  if (referrer === null) {
    throw Boom.badRequest("No referrer");
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
