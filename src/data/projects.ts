import sinPlumaImage from "@assets/thejournal/stock/07.avif";
import albertoDuranImage from "@assets/thejournal/stock/01.avif";
import equityImage from "@assets/thejournal/stock/06.avif";
import mlscraperImage from "@assets/thejournal/stock/08.avif";
import type { ProjectLandingRoute } from "@data/project_pages";
import type { ImageMetadata } from "astro";

export interface ProjectSummary {
  title: string;
  category: string;
  description: string;
  href: ProjectLandingRoute;
  image: ImageMetadata;
  imageAlt: string;
  technologies: readonly string[];
}

export const projectCatalog = [
  {
    title: "albertoduran.com",
    category: "Portfolio · Publishing",
    description:
      "A static-first portfolio and technical publishing system where typed content, build-rendered visuals, and progressive enhancement keep deep engineering material fast and approachable.",
    href: "/projects/albertoduran/",
    image: albertoDuranImage,
    imageAlt:
      "A bright development workspace with source code open on a laptop",
    technologies: ["Astro", "MDX", "Static-first", "Cloudflare"],
  },
  {
    title: "Equity Valuation Engine",
    category: "Finance · Decision Support",
    description:
      "An auditable Python engine that carries data quality, model suitability, assumptions, scenarios, and skipped-method reasons all the way into its valuation output.",
    href: "/projects/equity-valuation-engine/",
    image: equityImage,
    imageAlt:
      "A financial market chart with candlesticks and trend lines on a dark display",
    technologies: ["Python", "yfinance", "DCF", "CLI · JSON"],
  },
  {
    title: "MLScraper",
    category: "Commerce · Automation",
    description:
      "A multi-source price tracker built around independent provider loops, defensive fetching, durable product history, operational health, and useful alerts.",
    href: "/projects/mlscraper/",
    image: mlscraperImage,
    imageAlt: "Red sale tags and a gift advertising a fifty-percent discount",
    technologies: ["FastAPI", "asyncio", "Playwright", "Telegram"],
  },
  {
    title: "Sin Pluma",
    category: "Writing · Distributed Systems",
    description:
      "A writing platform that connects rich editing and discovery with secure sessions, language analysis, specialized storage, and an automated high-availability database cluster.",
    href: "/projects/sin-pluma/",
    image: sinPlumaImage,
    imageAlt:
      "A typewriter and writing desk representing the Sin Pluma publishing platform",
    technologies: ["React · Slate", "Flask", "MySQL Cluster", "Docker"],
  },
] as const satisfies readonly ProjectSummary[];
