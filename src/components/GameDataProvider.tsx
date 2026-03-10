"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { loadGameData, saveGameDataLocal } from "@/lib/storage";
import {
  initSyncListeners,
  fetchRemoteGameData,
  queueRemoteSync,
} from "@/lib/sync";

/**
 * GameDataProvider — handles one-time Supabase hydration on authenticated mount.
 *
 * On login:
 *   1. Initializes flush-on-unload listeners (so pending saves survive tab close)
 *   2. Fetches game data from Supabase
 *   3. If server has data → overwrites localStorage, dispatches "dreamboard-data-hydrated"
 *   4. If server is empty + localStorage has data → pushes localStorage to Supabase
 *
 * Does NOT replace per-page useState(gameData). Pages still own their own state.
 * This provider just ensures localStorage is up-to-date with the server on mount.
 */
export function GameDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const hydrated = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.googleSub) return;
    if (hydrated.current) return;
    hydrated.current = true;

    // Wire up flush-on-unload so pending saves survive page close
    initSyncListeners();

    // Hydrate from Supabase in the background
    fetchRemoteGameData().then(({ data: remoteData }) => {
      if (remoteData) {
        // Server has data — it wins. Overwrite localStorage (no re-sync loop).
        saveGameDataLocal(remoteData);
        // Notify pages to re-read from localStorage
        window.dispatchEvent(new Event("dreamboard-data-hydrated"));
      } else {
        // Server is empty. If localStorage has meaningful data, push it up.
        const localData = loadGameData();
        if (localData.activities && localData.activities.length > 0) {
          queueRemoteSync(localData);
        }
      }
    });
  }, [status, session?.user?.googleSub]);

  return <>{children}</>;
}
