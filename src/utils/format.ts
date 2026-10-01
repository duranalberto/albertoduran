/** "5 min read", or null when there is nothing to read. */
export function formatReadTime(minutes: number): string | null {
  return minutes > 0 ? `${minutes} min read` : null;
}

const dateFormats = {
  short: new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
  long: new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }),
} as const;

/**
 * Format a publication date. Frontmatter dates are UTC midnight, so format in
 * UTC; the build machine's time zone would otherwise shift them a day back.
 */
export function formatDate(
  date: Date,
  style: keyof typeof dateFormats,
): string {
  return dateFormats[style].format(date);
}

/** Total minutes as "2h 5m", or "2h" on the hour. */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
