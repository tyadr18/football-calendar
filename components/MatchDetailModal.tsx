"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Match, MatchStatus } from "@/types/football";
import { Locale, t } from "@/lib/i18n";
import { formatKickoff, format } from "@/lib/date-utils";
import { XIcon, CalendarPlusIcon } from "./Icons";
import { NATIONAL_TEAM_COMPETITION_CODES, TLA_TO_FLAG, NAME_TO_FLAG } from "@/lib/national-flags";

interface Props {
  match: Match | null;
  locale: Locale;
  competitionLabel?: string;
  competitionCode?: string;
  onClose: () => void;
}

function toICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function teamLabel(team: Match["homeTeam"], competitionCode?: string): string {
  if (competitionCode && NATIONAL_TEAM_COMPETITION_CODES.has(competitionCode)) {
    const flag = TLA_TO_FLAG[team.tla] ?? NAME_TO_FLAG[team.name] ?? "";
    return flag ? `${flag} ${team.name}` : team.name;
  }
  return team.name;
}

function getGoogleCalendarUrl(match: Match, competitionLabel?: string, competitionCode?: string): string {
  const start = new Date(match.utcDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const title = `${teamLabel(match.homeTeam, competitionCode)} vs ${teamLabel(match.awayTeam, competitionCode)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    ...(competitionLabel ? { details: competitionLabel } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadICS(match: Match, competitionLabel?: string, competitionCode?: string): void {
  const start = new Date(match.utcDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const title = `${teamLabel(match.homeTeam, competitionCode)} vs ${teamLabel(match.awayTeam, competitionCode)}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Football Calendar//EN",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${title}`,
    ...(competitionLabel ? [`DESCRIPTION:${competitionLabel}`] : []),
    `UID:football-${match.id}@football-calendar`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${match.homeTeam.tla}-vs-${match.awayTeam.tla}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

const CALENDAR_HIDDEN_STATUSES = new Set<MatchStatus>(["POSTPONED", "CANCELLED", "SUSPENDED"]);

const STATUS_COLOR: Record<MatchStatus, string> = {
  SCHEDULED:  "bg-gray-700 text-gray-300",
  TIMED:      "bg-gray-700 text-gray-300",
  IN_PLAY:    "bg-green-600 text-white",
  PAUSED:     "bg-yellow-600 text-black",
  FINISHED:   "bg-gray-600 text-gray-200",
  POSTPONED:  "bg-orange-700 text-white",
  CANCELLED:  "bg-red-700 text-white",
  SUSPENDED:  "bg-red-700 text-white",
};

function CrestImage({ src, name }: { src: string; name: string }) {
  const isTBA = !name || name === "TBA";
  if (isTBA || !src) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-400">
        {isTBA ? "?" : name[0]}
      </div>
    );
  }
  return (
    <div className="relative w-16 h-16">
      <Image src={src} alt={name} fill className="object-contain" unoptimized />
    </div>
  );
}

export default function MatchDetailModal({ match, locale, competitionLabel, competitionCode, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!match) return null;

  const tr = t[locale];
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const showScore = isLive || match.status === "FINISHED";
  const stageLabel = match.matchday
    ? tr.matchday(match.matchday)
    : match.stage?.replace(/_/g, " ");

  const dateStr = format(new Date(match.utcDate), "EEEE, d MMMM yyyy");
  const competitionDisplay = match.competition?.name ?? competitionLabel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex flex-col gap-1.5">
            {competitionDisplay && (
              <span className="text-xs font-semibold text-blue-400 tracking-wide">
                {competitionDisplay}
              </span>
            )}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[match.status]}`}>
                {tr.status[match.status]}
              </span>
              {stageLabel && <span className="text-xs text-gray-500">{stageLabel}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
            <XIcon />
          </button>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <CrestImage src={match.homeTeam.crest} name={match.homeTeam.name} />
            <span className="text-sm font-semibold text-white leading-tight">{match.homeTeam.name}</span>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            {showScore ? (
              <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                {match.score.fullTime.home ?? 0}
                <span className="mx-1.5 text-gray-500">–</span>
                {match.score.fullTime.away ?? 0}
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-400">
                {formatKickoff(match.utcDate)}
              </div>
            )}
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {tr.status.IN_PLAY}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <CrestImage src={match.awayTeam.crest} name={match.awayTeam.name} />
            <span className="text-sm font-semibold text-white leading-tight">{match.awayTeam.name}</span>
          </div>
        </div>

        {/* Date */}
        <div className="border-t border-gray-800 pt-3 mt-2 text-center">
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>

        {/* Add to calendar */}
        {!CALENDAR_HIDDEN_STATUSES.has(match.status) && (
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <a
              href={getGoogleCalendarUrl(match, competitionLabel, competitionCode)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              <CalendarPlusIcon />
              Google Calendar
            </a>
            <button
              onClick={() => downloadICS(match, competitionLabel, competitionCode)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors"
            >
              <CalendarPlusIcon />
              Apple Calendar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
