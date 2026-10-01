import { describe, expect, it } from "vitest";
import { getCurrentSite } from "@utils/navigation";

describe("navigation helpers", () => {
  it("normalizes root and known section paths", () => {
    expect(getCurrentSite("/")).toEqual({
      site: "/",
      isRoot: true,
      path: "/",
    });

    expect(getCurrentSite("/profile")).toEqual({
      site: "/profile/",
      isRoot: true,
      path: "/profile/",
    });

    expect(getCurrentSite("/projects/equity-valuation-engine")).toEqual({
      site: "/projects/",
      isRoot: false,
      path: "/projects/equity-valuation-engine/",
    });

    expect(getCurrentSite("/thejournal/my_first_publication")).toEqual({
      site: "/thejournal/",
      isRoot: false,
      path: "/thejournal/my_first_publication/",
    });
  });
});
