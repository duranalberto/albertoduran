import { robotsTxt } from "@utils/seo_files";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt(site!), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
