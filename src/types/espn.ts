export interface ESPNTeamSchedule {
  season?: {
    year: number;
    type: number;
    name: string;
    displayName: string;
    half?: number;
  };
  requestedSeason?: {
    year: number;
    type: number;
    name: string;
    displayName: string;
  };
  team: {
    standingSummary: string;
    recordSummary: string;
  };
  events: Array<{
    competitions: Array<{
      date: string;
      venue: {
        fullName: string;
        address: { city: string };
      };
      competitors: Array<{
        homeAway: "home" | "away";
        team: { displayName: string };
      }>;
    }>;
  }>;
}
