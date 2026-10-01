import type { SiteManifest } from "@appTypes/navigation";
import type { ProjectPageConfig } from "@appTypes/project";
import { isVaultChild } from "@content/entry_kind";
import { projectCatalog, type ProjectSummary } from "@data/projects";
import { pickDescription } from "@utils/seo";

export type ProjectHref = (typeof projectCatalog)[number]["href"];

/** What a project page writes itself; the rest comes from projectCatalog. */
export type ProjectPageInput = Omit<
  ProjectPageConfig,
  "title" | "image" | "imageAlt"
> & {
  /** Defaults to the catalog title. */
  title?: string;
};

const MAX_FACTS = 4;

/**
 * Hero settings for a project landing page. The cover image, its alt text and
 * (unless overridden) the title come from the page's projectCatalog entry, so
 * the card and the hero cannot drift apart.
 */
export function defineProjectPage(
  href: ProjectHref,
  input: ProjectPageInput,
  catalog: readonly ProjectSummary[] = projectCatalog,
): ProjectPageConfig {
  const entry = catalog.find((project) => project.href === href);
  if (!entry) {
    throw new Error(`[projects] ${href} is not in projectCatalog.`);
  }

  const { title = entry.title, ...rest } = input;
  if (rest.facts && rest.facts.length > MAX_FACTS) {
    throw new Error(
      `[projects] "${title}" has ${rest.facts.length} hero facts. Project pages support at most ${MAX_FACTS} facts.`,
    );
  }

  return {
    ...rest,
    title,
    image: entry.image,
    imageAlt: entry.imageAlt,
    metaDescription: pickDescription(rest.description, entry.tagline),
  };
}

/** A project page may link to a standalone publication or a vault root only. */
export function assertProjectJournalLink(
  link: { id: string; vaultId?: string | undefined },
  projectTitle: string,
): void {
  if (isVaultChild(link)) {
    throw new Error(
      `[projects] "${projectTitle}" references Journal child entry "${link.id}". Project pages may reference only standalone publications or vault roots.`,
    );
  }
}

/** Page metadata for a page titled after its subject. */
export function buildSiteManifest({
  title,
  description,
}: {
  title: string;
  description: string;
}): SiteManifest {
  return { label: title, pageTitle: title, description };
}
