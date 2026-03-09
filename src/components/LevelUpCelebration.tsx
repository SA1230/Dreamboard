"use client";

import { useEffect, useRef, useState } from "react";
import { StatKey } from "@/lib/types";

// --- Stat-specific toast messages (3-5 per stat, rotated by level) ---

const LEVEL_UP_MESSAGES: Record<StatKey, string[]> = {
  strength: [
    "Getting stronger 💪",
    "Built different 🏋️",
    "Power level rising 🔥",
    "Iron sharpens iron ⚔️",
    "Beast mode unlocked 💥",
  ],
  wisdom: [
    "Knowledge compounds 📚",
    "Mind expanding 🧠",
    "Leveling up your brain 🎓",
    "Wisdom is earned 📖",
    "The student grows 🌱",
  ],
  vitality: [
    "Taking care of yourself ✨",
    "Health is wealth 🌿",
    "Body and mind aligned 🧘",
    "Glowing from within 💚",
    "Vitality restored 🌟",
  ],
  charisma: [
    "People person 🤝",
    "Making connections 🌐",
    "Social butterfly 🦋",
    "Charm unlocked 💬",
    "Building your tribe 👥",
  ],
  craft: [
    "Making things 🛠",
    "Creator energy ⚡",
    "Building something great 🏗",
    "Hands of an artisan 🎨",
    "Ship it 🚀",
  ],
  discipline: [
    "Building habits 🧱",
    "Consistency wins 🎯",
    "Doing the hard things 💎",
    "Discipline is freedom 🔑",
    "One brick at a time 🏛",
  ],
  spirit: [
    "Inner peace 🌿",
    "Soul level up 🕊",
    "Finding your center 🧘",
    "Stillness is strength 🌙",
    "The quiet path 🍃",
  ],
  wealth: [
    "Investing in yourself 💰",
    "Wealth mindset 📈",
    "Stacking wins 🪙",
    "Financial glow-up 💎",
    "Money moves 🏦",
  ],
};

function getToastMessage(statKey: StatKey, newLevel: number): string {
  const messages = LEVEL_UP_MESSAGES[statKey];
  const index = (newLevel - 2) % messages.length;
  return messages[Math.abs(index)];
}

// --- The Celebration Component ---

interface LevelUpCelebrationProps {
  statKey: StatKey;
  newLevel: number;
  statColor: string;
  isOverallLevelUp: boolean;
  overallNewLevel?: number;
  overallNewRank?: string;
  onComplete: () => void;
}

export function LevelUpCelebration({
  statKey,
  newLevel,
  statColor,
  isOverallLevelUp,
  overallNewLevel,
  overallNewRank,
  onComplete,
}: LevelUpCelebrationProps) {
  const [showToast, setShowToast] = useState(false);
  const [fading, setFading] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const toastMessage = getToastMessage(statKey, newLevel);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // After a brief stillness, reveal the toast
    timers.push(setTimeout(() => setShowToast(true), isOverallLevelUp ? 700 : 450));

    // Begin fade out
    timers.push(setTimeout(() => setFading(true), isOverallLevelUp ? 2200 : 1600));

    // Complete
    timers.push(setTimeout(() => onCompleteRef.current(), isOverallLevelUp ? 2500 : 1900));

    return () => timers.forEach(clearTimeout);
  }, [isOverallLevelUp]);

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
      style={{
        backgroundColor: fading ? "transparent" : `rgba(0, 0, 0, ${isOverallLevelUp ? 0.14 : 0.1})`,
        transition: "background-color 400ms ease",
      }}
    >
      {showToast && !fading && (
        <div className="animate-stillnessReveal text-center">
          {isOverallLevelUp && overallNewLevel && overallNewRank ? (
            <div
              className="px-8 py-5 rounded-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.97)",
                boxShadow: "0 8px 40px rgba(180, 150, 100, 0.2)",
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600/60 mb-1">
                Level Up
              </p>
              <p
                className="text-3xl font-black"
                style={{
                  background: "linear-gradient(180deg, #c47a20 0%, #8b5a1a 60%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                <span className="text-lg font-bold mr-1">Lv.</span>
                {overallNewLevel}
              </p>
              <p className="text-sm font-bold text-amber-600 mt-1">{overallNewRank}</p>
            </div>
          ) : (
            <div
              className="px-6 py-3 rounded-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: statColor,
                boxShadow: `0 4px 24px ${statColor}15`,
              }}
            >
              <span className="text-base font-bold mr-2">Lv. {newLevel}</span>
              <span style={{ opacity: 0.5 }}>—</span>
              <span className="ml-2 text-base font-bold">{toastMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
