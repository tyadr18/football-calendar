import { Match } from "@/types/football";

const BASE = "https://api.football-data.org/v4";

export async function fetchMatches(
  competition: string,
  dateFrom: string,
  dateTo: string,
  competitionName?: string
): Promise<Match[]> {
  const url = `${BASE}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const res = await fetch(url, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 300 },
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

  const data = await res.json();
  const matches = (data.matches ?? []) as Match[];
  const withSource = matches.map((m) => ({ ...m, source: "fd" as const }));
  if (!competitionName) return withSource;
  return withSource.map((m) => ({ ...m, competition: { name: competitionName } }));
}
