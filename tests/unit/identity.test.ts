import { githubRepoUrl, identity, socialLinks } from "@data/identity";
import { describe, expect, it } from "vitest";

describe("identity", () => {
  it("uses https profile URLs that contain their handle", () => {
    for (const link of Object.values(socialLinks)) {
      const url = new URL(link.href);

      expect(url.protocol).toBe("https:");
      expect(link.href).toContain(identity.handle);
      expect(link.href.endsWith("/")).toBe(true);
    }
  });

  it("builds repository URLs under the GitHub account", () => {
    expect(githubRepoUrl("MLScraper")).toBe(
      "https://github.com/duranalberto/MLScraper",
    );
  });

  it("formats years of experience as a floor", () => {
    expect(identity.experienceLabel).toBe(
      `${identity.yearsOfExperience}+ years`,
    );
  });
});
