"use client";

import { useState, useEffect, useCallback } from "react";
import { Match } from "@/types/football";
import { Locale, t } from "@/lib/i18n";
import { getMatches } from "@/lib/api";
import CompetitionSelector from "./CompetitionSelector";
import MonthNavigator from "./MonthNavigator";
import CalendarGrid from "./CalendarGrid";
import MatchDetailModal from "./MatchDetailModal";

export default function CalendarPage() {
  const now = new Date();
  const [locale, setLocale] = useState<Locale>("ja");
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

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };

  const tr = t[locale];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">⚽ {tr.title}</h1>
            <p className="text-gray-500 text-sm">{tr.subtitle}</p>
          </div>
          {/* Language toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-full p-1">
            {(["ja", "en"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${
                  locale === l ? "bg-white text-gray-900" : "text-gray-400 hover:text-white"
                }`}
              >
                {l === "ja" ? "日本語" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Competition selector */}
        <div className="mb-6">
          <CompetitionSelector value={competition} onChange={setCompetition} />
        </div>

        {/* Month navigation + status */}
        <div className="flex items-center justify-between mb-4">
          <MonthNavigator year={year} month={month} locale={locale} onPrev={prevMonth} onNext={nextMonth} />
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {loading && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                {tr.loading}
              </span>
            )}
            {!loading && !error && (
              <span>{tr.matches(matches.length)}</span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
            {error === "RATE_LIMITED" ? tr.rateLimit : tr.loadError(error)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && matches.length === 0 && (
          <div className="text-center text-gray-500 py-20 text-sm">{tr.noMatches}</div>
        )}

        {/* Calendar */}
        <div className={`transition-opacity duration-200 ${loading ? "opacity-50" : "opacity-100"}`}>
          <CalendarGrid
            year={year}
            month={month}
            matches={matches}
            locale={locale}
            onMatchClick={setSelectedMatch}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-800 border border-gray-700" />
            {tr.legend.scheduled}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-900/60 border border-green-500/40" />
            {tr.legend.live}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-800/80" />
            {tr.legend.finished}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-900/40 border border-red-500/30" />
            {tr.legend.postponed}
          </span>
        </div>
      </div>

      <MatchDetailModal match={selectedMatch} locale={locale} onClose={() => setSelectedMatch(null)} />
    </div>
  );
}
