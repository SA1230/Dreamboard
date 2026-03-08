/** Dreamy gradient palette for Vision Board text cards — warm, cozy, Pinterest-style quote cards */
export const VISION_GRADIENTS = [
  { name: "Sunset Glow", from: "#FDDCDC", to: "#FCE4EC", accent: "#E8A0A0" },
  { name: "Lavender Dream", from: "#E8DEF8", to: "#F3EFF7", accent: "#B39DDB" },
  { name: "Ocean Calm", from: "#D1E7F0", to: "#E8F4F8", accent: "#81B9D4" },
  { name: "Golden Hour", from: "#FCEABB", to: "#FFF3D6", accent: "#D4A843" },
  { name: "Sage Whisper", from: "#D5E8D4", to: "#EAF5E9", accent: "#8CB88A" },
  { name: "Berry Soft", from: "#E8D5E8", to: "#F5ECF5", accent: "#B388B3" },
] as const;

/** Flat pastel fallback for non-gradient contexts */
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

/** Get gradient for a card based on its ID (deterministic hash) */
export function getCardGradient(cardId: string) {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 3) + cardId.charCodeAt(i)) | 0;
  }
  return VISION_GRADIENTS[Math.abs(hash) % VISION_GRADIENTS.length];
}
