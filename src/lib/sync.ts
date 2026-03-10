"use client";

/**
 * Debounced remote sync engine — persists GameData to Supabase.
 *
 * Write-through cache pattern:
 *   saveGameData() writes to localStorage immediately (synchronous),
 *   then calls queueRemoteSync() which debounces and PUTs to /api/game-data.
 *
 * Never blocks the UI — all remote writes are fire-and-forget.
 * Mirrors the tracker.ts module-level singleton pattern.
 */

import type { GameData } from "./types";

const DEBOUNCE_MS = 2000;

let pendingData: GameData | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSyncing = false;
let listenersInitialized = false;

/**
 * Queue a debounced save to Supabase.
 * Called by saveGameData() after every localStorage write.
 * Skips sync if user is not authenticated (no window.__dreamboardUserId).
 */
export function queueRemoteSync(data: GameData): void {
  if (typeof window === "undefined") return;
  if (typeof fetch === "undefined") return;

  // Only sync for authenticated users
  if (!window.__dreamboardUserId) return;

  pendingData = data;

  // Reset debounce timer — only the last mutation in a burst triggers a PUT
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    flushToRemote();
  }, DEBOUNCE_MS);
}

/** Send the latest pending data to /api/game-data */
async function flushToRemote(): Promise<void> {
  if (!pendingData) return;
  if (isSyncing) return; // Another flush is in progress — the next queueRemoteSync will catch it

  isSyncing = true;
  const dataToSend = pendingData;
  pendingData = null;

  try {
    await fetch("/api/game-data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataToSend }),
      keepalive: true,
    });
  } catch {
    // Silently ignore — sync should never break the app.
    // Data is safe in localStorage. Next mutation will retry.
  }

  isSyncing = false;

  // If new data accumulated while we were syncing, flush again
  if (pendingData) {
    flushToRemote();
  }
}

/**
 * Initialize unload listeners to flush pending data before the page closes.
 * Same pattern as tracker.ts — visibilitychange for mobile, beforeunload for desktop.
 * Call once on app mount.
 */
export function initSyncListeners(): void {
  if (listenersInitialized || typeof window === "undefined") return;
  listenersInitialized = true;

  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // Cancel debounce and flush immediately
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      flushToRemote();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    flushToRemote();
  });
}

/**
 * Fetch the user's game data from Supabase.
 * Returns { data, updatedAt } if server has data, { data: null, updatedAt: null } otherwise.
 */
export async function fetchRemoteGameData(): Promise<{
  data: GameData | null;
  updatedAt: string | null;
}> {
  try {
    const response = await fetch("/api/game-data");
    if (!response.ok) {
      return { data: null, updatedAt: null };
    }
    const result = await response.json();
    return {
      data: result.data ?? null,
      updatedAt: result.updatedAt ?? null,
    };
  } catch {
    // Network error — fall back to localStorage
    return { data: null, updatedAt: null };
  }
}
