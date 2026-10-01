export interface BuiltWith {
  label: string;
  href: string;
}

import type { Icon } from "./icon";

export interface SocialLink {
  label: string;
  href: string;
  icon: Icon;
  display: string;
}
