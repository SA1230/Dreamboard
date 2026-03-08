"use client";

import { useState } from "react";
import { GameData, BoardReading } from "@/lib/types";
import {
  getVisionCards,
  getOverallLevel,
  getTotalLifetimeXP,
  getEffectiveDefinitions,
} from "@/lib/storage";
import { getRankTitle } from "@/lib/ranks";
import { STAT_KEYS } from "@/lib/stats";
import { ModalBackdrop } from "./ModalBackdrop";
import { OracleCharacter } from "./OracleCharacter";
import { X, Sparkles } from "lucide-react";

interface BoardReadingModalProps {
  onClose: () => void;
  gameData: GameData;
  lastReading: BoardReading | null;
  onReadingSaved: (readingText: string) => void;
}

type ReadingState = "idle" | "loading" | "done" | "error";

export function BoardReadingModal({
  onClose,
  gameData,
  lastReading,
  onReadingSaved,
}: BoardReadingModalProps) {
  const [state, setState] = useState<ReadingState>(lastReading ? "done" : "idle");
  const [readingText, setReadingText] = useState(lastReading?.text ?? "");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestReading = async () => {
    setState("loading");

    try {
      const cards = getVisionCards(gameData);
      const totalXP = getTotalLifetimeXP(gameData);
      const { level } = getOverallLevel(totalXP);
      const rank = getRankTitle(level);
      const definitions = getEffectiveDefinitions(gameData);
      const topStats = STAT_KEYS
        .map((key) => ({ name: definitions[key].name, level: gameData.stats[key].level }))
        .sort((a, b) => b.level - a.level)
        .slice(0, 3);

      const recentActivities = gameData.activities
        .slice(0, 5)
        .map((a) => {
          const def = definitions[a.stat];
          return `${def.name}: ${a.note}`;
        });

      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "read",
          cards: cards.map((c) => ({ rawText: c.rawText, weavedText: c.weavedText })),
          playerContext: {
            overallLevel: level,
            rank,
            topStats,
            recentActivities,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("The Oracle is resting. Try again later.");
      }

      const result = await response.json();
      setReadingText(result.reading);
      onReadingSaved(result.reading);
      setState("done");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setState("error");
    }
  };

  return (
    <ModalBackdrop onClose={onClose} backdropStyle="medium" ariaLabel="Board reading">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-700 flex items-center gap-2">
            <OracleCharacter size={24} />
            The Oracle
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Idle — prompt to request reading */}
        {state === "idle" && (
          <div className="text-center py-6">
            <div className="animate-oracleFloat w-fit mx-auto mb-4">
              <OracleCharacter size={72} />
            </div>
            <p className="text-sm text-stone-500 mb-5 leading-relaxed">
              Your dreams speak to each other when you&apos;re not looking. Let the Oracle listen.
            </p>
            <button
              onClick={handleRequestReading}
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles size={14} />
              Read my board
            </button>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="animate-oracleFloat w-fit mx-auto">
              <OracleCharacter size={64} thinking />
            </div>
            <p className="text-sm text-stone-500 font-medium">The Oracle is reading your dreams...</p>
          </div>
        )}

        {/* Done — show reading */}
        {state === "done" && (
          <>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 mb-4">
              <p className="text-sm text-stone-600 leading-relaxed italic">
                {readingText}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRequestReading}
                className="flex-1 py-3 rounded-xl border border-purple-200 text-purple-600 text-sm font-semibold transition-colors hover:bg-purple-50 flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} />
                Read again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-200"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="text-center py-6">
            <p className="text-sm text-red-500 mb-4">{errorMessage}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </ModalBackdrop>
  );
}
