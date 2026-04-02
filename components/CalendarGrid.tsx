"use client";

import { Match } from "@/types/football";
import { Locale, t } from "@/lib/i18n";
import { getCalendarDays, groupMatchesByDate, format } from "@/lib/date-utils";
import DayCell from "./DayCell";

interface Props {
  year: number;
  month: number;
  matches: Match[];
  locale: Locale;
  onMatchClick: (match: Match) => void;
}

export default function CalendarGrid({ year, month, matches, locale, onMatchClick }: Props) {
  const days = getCalendarDays(year, month);
  const matchMap = groupMatchesByDate(matches);
  const weekdays = t[locale].weekdays;

  return (
    <div>
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
              matches={matchMap[key] ?? []}
              locale={locale}
              onMatchClick={onMatchClick}
            />
          );
        })}
      </div>
    </div>
  );
}
