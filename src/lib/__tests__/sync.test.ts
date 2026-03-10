import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GameData } from "../types";

// Mock window for Node environment (project uses environment: "node")
const windowMock: Record<string, unknown> = {
  __dreamboardUserId: undefined,
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};
Object.defineProperty(globalThis, "window", {
  value: windowMock,
  writable: true,
  configurable: true,
});

// Mock document.visibilityState for initSyncListeners
Object.defineProperty(globalThis, "document", {
  value: { visibilityState: "visible" },
  writable: true,
  configurable: true,
});

// Minimal GameData for testing
function createTestGameData(overrides: Partial<GameData> = {}): GameData {
  return {
    stats: {
      strength: { xp: 10, level: 1 },
      wisdom: { xp: 0, level: 1 },
      vitality: { xp: 0, level: 1 },
      charisma: { xp: 0, level: 1 },
      craft: { xp: 0, level: 1 },
      discipline: { xp: 0, level: 1 },
      spirit: { xp: 0, level: 1 },
      wealth: { xp: 0, level: 1 },
    },
    activities: [],
    ...overrides,
  } as GameData;
}

describe("sync engine", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock authenticated user
    windowMock.__dreamboardUserId = "test-google-sub";

    // Mock fetch
    fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", fetchSpy);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.clearAllTimers();
    // Reset window mock state
    windowMock.__dreamboardUserId = undefined;
    (windowMock.addEventListener as ReturnType<typeof vi.fn>).mockClear();
  });

  describe("queueRemoteSync", () => {
    it("debounces — rapid calls result in one fetch after 2s", async () => {
      // Dynamic import to get fresh module state
      const { queueRemoteSync } = await import("../sync");

      const data1 = createTestGameData({ activities: [] });
      const data2 = createTestGameData({
        activities: [{ id: "1", stat: "strength", note: "test", timestamp: "2026-01-01", amount: 1 }],
      } as Partial<GameData>);
      const data3 = createTestGameData({
        activities: [
          { id: "1", stat: "strength", note: "test", timestamp: "2026-01-01", amount: 1 },
          { id: "2", stat: "wisdom", note: "test2", timestamp: "2026-01-01", amount: 1 },
        ],
      } as Partial<GameData>);

      queueRemoteSync(data1);
      queueRemoteSync(data2);
      queueRemoteSync(data3);

      // No fetch yet — still debouncing
      expect(fetchSpy).not.toHaveBeenCalled();

      // Advance past debounce window
      await vi.advanceTimersByTimeAsync(2100);

      // Only one fetch with the LATEST data
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.data.activities).toHaveLength(2);
    });

    it("skips sync when user is not authenticated", async () => {
      const { queueRemoteSync } = await import("../sync");
      windowMock.__dreamboardUserId = undefined;

      queueRemoteSync(createTestGameData());
      await vi.advanceTimersByTimeAsync(2100);

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("sends PUT to /api/game-data with keepalive", async () => {
      const { queueRemoteSync } = await import("../sync");

      queueRemoteSync(createTestGameData());
      await vi.advanceTimersByTimeAsync(2100);

      expect(fetchSpy).toHaveBeenCalledWith("/api/game-data", expect.objectContaining({
        method: "PUT",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      }));
    });

    it("handles fetch errors gracefully — no throw", async () => {
      const { queueRemoteSync } = await import("../sync");
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));

      queueRemoteSync(createTestGameData());

      // Should not throw
      await expect(vi.advanceTimersByTimeAsync(2100)).resolves.not.toThrow();
    });

    it("handles server 500 gracefully — no throw", async () => {
      const { queueRemoteSync } = await import("../sync");
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal Server Error" }),
      });

      queueRemoteSync(createTestGameData());

      await expect(vi.advanceTimersByTimeAsync(2100)).resolves.not.toThrow();
    });
  });

  describe("fetchRemoteGameData", () => {
    it("returns parsed data when server has game data", async () => {
      const { fetchRemoteGameData } = await import("../sync");
      const serverData = createTestGameData({
        activities: [{ id: "1", stat: "strength", note: "test", timestamp: "2026-01-01", amount: 1 }],
      } as Partial<GameData>);

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: serverData, updatedAt: "2026-01-01T00:00:00Z" }),
      });

      const result = await fetchRemoteGameData();
      expect(result.data).toBeTruthy();
      expect(result.updatedAt).toBe("2026-01-01T00:00:00Z");
    });

    it("returns null when server has no data", async () => {
      const { fetchRemoteGameData } = await import("../sync");
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null, updatedAt: null }),
      });

      const result = await fetchRemoteGameData();
      expect(result.data).toBeNull();
      expect(result.updatedAt).toBeNull();
    });

    it("returns null on network error", async () => {
      const { fetchRemoteGameData } = await import("../sync");
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));

      const result = await fetchRemoteGameData();
      expect(result.data).toBeNull();
      expect(result.updatedAt).toBeNull();
    });

    it("returns null on server error response", async () => {
      const { fetchRemoteGameData } = await import("../sync");
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchRemoteGameData();
      expect(result.data).toBeNull();
    });
  });

  describe("initSyncListeners", () => {
    it("adds visibilitychange and beforeunload listeners", async () => {
      // Need fresh module to reset listenersInitialized flag
      vi.resetModules();

      // Re-stub fetch after module reset
      vi.stubGlobal("fetch", fetchSpy);

      const { initSyncListeners } = await import("../sync");
      const addEventSpy = windowMock.addEventListener as ReturnType<typeof vi.fn>;

      initSyncListeners();

      const eventTypes = addEventSpy.mock.calls.map((call) => call[0]);
      expect(eventTypes).toContain("visibilitychange");
      expect(eventTypes).toContain("beforeunload");
    });
  });
});
