import { type ServerBuild, createRequestHandler } from "@remix-run/cloudflare";
import { Hono } from "hono";
import { contextStorage, getContext } from "hono/context-storage";
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server";
import { getLoadContext } from "./load-context";

import { generateOgImage } from "~/libs/ogp";
import { getTitle } from "~/routes";

const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

const app = new Hono();

app.use(contextStorage());
app.use(async (_c, next) => {
  if (!Object.getOwnPropertyDescriptor(process, "env")?.get) {
    const processEnv = process.env;
    Object.defineProperty(process, "env", {
      get() {
        try {
          return { ...processEnv, ...getContext().env };
        } catch {
          return processEnv;
        }
      },
    });
  }
  return next();
});

app.get("/api/ogp", async (c) => {
  const { cat, slug } = c.req.query();
  if (!cat || !slug) {
    return c.body("Not Found", { status: 404 });
  }
  const title = getTitle(cat, slug);
  if (!title) {
    return c.body("Not Found", { status: 404 });
  }
  const ogp = await generateOgImage(cat, slug, title);
  if (!ogp) {
    return c.body("Not Found", { status: 404 });
  }
  return c.body(ogp, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});

app.all("*", async (c) => {
  const context = getLoadContext({
    request: c.req.raw,
    context: {
      cloudflare: {
        cf: c.req.raw.cf,
        ctx: {
          waitUntil: c.executionCtx.waitUntil.bind(c.executionCtx),
          passThroughOnException: c.executionCtx.passThroughOnException.bind(
            c.executionCtx
          ),
        },
        caches,
        env: c.env as never,
      },
    },
  });
  return await handleRemixRequest(c.req.raw, context);
});

export default app;
