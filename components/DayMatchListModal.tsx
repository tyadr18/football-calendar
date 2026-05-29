"use client";

import { useEffect } from "react";
import { Match } from "@/types/football";
import { Locale } from "@/lib/i18n";
import { formatKickoff } from "@/lib/date-utils";
import { XIcon } from "./Icons";

interface Props {
  date: Date | null;
  matches: Match[];
  locale: Locale;
  onMatchClick: (match: Match) => void;
  onClose: () => void;
}

function rowScore(match: Match): string {
  const { status, score, utcDate } = match;
  if (status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED") {
    return `${score.fullTime.home ?? 0}–${score.fullTime.away ?? 0}`;
  }
  if (status === "POSTPONED") return "PPD";
  if (status === "CANCELLED") return "CXL";
  return formatKickoff(utcDate);
}

function scoreColor(status: Match["status"]): string {
  if (status === "IN_PLAY" || status === "PAUSED") return "text-green-400";
  if (status === "FINISHED") return "text-gray-500";
  if (status === "POSTPONED" || status === "CANCELLED") return "text-red-400";
  return "text-blue-400";
}

export default function DayMatchListModal({ date, matches, locale, onMatchClick, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!date || matches.length === 0) return null;

  const dateStr = new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  }).format(date);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div>
            <p className="text-sm font-semibold text-gray-200">{dateStr}</p>
            <p className="text-xs text-gray-500">{matches.length} matches</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Match list */}
        <div className="overflow-y-auto max-h-[60vh] divide-y divide-gray-800/50">
          {matches.map((match) => {
            const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
            const isTBA = !match.homeTeam?.name || match.homeTeam.name === "TBA";
            return (
              <button
                key={match.id}
                onClick={() => { onClose(); onMatchClick(match); }}
                disabled={isTBA}
                className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-gray-800/50 active:bg-gray-800 transition-colors"
              >
                {isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                )}
                {!isTBA && match.homeTeam.crest && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.homeTeam.crest}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <span className="flex-1 text-left text-sm text-gray-200 truncate">
                  {isTBA ? "TBA" : (match.homeTeam.shortName || match.homeTeam.name)}
                </span>
                <span className={`shrink-0 font-mono text-xs font-semibold ${scoreColor(match.status)}`}>
                  {rowScore(match)}
                </span>
                <span className="flex-1 text-right text-sm text-gray-200 truncate">
                  {isTBA ? "TBA" : (match.awayTeam.shortName || match.awayTeam.name)}
                </span>
                {!isTBA && match.awayTeam.crest && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={match.awayTeam.crest}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
