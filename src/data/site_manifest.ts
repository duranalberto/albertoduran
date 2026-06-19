import type { SiteManifest, Sites } from "@appTypes/navigation";

export const sitesManifest: Record<Sites, SiteManifest> = {
  "/": {
    label: "AlbertoDuran",
    pageTitle: "Alberto Duran",
    description:
      "Hi! You've found my tiny space in the digital world. Feel free to explore: whether it's for recruiting or reading my publications",
  },
  "/profile/": {
    label: "Professional Profile",
    pageTitle: "Alberto Duran | Software Engineer",
    description:
      "Results-oriented Software Engineer with experience designing, optimizing, and deploying web applications and enterprise solutions. Analytical and delivery-focused, with an emphasis on scalable, maintainable systems that support business and user needs.",
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
