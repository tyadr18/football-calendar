"use client";

import { useState, useEffect, useCallback } from "react";
import { Match } from "@/types/football";
import { getMatches } from "@/lib/api";
import CompetitionSelector from "./CompetitionSelector";
import MonthNavigator from "./MonthNavigator";
import CalendarGrid from "./CalendarGrid";
import MatchDetailModal from "./MatchDetailModal";

export default function CalendarPage() {
  const now = new Date();
  const [competition, setCompetition] = useState("PL");
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMatches(competition, year, month);
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [competition, year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">
            ⚽ Football Calendar
          </h1>
          <p className="text-gray-500 text-sm">
            Live scores, fixtures & results
          </p>
        </div>

        {/* Competition selector */}
        <div className="mb-6">
          <CompetitionSelector value={competition} onChange={(code) => { setCompetition(code); }} />
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <MonthNavigator year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {loading && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            )}
            {!loading && !error && (
              <span>{matches.length} matches</span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error === "RATE_LIMITED"
              ? "Rate limit reached. Please wait a moment and try again."
              : `Could not load matches: ${error}`}
          </div>
        )}

        {/* Calendar */}
        <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : "opacity-100"}`}>
          <CalendarGrid
            year={year}
            month={month}
            matches={matches}
            onMatchClick={setSelectedMatch}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" />
            Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-900/60 border border-green-500/40" />
            Live
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-800/80" />
            Finished
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-900/40 border border-red-500/30" />
            Postponed / Cancelled
          </span>
        </div>
      </div>

      {/* Modal */}
      <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
