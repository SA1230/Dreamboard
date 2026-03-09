"use client";

// Sound effect paths (relative to /public)
const SOUNDS = {
  levelUp: "/sounds/level-up.mp3",
  xpGain: "/sounds/xp-gain.mp3",
  habitToggle: "/sounds/habit-toggle.mp3",
  purchase: "/sounds/purchase.mp3",
} as const;

export type SoundName = keyof typeof SOUNDS;

const MUTE_KEY = "dreamboard_muted";

// --- Mute state ---

export function isMuted(): boolean {
  if (typeof window === "undefined") return true;
  // Default to muted — user must opt in via Settings
  return localStorage.getItem(MUTE_KEY) !== "false";
}

export function setMuted(muted: boolean): void {
  localStorage.setItem(MUTE_KEY, muted ? "true" : "false");
}

export function toggleMuted(): boolean {
  const next = !isMuted();
  setMuted(next);
  return next;
}

// --- Playback ---

// Cache Audio objects for instant replay
const audioCache: Partial<Record<SoundName, HTMLAudioElement>> = {};

function getAudio(name: SoundName): HTMLAudioElement {
  if (!audioCache[name]) {
    audioCache[name] = new Audio(SOUNDS[name]);
  }
  return audioCache[name];
}

export function playSound(name: SoundName, volume = 0.5): void {
  if (typeof window === "undefined" || isMuted()) return;

  try {
    const audio = getAudio(name);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser blocked autoplay — silently ignore
    });
  } catch {
    // Audio not supported — silently ignore
  }
}

// --- Vibration (mobile haptic feedback) ---

export function vibrate(pattern: number | number[] = 30): void {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// Combined: play sound + vibrate
export function playSoundWithHaptic(name: SoundName, volume = 0.5, vibrateMs: number | number[] = 30): void {
  playSound(name, volume);
  vibrate(vibrateMs);
}
