"use client";

import { VisionCard } from "@/lib/types";
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
  return (hash % 7) - 3; // -3 to +3 degrees
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="columns-2 gap-3">
      {cards.map((card, index) => {
        const rotation = getCardRotation(card.id);
        const hasImage = !!card.imageBase64;

        return (
          <button
            key={card.id}
            className="w-full break-inside-avoid mb-3 text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] animate-dreamFadeIn group"
            style={{
              animationDelay: `${index * 60}ms`,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => onCardTap(card)}
          >
            {/* Polaroid card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-stone-200/60 group-hover:shadow-lg transition-shadow">
              {/* Pin */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500/30" />
              </div>

              {/* Image */}
              {hasImage ? (
                <div className="w-full aspect-square overflow-hidden">
                  <img
                    src={card.imageBase64}
                    alt={card.rawText}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-square bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
                  <p className="text-sm text-stone-500 text-center leading-relaxed line-clamp-6">
                    {card.weavedText}
                  </p>
                </div>
              )}

              {/* Bottom strip with text */}
              <div className="px-3 py-2.5 bg-white">
                <p className="text-xs text-stone-500 leading-snug line-clamp-2">
                  {card.rawText}
                </p>
                {card.pinned && (
                  <Pin size={10} className="text-purple-400 mt-1 rotate-45 inline-block" />
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
