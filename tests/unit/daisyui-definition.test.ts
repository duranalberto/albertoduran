import { describe, expect, it } from "vitest";
import { parseDaisyUiFenceDefinition } from "@integrations/daisyui/definition";

function parseFixture(value: unknown) {
  return parseDaisyUiFenceDefinition(JSON.stringify(value), {
    fileURL: new URL("file:///fixtures/article.mdx"),
    fenceLang: "daisyui",
  });
}

describe("DaisyUI fence definitions", () => {
  it("normalizes minimal callout definitions", () => {
    const definition = parseFixture({
      component: "callout",
      content: "Remember the editorial context.",
    });

    expect(definition).toMatchObject({
      version: 1,
      component: "callout",
      variant: "note",
      content: [{ type: "paragraph", text: "Remember the editorial context." }],
    });
  });

  it("normalizes steps defaults", () => {
    const definition = parseFixture({
      component: "steps",
      items: [{ label: "Draft" }, { label: "Publish" }],
    });

    expect(definition).toMatchObject({
      component: "steps",
      activeColor: "primary",
      orientation: "responsive",
      items: [{ label: "Draft" }, { label: "Publish" }],
    });
  });

  it("parses list rows with marker media, statuses, actions, and data attrs", () => {
    const definition = parseFixture({
      component: "list",
      ariaLabel: "Publication component inventory",
      data: { fixture: "components", index: 1, active: true },
      items: [
        {
          title: "Lists",
          description: "Structured publication inventories.",
          media: { kind: "marker", label: "02" },
          status: { label: "Ready", color: "success" },
          action: {
            label: "Docs",
            href: "https://daisyui.com/components/list/",
            external: true,
          },
        },
      ],
    });

    expect(definition).toMatchObject({
      component: "list",
      ariaLabel: "Publication component inventory",
      data: { fixture: "components", index: 1, active: true },
      items: [
        {
          title: "Lists",
          media: { kind: "marker", label: "02" },
          status: { label: "Ready", color: "success" },
          action: { label: "Docs", external: true },
        },
      ],
    });
  });

  it("fails with source context for invalid JSON", () => {
    expect(() =>
      parseDaisyUiFenceDefinition("{", {
        fileURL: new URL("file:///fixtures/broken.mdx"),
        fenceLang: "daisyui",
      }),
    ).toThrow(/daisyui fence in \/fixtures\/broken\.mdx: invalid JSON/);
  });

  it("rejects unsupported components, colors, browser input, and non-finite numbers", () => {
    expect(() => parseFixture({ component: "accordion" })).toThrow(
      /component must be one of/,
    );

    expect(() =>
      parseFixture({
        component: "callout",
        variant: "loud",
        content: "Nope",
      }),
    ).toThrow(/variant must be one of/);

    expect(() =>
      parseFixture({
        component: "steps",
        activeColor: "loud",
        items: [{ label: "Draft" }],
      }),
    ).toThrow(/activeColor must be one of/);

    expect(() =>
      parseFixture({
        component: "mockup-browser",
        content: "Preview",
      }),
    ).toThrow(/requires a non-empty url or toolbar/);

    expect(() =>
      parseDaisyUiFenceDefinition(
        '{"component":"steps","items":[{"label":"Draft"}],"currentStep":1e999}',
      ),
    ).toThrow(/finite number/);
  });
});
