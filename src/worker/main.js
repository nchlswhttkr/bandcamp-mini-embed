/**
 * A dependency of boom/call, hoek, references Node's Buffer API. Cloudflare
 * rejects workers whose code references this unavailable API. Declaring a falsy
 * value via an implicit global gets around this behaviour.
 */
Buffer = undefined;
const Boom = require("@hapi/boom");
const Call = require("@hapi/call");

const bandcamp = require("./bandcamp.js");

/**
 * To get Handlebars to run on a worker (without Webpack's handlebars-loader),
 * either the global or window APIs need to be available. Using an implicit
 * global achieves this, even if it janky.
 */
global = {};
Handlebars = require("handlebars");
require("../../dist/templates/embed.hbs.js");
require("../../dist/templates/home.hbs.js");

const router = new Call.Router();
router.add({ method: "get", path: "/" }, getEmbedPage);
router.add(
  { method: "get", path: "/album/{albumId}" },
  proxyAlbumEmbedDataRequest
);
router.add(
  { method: "get", path: "/examples/" },
  staticFileRouteGenerator(require("./examples.html"), "text/html")
);
router.add(
  { method: "get", path: "/robots.txt" },
  staticFileRouteGenerator(require("./robots.txt"), "text/plain")
);
router.add(
  { method: "get", path: "/embed/bundle.js" },
  staticFileRouteGenerator(
    require("../../dist/embed/bundle.js.txt"),
    "application/javascript"
  )
);
router.add(
  { method: "get", path: "/embed/bundle.css" },
  staticFileRouteGenerator(
    require("../../dist/embed/bundle.css.txt"),
    "text/css"
  )
);

function staticFileRouteGenerator(body, type) {
  return () =>
    new Response(body, { status: 200, headers: { "Content-Type": type } });
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const { pathname } = new URL(event.request.url);
    const method = event.request.method.toLowerCase();

    const match = router.route(method, pathname);
    if (match.isBoom) {
      throw match;
    }
    return await match.route(event, match.params);
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

async function proxyAlbumEmbedDataRequest(event, { albumId }) {
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

async function getEmbedPage(event) {
  const url = new URL(event.request.url).searchParams.get("url");
  let embed;
  if (url !== null) {
    const { albumId, title } = await bandcamp.getAlbumDetails(url);
    embed = Handlebars.templates["embed.hbs"]({ albumId, title, url });
  }

  return new Response(Handlebars.templates["home.hbs"]({ embed }), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
