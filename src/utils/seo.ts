/**
 * Search and sharing metadata: page titles, descriptions and schema.org
 * JSON-LD. Plain functions with no Astro imports, so pages, endpoints and
 * tests can all use them.
 */
import { identity, socialLinks } from "@data/identity";

export const SITE_NAME = identity.name;
export const SITE_LOCALE = "en_US";
const MAX_TITLE = 60;
export const MAX_DESCRIPTION = 160;

/** Alt text for the share images that are not tied to a page's own image. */
export const DEFAULT_IMAGE_ALT =
  "Alberto Duran, full stack developer: Python, Java and TypeScript";

/**
 * "<title> | Alberto Duran", unless the title already names the site or the
 * suffix would push it past what search results show (~60 characters).
 */
export function formatTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  const branded = `${title} | ${SITE_NAME}`;
  return branded.length <= MAX_TITLE ? branded : title;
}

/** The first candidate that fits a search snippet, else the shortest one. */
export function pickDescription(...candidates: (string | undefined)[]): string {
  const present = candidates.filter((text): text is string => !!text);
  return (
    present.find((text) => text.length <= MAX_DESCRIPTION) ??
    [...present].sort((a, b) => a.length - b.length)[0] ??
    ""
  );
}

export type JsonLd = Record<string, unknown>;

/** What a page adds to the metadata BaseLayout always emits. */
export interface PageSeo {
  /** Alt text for the share image; defaults to DEFAULT_IMAGE_ALT. */
  imageAlt?: string | undefined;
  /** Keep the page out of search results (and omit its canonical URL). */
  noindex?: boolean | undefined;
  /** Marks the page as an article (og:type and article:* tags). */
  article?:
    | {
        published: Date;
        modified?: Date | undefined;
        tags?: readonly string[] | undefined;
      }
    | undefined;
  /** Extra JSON-LD nodes; the site owner (Person) is always included. */
  jsonLd?: ((context: SeoContext) => JsonLd[]) | undefined;
}

/** Resolved values a page's JSON-LD can refer to. */
export interface SeoContext {
  site: URL;
  /** Absolute URL of the page. */
  url: string;
  /** Absolute URL of the page's share image. */
  image: string;
}

const absolute = (path: string, site: URL) => new URL(path, site).href;

/** The site owner, referenced by every other node. */
export function personJsonLd(site: URL): JsonLd {
  return {
    "@type": "Person",
    "@id": absolute("/#person", site),
    name: identity.name,
    url: absolute("/", site),
    jobTitle: "Software Engineer",
    sameAs: Object.values(socialLinks).map(({ href }) => href),
  };
}

export function websiteJsonLd(site: URL, description: string): JsonLd {
  return {
    "@type": "WebSite",
    "@id": absolute("/#website", site),
    name: SITE_NAME,
    url: absolute("/", site),
    description,
    inLanguage: "en",
    publisher: { "@id": absolute("/#person", site) },
  };
}

/** Breadcrumb trail; `crumbs` are [name, path] from the home page down. */
export function breadcrumbJsonLd(
  site: URL,
  crumbs: readonly (readonly [name: string, path: string])[],
): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absolute(path, site),
    })),
  };
}

export interface ArticleMeta {
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  published: Date;
  modified?: Date | undefined;
  tags?: readonly string[] | undefined;
  /** The vault (series) a child entry belongs to. */
  series?: { name: string; path: string } | undefined;
}

export function articleJsonLd(site: URL, article: ArticleMeta): JsonLd {
  const url = absolute(article.path, site);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: article.title.slice(0, 110),
    description: article.description,
    url,
    mainEntityOfPage: url,
    datePublished: article.published.toISOString(),
    dateModified: (article.modified ?? article.published).toISOString(),
    author: { "@id": absolute("/#person", site) },
    publisher: { "@id": absolute("/#person", site) },
    inLanguage: "en",
    ...(article.image ? { image: article.image } : {}),
    ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
    ...(article.series
      ? {
          isPartOf: {
            "@type": "CreativeWorkSeries",
            name: article.series.name,
            url: absolute(article.series.path, site),
          },
        }
      : {}),
  };
}

export interface ProjectMeta {
  title: string;
  description: string;
  path: string;
  image?: string | undefined;
  repository?: string | undefined;
}

/** A project page: source code when it has a public repository. */
export function projectJsonLd(site: URL, project: ProjectMeta): JsonLd {
  const url = absolute(project.path, site);
  return {
    "@type": project.repository ? "SoftwareSourceCode" : "CreativeWork",
    "@id": `${url}#project`,
    name: project.title,
    description: project.description,
    url,
    author: { "@id": absolute("/#person", site) },
    ...(project.image ? { image: project.image } : {}),
    ...(project.repository ? { codeRepository: project.repository } : {}),
  };
}

/** One JSON-LD document holding several nodes. */
export function jsonLdGraph(nodes: readonly JsonLd[]): string {
  // Escape "<" so a value can never close the surrounding <script>.
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes,
  }).replace(/</g, "\\u003c");
}

/** A page about the site owner (the profile page). */
export function profilePageJsonLd(site: URL, url: string): JsonLd {
  return {
    "@type": "ProfilePage",
    url,
    mainEntity: { "@id": absolute("/#person", site) },
  };
}

/** theJournal as a blog published by the site owner. */
export function blogJsonLd(
  site: URL,
  url: string,
  description: string,
): JsonLd {
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: "theJournal",
    url,
    description,
    inLanguage: "en",
    publisher: { "@id": absolute("/#person", site) },
  };
}
