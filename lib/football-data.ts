import { Match } from "@/types/football";

const BASE = "https://api.football-data.org/v4";

export async function fetchMatches(
  competition: string,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const url = `${BASE}/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const res = await fetch(url, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 300 }, // cache 5 min
  });

  if (res.status === 429) throw new Error("RATE_LIMITED");
  if (res.status === 404) return []; // tournament not running
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);

  const data = await res.json();
  return (data.matches ?? []) as Match[];
}
