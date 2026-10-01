/**
 * Who the site belongs to. Profile URLs, the GitHub account and career facts
 * that appear in more than one place are read from here.
 */

const handle = "duranalberto";
const yearsOfExperience = 6;

export const identity = {
  name: "Alberto Duran",
  handle,
  yearsOfExperience,
  /** "6+ years": experience is stated as a floor. */
  experienceLabel: `${yearsOfExperience}+ years`,
} as const;

export interface SocialLink {
  href: string;
  /** Accessible name, e.g. "LinkedIn Profile". */
  label: string;
  /** Short visible form, e.g. "@duranalberto". */
  handle: string;
}

export const socialLinks = {
  linkedIn: {
    href: `https://www.linkedin.com/in/${handle}/`,
    label: "LinkedIn Profile",
    handle: `in/${handle}`,
  },
  github: {
    href: `https://github.com/${handle}/`,
    label: "GitHub Profile",
    handle: `@${handle}`,
  },
} as const satisfies Record<string, SocialLink>;

/** `https://github.com/<handle>/<repo>` */
export function githubRepoUrl(repo: string): string {
  return `https://github.com/${handle}/${repo}`;
}
