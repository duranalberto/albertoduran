import { entryManifest } from "@content/processors/thejournal";
import { sitesManifest } from "@data/site_manifest";
import { journalHref, journalIndexHref } from "@utils/routes";
import { rssXml } from "@utils/seo_files";
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
  new Response(
    rssXml(site!, {
      title: "theJournal | Alberto Duran",
      description: sitesManifest["/thejournal/"].description,
      path: journalIndexHref,
      feedPath: `${journalIndexHref}rss.xml`,
      items: Object.values(entryManifest).map((entry) => ({
        title: entry.title,
        path: journalHref(entry.id),
        description: entry.description,
        published: entry.pubDate,
        categories: entry.tags,
      })),
    }),
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
  );
