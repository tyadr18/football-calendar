"use client";

import { useEffect, useState } from "react";
import { Player } from "@/types/football";
import { Locale } from "@/lib/i18n";

interface Props {
  teamId: number;
  teamName: string;
  matchSource: string | undefined;
  locale: Locale;
  onBack: () => void;
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

const POSITION_LABEL: Record<string, { ja: string; en: string; abbr: string }> = {
  Goalkeeper: { ja: "ゴールキーパー", en: "Goalkeepers", abbr: "GK" },
  Defender:   { ja: "ディフェンダー", en: "Defenders",   abbr: "DF" },
  Midfielder: { ja: "ミッドフィールダー", en: "Midfielders", abbr: "MF" },
  Forward:    { ja: "フォワード",     en: "Forwards",    abbr: "FW" },
};

export default function SquadView({ teamId, teamName, matchSource, locale, onBack }: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    const useId = matchSource === "fd" && teamId > 0;
    const url = useId
      ? `/api/squad?teamId=${teamId}`
      : `/api/squad?teamName=${encodeURIComponent(teamName)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setPlayers(data.players ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [teamId, teamName, matchSource]);

  const grouped = POSITION_ORDER.reduce<Record<string, Player[]>>((acc, pos) => {
    const list = players.filter((p) => p.position === pos);
    if (list.length > 0) acc[pos] = list.sort((a, b) => (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99));
    return acc;
  }, {});

  const ja = locale === "ja";

  return (
    <div className="flex flex-col" style={{ maxHeight: "65vh" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← {ja ? "戻る" : "Back"}
        </button>
        <h3 className="text-base font-bold text-white truncate">{teamName}</h3>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 -mx-1 px-1">
        {loading && (
          <div className="flex justify-center py-10">
            <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && error && (
          <p className="text-center text-gray-500 text-sm py-8">
            {ja ? "スカッド情報を取得できませんでした" : "Could not load squad data"}
          </p>
        )}

        {!loading && !error && players.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            {ja ? "スカッド情報がありません" : "No squad data available"}
          </p>
        )}

        {!loading && !error && players.length > 0 && (
          <div className="space-y-4">
            {Object.entries(grouped).map(([pos, list]) => {
              const label = POSITION_LABEL[pos];
              return (
                <div key={pos}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-green-400 tracking-widest">
                      {label?.abbr}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {ja ? label?.ja : label?.en}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {list.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-800 transition-colors"
                      >
                        <span className="w-5 text-right text-xs font-mono text-gray-500 shrink-0">
                          {player.shirtNumber ?? "—"}
                        </span>
                        <span className="flex-1 text-sm font-medium text-gray-200 truncate">
                          {player.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[40%] text-right">
                          {player.currentTeam?.name ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
