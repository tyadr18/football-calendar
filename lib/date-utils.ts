import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
} from "date-fns";
import { Match } from "@/types/football";
import { Locale } from "./i18n";

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = startOfMonth(new Date(year, month - 1, 1));
  const lastDay = endOfMonth(firstDay);
  const start = startOfWeek(firstDay, { weekStartsOn: 1 });
  const end = endOfWeek(lastDay, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function groupMatchesByDate(matches: Match[]): Record<string, Match[]> {
  const map: Record<string, Match[]> = {};
  for (const match of matches) {
    const key = format(new Date(match.utcDate), "yyyy-MM-dd");
    if (!map[key]) map[key] = [];
    map[key].push(match);
  }
  return map;
}

export function formatKickoff(utcDate: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(utcDate));
}

export function formatMonthTitle(year: number, month: number, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(locale === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, 1));
}

export { isSameDay, format };
