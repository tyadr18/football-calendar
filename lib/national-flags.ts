export const NATIONAL_TEAM_COMPETITION_CODES = new Set(["WC", "EC", "INTL"]);

export const TLA_TO_FLAG: Record<string, string> = {
  // Europe
  GER: "🇩🇪", FRA: "🇫🇷", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ESP: "🇪🇸", ITA: "🇮🇹",
  POR: "🇵🇹", NED: "🇳🇱", BEL: "🇧🇪", CRO: "🇭🇷", DEN: "🇩🇰",
  SWE: "🇸🇪", NOR: "🇳🇴", SUI: "🇨🇭", AUT: "🇦🇹", POL: "🇵🇱",
  CZE: "🇨🇿", HUN: "🇭🇺", ROM: "🇷🇴", GRE: "🇬🇷", TUR: "🇹🇷",
  UKR: "🇺🇦", SRB: "🇷🇸", SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", SVK: "🇸🇰",
  SVN: "🇸🇮", ALB: "🇦🇱", GEO: "🇬🇪", MKD: "🇲🇰", ISL: "🇮🇸",
  FIN: "🇫🇮", IRL: "🇮🇪", LUX: "🇱🇺", BLR: "🇧🇾", MNE: "🇲🇪",
  BIH: "🇧🇦", KOS: "🇽🇰", AZE: "🇦🇿", ARM: "🇦🇲", KAZ: "🇰🇿",
  // South America
  BRA: "🇧🇷", ARG: "🇦🇷", URU: "🇺🇾", COL: "🇨🇴", CHI: "🇨🇱",
  ECU: "🇪🇨", PER: "🇵🇪", PAR: "🇵🇾", VEN: "🇻🇪", BOL: "🇧🇴",
  // North & Central America
  USA: "🇺🇸", MEX: "🇲🇽", CAN: "🇨🇦", CRC: "🇨🇷", PAN: "🇵🇦",
  JAM: "🇯🇲", HON: "🇭🇳", GUA: "🇬🇹", SLV: "🇸🇻", TRI: "🇹🇹",
  // Africa
  SEN: "🇸🇳", MAR: "🇲🇦", NGA: "🇳🇬", CMR: "🇨🇲", GHA: "🇬🇭",
  CIV: "🇨🇮", EGY: "🇪🇬", TUN: "🇹🇳", ALG: "🇩🇿", RSA: "🇿🇦",
  MLI: "🇲🇱", BFA: "🇧🇫", COD: "🇨🇩", ZIM: "🇿🇼", MOZ: "🇲🇿",
  // Asia & Oceania
  JPN: "🇯🇵", KOR: "🇰🇷", AUS: "🇦🇺", IRN: "🇮🇷", SAU: "🇸🇦",
  QAT: "🇶🇦", UAE: "🇦🇪", CHN: "🇨🇳", IRQ: "🇮🇶", JOR: "🇯🇴",
  SYR: "🇸🇾", UZB: "🇺🇿",
};

// Name-based fallback for API-Football (which auto-generates TLA from name)
export const NAME_TO_FLAG: Record<string, string> = {
  "Germany": "🇩🇪", "France": "🇫🇷", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Spain": "🇪🇸",
  "Italy": "🇮🇹", "Portugal": "🇵🇹", "Netherlands": "🇳🇱", "Belgium": "🇧🇪",
  "Croatia": "🇭🇷", "Denmark": "🇩🇰", "Sweden": "🇸🇪", "Norway": "🇳🇴",
  "Switzerland": "🇨🇭", "Austria": "🇦🇹", "Poland": "🇵🇱", "Czech Republic": "🇨🇿",
  "Hungary": "🇭🇺", "Romania": "🇷🇴", "Greece": "🇬🇷", "Turkey": "🇹🇷",
  "Ukraine": "🇺🇦", "Serbia": "🇷🇸", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Slovakia": "🇸🇰", "Slovenia": "🇸🇮", "Albania": "🇦🇱", "Georgia": "🇬🇪",
  "North Macedonia": "🇲🇰", "Iceland": "🇮🇸", "Finland": "🇫🇮", "Ireland": "🇮🇪",
  "Luxembourg": "🇱🇺", "Montenegro": "🇲🇪", "Bosnia": "🇧🇦", "Kosovo": "🇽🇰",
  "Brazil": "🇧🇷", "Argentina": "🇦🇷", "Uruguay": "🇺🇾", "Colombia": "🇨🇴",
  "Chile": "🇨🇱", "Ecuador": "🇪🇨", "Peru": "🇵🇪", "Paraguay": "🇵🇾",
  "Venezuela": "🇻🇪", "Bolivia": "🇧🇴",
  "United States": "🇺🇸", "Mexico": "🇲🇽", "Canada": "🇨🇦", "Costa Rica": "🇨🇷",
  "Panama": "🇵🇦", "Jamaica": "🇯🇲", "Honduras": "🇭🇳",
  "Senegal": "🇸🇳", "Morocco": "🇲🇦", "Nigeria": "🇳🇬", "Cameroon": "🇨🇲",
  "Ghana": "🇬🇭", "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮",
  "Egypt": "🇪🇬", "Tunisia": "🇹🇳", "Algeria": "🇩🇿", "South Africa": "🇿🇦",
  "Japan": "🇯🇵", "South Korea": "🇰🇷", "Korea Republic": "🇰🇷",
  "Australia": "🇦🇺", "Iran": "🇮🇷", "Saudi Arabia": "🇸🇦", "Qatar": "🇶🇦",
  "United Arab Emirates": "🇦🇪", "China": "🇨🇳", "China PR": "🇨🇳",
  "Iraq": "🇮🇶", "Jordan": "🇯🇴", "Uzbekistan": "🇺🇿",
};
