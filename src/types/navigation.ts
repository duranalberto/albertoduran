export type Sites = "/" | "/profile/" | "/projects/" | "/thejournal/" | "404";

export interface SiteManifest {
  label: string;
  pageTitle: string;
  description: string;
}

export interface CurrentSite {
  site: Sites;
  isRoot: boolean;
  path: string;
}
