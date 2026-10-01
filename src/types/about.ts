import type { UiIconKey } from "@data/icons";
import { type Icon } from "./icon";

export interface Skills {
  category: string;
  icons: Icon[];
}

export interface Strength {
  title: string;
  icon: UiIconKey;
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
