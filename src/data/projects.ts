import albertoDuranImage from "@assets/thejournal/stock/01.avif";
import equilyzeImage from "@assets/thejournal/stock/13.jpg";
import pressroomImage from "@assets/thejournal/stock/12.jpg";
import equityImage from "@assets/thejournal/stock/06.avif";
import sinPlumaImage from "@assets/thejournal/stock/07.avif";
import mlscraperImage from "@assets/thejournal/stock/08.avif";
import serverlessVodImage from "@assets/thejournal/stock/17.jpg";
import ravnaryImage from "@assets/thejournal/stock/18.jpg";
import siteHomeShot from "@assets/projects/albertoduran_home.jpg";
import siteJournalShot from "@assets/projects/albertoduran_journal.jpg";
import sitePublicationShot from "@assets/projects/albertoduran_publication.jpg";
import ravnaryHomeShot from "@assets/thejournal/pub/ravnary_home.png";
import ravnaryCardShot from "@assets/thejournal/pub/ravnary_card.png";
import ravnaryQuizShot from "@assets/thejournal/pub/ravnary_quiz_explanation.png";
import sinPlumaWorkShot from "@assets/thejournal/pub/sinpluma_01.png";
import sinPlumaProfileShot from "@assets/thejournal/pub/sinpluma_03.png";
import sinPlumaEditorShot from "@assets/thejournal/pub/sinpluma_06.png";
import streamVaultHomeShot from "@assets/thejournal/pub/streamvault_home.png";
import streamVaultVideoShot from "@assets/thejournal/pub/streamvault_video.png";
import vodCatalogShot from "@assets/thejournal/pub/vod_catalog.png";
import type { ProjectTech } from "@appTypes/project";
import type { ProjectVisualId } from "@data/project_visuals";
import type { ImageMetadata } from "astro";

export type { ProjectTech };

export type ProjectLandingRoute = `/projects/${string}/`;

export type ProjectSlide = { caption: string; alt: string } & (
  | { kind: "image"; image: ImageMetadata }
  | { kind: "visual"; visual: ProjectVisualId }
);

/** A static figure, or one counted at build time so it never goes stale. */
export type ProjectStat =
  | { value: string; label: string }
  | { count: "journalPublications"; label: string };

export interface ProjectSummary {
  title: string;
  shortTitle?: string;
  category: string;
  shortCategory?: string;
  description: string;
  tagline: string;
  href: ProjectLandingRoute;
  image: ImageMetadata;
  imageAlt: string;
  stat: ProjectStat;
  stack: readonly ProjectTech[];
  mediaLabel: string;
  media: readonly ProjectSlide[];
}

const aws = (label: string): ProjectTech => ({ label, icon: "aws" });

