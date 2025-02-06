import type { LoaderFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
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
  const loaderData = useRouteLoaderData<typeof loader>("root") as
    | LoaderReponseType
    | undefined;
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
        {loaderData?.ENV.PROD && loaderData?.ENV.CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${loaderData.ENV.CF_BEACON_TOKEN}"}`}
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

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <h1 className="text-2xl font-bold">Not Found</h1>;
  }
  return <h1 className="text-2xl font-bold">Oops! An error occurred!</h1>;
}
