const countryFlagMap: Record<string, string> = {
  "united states": "🇺🇸",
  "united kingdom": "🇬🇧",
  "european union": "🇪🇺",
  japan: "🇯🇵",
  canada: "🇨🇦",
  australia: "🇦🇺",
  switzerland: "🇨🇭",
  sweden: "🇸🇪",
  norway: "🇳🇴",
  denmark: "🇩🇰",
  turkey: "🇹🇷",
  egypt: "🇪🇬",
  السعودية: "🇸🇦",
  "saudi arabia": "🇸🇦",
  uae: "🇦🇪",
  "united arab emirates": "🇦🇪",
  qatar: "🇶🇦",
  jordan: "🇯🇴",
  الكويت: "🇰🇼",
  kuwait: "🇰🇼",
};

export function slugifyCountryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getCountryFlag(name: string, savedFlag?: string | null) {
  if (savedFlag?.trim()) {
    return savedFlag.trim();
  }

  return countryFlagMap[name.trim().toLowerCase()] || null;
}