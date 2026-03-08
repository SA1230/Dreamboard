"use client";

import { VisionCard } from "@/lib/types";
import { VISION_COLORS } from "@/lib/visionColors";
import { Pin } from "lucide-react";

interface VisionCardGridProps {
  cards: VisionCard[];
  onCardTap: (card: VisionCard) => void;
}

// Deterministic rotation per card based on its id
function getCardRotation(cardId: string): number {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 5) - hash + cardId.charCodeAt(i)) | 0;
  }
  return (hash % 5) - 2; // -2 to +2 degrees
}

// Accent bar colors — muted pastels that look like colored tape edges
const ACCENT_COLORS = [
  "#E8B4B8", // dusty rose
  "#B8D4E3", // soft blue
  "#C5D5A9", // sage green
  "#E3C9A6", // warm sand
  "#C4B4D8", // lavender
  "#E3D4A6", // muted gold
];

function getAccentColor(cardId: string): string {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 3) + cardId.charCodeAt(i)) | 0;
  }
  return ACCENT_COLORS[Math.abs(hash) % ACCENT_COLORS.length];
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, index) => {
        const rotation = getCardRotation(card.id);
        const accent = getAccentColor(card.id);
        const hasImage = !!card.imageBase64;
        const color = VISION_COLORS[card.colorIndex % VISION_COLORS.length];

        return (
          <button
            key={card.id}
            className="text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] animate-dreamFadeIn group"
            style={{
              animationDelay: `${index * 60}ms`,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => onCardTap(card)}
          >
            <div className="rounded-lg overflow-hidden vision-card-shadow group-hover:vision-card-shadow-hover transition-shadow">
              {/* Colored accent bar at top */}
              <div className="h-1.5" style={{ backgroundColor: accent }} />

              {hasImage ? (
                <>
                  {/* Image card */}
                  <div className="w-full aspect-[4/5] overflow-hidden">
                    <img
                      src={card.imageBase64}
                      alt={card.rawText}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2.5 bg-white">
                    <p className="text-xs text-stone-600 leading-snug line-clamp-2 font-medium">
                      {card.rawText}
                    </p>
                    {card.pinned && (
                      <Pin size={10} className="text-purple-400 rotate-45 mt-1" />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Text card — warm pastel fill, bigger text, more padding */}
                  <div
                    className="px-4 py-5 min-h-[120px] flex flex-col justify-center"
                    style={{ backgroundColor: color.bg }}
                  >
                    <p className="text-[15px] text-stone-700 leading-relaxed line-clamp-6">
                      {card.weavedText}
                    </p>
                  </div>
                  {(card.rawText !== card.weavedText || card.pinned) && (
                    <div className="px-3 py-2 bg-white/80 flex items-center gap-1">
                      {card.rawText !== card.weavedText && (
                        <p className="text-[10px] text-stone-400 line-clamp-1 flex-1 italic">
                          {card.rawText}
                        </p>
                      )}
                      {card.pinned && (
                        <Pin size={10} className="text-purple-400 rotate-45 shrink-0" />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
