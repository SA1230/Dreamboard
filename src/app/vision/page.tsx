"use client";

import { useState, useEffect, useCallback } from "react";
import { GameData, VisionCard } from "@/lib/types";
import {
  loadGameData,
  getVisionCards,
  addVisionCard,
  deleteVisionCard,
  togglePinVisionCard,
  saveBoardReading,
  getLastBoardReading,
} from "@/lib/storage";
import { MAX_VISION_CARDS } from "@/lib/visionColors";
import { VisionCardGrid } from "@/components/VisionCardGrid";
import { AddVisionModal } from "@/components/AddVisionModal";
import { VisionCardDetail } from "@/components/VisionCardDetail";
import { BoardReadingModal } from "@/components/BoardReadingModal";
import { ArrowLeft, Sparkles, Plus, Eye } from "lucide-react";
import Link from "next/link";

export default function VisionBoardPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<VisionCard | null>(null);
  const [showBoardReading, setShowBoardReading] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);

  useEffect(() => {
    setGameData(loadGameData());
  }, []);

  const showToast = useCallback((message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 1500);
  }, []);

  const handleAddCard = useCallback(
    (rawText: string, weavedText: string) => {
      const freshData = loadGameData();
      const newData = addVisionCard(freshData, rawText, weavedText);
      if (newData) {
        setGameData(newData);
        setShowAddModal(false);
        showToast("Vision added");
      } else {
        showToast("Board is full (20 max)");
      }
    },
    [showToast]
  );

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      const freshData = loadGameData();
      const newData = deleteVisionCard(freshData, cardId);
      setGameData(newData);
      setSelectedCard(null);
      showToast("Vision removed");
    },
    [showToast]
  );

  const handleTogglePin = useCallback(
    (cardId: string) => {
      const freshData = loadGameData();
      const newData = togglePinVisionCard(freshData, cardId);
      if (newData) {
        setGameData(newData);
        // Update the selected card to reflect new pin state
        const updatedCards = getVisionCards(newData);
        const updatedCard = updatedCards.find((c) => c.id === cardId);
        if (updatedCard) setSelectedCard(updatedCard);
        showToast(updatedCard?.pinned ? "Pinned" : "Unpinned");
      }
    },
    [showToast]
  );

  const handleBoardReadingSaved = useCallback(
    (readingText: string) => {
      const freshData = loadGameData();
      const newData = saveBoardReading(freshData, readingText);
      setGameData(newData);
    },
    []
  );

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  const cards = getVisionCards(gameData);
  const atLimit = cards.length >= MAX_VISION_CARDS;
  const lastReading = getLastBoardReading(gameData);

  return (
    <main className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      {/* Toast */}
      {actionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2 rounded-full bg-stone-700 text-white text-sm font-semibold shadow-lg">
            {actionToast}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-400 hover:text-stone-500"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-extrabold text-stone-700 flex items-center gap-2">
          <Sparkles size={22} className="text-purple-400" />
          Vision Board
        </h1>
        <div className="w-9" /> {/* spacer for centering */}
      </header>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="animate-fadeIn mt-16 text-center">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-purple-300" />
          </div>
          <h2 className="text-lg font-bold text-stone-600 mb-2">
            Your future starts here
          </h2>
          <p className="text-sm text-stone-400 mb-6 max-w-xs mx-auto">
            Add your dreams, goals, and vibes. The Oracle can weave them into
            something beautiful.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm transition-colors"
          >
            Add your first vision
          </button>
        </div>
      )}

      {/* Cards grid */}
      {cards.length > 0 && (
        <>
          <VisionCardGrid cards={cards} onCardTap={setSelectedCard} />

          {/* Board Reading button — show when 3+ cards */}
          {cards.length >= 3 && (
            <button
              onClick={() => setShowBoardReading(true)}
              className="w-full mt-6 py-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              What does the Oracle see?
            </button>
          )}
        </>
      )}

      {/* Floating add button */}
      {cards.length > 0 && !atLimit && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center shadow-lg transition-colors z-40"
          aria-label="Add a vision"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddVisionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCard}
          gameData={gameData}
        />
      )}

      {selectedCard && (
        <VisionCardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onDelete={handleDeleteCard}
          onTogglePin={handleTogglePin}
        />
      )}

      {showBoardReading && (
        <BoardReadingModal
          onClose={() => setShowBoardReading(false)}
          gameData={gameData}
          lastReading={lastReading}
          onReadingSaved={handleBoardReadingSaved}
        />
      )}
    </main>
  );
}
