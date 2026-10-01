import type { CurrentSite, Sites } from "@appTypes/navigation";

/** Which top-level section a path belongs to, and whether it is that section's root. */
export const getCurrentSite = (path: string): CurrentSite => {
  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  const specificSites: Exclude<Sites, "/">[] = [
    "/thejournal/",
    "/projects/",
    "/profile/",
  ];

  const match = specificSites.find((site) => normalizedPath.startsWith(site));

  const site: Sites = match ?? "/";
  const isRoot = normalizedPath === site;

  return {
    site,
    isRoot,
    path: normalizedPath,
  };
};
