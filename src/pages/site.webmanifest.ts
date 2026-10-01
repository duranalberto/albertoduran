import { THEME_META_COLORS } from "@runtime/managers/theme_config";
import { SITE_NAME } from "@utils/seo";
import type { APIRoute } from "astro";

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        name: SITE_NAME,
        short_name: SITE_NAME,
        description: "Software engineering portfolio and theJournal.",
        start_url: "/",
        display: "browser",
        background_color: THEME_META_COLORS.light,
        theme_color: THEME_META_COLORS.light,
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/manifest+json" } },
  );
