"use client";

import { useState, useEffect } from "react";
import { Match } from "@/types/football";
import { Locale, t } from "@/lib/i18n";
import { getCalendarDays, groupMatchesByDate, format, isSameDay, formatKickoff } from "@/lib/date-utils";
import DayCell from "./DayCell";

interface Props {
  year: number;
  month: number;
  matches: Match[];
  locale: Locale;
  onMatchClick: (match: Match) => void;
  onMoreClick: (date: Date, matches: Match[]) => void;
}

function agendaScoreOrTime(match: Match): string {
  const { status, score, utcDate } = match;
  if (status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED") {
    return `${score.fullTime.home ?? 0}–${score.fullTime.away ?? 0}`;
  }
  if (status === "POSTPONED") return "PPD";
  if (status === "CANCELLED") return "CXL";
  return formatKickoff(utcDate);
}

function agendaScoreClass(status: Match["status"]): string {
  switch (status) {
    case "IN_PLAY":
    case "PAUSED":
      return "text-green-400";
    case "FINISHED":
      return "text-gray-500";
    case "POSTPONED":
    case "CANCELLED":
    case "SUSPENDED":
      return "text-red-400";
    default:
      return "text-blue-400";
  }
}

const COMPETITION_SHORT: Record<string, string> = {
  "FIFA World Cup":               "WC",
  "UEFA Euro":                    "EURO",
  "Africa Cup of Nations":        "AFCON",
  "AFC Asian Cup":                "Asian Cup",
  "CONCACAF Gold Cup":            "Gold Cup",
  "Copa América":                 "Copa Am.",
  "International Friendlies":     "Friendly",
  "Jリーグ":                      "J.Lge",
  "明治安田J1百年構想リーグ":       "百年構想",
  "明治安田J2・J3百年構想リーグ":   "百年構想",
};

function competitionBadge(name: string): string {
  return COMPETITION_SHORT[name] ?? name;
}

function formatDayHeader(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export default function CalendarGrid({ year, month, matches, locale, onMatchClick, onMoreClick }: Props) {
  const days = getCalendarDays(year, month);
  const matchMap = groupMatchesByDate(matches);
  const weekdays = t[locale].weekdays;
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => { setToday(new Date()); }, []);

  const agendaDays = days.filter(
    (d) => d.getMonth() === month - 1 && (matchMap[format(d, "yyyy-MM-dd")] ?? []).length > 0
  );

  return (
    <>
      {/* Mobile: agenda/list view */}
      <div className="block md:hidden space-y-2">
        {agendaDays.map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const dayMatches = matchMap[key];
          const isToday = today ? isSameDay(date, today) : false;
          return (
            <div key={key} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div className={`px-3 py-2 border-b border-gray-800 ${isToday ? "bg-green-900/20" : "bg-gray-800/40"}`}>
                <span className={`text-sm font-semibold ${isToday ? "text-green-400" : "text-gray-300"}`}>
                  {formatDayHeader(date, locale)}
                </span>
              </div>
              <div className="divide-y divide-gray-800/50">
                {dayMatches.map((match) => {
                  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
                  const isTBA = !match.homeTeam?.name || match.homeTeam.name === "TBA";
                  const homeName = isTBA ? "TBA" : (match.homeTeam.shortName || match.homeTeam.name);
                  const awayName = isTBA ? "TBA" : (match.awayTeam.shortName || match.awayTeam.name);
                  return (
                    <button
                      key={match.id}
                      onClick={() => !isTBA && onMatchClick(match)}
                      disabled={isTBA}
                      className="w-full px-3 py-2.5 flex items-center gap-2 hover:bg-gray-800/50 active:bg-gray-800 transition-colors"
                    >
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                      )}
                      {!isTBA && match.homeTeam.crest && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={match.homeTeam.crest}
                          alt=""
                          width={20}
                          height={20}
                          className="object-contain shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                      <span className="flex-1 text-left text-sm font-medium text-gray-200 truncate">
                        {homeName}
                      </span>
                      <span className="flex flex-col items-center shrink-0 gap-0.5">
                        <span className={`font-mono text-xs font-bold ${agendaScoreClass(match.status)}`}>
                          {agendaScoreOrTime(match)}
                        </span>
                        {match.competition?.name && (
                          <span className="text-[9px] text-gray-500 leading-none whitespace-nowrap">
                            {competitionBadge(match.competition.name)}
                          </span>
                        )}
                      </span>
                      <span className="flex-1 text-right text-sm font-medium text-gray-200 truncate">
                        {awayName}
                      </span>
                      {!isTBA && match.awayTeam.crest && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={match.awayTeam.crest}
                          alt=""
                          width={20}
                          height={20}
                          className="object-contain shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: calendar grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekdays.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => {
            const key = format(date, "yyyy-MM-dd");
            const isCurrentMonth = date.getMonth() === month - 1;
            return (
              <DayCell
                key={key}
                date={date}
                isCurrentMonth={isCurrentMonth}
                isToday={today ? isSameDay(date, today) : false}
                matches={matchMap[key] ?? []}
                locale={locale}
                onMatchClick={onMatchClick}
                onMoreClick={onMoreClick}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
