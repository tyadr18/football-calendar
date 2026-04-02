import { Match } from "@/types/football";

export async function getMatches(
  competition: string,
  year: number,
  month: number
): Promise<Match[]> {
  const res = await fetch(
    `/api/matches?competition=${competition}&year=${year}&month=${month}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.matches as Match[];
}
