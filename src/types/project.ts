import type { ImageMetadata } from "astro";

export interface ProjectFact {
  label: string;
  value: string;
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
}
