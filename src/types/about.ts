import { type Icon } from "./icon";

export interface Skills {
  category: string;
  skills_icons: Icon[];
}

export interface Strength {
  title: string;
  /** Key of the `ui` icon set in @data/icons. */
  icon: string;
  /** The supporting sentence, shown second in smaller type. */
  context: string;
  /** The habit's one-line conclusion, shown first. Omitted when the habit is a single sentence. */
  takeaway?: string;
  /** Applies across the whole path instead of being one step in it. */
  everyStep?: boolean;
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
