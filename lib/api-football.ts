import { Match, MatchStatus } from "@/types/football";
import { API_FOOTBALL_LEAGUE_IDS, INTL_LEAGUES } from "./constants";

const BASE = "https://v3.football.api-sports.io";

function normalizeStatus(short: string): MatchStatus {
  switch (short) {
    case "1H": case "2H": case "ET": case "P": case "BT":
      return "IN_PLAY";
    case "HT":
      return "PAUSED";
    case "FT": case "AET": case "PEN":
      return "FINISHED";
    case "PST":
      return "POSTPONED";
    case "CANC": case "ABD":
      return "CANCELLED";
    case "SUSP": case "INT":
      return "SUSPENDED";
    default:
      return "SCHEDULED";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMatch(fixture: any, competitionName?: string): Match {
  const f = fixture.fixture;
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const goals = fixture.goals;

  return {
    id: f.id,
    utcDate: f.date,
    status: normalizeStatus(f.status.short),
    matchday: fixture.league.round
      ? parseInt(fixture.league.round.replace(/\D/g, "")) || null
      : null,
    stage: fixture.league.round ?? "",
    group: null,
    homeTeam: {
      id: home.id ?? 0,
      name: home.name ?? "TBA",
      shortName: home.name ?? "TBA",
      tla: home.name ? home.name.slice(0, 3).toUpperCase() : "TBA",
      crest: home.logo ?? "",
    },
    awayTeam: {
      id: away.id ?? 0,
      name: away.name ?? "TBA",
      shortName: away.name ?? "TBA",
      tla: away.name ? away.name.slice(0, 3).toUpperCase() : "TBA",
      crest: away.logo ?? "",
    },
    score: {
      winner:
        goals.home != null && goals.away != null
          ? goals.home > goals.away ? "HOME_TEAM"
            : goals.away > goals.home ? "AWAY_TEAM"
            : "DRAW"
          : null,
      fullTime: { home: goals.home, away: goals.away },
      halfTime: {
        home: fixture.score?.halftime?.home ?? null,
        away: fixture.score?.halftime?.away ?? null,
      },
    },
    ...(competitionName ? { competition: { name: competitionName } } : {}),
    source: "af" as const,
  };
}

export async function fetchMatchesApiFootball(
  competition: string,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const leagueId = API_FOOTBALL_LEAGUE_IDS[competition];
  if (!leagueId) return [];

  const season = new Date(dateFrom).getFullYear();
  const url = `${BASE}/fixtures?league=${leagueId}&season=${season}&from=${dateFrom}&to=${dateTo}`;

  const res = await fetch(url, {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY!,
    },
    next: { revalidate: 300 },
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

  const data = await res.json();
  if (data.errors?.token || data.errors?.rateLimit) {
    throw new Error("RATE_LIMITED");
  }

  return (data.response ?? []).map(toMatch);
}

async function fetchLeague(
  leagueId: number,
  competitionName: string,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const season = new Date(dateFrom).getFullYear();
  const url = `${BASE}/fixtures?league=${leagueId}&season=${season}&from=${dateFrom}&to=${dateTo}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY! },
    next: { revalidate: 300 },
  });
  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) return [];
  const data = await res.json();
  if (data.errors?.token || data.errors?.rateLimit) throw new Error("RATE_LIMITED");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.response ?? []).map((f: any) => toMatch(f, competitionName));
}

export async function fetchInternationalMatches(
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const results = await Promise.allSettled(
    INTL_LEAGUES.map(({ id, name }) => fetchLeague(id, name, dateFrom, dateTo))
  );

  const matches: Match[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") matches.push(...result.value);
    else if (result.reason?.message === "RATE_LIMITED") throw new Error("RATE_LIMITED");
  }

  return matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
}
