import { join } from "node:path";
import { cwd } from "node:process";

import { GlobalFonts, createCanvas } from "@napi-rs/canvas";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

import { SITE_TITLE } from "~/const";
import { getTitle } from "~/routes";

const WIDTH = 1200;
const HEIGHT = 630;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const cat = url.searchParams.get("cat");
  const slug = url.searchParams.get("slug");
  if (!cat || !slug) {
    return new Response("Not Found", { status: 404 });
  }

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const title = getTitle(cat, slug);
  if (!title) {
    return new Response("Not Found", { status: 404 });
  }

  GlobalFonts.registerFromPath(
    join(cwd(), "public", "fonts", "inconsolata-v32-latin-700.woff2"),
    "inconsolata"
  );
  GlobalFonts.registerFromPath(
    join(cwd(), "public", "fonts", "inconsolata-v32-latin-regular.woff2"),
    "inconsolata"
  );

  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#030221");
  gradient.addColorStop(1, "#0f0c38");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#5a596b45";
  ctx.roundRect(50, 50, WIDTH - 100, HEIGHT - 100, 50);
  ctx.fill();

  ctx.font = "normal 48px inconsolata";
  ctx.fillStyle = "#bbb";
  ctx.textAlign = "center";
  ctx.fillText(`/*** ${SITE_TITLE} ***/`, WIDTH / 2, 150);

  ctx.font = "bold 90px inconsolata";
  ctx.fillStyle = "#eee";
  ctx.textAlign = "center";
  ctx.fillText(`${cat}.${slug}`, WIDTH / 2, HEIGHT / 2);

  ctx.font = "bold 60px inconsolata";
  ctx.fillStyle = "#ddd";
  ctx.fillText(title, WIDTH / 2, HEIGHT / 2 + 150);

  return new Response(canvas.toBuffer("image/webp"), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
