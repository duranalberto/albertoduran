export type Sites = "/" | "/profile/" | "/thejournal/" | "404";

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

export const getCurrentSite = (path: string): CurrentSite => {
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  const specificSites: Exclude<Sites, "/">[] = ["/thejournal/", "/profile/"];

  const match = specificSites.find((site) => normalizedPath.startsWith(site));

  const site: Sites = match ?? "/";
  const isRoot = normalizedPath === site;

  return {
    site,
    isRoot,
    path: normalizedPath,
  };
};

export const isTheJourneyPublication = (current: CurrentSite) => {
  return current.site === "/thejournal/" && !current.isRoot;
};
