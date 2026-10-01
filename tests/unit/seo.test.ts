import { socialLinks } from "@data/identity";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  formatTitle,
  jsonLdGraph,
  personJsonLd,
  pickDescription,
  projectJsonLd,
  websiteJsonLd,
} from "@utils/seo";
import { describe, expect, it } from "vitest";

const site = new URL("https://example.test");

describe("formatTitle", () => {
  it("adds the site name when it fits in 60 characters", () => {
    expect(formatTitle("MLScraper")).toBe("MLScraper | Alberto Duran");
  });

  it("keeps titles that already name the site", () => {
    expect(formatTitle("My Projects | Alberto Duran")).toBe(
      "My Projects | Alberto Duran",
    );
  });

  it("leaves long titles alone rather than pushing them past 60", () => {
    const long = "Designing an AI ops agent from the ground up, part two";
    expect(formatTitle(long)).toBe(long);
  });
});

describe("pickDescription", () => {
  it("uses the first candidate that fits 160 characters", () => {
    expect(pickDescription("x".repeat(200), "short tagline")).toBe(
      "short tagline",
    );
    expect(pickDescription("fits", "also fits")).toBe("fits");
  });

  it("falls back to the shortest when none fit", () => {
    expect(pickDescription("y".repeat(300), "z".repeat(200))).toBe(
      "z".repeat(200),
    );
  });

  it("skips missing candidates", () => {
    expect(pickDescription(undefined, "only")).toBe("only");
  });
});

describe("JSON-LD", () => {
  it("describes the person with profile links", () => {
    expect(personJsonLd(site)).toMatchObject({
      "@type": "Person",
      "@id": "https://example.test/#person",
      name: "Alberto Duran",
      sameAs: Object.values(socialLinks).map(({ href }) => href),
    });
  });

  it("links the website to its publisher", () => {
    expect(websiteJsonLd(site, "About")).toMatchObject({
      "@type": "WebSite",
      url: "https://example.test/",
      publisher: { "@id": "https://example.test/#person" },
    });
  });

  it("numbers breadcrumbs from 1 with absolute URLs", () => {
    expect(
      breadcrumbJsonLd(site, [
        ["Home", "/"],
        ["theJournal", "/thejournal/"],
      ]),
    ).toEqual({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://example.test/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "theJournal",
          item: "https://example.test/thejournal/",
        },
      ],
    });
  });

  it("describes an article with dates, tags and its series", () => {
    const published = new Date("2026-07-01T00:00:00Z");
    const node = articleJsonLd(site, {
      title: "Post",
      description: "D",
      path: "/thejournal/v/post/",
      published,
      tags: ["aws", "astro"],
      series: { name: "Vault", path: "/thejournal/v/" },
    });

    expect(node).toMatchObject({
      "@type": "BlogPosting",
      url: "https://example.test/thejournal/v/post/",
      datePublished: "2026-07-01T00:00:00.000Z",
      dateModified: "2026-07-01T00:00:00.000Z",
      keywords: "aws, astro",
      isPartOf: {
        "@type": "CreativeWorkSeries",
        url: "https://example.test/thejournal/v/",
      },
    });
  });

  it("types a project with a repository as source code", () => {
    expect(
      projectJsonLd(site, {
        title: "P",
        description: "D",
        path: "/projects/p/",
        repository: "https://github.com/x/p",
      })["@type"],
    ).toBe("SoftwareSourceCode");
    expect(
      projectJsonLd(site, {
        title: "P",
        description: "D",
        path: "/projects/p/",
      })["@type"],
    ).toBe("CreativeWork");
  });

  it("serializes a graph that cannot break out of its script tag", () => {
    const text = jsonLdGraph([{ name: "</script><b>" }]);

    expect(text).not.toContain("</script>");
    expect(JSON.parse(text)).toEqual({
      "@context": "https://schema.org",
      "@graph": [{ name: "</script><b>" }],
    });
  });
});
