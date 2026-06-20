import type { SiteManifest, Sites } from "@appTypes/navigation";

export const sitesManifest: Record<Sites, SiteManifest> = {
  "/": {
    label: "AlbertoDuran",
    pageTitle: "Alberto Duran",
    description:
      "Hi! You've found my tiny space in the digital world. Feel free to explore: whether it's for recruiting or reading my publications",
  },
  "/profile/": {
    label: "Professional profile",
    pageTitle: "Alberto Duran | Full-Stack and Backend Systems Engineer",
    description:
      "Alberto Duran is a software engineer with 6+ years of experience across full-stack applications, backend systems, enterprise Java, Python tooling, and TypeScript platforms.",
  },
  "/projects/": {
    label: "Projects",
    pageTitle: "My Projects | Alberto Duran",
    description:
      "Selected engineering projects spanning static publishing, financial analysis, commerce automation, and distributed systems.",
  },
  "/thejournal/": {
    label: "TheJournal.",
    pageTitle: "TheJournal - Insights & Documentation",
    description: "Like a blog, but with a cooler name",
  },
  "404": {
    label: "404",
    pageTitle: "404 - Page Not Found",
    description: "Don't enter this page!",
  },
};
