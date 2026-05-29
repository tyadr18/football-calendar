import { NextRequest, NextResponse } from "next/server";
import { Player } from "@/types/football";

const FD_BASE = "https://api.football-data.org/v4";
const FD_HEADERS = { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY ?? "" };

// ESPN / API-Football の国名表記 → football-data.org の表記に正規化
const TEAM_NAME_ALIASES: Record<string, string> = {
  "United States":       "USA",
  "South Korea":         "Korea Republic",
  "Korea Republic":      "Korea Republic",
  "North Korea":         "Korea DPR",
  "Ivory Coast":         "Côte d'Ivoire",
  "Cote d'Ivoire":       "Côte d'Ivoire",
  "DR Congo":            "Congo DR",
  "Republic of Ireland": "Ireland",
  "Czech Republic":      "Czechia",
  "Turkey":              "Türkiye",
  "Holland":             "Netherlands",
  "China PR":            "China PR",
  "Chinese Taipei":      "Chinese Taipei",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPlayer(p: any): Player {
  return {
    id: p.id,
    name: p.name,
    position: p.position ?? "Unknown",
    shirtNumber: p.shirtNumber ?? null,
    currentTeam: p.currentTeam
      ? { name: p.currentTeam.name ?? "", crest: p.currentTeam.crest ?? "" }
      : null,
  };
}

async function fetchSquadById(teamId: number): Promise<Player[] | null> {
  const res = await fetch(`${FD_BASE}/teams/${teamId}`, {
    headers: FD_HEADERS,
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.squad ?? [])
    .filter((p: { position?: string }) => p.position)
    .map(toPlayer);
}

async function findTeamIdByName(rawName: string): Promise<number | null> {
  const name = TEAM_NAME_ALIASES[rawName] ?? rawName;

  const res = await fetch(
    `${FD_BASE}/teams?name=${encodeURIComponent(name)}&limit=10`,
    { headers: FD_HEADERS, next: { revalidate: 86400 } }
  );
  if (res.ok) {
    const data = await res.json();
    const teams = (data.teams ?? []) as Array<{ id: number; type: string }>;
    const national = teams.find((t) => t.type === "NATIONAL");
    if (national) return national.id;
    if (teams.length > 0) return teams[0].id;
  }

  // フォールバック: WC / EC のチーム一覧から名前で検索
  for (const compCode of ["WC", "EC"]) {
    const compRes = await fetch(`${FD_BASE}/competitions/${compCode}/teams`, {
      headers: FD_HEADERS,
      next: { revalidate: 86400 },
    });
    if (!compRes.ok) continue;
    const compData = await compRes.json();
    const teams = (compData.teams ?? []) as Array<{ id: number; name: string }>;
    const match = teams.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (match) return match.id;
  }

  return null;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const teamIdParam = searchParams.get("teamId");
  const teamName = searchParams.get("teamName");

  // fd.org 直接 ID が使える場合はそちらを優先
  if (teamIdParam && teamIdParam !== "0") {
    const id = parseInt(teamIdParam);
    if (!isNaN(id) && id > 0) {
      const players = await fetchSquadById(id);
      if (players !== null) {
        return NextResponse.json({ players });
      }
    }
  }

  // チーム名で検索
  if (teamName) {
    const id = await findTeamIdByName(teamName);
    if (id) {
      const players = await fetchSquadById(id);
      if (players !== null) {
        return NextResponse.json({ players });
      }
    }
  }

  return NextResponse.json({ error: "TEAM_NOT_FOUND", players: [] }, { status: 404 });
}
