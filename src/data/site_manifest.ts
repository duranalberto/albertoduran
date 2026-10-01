import type { SiteManifest, Sites } from "@appTypes/navigation";
import { identity } from "@data/identity";

export const sitesManifest: Record<Sites, SiteManifest> = {
  "/": {
    label: "AlbertoDuran",
    pageTitle: "Alberto Duran | Software Engineer",
    description:
      "Hi! You've found my tiny space in the digital world. Feel free to explore: whether it's for recruiting or reading my publications",
  },
  "/profile/": {
    label: "Professional profile",
    pageTitle: "Alberto Duran | Full-Stack and Backend Systems Engineer",
    description: `${identity.name} is a software engineer with ${identity.experienceLabel} of experience in full-stack apps, backend systems, enterprise Java, Python tooling, and TypeScript.`,
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
    description:
      "Technical write-ups and project vaults by Alberto Duran on software architecture, AWS, Python, AI agents, and how this site is built.",
  },
  "404": {
    label: "404",
    pageTitle: "404 - Page Not Found",
    description: "Don't enter this page!",
  },
};
