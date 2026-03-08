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
import { OracleCharacter } from "@/components/OracleCharacter";
import { ArrowLeft, Sparkles, Plus } from "lucide-react";
import Link from "next/link";

// Ambient bokeh orbs — soft glowing spheres drifting gently upward
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const colors = [
      "rgba(168, 130, 255, 0.12)",  // soft purple
      "rgba(130, 180, 255, 0.10)",  // soft blue
      "rgba(255, 180, 200, 0.10)",  // soft pink
      "rgba(255, 210, 130, 0.08)",  // warm gold
      "rgba(180, 220, 255, 0.08)",  // ice blue
    ];
    return {
      left: `${(i * 23 + 5) % 95}%`,
      size: 6 + (i % 4) * 4,
      delay: i * 1.8,
      duration: 12 + (i % 5) * 3,
      color: colors[i % colors.length],
      peakOpacity: 0.3 + (i % 3) * 0.1,
    };
  });

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute vision-particle"
          style={{
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            "--particle-peak": particle.peakOpacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// Ambient background glow orbs — large static blurred shapes for depth
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute w-[300px] h-[300px] rounded-full top-[-50px] left-[-80px] opacity-30"
        style={{ background: "radial-gradient(circle, rgba(120, 80, 200, 0.4) 0%, transparent 70%)" }} />
      <div className="absolute w-[250px] h-[250px] rounded-full top-[30%] right-[-60px] opacity-20"
        style={{ background: "radial-gradient(circle, rgba(80, 140, 220, 0.4) 0%, transparent 70%)" }} />
      <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[20%] opacity-15"
        style={{ background: "radial-gradient(circle, rgba(200, 120, 180, 0.3) 0%, transparent 70%)" }} />
      <div className="absolute w-[200px] h-[200px] rounded-full top-[60%] right-[10%] opacity-20"
        style={{ background: "radial-gradient(circle, rgba(100, 180, 240, 0.3) 0%, transparent 70%)" }} />
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
        showToast("Dream held");
        track("vision_added", { hasImage: !!imageBase64, oracleUsed: rawText !== weavedText });
      } else {
        showToast("Your board holds 20 dreams \u2014 release one to make room");
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
      showToast("Released");
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
        showToast(updatedCard?.pinned ? "Anchored" : "Freed");
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
    <main className="vision-corkboard pb-6">
      <BackgroundOrbs />
      <FloatingParticles />
      <div className="max-w-3xl mx-auto relative z-10">
      {/* Toast */}
      {actionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-sm font-semibold shadow-lg border border-white/10">
            {actionToast}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-5 pb-4">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors text-white/50 hover:text-white/70 border border-white/5"
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-extrabold text-white/90 flex items-center gap-2">
          <Sparkles size={22} className="text-purple-300" />
          Vision Board
        </h1>
        <div className="w-9" />
      </header>

      {/* Empty state — atmospheric, evocative */}
      {cards.length === 0 && (
        <div className="animate-fadeIn mt-12 text-center px-4">
          <div className="animate-oracleFloat w-fit mx-auto mb-5">
            <OracleCharacter size={100} />
          </div>
          <h2 className="text-xl font-bold text-white/85 mb-2">
            This board is waiting for your dreams
          </h2>
          <p className="text-sm text-white/50 mb-8 max-w-xs mx-auto leading-relaxed">
            Describe a wish, a goal, or a vibe — the Oracle will help you see it clearly.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-7 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-500/30"
          >
            Begin dreaming
          </button>
        </div>
      )}

      {/* Cards grid — floating board */}
      {cards.length > 0 && (
        <div className="px-4 pt-1">
          <div className="vision-board-frame p-4">
            <VisionCardGrid cards={cards} onCardTap={setSelectedCard} />
          </div>

          {/* Oracle + Board Reading — show when 3+ cards */}
          {cards.length >= 3 && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="animate-oracleFloat">
                <OracleCharacter size={80} />
              </div>
              <button
                onClick={() => setShowBoardReading(true)}
                className="w-full py-3.5 rounded-2xl bg-white/8 hover:bg-white/12 border border-white/10 text-purple-300 text-sm font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Sparkles size={14} />
                What does the Oracle see?
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating add button */}
      {cards.length > 0 && !atLimit && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-500 hover:bg-purple-400 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-colors z-40"
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
