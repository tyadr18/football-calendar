"use client";

import { Match } from "@/types/football";
import MatchTile from "./MatchTile";
import { isSameDay } from "@/lib/date-utils";

interface Props {
  date: Date;
  isCurrentMonth: boolean;
  matches: Match[];
  onMatchClick: (match: Match) => void;
}

const MAX_VISIBLE = 3;

export default function DayCell({ date, isCurrentMonth, matches, onMatchClick }: Props) {
  const today = isSameDay(date, new Date());
  const visible = matches.slice(0, MAX_VISIBLE);
  const overflow = matches.length - MAX_VISIBLE;

  return (
    <div
      className={`min-h-[120px] p-1.5 rounded-lg border transition-colors ${
        isCurrentMonth
          ? "bg-gray-900 border-gray-800"
          : "bg-gray-950 border-gray-800/50"
      }`}
    >
      <div className="flex items-center justify-end mb-1">
        <span
          className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
            today
              ? "bg-green-500 text-black"
              : isCurrentMonth
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        >
          {date.getDate()}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        {visible.map((match) => (
          <MatchTile key={match.id} match={match} onClick={onMatchClick} />
        ))}
        {overflow > 0 && (
          <button
            className="text-[10px] text-gray-500 hover:text-gray-300 text-left pl-1.5 transition-colors"
            onClick={() => onMatchClick(matches[MAX_VISIBLE])}
          >
            +{overflow} more
          </button>
        )}
      </div>
    </div>
  );
}
