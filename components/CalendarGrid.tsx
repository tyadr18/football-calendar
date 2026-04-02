"use client";

import { Match } from "@/types/football";
import { getCalendarDays, groupMatchesByDate, format } from "@/lib/date-utils";
import DayCell from "./DayCell";

interface Props {
  year: number;
  month: number;
  matches: Match[];
  onMatchClick: (match: Match) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ year, month, matches, onMatchClick }: Props) {
  const days = getCalendarDays(year, month);
  const matchMap = groupMatchesByDate(matches);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar days */}
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
              onMatchClick={onMatchClick}
            />
          );
        })}
      </div>
    </div>
  );
}
