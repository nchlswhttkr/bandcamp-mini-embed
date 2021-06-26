// TODO: Move to Boom

import { VercelRequest, VercelResponse } from "@vercel/node";
import got from "got";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const clientIP = req.headers["x-forwarded-for"];
    const referrer = req.headers["referer"];
    if (clientIP === undefined || typeof clientIP === "object") {
      throw new Error("Bad client IP");
    }
    if (referrer === undefined) {
      throw new Error("No referrer");
    }

    const data = await got(
      `https://bandcamp.com/EmbeddedPlayer/ref=${encodeURIComponent(
        referrer
      )}/album=${req.query.album}`,
      {
        headers: {
          "X-Forwarded-For": clientIP,
          "Forwarded": `for=${clientIP}`,
        },
      }
    )
      .then((response) => {
        if (response.statusCode !== 200) {
          throw new Error(`Received ${response.statusCode} from Bandcamp`);
        }
        return response.body;
      })
      .then((text) => {
        const match = text.match(/data-player-data="([^"]*)"/);
        if (match === null) {
          throw new Error("Could not read player data from Bandcamp");
        }
        return match[1].replace(/&quot;/g, '"');
      });

    res.setHeader("Access-Control-Allow-Origin", new URL(referrer).origin);
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send("Error");
  }
};
