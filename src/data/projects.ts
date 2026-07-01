import albertoDuranImage from "@assets/thejournal/stock/01.avif";
import equilyzeImage from "@assets/thejournal/stock/13.jpg";
import pressroomImage from "@assets/thejournal/stock/12.jpg";
import equityImage from "@assets/thejournal/stock/06.avif";
import sinPlumaImage from "@assets/thejournal/stock/07.avif";
import mlscraperImage from "@assets/thejournal/stock/08.avif";
import type { ProjectLandingRoute } from "@data/project_pages";
import type { ImageMetadata } from "astro";

export interface ProjectSummary {
  title: string;
  category: string;
  description: string;
  signal: string;
  href: ProjectLandingRoute;
  image: ImageMetadata;
  imageAlt: string;
  technologies: readonly string[];
}

export const projectCatalog = [
  {
    title: "Pressroom",
    category: "Local multi-agent editorial pipeline",
    description:
      "A pressroom is where a journalist's brief becomes the printed word. Here nine AI agents do the same work, turning source material into a publication-ready article.",
    signal:
      "A nine-agent LangGraph pipeline that outlines, writes, reviews, humanizes, and publishes MDX with rendered charts and diagrams. Every model runs locally through Ollama.",
    href: "/projects/pressroom/",
    image: pressroomImage,
    imageAlt:
      "An open handwritten notebook with a fountain pen resting on the page",
    technologies: ["LangGraph", "Python", "Ollama", "MDX"],
  },
  {
    title: "Equilyze",
    category: "Local multi-agent equity analysis",
    description:
      "Equity plus analyze. Point it at any publicly traded company and it produces a rigorous, multi-model investment report powered entirely by local AI.",
    signal:
      "A pipeline that runs six valuation models across three scenarios, then chains six AI agents to add context, research news, and write a structured report — fully offline.",
    href: "/projects/equilyze/",
    image: equilyzeImage,
    imageAlt:
      "A glass jar full of coins with a small green plant growing out of it",
    technologies: ["Python", "LangChain", "Ollama", "yfinance"],
  },
  {
    title: "MLScraper",
    category: "Resilient Python monitoring service",
    description:
      "A bargain that sold out within five minutes started a habit of checking for deals and, eventually, a price tracker that was almost too good at finding them.",
    signal:
      "A FastAPI and asyncio service that runs each provider independently. It keeps product history, reports its health, and sends Telegram alerts when a tracked price changes.",
    href: "/projects/mlscraper/",
    image: mlscraperImage,
    imageAlt: "Red sale tags and a gift advertising a fifty-percent discount",
    technologies: ["FastAPI", "Python", "Telegram"],
  },
  {
    title: "Sin Pluma",
    category: "Solo distributed full-stack system",
    description:
      "An academic assignment became the project that introduced me to software architecture, then placed second among 40 projects even though I built it alone.",
    signal:
      "A React and Flask writing platform with REST APIs, access and refresh tokens, Redis-backed logout, MinIO storage, Docker networking, and a three-node MySQL cluster.",
    href: "/projects/sin-pluma/",
    image: sinPlumaImage,
    imageAlt:
      "A typewriter and writing desk representing the Sin Pluma publishing platform",
    technologies: ["React", "Flask", "MySQL Cluster", "Docker"],
  },
  {
    title: "Equity Valuation Engine",
    category: "Python domain and decision-support application",
    description:
      "Years of conservative investing led me to build a more disciplined way to study companies as I expand my portfolio, with assumptions and uncertainty kept visible.",
    signal:
      "A Python tool that separates data loading, normalized metrics, model checks, calculations, scenarios, and CLI or JSON output.",
    href: "/projects/equity-valuation-engine/",
    image: equityImage,
    imageAlt:
      "A financial market chart with candlesticks and trend lines on a dark display",
    technologies: ["Python", "yfinance"],
  },
  {
    title: "albertoduran.com",
    category: "Static publishing and build system",
    description:
      "I started this site after a layoff gave me a reason to show more than a résumé or short interview could hold. It grew into a static-first portfolio and publishing platform.",
    signal:
      "An Astro and TypeScript site with typed content, manifest-driven publishing, generated routes, build-time diagrams and charts, and a small runtime layer.",
    href: "/projects/albertoduran/",
    image: albertoDuranImage,
    imageAlt:
      "A bright development workspace with source code open on a laptop",
    technologies: ["Astro", "MDX", "Static-first", "Cloudflare"],
  },
] as const satisfies readonly ProjectSummary[];
