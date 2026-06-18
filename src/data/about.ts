import {
  type Awards,
  type Certifications,
  type Education,
  type Experience,
  type Projects,
  type RecruiterQuestion,
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

const strengths: Strength[] = [
  {
    title: "Architecture and Design Judgment",
    description:
      "Improved build initialization, dependency reuse, package structure, and runtime reliability in documentation systems where small changes could affect many generated publication pages.",
  },
  {
    title: "Coding and Problem Solving",
    description:
      "Built a recursive markup-merging plugin to restore advanced syntax-highlight customization after upstream highlight.js behavior changed.",
  },
  {
    title: "End-to-End Delivery",
    description:
      "Worked across implementation, testing, debugging, migration validation, and platform maintenance in both Oracle and TCS environments.",
  },
  {
    title: "Platform Reliability",
    description:
      "Resolved race conditions, runtime initialization issues, migration defects, and production-impacting behavior in complex enterprise systems.",
  },
  {
    title: "Tooling and Automation",
    description:
      "Built and maintained Python migration tooling and personal Python/FastAPI systems for scheduled data extraction, provider boundaries, structured output, and notifications.",
  },
  {
    title: "Cross-Functional Collaboration",
    description:
      "Worked with engineers, technical writers, QA, business stakeholders, client stakeholders, and platform maintainers to deliver and validate software changes.",
  },
];

const recruiterQuestions: RecruiterQuestion[] = [
  {
    question: "Why are you looking for a new role?",
    answer:
      "My Oracle role ended as part of a layoff after more than four years with the company. I did not resign. I valued the team, the collaboration, and the work I delivered there, and I am now looking for a role better aligned with my long-term direction.",
  },
  {
    question: "What direction are you targeting next?",
    answer:
      "I am targeting backend-facing full-stack, internal tools, platform, and application modernization roles. My long-term goal is to grow toward software architecture, so I am looking for work that builds deeper ownership across systems, data flows, tooling, APIs, reliability, and product-facing delivery.",
  },
  {
    question: "Why move beyond frontend-focused roles?",
    answer:
      "My recent work was frontend-heavy, but my strongest contributions were closer to platform engineering: runtime reliability, build initialization, dependency reuse, migration tooling, legacy modernization, and debugging production-impacting behavior. Frontend-only positions no longer fit the full profile I am building toward.",
  },
  {
    question: "What kind of engineering work do you bring?",
    answer:
      "I bring experience across Oracle documentation platforms, generated publication systems, enterprise Java environments, Python migration tooling, security migration support, database/mainframe-connected workflows, QA validation, and cross-functional delivery.",
  },
  {
    question: "What roles are the strongest fit?",
    answer:
      "Best-fit roles include full-stack engineer, web platform engineer, internal tools engineer, application modernization engineer, migration tools engineer, backend-facing software engineer, and developer tools/platform roles.",
  },
  {
    question: "How should recruiters read your backend and cloud experience?",
    answer:
      "I have enterprise Java background, Python tooling experience, FastAPI/backend-facing project work, and strong platform reliability experience. I am also interested in developing with cloud providers when the opportunity allows ramp-up, but I am not positioning myself as a senior Spring Boot/AWS/cloud specialist.",
  },
];

const experience: Experience[] = [
  {
    company: "ORACLE",
    role: "Software Developer at docs.oracle.com",
    period: "May 2021 – August 2025",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Platform Reliability: Improved runtime-generated documentation page templates by strengthening build initialization flows and resolving race conditions that affected stable page rendering.",
      "Architecture and Optimization: Reduced internal pipeline inefficiencies by improving dependency reuse, package structure, and publication output behavior, cutting package sizes by up to 90%.",
      "Coding and Problem Solving: Built a recursive markup-merging plugin to restore advanced syntax-highlight customization after highlight.js deprecated HTML auto-merging behavior.",
      "Python Migration Tooling: Updated and maintained Python-based migration tooling to support evolving publication requirements and help move legacy documentation into modern platform workflows.",
      "Modernization: Modernized and stabilized legacy publication interfaces, extending their useful life while reducing maintenance friction.",
      "Web Platform Delivery: Developed and maintained production-facing documentation web interfaces using Preact, Oracle JET, JavaScript/TypeScript, HTML, and CSS while balancing stakeholder and platform constraints.",
    ],
  },
  {
    company: "TATA CONSULTANCY SERVICES",
    role: "Java Software Developer at USAA.com",
    period: "July 2019 – April 2021",
    location: "Guadalajara, Jalisco",
    achievements: [
      "Enterprise Security Migration: Supported a large-scale CyberArk migration for a major financial institution, helping transition multiple application entry points toward more secure data access workflows.",
      "Enterprise Systems Support: Worked across Java applications, Perl scripts, database-connected workflows, and mainframe-connected systems to support migration, validation, and compliance requirements.",
      "Java and Integration Work: Contributed to Java EE and limited Spring-based enterprise components while coordinating implementation details with QA, business, and technical stakeholders.",
      "Migration Validation: Designed and executed targeted QA test cases to validate migration behavior, security requirements, and system reliability.",
      "Cross-Functional Delivery: Communicated security behavior, implementation details, and migration progress with business and technical stakeholders.",
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
  strengths,
  recruiterQuestions,
  experience,
  education,
  certifications,
  awards,
  projects,
};
