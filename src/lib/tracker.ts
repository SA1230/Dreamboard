"use client";

/**
 * Lightweight analytics tracker — queues events and sends them in batches.
 *
 * Usage:
 *   import { track } from "@/lib/tracker";
 *   track("page_view", { page: "/vision" });
 *   track("xp_earned", { stat: "wisdom", amount: 5 });
 *
 * Events are batched and sent every 5 seconds or when the page unloads.
 * Never blocks the UI — all sends are fire-and-forget.
 */

interface QueuedEvent {
  eventType: string;
  eventData: Record<string, unknown>;
  timestamp: string;
  userId: string;
}

const BATCH_INTERVAL_MS = 5000;
const ANON_ID_KEY = "dreamboard_anon_id";

let eventQueue: QueuedEvent[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let initialized = false;

/** Get or create a persistent anonymous user ID */
function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";

  let anonId = localStorage.getItem(ANON_ID_KEY);
  if (!anonId) {
    anonId = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(ANON_ID_KEY, anonId);
  }
  return anonId;
}

/** Get the user ID — google_sub if signed in, anonymous ID otherwise */
function getUserId(): string {
  // Check if we have a cached google_sub from the session
  if (typeof window !== "undefined" && window.__dreamboardUserId) {
    return window.__dreamboardUserId;
  }
  return getAnonymousId();
}

/** Flush the current event queue to the server */
function flushQueue(): void {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  // Fire-and-forget — never await this
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventsToSend),
    // Use keepalive so the request completes even during page unload
    keepalive: true,
  }).catch(() => {
    // Silently ignore — tracking should never throw
  });
}

/** Initialize the batch timer and unload listener (once) */
function ensureInitialized(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Flush on page unload (beforeunload for desktop, visibilitychange for mobile)
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushQueue();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushQueue();
  });
}

/** Start the batch timer if not already running */
function scheduleBatch(): void {
  if (batchTimer !== null) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    flushQueue();
  }, BATCH_INTERVAL_MS);
}

/**
 * Track an event. Call this from anywhere in the client.
 *
 * @param eventType - One of the allowed event types (session_start, page_view, etc.)
 * @param eventData - Optional payload with event-specific data
 */
export function track(eventType: string, eventData: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;

  ensureInitialized();

  eventQueue.push({
    eventType,
    eventData,
    timestamp: new Date().toISOString(),
    userId: getUserId(),
  });

  scheduleBatch();
}

/**
 * Set the authenticated user ID (called when session is available).
 * This links future events to the real user instead of the anonymous ID.
 * Also fires a one-time event to link the anonymous ID to the real user.
 */
export function identifyUser(googleSub: string): void {
  if (typeof window === "undefined") return;

  const previousId = window.__dreamboardUserId;
  window.__dreamboardUserId = googleSub;

  // If the user was previously anonymous, link the two IDs
  const anonId = localStorage.getItem(ANON_ID_KEY);
  if (anonId && previousId !== googleSub) {
    track("user_identified", { anonymousId: anonId, authenticatedId: googleSub });
  }
}

// Extend Window to hold the cached user ID
declare global {
  interface Window {
    __dreamboardUserId?: string;
  }
}
