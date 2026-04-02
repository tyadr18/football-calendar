"use client";

import { COMPETITIONS } from "@/lib/constants";

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export default function CompetitionSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {COMPETITIONS.map((c) => (
        <button
          key={c.code}
          onClick={() => onChange(c.code)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            value === c.code
              ? "bg-green-500 text-black shadow-lg shadow-green-500/30"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <span className="mr-1.5">{c.flag}</span>
          {c.label}
        </button>
      ))}
    </div>
  );
}
