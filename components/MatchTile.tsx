"use client";

import { Match, MatchStatus } from "@/types/football";
import { formatKickoff } from "@/lib/date-utils";

interface Props {
  match: Match;
  onClick: (match: Match) => void;
}

function statusStyle(status: MatchStatus): string {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
      return "bg-green-900/60 border border-green-500/40 text-green-300";
    case "FINISHED":
      return "bg-gray-800/80 text-gray-400";
    case "POSTPONED":
    case "CANCELLED":
    case "SUSPENDED":
      return "bg-red-900/40 border border-red-500/30 text-red-400";
    default:
      return "bg-gray-800 border border-gray-700/50 text-gray-200 hover:bg-gray-700";
  }
}

function scoreOrTime(match: Match): string {
  if (match.status === "FINISHED" || match.status === "IN_PLAY" || match.status === "PAUSED") {
    const h = match.score.fullTime.home ?? 0;
    const a = match.score.fullTime.away ?? 0;
    return `${h} - ${a}`;
  }
  if (match.status === "POSTPONED") return "PPD";
  if (match.status === "CANCELLED") return "CXL";
  return formatKickoff(match.utcDate);
}

export default function MatchTile({ match, onClick }: Props) {
  const home = match.homeTeam.tla || match.homeTeam.shortName?.slice(0, 3) || "?";
  const away = match.awayTeam.tla || match.awayTeam.shortName?.slice(0, 3) || "?";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

  return (
    <button
      onClick={() => onClick(match)}
      className={`w-full text-left px-1.5 py-0.5 rounded text-xs leading-tight transition-all duration-100 ${statusStyle(match.status)}`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="truncate font-medium">
          {isLive && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1 animate-pulse" />
          )}
          {home} - {away}
        </span>
        <span className="shrink-0 font-mono text-[10px] opacity-80">
          {scoreOrTime(match)}
        </span>
      </div>
    </button>
  );
}
