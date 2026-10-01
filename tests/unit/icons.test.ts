import { projectStack, skills, social, ui } from "@data/icons";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

const registries = { skills, ui, social, projectStack };

describe("icon registries", () => {
  it.each(Object.entries(registries))(
    "%s icons all have a label, a viewBox and SVG content",
    (_name, registry) => {
      for (const [key, icon] of Object.entries(registry)) {
        expect(icon.text, key).toBeTruthy();
        expect(icon.viewBox.trim(), key).toMatch(/^-?\d+ -?\d+ \d+ \d+$/);
        expect(icon.content, key).toMatch(/<\w/);
      }
    },
  );

  it("loads file icons from src/assets/icons", () => {
    for (const key of Object.keys(skills)) {
      expect(existsSync(`src/assets/icons/${key}.svg`), key).toBe(true);
    }
  });

  it("namespaces ids inside file icons so gradients cannot collide", () => {
    expect(projectStack.next.content).toContain('id="next-');
    expect(projectStack.python.content).toContain("url(#python-");
  });

  it("draws line icons with the shared stroke style", () => {
    expect(ui.feedBuilding).toMatchObject({
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.75,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    });
  });

  it("reuses the social GitHub icon for project stacks", () => {
    expect(projectStack.github).toBe(social.github);
  });

  it("keeps project-only icons out of the skills ribbon", () => {
    expect(Object.keys(skills)).not.toContain("dynamodb");
    expect(Object.keys(projectStack)).toContain("dynamodb");
  });
});
