import {
  type Awards,
  type Certifications,
  type Education,
  type Experience,
  type Projects,
  type Skills,
  type Strength,
} from "@appTypes/about";
import { skills as icons } from "@data/icons";

const skills: Skills[] = [
  {
    category: "Languages",
    skills_icons: [icons.js!, icons.ts!, icons.python!, icons.java!],
  },
  {
    category: "Frameworks and libraries",
    skills_icons: [
      icons.react!,
      icons.preact!,
      icons.oracle_jet!,
      icons.fastapi!,
      icons.astro!,
    ],
  },
  {
    category: "DevOps and platforms",
    skills_icons: [
      icons.aws!,
      icons.docker!,
      icons.git!,
      icons.jenkins!,
      icons.jira!,
      icons.oracle_infrastructure!,
      icons.oracle_apex!,
    ],
  },
];

const strengths: Strength[] = [
  {
    title: "Understand the system before changing it",
    description:
      "I first trace how the application, its data, and its users are connected. That helps me make changes in the right place instead of treating only the visible symptom.",
  },
  {
    title: "Work within real constraints",
    description:
      "I balance product needs with existing code, framework limitations, security requirements, and delivery timelines. A useful solution has to work in the environment the team actually has.",
  },
  {
    title: "Build for reliability",
    description:
      "I think about bad input, race conditions, failed integrations, and recovery while I build. Reliability is part of the work, not something to add after the feature is finished.",
  },
  {
    title: "Leave software easier to maintain",
    description:
      "I look for clear responsibilities, reusable dependencies, simpler migration paths, and automation that removes repetitive work. The next change should be easier than the last one.",
  },
  {
    title: "Follow the work through delivery",
    description:
      "I stay involved through implementation, testing, debugging, release checks, and maintenance. I want to know that the change works outside my local environment.",
  },
  {
    title: "Work directly with the people involved",
    description:
      "I clarify requirements with technical and business stakeholders, coordinate verification with QA, and explain decisions in terms each group can use.",
  },
];

const experience: Experience[] = [
  {
    company: "ORACLE",
    role: "Software Developer at docs.oracle.com",
    period: "May 2021 to August 2025",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Made runtime-generated documentation pages more reliable by improving build startup and fixing race conditions that caused unstable rendering.",
      "Improved dependency reuse, package structure, and publication output in the internal pipeline. These changes reduced some package sizes by as much as 90%.",
      "Built a recursive markup-merging plugin that restored advanced syntax customization after highlight.js deprecated its automatic HTML merging behavior.",
      "Updated and maintained Python migration tools as publication requirements changed, helping move legacy documentation into the current platform.",
      "Modernized and stabilized legacy publishing interfaces so they remained useful and easier to maintain.",
      "Built and maintained production documentation interfaces with Preact, Oracle JET, JavaScript, TypeScript, HTML, and CSS within stakeholder and platform constraints.",
    ],
  },
  {
    company: "TATA CONSULTANCY SERVICES",
    role: "Java Software Developer at USAA.com",
    period: "July 2019 to April 2021",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Supported a large CyberArk migration for a major financial institution, moving several application entry points to more secure data access workflows.",
      "Worked with Java applications, Perl scripts, databases, and mainframe-connected systems to meet migration, validation, and compliance requirements.",
      "Contributed to Java EE components and a smaller amount of Spring-based code, coordinating the details with QA and business and technical teams.",
      "Designed and ran focused QA tests to verify migration behavior, security requirements, and system reliability.",
      "Kept business and technical teams informed about security behavior, implementation details, and migration progress.",
    ],
  },
];

const education: Education[] = [
  {
    school: "UNIVERSIDAD DE GUADALAJARA",
    degree: "Bachelor of Science in Computer Engineering",
    period: "2015 to 2019",
  },
  {
    school: "CENTRO DE ENSEÑANZA TECNICA INDUSTRIAL",
    degree: "Associate of Science in Computer Science",
    period: "2010 to 2014",
  },
];

const certifications: Certifications[] = [
  {
    name: "AWS Certified Cloud Practitioner",
    link: "https://www.credly.com/badges/e9debe12-afae-4d0f-82d5-453f8ca830a1/",
  },
  {
    name: "Oracle Cloud Infrastructure 2025 AI Foundations Associate",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=E494C7D9F76122F3536EED33BBD2790F98E8FBE4C4A035BFAF8EBC9AB0568C9B",
  },
  {
    name: "Oracle Cloud Infrastructure 2025 Certified Foundations Associate",
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=296C6DA46AEB6498F3CE3D3244AAA6A7100534E388BBB79F3828EB54B38481AA",
  },
  {
    name: "Oracle Certified Associate, Java SE 7 Programmer",
    link: "https://www.credly.com/badges/414df637-5a83-4ab1-8530-59d77fef76f9",
  },
];

const awards: Awards[] = [
  {
    title: "CENEVAL EGEL academic excellence award",
    org: "CENEVAL",
    desc: "Earned an outstanding score in three evaluated areas.",
    link: "https://reconocimiento.ceneval.edu.mx/busqueda-de-reconocimientos-2/?resultId=4574",
  },
  {
    title: "Second place at the DIVEC 2019 showcase",
    org: "Universidad De Guadalajara",
    desc: "Placed second among 40 projects with a scalable microservices architecture.",
  },
];

const projects: Projects[] = [
  {
    name: "Equity Valuation Engine",
    tech: "Python, CLI",
    desc: "Equity valuation engine vault covering data loading, suitability checks, valuation models, assumptions, CLI output, and tests.",
    link: "/thejournal/equity_valuation_engine/",
    github_link: "github.com/duranalberto/equity-valuation-engine",
    image: "/a.jpg",
  },
  {
    name: "Product Tracker (MLScraper)",
    tech: "Python, FastAPI",
    desc: "Scheduled product tracking vault covering provider loops, YAML jobs, health checks, persistence, and Telegram alerts.",
    link: "/thejournal/mlscraper/",
    github_link: "github.com/duranalberto/MLScraper",
    image: "/a.jpg",
  },
  {
    name: "Scalable Microservices System",
    tech: "Docker, Nginx, Python, React",
    desc: "High-concurrency system using Flask, React.js, InnoDB Cluster, Minio, and Redis.",
    link: "/project/SinPluma",
    github_link: "github.com/duranalberto/SinPluma",
    image: "/a.jpg",
  },
];

export default {
  skills,
  strengths,
  experience,
  education,
  certifications,
  awards,
  projects,
};
