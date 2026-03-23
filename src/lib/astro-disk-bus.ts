/**
 * astro-disk-bus.ts
 * A worker-safe, disk-persistent cache utility for Astro/Vite.
 * Automatically bases itself in the project's .astro directory.
 */
import crypto from "node:crypto";
import fsSync from "node:fs";
import fsAsync from "node:fs/promises";
import path from "node:path";

export interface BusOptions {
  /** The specific folder name inside .astro/ (e.g., 'mermaid-cache') */
  subDir: string;
  /** Versioning key to invalidate cache when logic changes */
  version?: string;
}

export class AstroDiskBus<T> {
  private cacheDir: string;
  private version: string;

  constructor(options: BusOptions) {
    this.cacheDir = path.join(process.cwd(), ".astro", options.subDir);
    this.version = options.version || "v1";
  }

  /**
   * Generates a unique key based on version, optional config, and content.
   */
  buildKey(content: string, configHash: string = ""): string {
    return crypto
      .createHash("sha256")
      .update(`${this.version}::${configHash}::${content}`)
      .digest("hex");
  }

  /**
   * Helper to hash configuration objects for cache invalidation.
   */
  static hashConfig(config: Record<string, any>): string {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(config))
      .digest("hex")
      .slice(0, 16);
  }

  private getPath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  async ensureDir(): Promise<void> {
    await fsAsync.mkdir(this.cacheDir, { recursive: true });
  }

  ensureDirSync(): void {
    if (!fsSync.existsSync(this.cacheDir)) {
      fsSync.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async get(key: string): Promise<T | null> {
    try {
      const raw = await fsAsync.readFile(this.getPath(key), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  getSync(key: string): T | null {
    try {
      const raw = fsSync.readFileSync(this.getPath(key), "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, data: T): Promise<void> {
    const finalPath = this.getPath(key);
    const tempPath = `${finalPath}.${crypto.randomBytes(4).toString("hex")}.tmp`;

    try {
      await fsAsync.writeFile(tempPath, JSON.stringify(data), "utf-8");
      await fsAsync.rename(tempPath, finalPath);
    } catch (err) {
      await fsAsync.unlink(tempPath).catch(() => {});
      throw err;
    }
  }

  readAllValuesSync(): T[] {
    this.ensureDirSync();
    const files = fsSync.readdirSync(this.cacheDir);
    const values: T[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        const raw = fsSync.readFileSync(
          path.join(this.cacheDir, file),
          "utf-8",
        );
        try {
          values.push(JSON.parse(raw) as T);
        } catch {}
      }
    }
    return values;
  }
}

export function shortKey(key: string): string {
  return `${key.slice(0, 12)}…`;
}
