export type ProjectLandingRoute = `/projects/${string}/`;

const projectLandingRoutes = {
  building_albertoduran: "/projects/albertoduran/",
  equity_valuation_engine: "/projects/equity-valuation-engine/",
  mlscraper: "/projects/mlscraper/",
  sin_pluma: "/projects/sin-pluma/",
} as const satisfies Record<string, ProjectLandingRoute>;

export function getProjectEntryHref(
  journalEntryId: string,
  routes: Readonly<Record<string, ProjectLandingRoute>> = projectLandingRoutes,
): string {
  return routes[journalEntryId] ?? `/thejournal/${journalEntryId}/`;
}
