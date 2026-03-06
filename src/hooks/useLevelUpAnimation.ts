import { useState, useEffect, useRef } from "react";
import { getRankTitle } from "@/lib/ranks";

export type AnimPhase = "idle" | "anticipation" | "ring-fill" | "shatter" | "number-swap" | "done";

export interface ShatterFragment {
  id: number;
  startAngle: number;
  endAngle: number;
  flyAngle: number;
  delay: number;
}

// Orchestrates the phased level-up animation sequence:
// idle → anticipation → ring-fill → shatter → number-swap → done → idle
// Returns animation state that the component uses for rendering
export function useLevelUpAnimation({
  level,
  isLevelingUp,
  previousOverallLevel,
  onShake,
}: {
  level: number;
  isLevelingUp?: boolean;
  previousOverallLevel?: number;
  onShake?: () => void;
}) {
  // Stabilize onShake callback so it doesn't re-trigger the animation effect
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [displayedLevel, setDisplayedLevel] = useState(level);
  const [displayedRank, setDisplayedRank] = useState(getRankTitle(level));
  const [rankChanging, setRankChanging] = useState(false);
  const [shatterFragments, setShatterFragments] = useState<ShatterFragment[]>([]);

  // Orchestrate the overall level-up animation
  // isLevelingUp is set immediately; this effect adds a 1400ms internal delay to align with Beat 4
  useEffect(() => {
    if (!isLevelingUp || !previousOverallLevel) {
      return;
    }

    // Show old level initially
    setDisplayedLevel(previousOverallLevel);
    setDisplayedRank(getRankTitle(previousOverallLevel));

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 0: Anticipation — ring glows, mascot bounces (600ms before ring fills)
    timers.push(setTimeout(() => {
      setAnimPhase("anticipation");
    }, 800));

    // Wait 1400ms (Beat 4 timing) before starting the ring animation
    timers.push(setTimeout(() => {
      // Phase 1: Ring fills to 100%
      setAnimPhase("ring-fill");

      // Phase 2: Shatter — ring breaks into arc fragments (~500ms after ring starts filling)
      timers.push(setTimeout(() => {
        // Generate 8 arc fragments evenly around the ring
        const fragmentCount = 8;
        const fragments = Array.from({ length: fragmentCount }, (_, index) => {
          const segmentAngle = (Math.PI * 2) / fragmentCount;
          const startAngle = index * segmentAngle - Math.PI / 2; // start from top
          const endAngle = startAngle + segmentAngle;
          const flyAngle = startAngle + segmentAngle / 2; // fly outward from midpoint
          return {
            id: index,
            startAngle,
            endAngle,
            flyAngle,
            delay: index * 25, // slight stagger for each fragment
          };
        });
        setShatterFragments(fragments);
        setAnimPhase("shatter");
        // Trigger page-wide screen shake at the moment of shatter
        onShakeRef.current?.();
      }, 500));

      // Phase 3: Swap the number with bounce (~400ms after shatter starts, fragments are flying)
      timers.push(setTimeout(() => {
        setAnimPhase("number-swap");
        setDisplayedLevel(level);

        // Check if rank title changed
        const oldRank = getRankTitle(previousOverallLevel);
        const newRank = getRankTitle(level);
        if (oldRank !== newRank) {
          setRankChanging(true);
          timers.push(setTimeout(() => {
            setDisplayedRank(newRank);
            timers.push(setTimeout(() => setRankChanging(false), 500));
          }, 150));
        }
      }, 900));

      // Phase 4: Done — settle back to normal
      timers.push(setTimeout(() => {
        setAnimPhase("done");
        setShatterFragments([]);
      }, 1600));

      // Full cleanup
      timers.push(setTimeout(() => {
        setAnimPhase("idle");
        setRankChanging(false);
      }, 2400));
    }, 1400));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isLevelingUp, previousOverallLevel, level]);

  // Keep displayed values in sync when not animating
  useEffect(() => {
    if (!isLevelingUp) {
      setDisplayedLevel(level);
      setDisplayedRank(getRankTitle(level));
    }
  }, [level, isLevelingUp]);

  return { animPhase, displayedLevel, displayedRank, rankChanging, shatterFragments };
}
