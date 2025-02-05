import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { ReactNode } from "react";

import Header from "~/components/Header";

import "./tailwind.css";

interface LoaderReponseType {
  ENV: {
    PROD: boolean;
    CF_BEACON_TOKEN?: string;
  };
}

export const loader: LoaderFunction = async ({ context }) => {
  return Response.json({
    ENV: {
      PROD: import.meta.env.PROD,
      CF_BEACON_TOKEN: context.cloudflare.env.CF_BEACON_TOKEN,
    },
  });
};

export function Layout({ children }: { children: ReactNode }) {
  const { ENV } = useLoaderData<typeof loader>() as LoaderReponseType;
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1.0"
        />
        <Meta />
        <Links />
        {ENV.PROD && ENV.CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${ENV.CF_BEACON_TOKEN}"}`}
          />
        )}
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
