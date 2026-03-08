"use client";

import { useState } from "react";
import { VisionCard } from "@/lib/types";
import { VISION_COLORS } from "@/lib/visionColors";
import { ModalBackdrop } from "./ModalBackdrop";
import { X, Pin, Trash2 } from "lucide-react";

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
  const [showOriginal, setShowOriginal] = useState(false);
  const color = VISION_COLORS[card.colorIndex % VISION_COLORS.length];
  const hasAIVersion = card.rawText !== card.weavedText;

  return (
    <ModalBackdrop onClose={onClose} backdropStyle="medium">
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-fadeIn"
        style={{ backgroundColor: color.bg, border: `1px solid ${color.border}` }}
      >
        {/* Close */}
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-white/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main text */}
        <p className="text-base text-stone-600 leading-relaxed mb-4">
          {showOriginal ? card.rawText : card.weavedText}
        </p>

        {/* Original text toggle */}
        {hasAIVersion && (
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="text-xs text-stone-400 hover:text-stone-500 transition-colors mb-4"
          >
            {showOriginal ? "Show Oracle version" : "Show your words"}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-stone-200/50">
          <button
            onClick={() => onTogglePin(card.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              card.pinned
                ? "bg-purple-100 text-purple-600"
                : "bg-white/60 text-stone-500 hover:bg-white/80"
            }`}
          >
            <Pin size={12} className={card.pinned ? "rotate-45" : ""} />
            {card.pinned ? "Pinned" : "Pin"}
          </button>

          <div className="flex-1" />

          {showDeleteConfirm ? (
            <button
              onClick={() => onDelete(card.id)}
              className="px-3 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-semibold transition-colors hover:bg-red-200"
            >
              Confirm delete
            </button>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-white/60 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </ModalBackdrop>
  );
}
