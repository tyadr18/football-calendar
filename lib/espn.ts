import { Match, MatchStatus } from "@/types/football";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

function toESPNDate(yyyy_mm_dd: string): string {
  return yyyy_mm_dd.replace(/-/g, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statusFromESPN(type: any): MatchStatus {
  const { name, state } = type;
  if (name === "STATUS_POSTPONED") return "POSTPONED";
  if (name === "STATUS_CANCELED" || name === "STATUS_CANCELLED") return "CANCELLED";
  if (name === "STATUS_SUSPENDED") return "SUSPENDED";
  if (state === "in") return name === "STATUS_HALFTIME" ? "PAUSED" : "IN_PLAY";
  if (state === "post") return "FINISHED";
  return "SCHEDULED";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function espnToMatch(event: any, competitionName: string): Match | null {
  const comp = event.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find((c: any) => c.homeAway === "home");
  const away = comp.competitors?.find((c: any) => c.homeAway === "away");
  if (!home || !away) return null;

  const status = statusFromESPN(comp.status.type);
  const showScore = status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED";
  const homeScore = showScore ? (parseInt(home.score) ?? 0) : null;
  const awayScore = showScore ? (parseInt(away.score) ?? 0) : null;

  return {
    id: parseInt(event.id),
    utcDate: comp.date ?? event.date,
    status,
    matchday: null,
    stage: "Friendly",
    group: null,
    homeTeam: {
      id: parseInt(home.team.id) || 0,
      name: home.team.displayName ?? "TBA",
      shortName: home.team.shortDisplayName ?? home.team.displayName ?? "TBA",
      tla: home.team.abbreviation ?? (home.team.displayName ?? "TBA").slice(0, 3).toUpperCase(),
      crest: home.team.logo ?? "",
    },
    awayTeam: {
      id: parseInt(away.team.id) || 0,
      name: away.team.displayName ?? "TBA",
      shortName: away.team.shortDisplayName ?? away.team.displayName ?? "TBA",
      tla: away.team.abbreviation ?? (away.team.displayName ?? "TBA").slice(0, 3).toUpperCase(),
      crest: away.team.logo ?? "",
    },
    score: {
      winner:
        showScore && homeScore != null && awayScore != null
          ? homeScore > awayScore ? "HOME_TEAM"
            : awayScore > homeScore ? "AWAY_TEAM"
            : "DRAW"
          : null,
      fullTime: { home: homeScore, away: awayScore },
      halfTime: { home: null, away: null },
    },
    competition: { name: competitionName },
    source: "espn" as const,
  };
}

export async function fetchESPNLeague(
  slug: string,
  competitionName: string,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const from = toESPNDate(dateFrom);
  const to = toESPNDate(dateTo);
  const url = `${BASE}/${slug}/scoreboard?dates=${from}-${to}&limit=200`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const data = await res.json();
  const matches: Match[] = [];
  for (const event of data.events ?? []) {
    const match = espnToMatch(event, competitionName);
    if (match) matches.push(match);
  }
  return matches;
}
