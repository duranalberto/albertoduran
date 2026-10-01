/**
 * Short, stable id from a string (32-bit FNV-1a, base 36). Used for DOM ids
 * that must be identical across builds; not for anything security-related.
 */
export function stableHash(input: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}
