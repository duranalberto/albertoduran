import type { AtlasData } from "@appTypes/atlas_data";
import type { ESPNTeamSchedule } from "../types/espn";

const CACHE_KEY = "atlas_data_cache";
const ONE_DAY = 24 * 60 * 60 * 1000;
const FOUR_HOURS = 4 * 60 * 60 * 1000;

export async function getAtlasData(): Promise<AtlasData | null> {
  const isBrowser = typeof window !== "undefined";
  const now = Date.now();

  if (isBrowser) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached) as {
          data: AtlasData;
          timestamp: number;
        };
        const matchTime = new Date(data.rawDate).getTime();

        const isMatchWindow = now >= matchTime && now <= matchTime + FOUR_HOURS;
        const isExpired = now - timestamp > ONE_DAY;
        const matchFinishedRecently =
          now > matchTime + FOUR_HOURS && timestamp < matchTime + FOUR_HOURS;

        if (!isMatchWindow && !isExpired && !matchFinishedRecently) {
          return data;
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }

  try {
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/216/schedule?fixture=true",
    );
    if (!response.ok) return null;

    const res: ESPNTeamSchedule = await response.json();
    const nextMatch = res.events[0]?.competitions[0];
    if (!nextMatch) return null;

    const recordSummary = res.team.recordSummary || "0-0-0";
    const [wins, ties] = recordSummary
      .split("-")
      .map((n) => parseInt(n, 10) || 0);

    const atlasData: AtlasData = {
      standing: res.team.standingSummary || "--",
      record: recordSummary
        .split("-")
        .map((v, i) => `${v} ${["wins", "ties", "loses"][i]}`)
        .join(" "),
      points: wins * 3 + ties * 1,
      homeTeam:
        nextMatch.competitors.find((c) => c.homeAway === "home")?.team
          .displayName || "--",
      awayTeam:
        nextMatch.competitors.find((c) => c.homeAway === "away")?.team
          .displayName || "--",
      rawDate: nextMatch.date,
      stadium: nextMatch.venue?.fullName || "--",
      city: nextMatch.venue?.address?.city || "--",
    };

    if (isBrowser) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data: atlasData,
          timestamp: now,
        }),
      );
    }

    return atlasData;
  } catch (error) {
    return null;
  }
}
