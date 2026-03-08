/** Soft pastel palette for Vision Board cards — dreamy, warm, cozy */
export const VISION_COLORS = [
  { name: "Misty Lavender", bg: "#F3EFF7", border: "#E0D5ED" },
  { name: "Soft Peach", bg: "#FDF0EC", border: "#F5DDD5" },
  { name: "Pale Sage", bg: "#EFF5EC", border: "#D8E8D2" },
  { name: "Warm Cream", bg: "#FDF8EC", border: "#F5EACC" },
  { name: "Light Rose", bg: "#FDF0F4", border: "#F5D8E2" },
  { name: "Sky Mist", bg: "#ECF2F8", border: "#D5E2EF" },
] as const;

/** Maximum number of vision cards allowed (encourages curation, prevents localStorage bloat) */
export const MAX_VISION_CARDS = 20;
