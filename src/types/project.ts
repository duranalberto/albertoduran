import type { ImageMetadata } from "astro";

export interface ProjectFact {
  label: string;
  value: string;
}

/** `icon` is a key of `projectStack` in @data/icons; without one a monogram renders. */
export interface ProjectTech {
  label: string;
  icon?: string;
  monogram?: string;
}

export interface ProjectLinks {
  githubUrl?: string;
  liveUrl?: string;
  journalId?: string;
}

export interface ProjectPageConfig {
  title: string;
  description: string;
  image: ImageMetadata;
  imageAlt: string;
  eyebrow?: string;
  facts?: ProjectFact[];
  links?: ProjectLinks;
  /** Shown as the "Built with" grid under the hero image. */
  stack?: readonly ProjectTech[];
}
