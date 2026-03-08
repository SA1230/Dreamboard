"use client";

import { useState } from "react";
import { GameData } from "@/lib/types";
import {
  getOverallLevel,
  getTotalLifetimeXP,
  getEffectiveDefinitions,
} from "@/lib/storage";
import { getRankTitle } from "@/lib/ranks";
import { STAT_KEYS } from "@/lib/stats";
import { ModalBackdrop } from "./ModalBackdrop";
import { X, Sparkles } from "lucide-react";

interface AddVisionModalProps {
  onClose: () => void;
  onSave: (rawText: string, weavedText: string) => void;
  gameData: GameData;
}

type ModalState = "input" | "weaving" | "preview" | "error";

export function AddVisionModal({ onClose, onSave, gameData }: AddVisionModalProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<ModalState>("input");
  const [weavedText, setWeavedText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const trimmedText = text.trim();
  const canSubmit = trimmedText.length > 0 && trimmedText.length <= 280;

  const handleWeave = async () => {
    if (!canSubmit) return;
    setState("weaving");

    try {
      // Build player context for the Oracle
      const totalXP = getTotalLifetimeXP(gameData);
      const { level } = getOverallLevel(totalXP);
      const rank = getRankTitle(level);
      const definitions = getEffectiveDefinitions(gameData);
      const topStats = STAT_KEYS
        .map((key) => ({ name: definitions[key].name, level: gameData.stats[key].level }))
        .sort((a, b) => b.level - a.level)
        .slice(0, 3);

      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weave",
          rawText: trimmedText,
          playerContext: { overallLevel: level, rank, topStats },
        }),
      });

      if (!response.ok) {
        throw new Error("The Oracle is resting. Try again later.");
      }

      const result = await response.json();
      setWeavedText(result.weavedText);
      setState("preview");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setState("error");
    }
  };

  return (
    <ModalBackdrop onClose={onClose} align="bottom" backdropStyle="medium">
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 animate-modalSlideUp">
        {/* Close button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-700">
            {state === "preview" ? "The Oracle says..." : "New Vision"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input state */}
        {(state === "input" || state === "error") && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you dreaming about?"
              className="w-full h-28 p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 resize-none focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
              maxLength={280}
              autoFocus
            />
            <div className="flex items-center justify-between mt-1 mb-4">
              <span className="text-xs text-stone-400">
                {trimmedText.length}/280
              </span>
              {state === "error" && (
                <span className="text-xs text-red-500">{errorMessage}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => canSubmit && onSave(trimmedText, trimmedText)}
                disabled={!canSubmit}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Just add it
              </button>
              <button
                onClick={handleWeave}
                disabled={!canSubmit}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                Let the Oracle weave it
              </button>
            </div>
          </>
        )}

        {/* Weaving state (loading) */}
        {state === "weaving" && (
          <div className="py-12 flex flex-col items-center gap-3">
            <Sparkles size={28} className="text-purple-400 animate-oracleShimmer" />
            <p className="text-sm text-stone-400">The Oracle is weaving...</p>
          </div>
        )}

        {/* Preview state (before/after) */}
        {state === "preview" && (
          <>
            {/* Original text (dimmed) */}
            <div className="mb-3">
              <p className="text-xs text-stone-400 mb-1">Your words:</p>
              <p className="text-xs text-stone-400 italic">{trimmedText}</p>
            </div>

            {/* Weaved text */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 mb-5">
              <p className="text-sm text-stone-600 leading-relaxed">
                {weavedText}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSave(trimmedText, trimmedText)}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-50"
              >
                Keep mine
              </button>
              <button
                onClick={() => onSave(trimmedText, weavedText)}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors"
              >
                Use this
              </button>
            </div>
          </>
        )}
      </div>
    </ModalBackdrop>
  );
}
