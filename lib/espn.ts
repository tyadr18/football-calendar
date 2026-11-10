import { Match, MatchStatus } from "@/types/football";

const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer";

/**
 * ESPN の scoreboard は期間指定 (dates=YYYYMMDD-YYYYMMDD) を受け付けなくなり 400 を返す。
 * 月指定 (dates=YYYYMM) は使えるので、期間にかかる月をすべて取得してから日付で絞り込む。
 */
function monthsBetween(dateFrom: string, dateTo: string): string[] {
  const [fy, fm] = dateFrom.split("-").map(Number);
  const [ty, tm] = dateTo.split("-").map(Number);
  const months: string[] = [];
  let y = fy;
  let m = fm;
  while (y < ty || (y === ty && m <= tm)) {
    months.push(`${y}${String(m).padStart(2, "0")}`);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchESPNMonth(slug: string, yyyymm: string): Promise<any[]> {
  const url = `${BASE}/${slug}/scoreboard?dates=${yyyymm}&limit=300`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

export async function fetchESPNLeague(
  slug: string,
  competitionName: string,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const months = monthsBetween(dateFrom, dateTo);
  const results = await Promise.allSettled(months.map((m) => fetchESPNMonth(slug, m)));

  const matches: Match[] = [];
  const seen = new Set<string>();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const event of r.value) {
      if (seen.has(String(event.id))) continue;
      const match = espnToMatch(event, competitionName);
      if (!match) continue;
      const day = match.utcDate.slice(0, 10);
      if (day < dateFrom || day > dateTo) continue;
      seen.add(String(event.id));
      matches.push(match);
    }
  }
  return matches;
}
