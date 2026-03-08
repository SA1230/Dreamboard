"use client";

import { VisionCard } from "@/lib/types";
import { getCardGradient } from "@/lib/visionColors";
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

// Deterministic float timing per card (varied delay + duration for organic movement)
function getFloatTiming(cardId: string): { delay: string; duration: string } {
  let hash = 0;
  for (let i = 0; i < cardId.length; i++) {
    hash = ((hash << 7) + cardId.charCodeAt(i)) | 0;
  }
  const delay = (Math.abs(hash) % 50) / 10; // 0s to 5s
  const duration = 5 + (Math.abs(hash >> 4) % 4); // 5s to 8s
  return { delay: `${delay}s`, duration: `${duration}s` };
}

// Adaptive text sizing — short visions get large bold text, long ones stay readable
function getTextStyle(text: string): { fontSize: string; fontWeight: string; lineClamp: string } {
  const length = text.length;
  if (length <= 40) return { fontSize: "text-xl", fontWeight: "font-bold", lineClamp: "line-clamp-4" };
  if (length <= 80) return { fontSize: "text-[17px]", fontWeight: "font-semibold", lineClamp: "line-clamp-5" };
  if (length <= 150) return { fontSize: "text-[15px]", fontWeight: "", lineClamp: "line-clamp-7" };
  return { fontSize: "text-[13px]", fontWeight: "", lineClamp: "line-clamp-10" };
}

export function VisionCardGrid({ cards, onCardTap }: VisionCardGridProps) {
  return (
    <div className="columns-2 gap-3 space-y-3">
      {cards.map((card, index) => {
        const rotation = getCardRotation(card.id);
        const hasImage = !!card.imageBase64;
        const gradient = getCardGradient(card.id);
        const float = getFloatTiming(card.id);
        const textStyle = !hasImage ? getTextStyle(card.weavedText) : null;

        return (
          /* Outer: masonry layout + entrance animation */
          <div
            key={card.id}
            className="break-inside-avoid animate-dreamFadeIn"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {/* Button: click handler + rotation + group context for hover */}
            <button
              className="block w-full text-left group"
              style={{ transform: `rotate(${rotation}deg)` }}
              onClick={() => onCardTap(card)}
            >
              {/* Hover/active scale (separate element to avoid animation conflict) */}
              <div className="transition-transform duration-200 group-hover:scale-[1.02] group-active:scale-[0.98]">
                {/* Card: shadow + float + glow */}
                <div
                  className={`rounded-2xl overflow-hidden vision-card-shadow vision-card-float transition-shadow duration-300 relative ${card.pinned ? "vision-card-pinned" : ""}`}
                  style={{
                    "--card-glow": `${gradient.accent}30`,
                    animationDelay: float.delay,
                    animationDuration: float.duration,
                  } as React.CSSProperties}
                >
                  {hasImage ? (
                    <>
                      {/* Image card — full bleed photo with vignette + pin badge */}
                      <div className="w-full overflow-hidden relative">
                        <img
                          src={card.imageBase64}
                          alt={card.rawText}
                          className="w-full object-cover"
                        />
                        {/* Subtle vignette overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none" />
                        {/* Pin badge on image cards */}
                        {card.pinned && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Pin size={10} className="text-amber-500 rotate-45" />
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-2.5 bg-white">
                        <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 font-medium">
                          {card.rawText}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Text card — adaptive typography with gradient background */}
                      <div
                        className="px-5 py-6 min-h-[140px] flex flex-col justify-center relative"
                        style={{
                          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
                        }}
                      >
                        {/* Decorative quote mark */}
                        <span
                          className="absolute top-2.5 left-3 text-[44px] leading-none font-serif select-none pointer-events-none opacity-[0.10]"
                          style={{ color: gradient.accent }}
                        >
                          &ldquo;
                        </span>

                        <p
                          className={`${textStyle!.fontSize} ${textStyle!.fontWeight} text-stone-700 leading-snug ${textStyle!.lineClamp} relative z-10`}
                        >
                          {card.weavedText}
                        </p>

                        {/* Pin indicator for text cards */}
                        {card.pinned && (
                          <div className="mt-2 flex items-center gap-1">
                            <Pin size={10} className="text-amber-500 rotate-45" />
                          </div>
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
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
