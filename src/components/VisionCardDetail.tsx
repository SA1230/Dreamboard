"use client";

import { useState } from "react";
import { VisionCard } from "@/lib/types";
import { getCardGradient } from "@/lib/visionColors";
import { ModalBackdrop } from "./ModalBackdrop";
import { Pin, Trash2 } from "lucide-react";

interface VisionCardDetailProps {
  card: VisionCard;
  onClose: () => void;
  onDelete: (cardId: string) => void;
  onTogglePin: (cardId: string) => void;
}

export function VisionCardDetail({
  card,
  onClose,
  onDelete,
  onTogglePin,
}: VisionCardDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasImage = !!card.imageBase64;
  const hasAIVersion = card.rawText !== card.weavedText;
  const gradient = getCardGradient(card.id);

  return (
    <ModalBackdrop onClose={onClose} backdropStyle="medium" ariaLabel="Vision card details">
      <div
        className={`w-full max-w-sm rounded-2xl overflow-hidden animate-fadeIn shadow-xl ${hasImage ? "bg-white" : ""}`}
        style={
          !hasImage
            ? { background: `linear-gradient(160deg, ${gradient.from} 0%, ${gradient.to} 100%)` }
            : undefined
        }
      >
        {/* Image (image cards only) */}
        {hasImage && (
          <div className="w-full overflow-hidden">
            <img
              src={card.imageBase64}
              alt={card.rawText}
              className="w-full object-cover max-h-[60vh]"
            />
          </div>
        )}

        {/* Content: text cards — centered with quote decoration on gradient */}
        {!hasImage && (
          <div className="px-6 pt-8 pb-6 min-h-[200px] flex flex-col justify-center relative">
            <span
              className="absolute top-4 left-5 text-[56px] leading-none font-serif select-none pointer-events-none opacity-[0.10]"
              style={{ color: gradient.accent }}
            >
              &ldquo;
            </span>
            <p className="text-lg text-stone-700 leading-relaxed relative z-10">
              {card.weavedText}
            </p>
            {hasAIVersion && (
              <p className="text-xs text-stone-400/70 mt-3 italic relative z-10">
                &ldquo;{card.rawText}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Content: image cards — weaved + original text */}
        {hasImage && (
          <div className="p-5">
            {hasAIVersion && (
              <p className="text-sm text-stone-500 italic leading-relaxed mb-2">
                {card.weavedText}
              </p>
            )}
            <p className="text-xs text-stone-400">
              {hasAIVersion ? `"${card.rawText}"` : card.rawText}
            </p>
          </div>
        )}

        {/* Action bar — glassmorphism on gradient cards, plain border on image cards */}
        <div
          className={`flex items-center gap-2 px-5 py-3 ${
            !hasImage
              ? "vision-glass border-t border-white/30"
              : "border-t border-stone-100"
          }`}
        >
          <button
            onClick={() => onTogglePin(card.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              card.pinned
                ? "bg-purple-100 text-purple-600"
                : hasImage
                  ? "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  : "bg-white/40 text-stone-600 hover:bg-white/60"
            }`}
          >
            <Pin size={12} className={card.pinned ? "rotate-45" : ""} />
            {card.pinned ? "Pinned" : "Pin"}
          </button>

          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
              hasImage
                ? "text-stone-500 hover:bg-stone-100"
                : "text-stone-500 hover:bg-white/30"
            }`}
          >
            Close
          </button>

          {showDeleteConfirm ? (
            <button
              onClick={() => onDelete(card.id)}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-semibold transition-colors hover:bg-red-200"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                hasImage
                  ? "text-stone-400 hover:text-red-500 hover:bg-stone-100"
                  : "text-stone-400 hover:text-red-500 hover:bg-white/30"
              }`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
