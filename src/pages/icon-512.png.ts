import { pngResponse, renderSiteIcon } from "@utils/site_icons";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () =>
  pngResponse(
    await renderSiteIcon(512, { background: "#ffffff", padding: 0.12 }),
  );