export const projectCatalog = [
  {
    title: "Ravnary.com",
    category: "Micro-learning platform on Next.js and AWS",
    shortCategory: "Micro-learning platform",
    description:
      "An open library of short, checked cards. You read one card, then the next, and a quiz is there whenever you want to test yourself.",
    tagline:
      "An open library of short, checked cards. Read one, then the next, and quiz yourself when you're ready.",
    href: "/projects/ravnary/",
    image: ravnaryImage,
    imageAlt: "Two black ravens perched on a pale rock, in black and white",
    stat: { value: "50", label: "topics across 6 subjects" },
    stack: [
      { label: "Next.js", icon: "next" },
      { label: "DynamoDB", icon: "dynamodb" },
      aws("Amplify"),
      aws("AWS CDK"),
    ],
    mediaLabel: "ravnary.com",
    media: [
      {
        kind: "image",
        image: ravnaryHomeShot,
        caption: "Home page",
        alt: "Ravnary home page with the headline Read one card. Then the next.",
      },
      {
        kind: "image",
        image: ravnaryCardShot,
        caption: "A card and its diagram",
        alt: "A Ravnary card explaining deadlocks with a thread and lock diagram",
      },
      {
        kind: "image",
        image: ravnaryQuizShot,
        caption: "Quiz with explanation",
        alt: "A Ravnary quiz question showing the explanation after answering",
      },
    ],
  },
  {
    title: "Serverless VOD and StreamVault",
    shortTitle: "Serverless VOD",
    category: "Serverless video pipeline and public player",
    shortCategory: "Serverless video pipeline",
    description:
      "I wanted to share gameplay without a video platform, so I built a small one. Nothing runs between uploads, and the viewer site is fully static.",
    tagline:
      "My own place to share gameplay. Uploads trigger the pipeline, and nothing runs in between.",
    href: "/projects/serverless-vod/",
    image: serverlessVodImage,
    imageAlt:
      "Nintendo Switch Joy-Con, Xbox and PlayStation controllers, and headphones on a dark desk",
    stat: { value: "0", label: "idle servers" },
    stack: [
      aws("Lambda"),
      aws("MediaConvert"),
      aws("CloudFront"),
      { label: "React", icon: "react" },
    ],
    mediaLabel: "duranalberto.github.io/stream-vault",
    media: [
      {
        kind: "image",
        image: streamVaultVideoShot,
        caption: "StreamVault player",
        alt: "StreamVault playing a Splatoon 3 match with HLS controls",
      },
      {
        kind: "image",
        image: streamVaultHomeShot,
        caption: "Public catalog",
        alt: "StreamVault catalog of gameplay videos with game and mode filters",
      },
      {
        kind: "image",
        image: vodCatalogShot,
        caption: "Upload manager",
        alt: "The private manager page listing uploaded recordings",
      },
    ],
  },
  {
    title: "Pressroom",
    category: "Local multi-agent editorial pipeline",
    description:
      "A pressroom is where a journalist's brief becomes the printed word. Here nine AI agents do the same work, turning source material into a publication-ready article.",
    tagline:
      "Nine local AI agents turn a rough brief into a publication-ready MDX article.",
    href: "/projects/pressroom/",
    image: pressroomImage,
    imageAlt:
      "An open handwritten notebook with a fountain pen resting on the page",
    stat: { value: "9", label: "AI agents" },
    stack: [
      { label: "LangGraph", icon: "python" },
      { label: "Python", icon: "python" },
      { label: "Ollama", icon: "go" },
      { label: "MDX", icon: "markdown" },
    ],
    mediaLabel: "pressroom · terminal",
    media: [
      {
        kind: "visual",
        visual: "pressroom-pipeline",
        caption: "The nine-agent pipeline",
        alt: "Nine agents in order: Loader, Interview, Outline Designer, Visualizer, Writer, Reviewer, Humanizer, Metadata, Publisher",
      },
      {
        kind: "visual",
        visual: "pressroom-mdx",
        caption: "The MDX it writes",
        alt: "An illustrative MDX file with frontmatter, a heading, a chart and a diagram",
      },
    ],
  },
  {
    title: "Equilyze",
    category: "Local multi-agent equity analysis",
    description:
      "Equity plus analyze. Point it at any publicly traded company and it produces a rigorous, multi-model investment report powered entirely by local AI.",
    tagline:
      "Point it at a public company and six local AI agents write an investment report.",
    href: "/projects/equilyze/",
    image: equilyzeImage,
    imageAlt:
      "A glass jar full of coins with a small green plant growing out of it",
    stat: { value: "6", label: "AI agents" },
    stack: [
      { label: "Python", icon: "python" },
      { label: "LangChain", icon: "python" },
      { label: "Ollama", icon: "go" },
      { label: "yfinance", icon: "python" },
    ],
    mediaLabel: "equilyze · terminal",
    media: [
      {
        kind: "visual",
        visual: "equilyze-agents",
        caption: "The six-agent chain",
        alt: "Six agents in order: Contextualizer, News and Sentiment, Synthesizer, Curious Investor, Section Writer, Final Reviewer",
      },
      {
        kind: "visual",
        visual: "equilyze-run",
        caption: "A report run",
        alt: "An illustrative terminal log of the valuation engine and each agent completing",
      },
    ],
  },
  {
    title: "MLScraper",
    category: "Resilient Python monitoring service",
    description:
      "A bargain that sold out within five minutes started a habit of checking for deals and, eventually, a price tracker that was almost too good at finding them.",
    tagline:
      "Watches four stores and sends a Telegram alert when a tracked price drops.",
    href: "/projects/mlscraper/",
    image: mlscraperImage,
    imageAlt: "Red sale tags and a gift advertising a fifty-percent discount",
    stat: { value: "4", label: "stores watched" },
    stack: [
      { label: "FastAPI", icon: "fastapi" },
      { label: "Python", icon: "python" },
      { label: "Telegram", icon: "python" },
    ],
    mediaLabel: "telegram · mlscraper bot",
    media: [
      {
        kind: "visual",
        visual: "mlscraper-alerts",
        caption: "Telegram alerts",
        alt: "Illustrative Telegram messages: a price drop from 12,000 to 10,000 and a new item",
      },
      {
        kind: "visual",
        visual: "mlscraper-health",
        caption: "Service health report",
        alt: "Illustrative health response listing four store providers and job counts",
      },
    ],
  },
  {
    title: "Sin Pluma",
    category: "Solo distributed full-stack system",
    shortCategory: "Distributed full-stack app",
    description:
      "An academic assignment became the project that introduced me to software architecture, then placed second among more than 40 projects even though I built it alone.",
    tagline:
      "A writing platform I built alone for a university course, judged against teams of three.",
    href: "/projects/sin-pluma/",
    image: sinPlumaImage,
    imageAlt:
      "A typewriter and writing desk representing the Sin Pluma publishing platform",
    stat: { value: "2nd place", label: "out of more than 40 projects" },
    stack: [
      { label: "React", icon: "react" },
      { label: "Flask", icon: "flask" },
      { label: "MySQL Cluster", icon: "mysql" },
      { label: "Docker", icon: "docker" },
    ],
    mediaLabel: "sin pluma",
    media: [
      {
        kind: "image",
        image: sinPlumaWorkShot,
        caption: "A published work",
        alt: "Sin Pluma work page for El gato negro with its synopsis and chapters",
      },
      {
        kind: "image",
        image: sinPlumaEditorShot,
        caption: "Author view",
        alt: "Sin Pluma author view of Orgullo y prejuicio with chapter editing",
      },
      {
        kind: "image",
        image: sinPlumaProfileShot,
        caption: "Reader profile",
        alt: "Sin Pluma reader profile with a reading list",
      },
    ],
  },
  {
    title: "Equity Valuation Engine",
    category: "Python domain and decision-support application",
    shortCategory: "Python valuation engine",
    description:
      "Years of conservative investing led me to build a more disciplined way to study companies as I expand my portfolio, with assumptions and uncertainty kept visible.",
    tagline:
      "Values a company with five models across bear, base and bull cases, and keeps the disagreement visible.",
    href: "/projects/equity-valuation-engine/",
    image: equityImage,
    imageAlt:
      "A financial market chart with candlesticks and trend lines on a dark display",
    stat: { value: "5 × 3", label: "models × scenarios" },
    stack: [
      { label: "Python", icon: "python" },
      { label: "yfinance", icon: "python" },
    ],
    mediaLabel: "terminal · CLI + JSON",
    media: [
      {
        kind: "visual",
        visual: "eve-ranges",
        caption: "Model ranges against price",
        alt: "Sample bear to bull value ranges for DCF, ROE, EV/EBITDA, P/S and NAV against a $50 price",
      },
      {
        kind: "visual",
        visual: "eve-cli",
        caption: "CLI output",
        alt: "Sample CLI table of bear, base and bull values per model with a $51.20 composite",
      },
    ],
  },
  {
    title: "albertoduran.com",
    category: "Static publishing and build system",
    description:
      "I started this site after a layoff gave me a reason to show more than a résumé or short interview could hold. It grew into a static-first portfolio and publishing platform.",
    tagline:
      "The static-first portfolio and publishing platform you are reading right now.",
    href: "/projects/albertoduran/",
    image: albertoDuranImage,
    imageAlt:
      "A bright development workspace with source code open on a laptop",
    stat: { count: "journalPublications", label: "publications in theJournal" },
    stack: [
      { label: "Astro", icon: "astro" },
      { label: "MDX", icon: "markdown" },
      { label: "TypeScript", icon: "ts" },
      { label: "Cloudflare", icon: "cloudflare" },
    ],
    mediaLabel: "albertoduran.com",
    media: [
      {
        kind: "image",
        image: siteHomeShot,
        caption: "Home page",
        alt: "The albertoduran.com home page with the hero and live feed panel",
      },
      {
        kind: "image",
        image: siteJournalShot,
        caption: "theJournal",
        alt: "The theJournal index listing publications",
      },
      {
        kind: "image",
        image: sitePublicationShot,
        caption: "A publication",
        alt: "A theJournal publication about the AWS serverless video workflow",
      },
    ],
  },
] as const satisfies readonly ProjectSummary[];

const featuredRoutes: readonly ProjectLandingRoute[] = [
  "/projects/ravnary/",
  "/projects/serverless-vod/",
  "/projects/sin-pluma/",
  "/projects/equity-valuation-engine/",
];

/** The four projects shown on the index and profile pages, in this order. */
export const featuredProjects: readonly ProjectSummary[] = featuredRoutes.map(
  (href) => {
    const project = projectCatalog.find((entry) => entry.href === href);
    if (!project)
      throw new Error(`Featured project ${href} is not in the catalog`);
    return project;
  },
);
