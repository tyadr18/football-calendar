import { CompetitionOption } from "@/types/football";

export const COMPETITIONS: CompetitionOption[] = [
  { code: "PL",  label: "Premier League",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "CL",  label: "Champions League",       flag: "⭐" },
  { code: "PD",  label: "La Liga",                flag: "🇪🇸" },
  { code: "BL1", label: "Bundesliga",             flag: "🇩🇪" },
  { code: "SA",  label: "Serie A",                flag: "🇮🇹" },
  { code: "FL1", label: "Ligue 1",                flag: "🇫🇷" },
  { code: "J1",  label: "J1リーグ",               flag: "🇯🇵" },
  { code: "WC",  label: "FIFA World Cup",         flag: "🌍" },
  { code: "EC",  label: "European Championship",  flag: "🇪🇺" },
];

// Competitions served by API-Football (RapidAPI) instead of football-data.org
export const API_FOOTBALL_CODES = new Set(["J1"]);

// API-Football league IDs
export const API_FOOTBALL_LEAGUE_IDS: Record<string, number> = {
  J1: 98,
};
