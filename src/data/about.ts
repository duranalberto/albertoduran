import {
  type Awards,
  type Certifications,
  type Education,
  type Experience,
  type Projects,
  type Skills,
} from "@appTypes/about";
import { skills as icons } from "@data/icons";

const skills: Skills[] = [
  {
    category: "Languages",
    skills_icons: [icons.js!, icons.ts!, icons.python!, icons.java!],
  },
  {
    category: "Frameworks & Libraries",
    skills_icons: [
      icons.react!,
      icons.preact!,
      icons.oracle_jet!,
      icons.fastapi!,
      icons.astro!,
    ],
  },
  {
    category: "DevOps & Platforms",
    skills_icons: [
      icons.docker!,
      icons.git!,
      icons.jenkins!,
      icons.jira!,
      icons.oracle_infrastructure!,
      icons.oracle_apex!,
    ],
  },
];

const experience: Experience[] = [
  {
    company: "ORACLE",
    role: "Software Developer at docs.oracle.com",
    period: "May 2021 – August 2025",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Platform Optimization: Re-architected internal publication pipelines to achieve a 90% reduction in package sizes, significantly lowering latency and accelerating server-side processing for docs.oracle.com.",
      "Developer Tooling: Engineered a real-time live loading system that slashed local development load cycles from minutes to seconds, increasing team velocity and enabling instant feedback loops. ",
      "Modernization & Migration: Led the full-stack migration of publication templates (Oracle JET 11 to 18), resolving complex architectural shifts and merge conflicts to ensure 100% backward compatibility with legacy content. ",
      "Python Automation: Developed and maintained a Python-based migration tool to automate the transition of legacy publications into modern documentation systems, ensuring data integrity and reducing manual effort. ",
      "Data Visualization: Enhanced analytics capabilities by integrating new data sources into Oracle APEX dashboards, enabling stakeholders to make data-driven decisions based on site traffic and user behavior. ",
      "Algorithm Implementation: Designed a recursive merging plugin for highlight.js to restore custom code highlighting, bypassing deprecated HTML auto-merging limitations to correctly render complex nested styles. ",
    ],
  },
  {
    company: "TATA CONSULTANCY SERVICES",
    role: "Java Software Developer at USAA.com",
    period: "July 2019 – April 2021",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Enterprise Security: Contributed to a large-scale security migration for a major financial institution, transitioning multiple enterprise entry points to CyberArk systems to protect critical backend and database infrastructures. ",
      "Backend Engineering: Demonstrated technical versatility by developing and maintaining Java EE and Spring based projects, writing Perl scripts, and integrating with databases and mainframe systems to deliver robust enterprise solutions.",
      "Quality Assurance: Improved system reliability by designing and executing targeted QA test cases, ensuring full compliance with rigorous business and technical requirements. ",
      "Stakeholder Management: Delivered technical demos to client executives, effectively communicating system functionality, security enhancements, and project milestones. ",
    ],
  },
];

const education: Education[] = [
  {
    school: "UNIVERSIDAD DE GUADALAJARA",
    degree: "Bachelor of Science in Computer Engineering",
    period: "2015 – 2019",
  },
  {
    school: "CENTRO DE ENSEÑANZA TECNICA INDUSTRIAL",
    degree: "Associate of Science in Computer Science",
    period: "2010 – 2014",
  },
];

const certifications: Certifications[] = [
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
    link: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=296C6DA46AEB6498F3CE3D3244AAA6A7100534E388BBB79F3828EB54B38481AA",
  },
];

const awards: Awards[] = [
  {
    title: "Academic Excellence in Egel Ceneval",
    org: "CENEVAL",
    desc: "Outstanding score in 3 evaluated areas.",
    link: "https://reconocimiento.ceneval.edu.mx/busqueda-de-reconocimientos-2/?resultId=4574",
  },
  {
    title: "2nd Best Project in DIVEC 2019 Showcase",
    org: "Universidad De Guadalajara",
    desc: "Recognized for building a scalable microservices architecture against 40 competitors.",
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
  experience,
  education,
  certifications,
  awards,
  projects,
};
