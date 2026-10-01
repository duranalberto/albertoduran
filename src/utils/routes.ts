/**
 * Site URL conventions. Every internal link to theJournal goes through here,
 * so trailing slashes and the base path are decided in one place.
 */

export const journalIndexHref = "/thejournal/";

/** `/thejournal/<id>/`, with an optional `#anchor`. */
export function journalHref(id: string, anchor?: string): string {
  const path = id.replace(/^\/+|\/+$/g, "");
  const hash = anchor?.replace(/^#/, "");

  return `${journalIndexHref}${path}/${hash ? `#${hash}` : ""}`;
}
