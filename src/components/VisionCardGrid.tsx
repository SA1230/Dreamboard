"use client";

import { VisionCard } from "@/lib/types";
import { VISION_GRADIENTS } from "@/lib/visionColors";
import { Pin } from "lucide-react";

interface VisionCardGridProps {
  cards: VisionCard[];
  onCardTap: (card: VisionCard) => void;
}

// Deterministic rotation per card based on its id (-1.5 to +1.5 degrees)
function getCardRotation(cardId: string): number {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 5) - hash + cardId.charCodeAt(i)) | 0;
  }
  return ((hash % 7) - 3) * 0.5;
}

// Pick a gradient based on card id
function getGradient(cardId: string) {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 3) + cardId.charCodeAt(i)) | 0;
  }
  return VISION_GRADIENTS[Math.abs(hash) % VISION_GRADIENTS.length];
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {cards.map((card, index) => {
        const rotation = getCardRotation(card.id);
        const hasImage = !!card.imageBase64;
        const gradient = getGradient(card.id);

        return (
          <button
            key={card.id}
            className="block w-full text-left break-inside-avoid transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] animate-dreamFadeIn group"
            style={{
              animationDelay: `${index * 60}ms`,
              transform: `rotate(${rotation}deg)`,
            }}
            onClick={() => onCardTap(card)}
          >
            <div className="rounded-2xl overflow-hidden vision-card-shadow group-hover:vision-card-shadow-hover transition-shadow relative">
              {hasImage ? (
                <>
                  {/* Image card — full bleed photo with caption overlay */}
                  <div className="w-full overflow-hidden">
                    <img
                      src={card.imageBase64}
                      alt={card.rawText}
                      className="w-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2.5 bg-white">
                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 font-medium">
                      {card.rawText}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Text card — dreamy gradient quote card */}
                  <div
                    className="px-5 py-6 min-h-[160px] flex flex-col justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                    }}
                  >
                    {/* Decorative quote mark */}
                    <span
                      className="absolute top-3 left-3.5 text-[40px] leading-none font-serif select-none pointer-events-none opacity-[0.12]"
                      style={{ color: gradient.accent }}
                    >
                      &ldquo;
                    </span>

                    <p className="text-[15px] text-stone-700 leading-relaxed line-clamp-8 relative z-10">
                      {card.weavedText}
                    </p>

                    {card.pinned && (
                      <Pin size={12} className="text-stone-400 rotate-45 mt-2 opacity-60" />
                    )}
                  </div>

                  {/* Original text footer (only if Oracle rewrote it) */}
                  {card.rawText !== card.weavedText && (
                    <div className="px-4 py-2 bg-white/60">
                      <p className="text-[10px] text-stone-400 line-clamp-1 italic">
                        {card.rawText}
                      </p>
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
