/**
 * Optional title/description/tags for a video, looked up in a published
 * catalog.json by playback URL. Pure lookup plus a fetch wrapper; the player
 * decides whether to use it (only when given a catalog URL).
 */

export interface CatalogVideo {
  title?: string;
  description?: string;
  tags: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/** The catalog entry for `src`, keeping only well-typed fields. */
export function findCatalogEntry(
  catalog: unknown,
  src: string,
): CatalogVideo | null {
  if (!isRecord(catalog) || !Array.isArray(catalog["videos"])) return null;

  const entry = catalog["videos"].find(
    (video): video is Record<string, unknown> =>
      isRecord(video) && video["playbackUrl"] === src,
  );
  if (!entry) return null;

  const { title, description, tags } = entry;
  return {
    ...(nonEmptyString(title) ? { title } : {}),
    ...(nonEmptyString(description) ? { description } : {}),
    tags: Array.isArray(tags) ? tags.filter(nonEmptyString) : [],
  };
}

/** Fetch the catalog and look up `src`; null on any failure. */
export async function fetchCatalogEntry(
  catalogUrl: string,
  src: string,
  fetchImpl: typeof fetch = fetch,
): Promise<CatalogVideo | null> {
  try {
    const response = await fetchImpl(catalogUrl, { mode: "cors" });
    if (!response.ok) return null;
    return findCatalogEntry(await response.json(), src);
  } catch {
    return null;
  }
}
