"use client";

import { VisionCard } from "@/lib/types";
import { VISION_COLORS } from "@/lib/visionColors";
import { Pin } from "lucide-react";

interface VisionCardGridProps {
  cards: VisionCard[];
  onCardTap: (card: VisionCard) => void;
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="columns-2 gap-3">
      {cards.map((card, index) => {
        const color = VISION_COLORS[card.colorIndex % VISION_COLORS.length];
        return (
          <button
            key={card.id}
            className="w-full break-inside-avoid mb-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.97] animate-dreamFadeIn"
            style={{
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              animationDelay: `${index * 50}ms`,
            }}
            onClick={() => onCardTap(card)}
          >
            {card.pinned && (
              <Pin size={12} className="text-stone-400 mb-1.5 rotate-45" />
            )}
            <p className="text-sm text-stone-600 leading-relaxed">
              {card.weavedText}
            </p>
          </button>
        );
      })}
    </div>
  );
}
