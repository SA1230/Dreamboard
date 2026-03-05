"use client";

import { useEffect, useRef, useCallback, useState } from "react";
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
  // Rotate through messages based on level so they don't repeat
  const index = (newLevel - 2) % messages.length; // -2 because first level-up is to level 2
  return messages[Math.abs(index)];
}

// --- Confetti color palettes per stat ---

const CONFETTI_COLORS: Record<StatKey, string[]> = {
  strength: ["#C45C3E", "#E07A5F", "#FF9B7B", "#D4533A", "#F4A28C"],
  wisdom: ["#5B7AA5", "#7BA0C9", "#9BBDE0", "#4A6A95", "#A8C8E8"],
  vitality: ["#6A8E5B", "#8AB878", "#A8D898", "#5A7E4B", "#B8E8A8"],
  charisma: ["#C9943E", "#E5B85C", "#F0D080", "#B88430", "#FFD890"],
  craft: ["#8B6B4A", "#B08E6A", "#C8A888", "#7B5B3A", "#D8C0A8"],
  discipline: ["#6B7B8D", "#8DA0B3", "#A8B8C8", "#5B6B7D", "#B8C8D8"],
  spirit: ["#8B6BA5", "#A98DC4", "#C0A8D8", "#7B5B95", "#D0B8E8"],
  wealth: ["#B8963E", "#D4B05C", "#E8C878", "#A88630", "#F0D888"],
};

// --- Confetti particle types ---

interface ConfettiPiece {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: "rect" | "circle" | "star";
  opacity: number;
  gravity: number;
  drag: number;
  wobbleAmplitude: number;
  wobbleSpeed: number;
  wobbleOffset: number;
}

