"use client";

import { formatMonthTitle } from "@/lib/date-utils";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function MonthNavigator({ year, month, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onPrev}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeftIcon />
      </button>
      <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
        {formatMonthTitle(year, month)}
      </h2>
      <button
        onClick={onNext}
        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        aria-label="Next month"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
