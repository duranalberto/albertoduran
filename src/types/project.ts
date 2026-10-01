import type { ProjectStackIconKey } from "@data/icons";
import type { ImageMetadata } from "astro";

export interface ProjectFact {
  label: string;
  value: string;
}

/** Without an icon, a monogram renders. */
export interface ProjectTech {
  label: string;
  icon?: ProjectStackIconKey;
  monogram?: string;
}

export interface ProjectLinks {
  githubUrl?: string;
  liveUrl?: string;
  journalId?: string;
}

/** The hero shows at most four facts. */
export type ProjectFacts =
  | readonly []
  | readonly [ProjectFact]
  | readonly [ProjectFact, ProjectFact]
  | readonly [ProjectFact, ProjectFact, ProjectFact]
  | readonly [ProjectFact, ProjectFact, ProjectFact, ProjectFact];

export interface ProjectPageConfig {
  title: string;
  description: string;
  image: ImageMetadata;
  imageAlt: string;
  eyebrow?: string;
  facts?: ProjectFacts;
  links?: ProjectLinks;
  /** Shown as the "Built with" grid under the hero image. */
  stack?: readonly ProjectTech[];
}
