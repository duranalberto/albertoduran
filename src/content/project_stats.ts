import type { ProjectStat, ProjectSummary } from "@data/projects";
import { publishedEntries } from "@content/processors/thejournal";

/** A project stat ready to display. */
export interface ResolvedProjectStat {
  value: string;
  label: string;
}

export type ProjectStatCounts = Record<
  Extract<ProjectStat, { count: string }>["count"],
  number
>;

/** Build-time counts that "counted" stats read from. */
export const projectStatCounts: ProjectStatCounts = {
  journalPublications: publishedEntries.length,
};

export function resolveProjectStat(
  stat: ProjectStat,
  counts: ProjectStatCounts,
): ResolvedProjectStat {
  return "count" in stat
    ? { value: String(counts[stat.count]), label: stat.label }
    : stat;
}

export type ResolvedProjectSummary = Omit<ProjectSummary, "stat"> & {
  stat: ResolvedProjectStat;
};

/** Projects with their stats resolved, for presentational components. */
export function withResolvedStats(
  projects: readonly ProjectSummary[],
  counts: ProjectStatCounts = projectStatCounts,
): ResolvedProjectSummary[] {
  return projects.map((project) => ({
    ...project,
    stat: resolveProjectStat(project.stat, counts),
  }));
}
