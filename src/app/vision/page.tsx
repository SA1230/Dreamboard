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
import { track } from "@/lib/tracker";
import { VisionCardGrid } from "@/components/VisionCardGrid";
import { AddVisionModal } from "@/components/AddVisionModal";
import { VisionCardDetail } from "@/components/VisionCardDetail";
import { BoardReadingModal } from "@/components/BoardReadingModal";
import { ArrowLeft, Sparkles, Plus, Eye } from "lucide-react";
import Link from "next/link";

// Floating luminous particles — warm motes of light drifting upward across the corkboard
function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    left: `${(i * 19 + 7) % 100}%`,
    size: 2 + (i % 3),
    delay: i * 1.2,
    duration: 8 + (i % 5) * 2,
    // Mix of white, purple, and golden motes
    color:
      i % 4 === 0
        ? "rgba(168, 85, 247, 0.15)"
        : i % 4 === 1
          ? "rgba(250, 200, 60, 0.12)"
          : "rgba(255, 255, 255, 0.2)",
  }));

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full vision-particle"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

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
    (rawText: string, weavedText: string, imageBase64?: string) => {
      const freshData = loadGameData();
      const newData = addVisionCard(freshData, rawText, weavedText, imageBase64);
      if (newData) {
        setGameData(newData);
        setShowAddModal(false);
        showToast("Vision pinned");
        track("vision_added", { hasImage: !!imageBase64, oracleUsed: rawText !== weavedText });
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
    <main className="vision-corkboard pb-24">
      <FloatingParticles />
      <div className="max-w-lg mx-auto relative z-10">
      {/* Toast */}
      {actionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2 rounded-full bg-stone-700 text-white text-sm font-semibold shadow-lg">
            {actionToast}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 hover:bg-white/90 transition-colors text-stone-400 hover:text-stone-500 shadow-sm"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-extrabold text-stone-700 flex items-center gap-2">
          <Sparkles size={22} className="text-purple-400" />
          Vision Board
        </h1>
        <div className="w-9" />
      </header>

      {/* Empty state — atmospheric, evocative */}
      {cards.length === 0 && (
        <div className="animate-fadeIn mt-16 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-white/60 flex items-center justify-center mx-auto mb-5 vision-empty-glow">
            <Sparkles size={32} className="text-purple-300" />
          </div>
          <h2 className="text-xl font-bold text-stone-600 mb-2">
            This board is waiting for your dreams
          </h2>
          <p className="text-sm text-stone-400 mb-8 max-w-xs mx-auto leading-relaxed">
            Describe a wish, a goal, or a vibe. The Oracle can turn your words into vivid images.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-7 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-500/20"
          >
            Begin dreaming
          </button>
        </div>
      )}

      {/* Cards grid */}
      {cards.length > 0 && (
        <div className="px-4 pt-2">
          <VisionCardGrid cards={cards} onCardTap={setSelectedCard} />

          {/* Board Reading button — show when 3+ cards */}
          {cards.length >= 3 && (
            <button
              onClick={() => setShowBoardReading(true)}
              className="w-full mt-4 py-3 rounded-xl border border-purple-200 bg-white/70 hover:bg-white/90 text-purple-600 text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Eye size={16} />
              What does the Oracle see?
            </button>
          )}
        </div>
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

      </div>

      {/* Modals */}
      {showAddModal && (
        <AddVisionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCard}
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
