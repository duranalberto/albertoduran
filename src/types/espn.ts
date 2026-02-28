export interface ESPNTeamSchedule {
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
