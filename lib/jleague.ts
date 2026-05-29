import { Match, MatchStatus } from "@/types/football";

const JLEAGUE_J100_URL = "https://www.jleague.jp/match/search/?competition_id=30&year=";

function normalizeFullWidth(s: string): string {
  return s
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim();
}

function mapStatus(text: string): MatchStatus {
  if (text.includes("試合終了")) return "FINISHED";
  if (text.includes("中止")) return "CANCELLED";
  if (text.includes("延期")) return "POSTPONED";
  if (text.includes("中断")) return "SUSPENDED";
  if (text.includes("ハーフタイム")) return "PAUSED";
  if (text.includes("試合中") || text.includes("前半") || text.includes("後半"))
    return "IN_PLAY";
  return "SCHEDULED";
}

function jstToUtc(year: number, month: number, day: number, timeStr: string): string {
  const [h, mi] = timeStr.split(":").map(Number);
  // treat inputs as JST (UTC+9): subtract 9h
  const utcMs = Date.UTC(year, month - 1, day, h, mi, 0) - 9 * 3600 * 1000;
  return new Date(utcMs).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function parseMatchesFromHtml(
  html: string,
  year: number,
  dateFrom: string,
  dateTo: string
): Match[] {
  const matches: Match[] = [];
  const seenIds = new Set<string>();

  // Split by leagAccTit sections; only process 百年構想リーグ sections
  const sections = html.split('<div class="leagAccTit">');

  // Concatenate 百年構想 sections into one block for parsing
  let targetHtml = "";
  for (const section of sections) {
    const h5 = section.match(/<h5>([^<]+)<\/h5>/);
    if (h5 && h5[1].includes("百年構想")) {
      targetHtml += section;
    }
  }

  if (!targetHtml) return [];

  // Match both j1 and j2j3 百年構想 URLs
  const urlRe =
    /href="\/match\/(j1|j2j3)\/(\d{4})\/(\d{6})\/live\/"/g;
  let m: RegExpExecArray | null;

  while ((m = urlRe.exec(targetHtml)) !== null) {
    const tier = m[1];
    const urlYear = parseInt(m[2]);
    const matchId = m[3];
    if (urlYear !== year) continue;

    const uniqueKey = `${tier}_${matchId}`;
    if (seenIds.has(uniqueKey)) continue;
    seenIds.add(uniqueKey);

    const month = parseInt(matchId.substring(0, 2));
    const day = parseInt(matchId.substring(2, 4));
    const matchDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (matchDate < dateFrom || matchDate > dateTo) continue;

    // Find the gameTable that follows this URL
    const afterIdx = m.index + m[0].length;
    const after = targetHtml.substring(afterIdx, afterIdx + 1500);
    const tStart = after.indexOf('<table class="gameTable">');
    if (tStart === -1) continue;
    const tEnd = after.indexOf("</table>", tStart);
    if (tEnd === -1) continue;
    const gt = after.substring(tStart, tEnd + 8);

    const homeM = gt.match(/<td[^>]*class="clubName leftside"[^>]*>[\s\S]*?<\/span>([^<]*)/);
    const awayM = gt.match(/<td[^>]*class="clubName rightside"[^>]*>[\s\S]*?<\/span>([^<]*)/);
    const homeName = homeM ? normalizeFullWidth(homeM[1]) : "TBA";
    const awayName = awayM ? normalizeFullWidth(awayM[1]) : "TBA";

    const homeScoreM = gt.match(/<td[^>]*class="point leftside"[^>]*>(\d+)<\/td>/);
    const awayScoreM = gt.match(/<td[^>]*class="point rightside"[^>]*>(\d+)<\/td>/);

    const statusM = gt.match(/<span[^>]*class="off"[^>]*>([^<]+)<\/span>/);
    const status = mapStatus(statusM ? statusM[1] : "");

    // Find kickoff time from the nearest preceding stadium td
    const before = targetHtml.substring(Math.max(0, m.index - 3000), m.index);
    const timeMs = [...before.matchAll(/class='stadium'>(\d{2}:\d{2})/g)];
    const timeStr = timeMs.length > 0 ? timeMs[timeMs.length - 1][1] : "12:00";

    const showScore =
      status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED";
    const homeScore = showScore && homeScoreM ? parseInt(homeScoreM[1]) : null;
    const awayScore = showScore && awayScoreM ? parseInt(awayScoreM[1]) : null;

    const competitionName =
      tier === "j1"
        ? "明治安田J1百年構想リーグ"
        : "明治安田J2・J3百年構想リーグ";

    matches.push({
      id: parseInt(matchId) + (tier === "j1" ? 4_000_000 : 3_000_000),
      utcDate: jstToUtc(year, month, day, timeStr),
      status,
      matchday: null,
      stage: "百年構想リーグ",
      group: null,
      homeTeam: {
        id: 0,
        name: homeName,
        shortName: homeName,
        tla: homeName.replace(/[^\x00-\x7F]/g, "").slice(0, 3).toUpperCase() || "JPN",
        crest: "",
      },
      awayTeam: {
        id: 0,
        name: awayName,
        shortName: awayName,
        tla: awayName.replace(/[^\x00-\x7F]/g, "").slice(0, 3).toUpperCase() || "JPN",
        crest: "",
      },
      score: {
        winner:
          homeScore !== null && awayScore !== null
            ? homeScore > awayScore
              ? "HOME_TEAM"
              : awayScore > homeScore
              ? "AWAY_TEAM"
              : "DRAW"
            : null,
        fullTime: { home: homeScore, away: awayScore },
        halfTime: { home: null, away: null },
      },
      competition: { name: competitionName },
    });
  }

  return matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));
}

export async function fetchJLeague100(
  year: number,
  dateFrom: string,
  dateTo: string
): Promise<Match[]> {
  const res = await fetch(`${JLEAGUE_J100_URL}${year}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ja,en-US;q=0.9",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) return [];

  const buf = await res.arrayBuffer();
  const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);

  return parseMatchesFromHtml(html, year, dateFrom, dateTo);
}
