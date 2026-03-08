"use client";

import { useState } from "react";
import { VisionCard } from "@/lib/types";
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

  return (
    <ModalBackdrop onClose={onClose} backdropStyle="medium">
      <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden animate-fadeIn shadow-xl">
        {/* Image */}
        {hasImage && (
          <div className="w-full aspect-square overflow-hidden">
            <img
              src={card.imageBase64}
              alt={card.rawText}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          {/* Text fallback for no-image cards */}
          {!hasImage && (
            <p className="text-base text-stone-600 leading-relaxed mb-3">
              {card.weavedText}
            </p>
          )}

          {/* Oracle text (when image exists and text was woven) */}
          {hasImage && hasAIVersion && (
            <p className="text-sm text-stone-500 italic leading-relaxed mb-2">
              {card.weavedText}
            </p>
          )}

          {/* Original words */}
          <p className="text-xs text-stone-400 mb-4">
            {hasAIVersion ? `"${card.rawText}"` : card.rawText}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
            <button
              onClick={() => onTogglePin(card.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                card.pinned
                  ? "bg-purple-100 text-purple-600"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              <Pin size={12} className={card.pinned ? "rotate-45" : ""} />
              {card.pinned ? "Pinned" : "Pin"}
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors"
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
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-stone-100 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
