import { NextRequest, NextResponse } from "next/server";
import { fetchMatches } from "@/lib/football-data";
import { fetchInternationalMatches } from "@/lib/api-football";
import { fetchESPNLeague } from "@/lib/espn";
import { fetchJLeague100 } from "@/lib/jleague";
import { INTL_FD_COMPETITIONS, ESPN_INTL_LEAGUES } from "@/lib/constants";
import { Match } from "@/types/football";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const competition = searchParams.get("competition") ?? "PL";
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

  // J100 は JST 固定なので拡張不要、他は ±1日拡張して UTC↔ローカル時刻のズレを吸収
  const dateFrom = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const dateTo = format(new Date(year, month, 0), "yyyy-MM-dd");
  const dateFromExt = format(new Date(year, month - 1, 0), "yyyy-MM-dd"); // 前月末日
  const dateToExt = format(new Date(year, month, 1), "yyyy-MM-dd");       // 翌月初日

  try {
    if (competition === "JPN") {
      // ESPN jpn.1（J1 + カップ戦）+ jleague.jp 百年構想リーグを並列取得
      const [espnResult, j100Result] = await Promise.allSettled([
        fetchESPNLeague("jpn.1", "Jリーグ", dateFromExt, dateToExt),
        fetchJLeague100(year, dateFrom, dateTo),
      ]);
      const matches: Match[] = [];
      if (espnResult.status === "fulfilled") matches.push(...espnResult.value);
      if (j100Result.status === "fulfilled") matches.push(...j100Result.value);
      matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
      return NextResponse.json({ matches });
    }

    if (competition === "INTL") {
      // 3ソース並列取得: football-data.org (WC/EC) + API-Football + ESPN (親善試合)
      const [fdResults, afResult, espnResults] = await Promise.allSettled([
        Promise.allSettled(
          INTL_FD_COMPETITIONS.map(({ code, name }) =>
            fetchMatches(code, dateFromExt, dateToExt, name)
          )
        ),
        fetchInternationalMatches(dateFromExt, dateToExt),
        Promise.allSettled(
          ESPN_INTL_LEAGUES.map(({ slug, name }) =>
            fetchESPNLeague(slug, name, dateFromExt, dateToExt)
          )
        ),
      ]);

      const matches: Match[] = [];

      if (fdResults.status === "fulfilled") {
        for (const r of fdResults.value) {
          if (r.status === "fulfilled") matches.push(...r.value);
        }
      }
      if (afResult.status === "fulfilled") {
        matches.push(...afResult.value);
      }
      if (espnResults.status === "fulfilled") {
        for (const r of espnResults.value) {
          if (r.status === "fulfilled") matches.push(...r.value);
        }
      }

      matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
      return NextResponse.json({ matches });
    }

    const matches = await fetchMatches(competition, dateFromExt, dateToExt);

    return NextResponse.json({ matches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    const status = message === "RATE_LIMITED" ? 429 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
