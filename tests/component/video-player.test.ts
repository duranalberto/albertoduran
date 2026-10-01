import VideoPlayer from "@components/ui/mdx/VideoPlayer.astro";
import { describe, expect, it } from "vitest";
import { render } from "./helpers/render";

const src = "https://example.test/video/master.m3u8";
const qualityIdOf = (html: string) =>
  html.match(/<select[^>]*\bid="([^"]+)"/)?.[1];

describe("VideoPlayer", () => {
  it("ships no external script tag; the runtime loads hls.js on demand", async () => {
    const html = await render(VideoPlayer, { props: { src } });

    expect(html).not.toMatch(/<script[^>]+src="https?:\/\//);
    expect(html).not.toContain("cdn.jsdelivr.net");
  });

  it("wires the playback source and an accessible quality control", async () => {
    const html = await render(VideoPlayer, {
      props: { src, title: "Match replay" },
    });
    const qualityId = qualityIdOf(html);

    expect(html).toContain(`data-video-src="${src}"`);
    expect(html).toContain('aria-label="Match replay"');
    expect(qualityId).toBeTruthy();
    expect(html).toContain(`for="${qualityId}"`);
  });

  it("derives a stable quality-control id from the source", async () => {
    const first = qualityIdOf(await render(VideoPlayer, { props: { src } }));
    const again = qualityIdOf(await render(VideoPlayer, { props: { src } }));
    const other = qualityIdOf(
      await render(VideoPlayer, { props: { src: `${src}?v=2` } }),
    );

    expect(first).toBe(again);
    expect(first).not.toBe(other);
  });

  it("only asks for catalog metadata when given a catalog URL", async () => {
    const without = await render(VideoPlayer, { props: { src } });
    const withCatalog = await render(VideoPlayer, {
      props: { src, catalogUrl: "https://example.test/catalog.json" },
    });

    expect(without).not.toContain("data-catalog-url");
    expect(withCatalog).toContain(
      'data-catalog-url="https://example.test/catalog.json"',
    );
  });
});
