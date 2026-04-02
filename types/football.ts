export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "SUSPENDED"
  | "POSTPONED"
  | "CANCELLED";

export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface Score {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface Match {
  id: number;
  utcDate: string;
  status: MatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: Score;
}

export interface CompetitionOption {
  code: string;
  label: string;
  flag: string;
}
