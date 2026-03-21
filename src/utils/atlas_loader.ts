import type { AtlasData } from "@appTypes/atlas_data";
import type { ESPNTeamSchedule } from "@appTypes/espn";

export default {
  name: "atlas-loader",
  load: async (context: any): Promise<void> => {
    const { store } = context;

    try {
      const response = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/soccer/all/teams/216/schedule?fixture=true",
      );

      if (!response.ok) return;

      const res: ESPNTeamSchedule = await response.json();
      const nextMatch = res.events[0]?.competitions[0];

      if (!nextMatch) return;

      const recordSummary = res.team.recordSummary || "0-0-0";
      const [wins, ties] = recordSummary
        .split("-")
        .map((n: string) => parseInt(n, 10) || 0);

      const formattedRecord = recordSummary
        .split("-")
        .map((v: string, i: number) => `${v} ${["wins", "ties", "loses"][i]}`)
        .join(" ");

      const atlasData: AtlasData = {
        standing: res.team.standingSummary || "--",
        record: formattedRecord,
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
