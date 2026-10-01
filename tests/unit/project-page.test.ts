import type { ProjectFact } from "@appTypes/project";
import {
  assertProjectJournalLink,
  buildSiteManifest,
  defineProjectPage,
} from "@data/project_page";
import { projectCatalog } from "@data/projects";
import { describe, expect, it } from "vitest";

const fact = (label: string): ProjectFact => ({ label, value: label });
const mlscraper = projectCatalog.find(
  ({ href }) => href === "/projects/mlscraper/",
)!;

describe("defineProjectPage", () => {
  it("takes the title, cover image and alt text from the catalog", () => {
    const page = defineProjectPage("/projects/mlscraper/", {
      description: "Page description.",
    });

    expect(page.title).toBe(mlscraper.title);
    expect(page.image).toBe(mlscraper.image);
    expect(page.imageAlt).toBe(mlscraper.imageAlt);
    expect(page.description).toBe("Page description.");
  });

  it("lets the page override the title only", () => {
    const page = defineProjectPage("/projects/mlscraper/", {
      title: "Short name",
      description: "d",
    });

    expect(page.title).toBe("Short name");
    expect(page.image).toBe(mlscraper.image);
  });

  it("rejects a route that is not in the catalog", () => {
    expect(() =>
      defineProjectPage("/projects/missing/" as "/projects/mlscraper/", {
        description: "d",
      }),
    ).toThrow("/projects/missing/ is not in projectCatalog.");
  });

  it("rejects more than four hero facts", () => {
    const facts = [fact("a"), fact("b"), fact("c"), fact("d"), fact("e")];

    expect(() =>
      defineProjectPage("/projects/mlscraper/", {
        description: "d",
        facts: facts as unknown as readonly [],
      }),
    ).toThrow("has 5 hero facts. Project pages support at most 4 facts.");
  });
});

describe("assertProjectJournalLink", () => {
  it("accepts standalone publications and vault roots", () => {
    expect(() =>
      assertProjectJournalLink({ id: "post", vaultId: "" }, "P"),
    ).not.toThrow();
    expect(() =>
      assertProjectJournalLink({ id: "vault", vaultId: "vault" }, "P"),
    ).not.toThrow();
  });

  it("rejects a vault child", () => {
    expect(() =>
      assertProjectJournalLink({ id: "vault/child", vaultId: "vault" }, "P"),
    ).toThrow('"P" references Journal child entry "vault/child".');
  });
});

describe("buildSiteManifest", () => {
  it("uses the title as label and page title", () => {
    expect(buildSiteManifest({ title: "T", description: "D" })).toEqual({
      label: "T",
      pageTitle: "T",
      description: "D",
    });
  });
});
