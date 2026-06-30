import { describe, expect, it } from "vitest";
import { parseDaisyUiFenceDefinition } from "@integrations/daisyui/definition";
import { renderDaisyUiMarkup } from "@integrations/daisyui/markup";

function render(value: unknown) {
  return renderDaisyUiMarkup(parseDaisyUiFenceDefinition(JSON.stringify(value)))
    .html;
}

describe("DaisyUI markup renderer", () => {
  it("renders callouts with existing classes and escaped content", () => {
    const html = render({
      component: "callout",
      variant: "warning",
      title: "Before <publishing>",
      content: [
        {
          type: "list",
          items: ["Check content", "Check <layout>"],
        },
      ],
    });

    expect(html).toContain("<aside");
    expect(html).toContain("callout-card not-prose");
    expect(html).toContain("callout-warning");
    expect(html).toContain("Before &lt;publishing&gt;");
    expect(html).toContain("Check &lt;layout&gt;");
    expect(html).toContain("<svg");
  });

  it("renders chat bubbles, lists, and steps", () => {
    const chat = render({
      component: "chat-bubble",
      align: "end",
      color: "primary",
      header: [{ type: "text", text: "Maintainer" }],
      content: [{ type: "text", text: "Good catch." }],
      footer: [{ type: "text", text: "Delivered" }],
    });
    const list = render({
      component: "list",
      ariaLabel: "Inventory",
      items: [
        {
          title: "Lists",
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
    const steps = render({
      component: "steps",
      currentStep: 2,
      activeColor: "success",
      items: [
        { label: "Draft", marker: "1" },
        { label: "Review", marker: "2" },
      ],
    });

    expect(chat).toContain("chat-end");
    expect(chat).toContain("chat-bubble-primary");
    expect(list).toContain("publication-list");
    expect(list).toContain('target="_blank"');
    expect(list).toContain("badge-success");
    expect(steps).toContain("steps-vertical sm:steps-horizontal");
    expect(steps).toContain('aria-current="step"');
  });

  it("renders mockups and section headers", () => {
    const browser = render({
      component: "mockup-browser",
      url: "https://example.com",
      content: [{ type: "image", src: "/preview.png", alt: "Preview" }],
      caption: "Production route",
    });
    const phone = render({
      component: "mockup-phone",
      content: "Offline state",
    });
    const window = render({
      component: "mockup-window",
      header: "Output",
      content: [{ type: "pre", text: "status: ok" }],
    });
    const section = render({
      component: "section-header",
      id: "overview-title",
      title: "Overview",
      level: 3,
      link: { href: "/projects/", label: "View projects" },
    });

    expect(browser).toContain("mockup-browser-frame");
    expect(browser).toContain("https://example.com");
    expect(phone).toContain("mockup-phone-frame");
    expect(window).toContain("mockup-window-frame");
    expect(section).toContain("<h3");
    expect(section).toContain('id="overview-title"');
    expect(section).toContain("View projects");
  });

  it("renders root data attributes", () => {
    const html = render({
      component: "callout",
      data: { gallery: "daisyui", active: true },
      content: "Fixture",
    });

    expect(html).toContain('data-gallery="daisyui"');
    expect(html).toContain('data-active="true"');
  });
});
