import { NextRequest, NextResponse } from "next/server";
import { fetchMatches } from "@/lib/football-data";
import { fetchMatchesApiFootball } from "@/lib/api-football";
import { API_FOOTBALL_CODES } from "@/lib/constants";

import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const competition = searchParams.get("competition") ?? "PL";
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  const dateFrom = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const dateTo = format(new Date(year, month, 0), "yyyy-MM-dd");

  try {
    const matches = API_FOOTBALL_CODES.has(competition)
      ? await fetchMatchesApiFootball(competition, dateFrom, dateTo)
      : await fetchMatches(competition, dateFrom, dateTo);

    return NextResponse.json({ matches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    const status = message === "RATE_LIMITED" ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
