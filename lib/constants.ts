import { CompetitionOption } from "@/types/football";

export const COMPETITIONS: CompetitionOption[] = [
  { code: "PL",   label: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "CL",   label: "Champions League", flag: "⭐" },
  { code: "PD",   label: "La Liga",          flag: "🇪🇸" },
  { code: "BL1",  label: "Bundesliga",       flag: "🇩🇪" },
  { code: "SA",   label: "Serie A",          flag: "🇮🇹" },
  { code: "FL1",  label: "Ligue 1",          flag: "🇫🇷" },
  { code: "JPN",  label: "Jリーグ",            labelEn: "J.League",               flag: "🇯🇵" },
  { code: "INTL", label: "国際Aマッチ",       labelEn: "International A-Match",  flag: "🌍" },
];

// Competitions served by API-Football instead of football-data.org
export const API_FOOTBALL_CODES = new Set(["INTL"]);

// API-Football league IDs (single-competition)
export const API_FOOTBALL_LEAGUE_IDS: Record<string, number> = {};

// International A-match leagues via API-Football
// WC/EC → football-data.org、Friendlies → ESPN が担当
export const INTL_LEAGUES = [
  { id: 6, name: "Africa Cup of Nations" },
  { id: 7, name: "AFC Asian Cup" },
  { id: 8, name: "CONCACAF Gold Cup" },
  { id: 9, name: "Copa América" },
];

// ESPN leagues fetched for INTL (no API key, no rate limit)
export const ESPN_INTL_LEAGUES = [
  { slug: "fifa.friendly", name: "International Friendlies" },
];

// football-data.org competitions included in INTL
export const INTL_FD_COMPETITIONS = [
  { code: "WC", name: "FIFA World Cup" },
  { code: "EC", name: "UEFA Euro" },
];
