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
  return (hash % 5) - 2; // -2 to +2 degrees (subtle)
}

// Deterministic washi tape color per card
const WASHI_COLORS = [
  { bg: "bg-pink-200/80", border: "border-pink-300/40" },
  { bg: "bg-amber-200/80", border: "border-amber-300/40" },
  { bg: "bg-sky-200/80", border: "border-sky-300/40" },
  { bg: "bg-lime-200/80", border: "border-lime-300/40" },
  { bg: "bg-violet-200/80", border: "border-violet-300/40" },
  { bg: "bg-orange-200/80", border: "border-orange-300/40" },
];

function getWashiColor(cardId: string): typeof WASHI_COLORS[number] {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 3) + cardId.charCodeAt(i)) | 0;
  }
  return WASHI_COLORS[Math.abs(hash) % WASHI_COLORS.length];
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => {
        const rotation = getCardRotation(card.id);
        const washi = getWashiColor(card.id);
        const hasImage = !!card.imageBase64;
        const color = VISION_COLORS[card.colorIndex % VISION_COLORS.length];

        return (
          <button
            key={card.id}
            className="relative text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] animate-dreamFadeIn group"
            style={{
              animationDelay: `${index * 60}ms`,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => onCardTap(card)}
          >
            {/* Washi tape strip */}
            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-10 h-4 ${washi.bg} ${washi.border} border rounded-sm`}
              style={{ transform: `translateX(-50%) rotate(${rotation > 0 ? -3 : 3}deg)` }}
            />

            {/* Card */}
            <div className="bg-white rounded-lg overflow-hidden vision-card-shadow group-hover:vision-card-shadow-hover transition-shadow">
              {hasImage ? (
                <>
                  {/* Image card — square photo + caption */}
                  <div className="w-full aspect-[4/5] overflow-hidden">
                    <img
                      src={card.imageBase64}
                      alt={card.rawText}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2.5 py-2 flex items-center gap-1">
                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-1 flex-1">
                      {card.rawText}
                    </p>
                    {card.pinned && (
                      <Pin size={9} className="text-purple-400 rotate-45 shrink-0" />
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Text-only card — compact, no square placeholder */}
                  <div className="px-3 py-4" style={{ backgroundColor: color.bg }}>
                    <p className="text-sm text-stone-600 leading-relaxed line-clamp-5">
                      {card.weavedText}
                    </p>
                  </div>
                  <div className="px-2.5 py-1.5 bg-white flex items-center gap-1">
                    {card.rawText !== card.weavedText && (
                      <p className="text-[10px] text-stone-400 leading-snug line-clamp-1 flex-1 italic">
                        {card.rawText}
                      </p>
                    )}
                    {card.pinned && (
                      <Pin size={9} className="text-purple-400 rotate-45 shrink-0" />
                    )}
                  </div>
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