function createConfettiPiece(
  canvasWidth: number,
  canvasHeight: number,
  colors: string[],
  isBigBurst: boolean
): ConfettiPiece {
  // Launch from center-bottom area with upward velocity
  const centerX = canvasWidth / 2;
  const spread = canvasWidth * 0.3;
  const angle = (Math.random() * Math.PI * 0.8) + Math.PI * 0.1; // mostly upward
  const speed = isBigBurst
    ? 8 + Math.random() * 10
    : 6 + Math.random() * 8;

  // 15% chance of star shape
  const shapeRoll = Math.random();
  const shape: "rect" | "circle" | "star" = shapeRoll < 0.15 ? "star" : shapeRoll < 0.45 ? "circle" : "rect";

  return {
    x: centerX + (Math.random() - 0.5) * spread,
    y: canvasHeight * 0.6,
    velocityX: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    velocityY: -Math.sin(angle) * speed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.15,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: isBigBurst ? 8 + Math.random() * 6 : 6 + Math.random() * 5,
    shape,
    opacity: 1,
    gravity: 0.12 + Math.random() * 0.04,
    drag: 0.98 + Math.random() * 0.015,
    wobbleAmplitude: 1 + Math.random() * 2,
    wobbleSpeed: 0.03 + Math.random() * 0.04,
    wobbleOffset: Math.random() * Math.PI * 2,
  };
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  color: string,
  opacity: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 4;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [showToast, setShowToast] = useState(false);
  const [showOverallBanner, setShowOverallBanner] = useState(false);
  const [showVignette, setShowVignette] = useState(false);

  // Store onComplete in a ref so the main effect doesn't re-run when the parent re-renders
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const toastMessage = getToastMessage(statKey, newLevel);
  const colors = CONFETTI_COLORS[statKey];

  const spawnConfetti = useCallback((count: number, isBigBurst: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < count; i++) {
      piecesRef.current.push(
        createConfettiPiece(canvas.width, canvas.height, colors, isBigBurst)
      );
    }
  }, [colors]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activePieces = 0;
    const time = Date.now() * 0.001;

    for (const piece of piecesRef.current) {
      if (piece.opacity <= 0.01) continue;
      activePieces++;

      // Physics update
      piece.velocityY += piece.gravity;
      piece.velocityX *= piece.drag;
      piece.velocityY *= piece.drag;

      // Wobble (sideways drift)
      piece.x += piece.velocityX + Math.sin(time * piece.wobbleSpeed + piece.wobbleOffset) * piece.wobbleAmplitude;
      piece.y += piece.velocityY;
      piece.rotation += piece.rotationSpeed;

      // Fade out once past 70% of canvas height
      if (piece.y > canvas.height * 0.7) {
        piece.opacity -= 0.02;
      }
      // Also fade if off-screen
      if (piece.y > canvas.height || piece.x < -20 || piece.x > canvas.width + 20) {
        piece.opacity = 0;
        continue;
      }

      // Draw
      if (piece.shape === "star") {
        drawStar(ctx, piece.x, piece.y, piece.size, piece.rotation, piece.color, piece.opacity);
      } else if (piece.shape === "circle") {
        ctx.save();
        ctx.globalAlpha = piece.opacity;
        ctx.fillStyle = piece.color;
        ctx.beginPath();
        ctx.arc(piece.x, piece.y, piece.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // Rectangle with rotation
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation);
        ctx.globalAlpha = piece.opacity;
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size * 0.3, piece.size, piece.size * 0.6);
        ctx.restore();
      }
    }

    if (activePieces > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // Orchestrate the celebration timeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Beat 3 (~500ms in): Category confetti fires
    const confettiTimer = setTimeout(() => {
      spawnConfetti(24, false);
      animationFrameRef.current = requestAnimationFrame(animate);
    }, 500);

    // Toast appears after Beat 3 (~800ms in)
    const toastTimer = setTimeout(() => {
      setShowToast(true);
    }, 800);

    // Beat 4: Overall level-up (if applicable, ~1400ms in)
    let overallTimer: ReturnType<typeof setTimeout> | undefined;
    let bigConfettiTimer: ReturnType<typeof setTimeout> | undefined;
    let vignetteTimer: ReturnType<typeof setTimeout> | undefined;

    if (isOverallLevelUp) {
      overallTimer = setTimeout(() => {
        setShowOverallBanner(true);
      }, 1400);

      bigConfettiTimer = setTimeout(() => {
        spawnConfetti(40, true);
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      }, 1600);

      vignetteTimer = setTimeout(() => {
        setShowVignette(true);
      }, 1500);
    }

    // Auto-cleanup the whole celebration
    const cleanupTimer = setTimeout(() => {
      onCompleteRef.current();
    }, isOverallLevelUp ? 4000 : 3200);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(confettiTimer);
      clearTimeout(toastTimer);
      clearTimeout(cleanupTimer);
      if (overallTimer) clearTimeout(overallTimer);
      if (bigConfettiTimer) clearTimeout(bigConfettiTimer);
      if (vignetteTimer) clearTimeout(vignetteTimer);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [spawnConfetti, animate, isOverallLevelUp]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Vignette flash for overall level-up */}
      {showVignette && (
        <div
          className="absolute inset-0 animate-vignette"
          style={{
            background: `radial-gradient(ellipse at center, transparent 50%, ${statColor}15 100%)`,
          }}
        />
      )}

      {/* Stat toast message */}
      {showToast && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center">
          <div
            className="animate-toastIn px-6 py-3 rounded-2xl text-base font-bold shadow-lg"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              color: statColor,
              boxShadow: `0 4px 24px ${statColor}20`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="mr-2">Lv. {newLevel}</span>
            <span style={{ opacity: 0.7 }}>—</span>
            <span className="ml-2">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Overall level-up banner */}
      {showOverallBanner && overallNewLevel && overallNewRank && (
        <div className="absolute inset-x-0 top-[45%] flex justify-center">
          <div
            className="animate-toastIn px-8 py-4 rounded-2xl shadow-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.97)",
              boxShadow: "0 8px 40px rgba(180, 150, 100, 0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600/70 mb-1">
                Dreamboard Level Up!
              </p>
              <p className="text-2xl font-black" style={{
                background: "linear-gradient(180deg, #c47a20 0%, #8b5a1a 60%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                <span className="text-lg font-bold mr-1">Lv.</span>{overallNewLevel}
              </p>
              <p className="animate-titleReveal text-sm font-bold text-amber-600 mt-1">
                {overallNewRank}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
