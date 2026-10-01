import { entryManifest } from "@content/processors/thejournal";
import { projectCatalog } from "@data/projects";
import { journalHref, journalIndexHref } from "@utils/routes";
import { sitemapXml, type SitemapUrl } from "@utils/seo_files";
import type { APIRoute } from "astro";

/** Every indexable page: top-level sections, project pages, Journal entries. */
export function sitemapUrls(): SitemapUrl[] {
  const entries = Object.values(entryManifest).map((entry) => ({
    path: journalHref(entry.id),
    lastmod: entry.updatedDate ?? entry.pubDate,
  }));
  const newestEntry = entries
    .map(({ lastmod }) => lastmod)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    { path: "/" },
    { path: "/profile/" },
    { path: "/projects/" },
    ...projectCatalog.map(({ href }) => ({ path: href })),
    { path: journalIndexHref, lastmod: newestEntry },
    ...entries,
  ];
}

export const GET: APIRoute = ({ site }) =>
  new Response(sitemapXml(site!, sitemapUrls()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
