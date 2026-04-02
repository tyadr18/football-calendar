"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Match } from "@/types/football";
import { formatKickoff, format } from "@/lib/date-utils";
import { XIcon } from "./Icons";

interface Props {
  match: Match | null;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  SCHEDULED:  { label: "Scheduled",  color: "bg-gray-700 text-gray-300" },
  TIMED:      { label: "Scheduled",  color: "bg-gray-700 text-gray-300" },
  IN_PLAY:    { label: "Live",       color: "bg-green-600 text-white" },
  PAUSED:     { label: "Half Time",  color: "bg-yellow-600 text-black" },
  FINISHED:   { label: "Finished",   color: "bg-gray-600 text-gray-200" },
  POSTPONED:  { label: "Postponed",  color: "bg-orange-700 text-white" },
  CANCELLED:  { label: "Cancelled",  color: "bg-red-700 text-white" },
  SUSPENDED:  { label: "Suspended",  color: "bg-red-700 text-white" },
};

function CrestImage({ src, name }: { src: string; name: string }) {
  if (!src) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-400">
        {name[0]}
      </div>
    );
  }
  return (
    <div className="relative w-16 h-16">
      <Image
        src={src}
        alt={name}
        fill
        className="object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        unoptimized
      />
    </div>
  );
}

export default function MatchDetailModal({ match, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!match) return null;

  const statusInfo = STATUS_LABEL[match.status] ?? STATUS_LABEL.SCHEDULED;
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const showScore = isLive || isFinished;
  const stageLabel = match.matchday
    ? `Matchday ${match.matchday}`
    : match.stage?.replace(/_/g, " ");

  const dateStr = format(new Date(match.utcDate), "EEEE, d MMMM yyyy");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {stageLabel && (
              <span className="text-xs text-gray-500">{stageLabel}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Home */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <CrestImage src={match.homeTeam.crest} name={match.homeTeam.name} />
            <span className="text-sm font-semibold text-white leading-tight">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {showScore ? (
              <div className="text-4xl font-black text-white tabular-nums">
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
                Live
              </span>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 flex flex-col items-center gap-2 text-center">
            <CrestImage src={match.awayTeam.crest} name={match.awayTeam.name} />
            <span className="text-sm font-semibold text-white leading-tight">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="border-t border-gray-800 pt-3 mt-2 text-center">
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>
      </div>
    </div>
  );
}
