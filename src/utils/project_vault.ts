import type {
  EntryContext,
  NestedGroup,
  VaultContext,
  VaultItem,
} from "@appTypes/content_context";
import { isNestedGroup } from "@appTypes/content_context";
import type { ListItem } from "@components/ui/display/list";

export interface ProjectVaultGroup {
  id: string;
  title: string;
  path: string[];
  depth: number;
  items: ListItem[];
}

function entrySubtitle(entry: EntryContext): string {
  const metadata: string[] = [];

  if (entry.readTime > 0) {
    metadata.push(`${entry.readTime} min read`);
  }

  if (entry.tags.length > 0) {
    metadata.push(entry.tags.map((tag) => `#${tag}`).join(" "));
  }

  return metadata.join(" · ");
}

function entryToListItem(
  entry: EntryContext,
  index: number,
  isSectionOverview = false,
): ListItem {
  const subtitle = entrySubtitle(entry);

  return {
    title: entry.title,
    ...(subtitle ? { subtitle } : {}),
    description: entry.description,
    media: {
      kind: "marker",
      label: String(index + 1).padStart(2, "0"),
    },
    ...(isSectionOverview
      ? { status: { label: "Section overview", color: "primary" } as const }
      : {}),
    action: {
      label: "Read page",
      href: `/thejournal/${entry.id}/`,
      ariaLabel: `Read ${entry.title} in The Journal`,
    },
  };
}

function directEntries(items: VaultItem[]): EntryContext[] {
  return items.filter((item): item is EntryContext => !isNestedGroup(item));
}

function nestedGroups(items: VaultItem[]): NestedGroup[] {
  return items.filter(isNestedGroup);
}

function collectNestedGroups(
  groups: NestedGroup[],
  parentPath: string[],
  depth: number,
): ProjectVaultGroup[] {
  const result: ProjectVaultGroup[] = [];

  for (const group of groups) {
    const path = [...parentPath, group.title];
    const entries = [group.index, ...directEntries(group.items)];

    result.push({
      id: group.id,
      title: group.title,
      path,
      depth,
      items: entries.map((entry, index) =>
        entryToListItem(entry, index, index === 0),
      ),
    });

    result.push(
      ...collectNestedGroups(nestedGroups(group.items), path, depth + 1),
    );
  }

  return result;
}

export function buildProjectVaultGroups(
  vault: VaultContext,
): ProjectVaultGroup[] {
  const rootEntries = directEntries(vault.items);
  const groups: ProjectVaultGroup[] = [];

  if (rootEntries.length > 0) {
    groups.push({
      id: `${vault.id}-publications`,
      title: "Vault publications",
      path: ["Vault publications"],
      depth: 0,
      items: rootEntries.map((entry, index) => entryToListItem(entry, index)),
    });
  }

  groups.push(...collectNestedGroups(nestedGroups(vault.items), [], 0));

  return groups;
}
