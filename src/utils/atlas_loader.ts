import type { AtlasData } from "@appTypes/atlas_data";
import type { ESPNTeamSchedule } from "@appTypes/espn";

type AtlasStandingsStats = {
  recordSummary: string;
  points: number;
};

type ESPNStandingsPage = {
  page?: {
    content?: {
      standings?: {
        groups?: {
          headers?: {
            points?: { i: number };
            total?: { i: number };
          };
          groups?: Array<{
            standings?: Array<{
              team?: { id?: string };
              stats?: Array<string>;
            }>;
          }>;
        };
      };
    };
  };
};

const ATLAS_TEAM_ID = "216";

export const ATLAS_TEST_DATA: AtlasData = {
  standing: "4th in Liga MX",
  record: "7 wins 2 ties 1 losses",
  points: 23,
  homeTeam: "Atlas",
  awayTeam: "Club America",
  rawDate: "2026-07-19T02:00:00Z",
  stadium: "Estadio Jalisco",
  city: "Guadalajara",
};

export function formatRecordSummary(recordSummary: string): string {
  if (!recordSummary) return "--";

  return recordSummary
    .split("-")
    .map((v, i) => `${v} ${["wins", "ties", "losses"][i] ?? ""}`)
    .join(" ");
}

export function parseRecordSummary(recordSummary: string): {
  wins: number;
  ties: number;
} {
  const [wins, ties] = recordSummary
    .split("-")
    .map((n) => Number.parseInt(n, 10) || 0);

  return {
    wins: wins || 0,
    ties: ties || 0,
  };
}

export function isZeroRecord(recordSummary: string, points: number): boolean {
  const normalized = recordSummary.trim();

  return (!normalized || normalized === "0-0-0") && points === 0;
}

export function extractEspnAppState(html: string): ESPNStandingsPage | null {
  const marker = "window['__espnfitt__']=";
  const markerIndex = html.indexOf(marker);

  if (markerIndex < 0) return null;

  const objectStart = html.indexOf("{", markerIndex + marker.length);
  if (objectStart < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = objectStart; index < html.length; index++) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth++;
      continue;
    }

    if (char === "}") {
      depth--;
      if (depth === 0) {
        const payload = html.slice(objectStart, index + 1);

        try {
          return JSON.parse(payload) as ESPNStandingsPage;
        } catch {
          return null;
        }
      }
    }
  }

  return null;
}

async function fetchLatestSeasonStats(
  seasonYear?: number,
): Promise<AtlasStandingsStats | null> {
  const standingsUrl = new URL(
    "https://www.espn.com/soccer/standings/_/league/mex.1",
  );

  if (seasonYear) {
    standingsUrl.searchParams.set("season", String(seasonYear));
  }

  const response = await fetch(standingsUrl.toString());

  if (!response.ok) return null;

  const html = await response.text();
  const appState = extractEspnAppState(html);
  const standings = appState?.page?.content?.standings;
  const headers = standings?.groups?.headers;
  const group = standings?.groups?.groups?.[0];

  if (!headers || !group?.standings) return null;

  const atlasRow = group.standings.find((row) => row.team?.id === ATLAS_TEAM_ID);

  if (!atlasRow?.stats) return null;

  const pointsIndex = headers.points?.i;
  const recordIndex = headers.total?.i;

  const points = pointsIndex != null ? Number(atlasRow.stats[pointsIndex]) : 0;
  const recordSummary =
    recordIndex != null ? atlasRow.stats[recordIndex] ?? "0-0-0" : "0-0-0";

  return {
    recordSummary,
    points: Number.isFinite(points) ? points : 0,
  };
}

export default {
  name: "atlas-loader",
  load: async (context: any): Promise<void> => {
    const { store } = context;

    if (process.env.ALBERTODURAN_TEST_MODE === "true") {
      store.clear();
      store.set({
        id: "current-match",
        data: ATLAS_TEST_DATA,
      });
      return;
    }

    try {
      const response = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/216/schedule?fixture=true",
      );

      if (!response.ok) return;

      const res: ESPNTeamSchedule = await response.json();
      const nextMatch = res.events[0]?.competitions[0];

      if (!nextMatch) return;

      const recordSummary = res.team.recordSummary || "0-0-0";
      const recordParts = parseRecordSummary(recordSummary);
      let formattedRecord = formatRecordSummary(recordSummary);
      let points = recordParts.wins * 3 + recordParts.ties;

      if (isZeroRecord(recordSummary, points)) {
        const latestSeasonStats = await fetchLatestSeasonStats(res.season?.year);

        if (latestSeasonStats) {
          formattedRecord = formatRecordSummary(latestSeasonStats.recordSummary);
          points = latestSeasonStats.points;
        }
      }

      const homeComp = nextMatch.competitors.find((c) => c.homeAway === "home");
      const awayComp = nextMatch.competitors.find((c) => c.homeAway === "away");

      const atlasData: AtlasData = {
        standing: res.team.standingSummary || "--",
        record: formattedRecord,
        points,
        homeTeam: homeComp?.team.displayName || "--",
        awayTeam: awayComp?.team.displayName || "--",
        rawDate: nextMatch.date,
        stadium: nextMatch.venue?.fullName || "--",
        city: nextMatch.venue?.address?.city || "--",
      };

      store.clear();
      store.set({
        id: "current-match",
        data: atlasData,
      });
    } catch (error) {
      console.error("Failed to fetch Atlas data:", error);
    }
  },
};
