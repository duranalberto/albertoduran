import { afterEach, describe, expect, it, vi } from "vitest";
import atlasLoader, {
  ATLAS_TEST_DATA,
  extractEspnAppState,
  formatRecordSummary,
  isZeroRecord,
  parseRecordSummary,
} from "@utils/atlas_loader";

function createStore() {
  return {
    clear: vi.fn(),
    set: vi.fn(),
  };
}

function jsonResponse(body: unknown) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function textResponse(body: string) {
  return {
    ok: true,
    text: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function scheduleFixture(recordSummary = "3-2-1") {
  return {
    team: {
      recordSummary,
      standingSummary: "2nd in Liga MX",
    },
    season: {
      year: 2026,
    },
    events: [
      {
        competitions: [
          {
            date: "2026-07-19T02:00:00Z",
            venue: {
              fullName: "Estadio Jalisco",
              address: { city: "Guadalajara" },
            },
            competitors: [
              { homeAway: "home", team: { displayName: "Atlas" } },
              { homeAway: "away", team: { displayName: "Club America" } },
            ],
          },
        ],
      },
    ],
  };
}

describe("atlas loader helpers", () => {
  it("formats and parses Liga MX records", () => {
    expect(formatRecordSummary("7-2-1")).toBe("7 wins 2 ties 1 losses");
    expect(formatRecordSummary("")).toBe("--");
    expect(parseRecordSummary("7-2-1")).toEqual({ wins: 7, ties: 2 });
    expect(parseRecordSummary("bad-data")).toEqual({ wins: 0, ties: 0 });
    expect(isZeroRecord("0-0-0", 0)).toBe(true);
    expect(isZeroRecord("1-0-0", 3)).toBe(false);
  });

  it("extracts ESPN app state while respecting nested JSON braces", () => {
    const payload = {
      page: {
        content: {
          standings: {
            groups: {
              headers: {},
              groups: [],
            },
          },
        },
      },
    };
    const html = `<script>window['__espnfitt__']=${JSON.stringify(payload)};</script>`;

    expect(extractEspnAppState(html)).toEqual(payload);
    expect(extractEspnAppState("<html></html>")).toBeNull();
  });
});

describe("atlas loader", () => {
  afterEach(() => {
    delete process.env.ALBERTODURAN_TEST_MODE;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses deterministic test data when ALBERTODURAN_TEST_MODE is enabled", async () => {
    process.env.ALBERTODURAN_TEST_MODE = "true";
    const store = createStore();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await atlasLoader.load({ store });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(store.clear).toHaveBeenCalledOnce();
    expect(store.set).toHaveBeenCalledWith({
      id: "current-match",
      data: ATLAS_TEST_DATA,
    });
  });

  it("loads the next match and derives points from a non-zero record", async () => {
    const store = createStore();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(scheduleFixture()));
    vi.stubGlobal("fetch", fetchMock);

    await atlasLoader.load({ store });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(store.clear).toHaveBeenCalledOnce();
    expect(store.set).toHaveBeenCalledWith({
      id: "current-match",
      data: {
        standing: "2nd in Liga MX",
        record: "3 wins 2 ties 1 losses",
        points: 11,
        homeTeam: "Atlas",
        awayTeam: "Club America",
        rawDate: "2026-07-19T02:00:00Z",
        stadium: "Estadio Jalisco",
        city: "Guadalajara",
      },
    });
  });

  it("falls back to standings when the schedule record is empty", async () => {
    const store = createStore();
    const standingsState = {
      page: {
        content: {
          standings: {
            groups: {
              headers: {
                total: { i: 1 },
                points: { i: 2 },
              },
              groups: [
                {
                  standings: [
                    {
                      team: { id: "216" },
                      stats: ["Atlas", "7-2-1", "23"],
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    };
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/standings/")) {
        return textResponse(
          `<script>window['__espnfitt__']=${JSON.stringify(standingsState)};</script>`,
        );
      }

      return jsonResponse(scheduleFixture("0-0-0"));
    });
    vi.stubGlobal("fetch", fetchMock);

    await atlasLoader.load({ store });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.set).toHaveBeenCalledWith({
      id: "current-match",
      data: expect.objectContaining({
        record: "7 wins 2 ties 1 losses",
        points: 23,
      }),
    });
  });

  it("does not mutate the store when no next match exists", async () => {
    const store = createStore();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ team: {}, events: [] }));
    vi.stubGlobal("fetch", fetchMock);

    await atlasLoader.load({ store });

    expect(store.clear).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });

  it("logs and swallows fetch failures", async () => {
    const store = createStore();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await atlasLoader.load({ store });

    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to fetch Atlas data:",
      expect.any(Error),
    );
    expect(store.set).not.toHaveBeenCalled();
  });
});
