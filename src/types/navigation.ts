export type Sites = "/" | "/profile/" | "/thejournal/";

export interface SiteManifest {
  label: string;
  title: string;
}

export const sitesManifest: Record<Sites, SiteManifest> = {
  "/": {
    label: "AlbertoDuran",
    title: "I am Alberto Duran, Welcome to my site!",
  },
  "/profile/": {
    label: "Professional Profile",
    title: "Alberto Duran | Software Engineer",
  },
  "/thejournal/": {
    label: "TheJournal.",
    title: "TheJournal - Insights & Documentation",
  },
};

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
