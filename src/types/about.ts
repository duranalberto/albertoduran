import { type Icon } from "./icon";

export interface Skills {
  category: string;
  skills_icons: Icon[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  achievements: string[];
}

export interface Education {
  school: string;
  degree: string;
  period: string;
}

export interface Certifications {
  name: string;
  link: string;
}

export interface Awards {
  title: string;
  org: string;
  desc: string;
  link?: string;
}

export interface Projects {
  name: string;
  tech: string;
  desc: string;
  link: string;
  image: string;
  github_link: string;
}
