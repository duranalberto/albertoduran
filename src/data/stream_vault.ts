/** StreamVault's public CloudFront distribution (Serverless VOD project). */
const STREAM_VAULT_ORIGIN = "https://d2mcml34hdlt3o.cloudfront.net";

/** Published titles, descriptions and tags for every video. */
export const STREAM_VAULT_CATALOG_URL = `${STREAM_VAULT_ORIGIN}/catalog/catalog.json`;

/** HLS master playlist for a published video id. */
export function streamVaultVideoUrl(videoId: string): string {
  return `${STREAM_VAULT_ORIGIN}/videos/${videoId}/master.m3u8`;
}
