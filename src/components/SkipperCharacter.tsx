"use client";

import { PlayerInventory, VisibleSlot, ItemRarity } from "@/lib/types";
import { getItemById } from "@/lib/items";
import { ITEM_SVG_REGISTRY } from "@/lib/itemSvgs";

interface SlotRenderData {
  svg: string;
  rarity: ItemRarity;
}

interface SkipperCharacterProps {
  /** Equipped items from player inventory — determines which SVG overlays render */
  equippedItems?: PlayerInventory["equippedItems"];
  /** CSS class name passed to the root <svg> element */
  className?: string;
  /** Pixel size (width and height) — defaults to 108 to match LevelDisplay */
  size?: number;
}

/** Maps rarity to its SVG filter ID — common returns null (no filter) */
function getRarityFilterId(rarity: ItemRarity): string | null {
  switch (rarity) {
    case "uncommon": return "rarity-uncommon";
    case "rare": return "rarity-rare";
    case "epic": return "rarity-epic";
    case "legendary": return "rarity-legendary";
    default: return null;
  }
}

/**
 * Inline SVG paper-doll component for Skipper the penguin.
 *
 * Renders the base Skipper body with layered equipment items on top.
 * Items are additional <g> groups inserted at specific z-order positions
 * so they visually appear on the correct body part.
 *
 * Rarity effects (SVG filters):
 *   common    → no filter (as-is)
 *   uncommon  → subtle brightness boost
 *   rare      → soft blue-white outer glow
 *   epic      → purple glow, more intense
 *   legendary → animated golden shimmer (CSS keyframe pulse)
 *
 * Aggregate power aura: when 3+ epic/legendary items are equipped,
 * a radial gradient circle renders behind Skipper.
 *
 * Rendering order (back to front):
 *   [power aura] → feet → boots → arms → weapons → body → chest/legs/robe → head → headgear → face
 */
export function SkipperCharacter({
  equippedItems = {},
  className = "",
  size = 108,
}: SkipperCharacterProps) {
  // Determine which visible slots are overridden (e.g., robe hides chest+legs)
  const overriddenSlots = new Set<VisibleSlot>();
  for (const itemId of Object.values(equippedItems)) {
    if (!itemId) continue;
    const item = getItemById(itemId);
    if (item?.overridesSlots) {
      item.overridesSlots.forEach((slot) => overriddenSlots.add(slot));
    }
  }

  // Get SVG content + rarity for a slot (returns null if empty or overridden)
  function getSlotData(slot: VisibleSlot): SlotRenderData | null {
    if (overriddenSlots.has(slot)) return null;
    const itemId = equippedItems[slot];
    if (!itemId) return null;
    const item = getItemById(itemId);
    if (!item?.svgAssetKey) return null;
    const svg = ITEM_SVG_REGISTRY[item.svgAssetKey];
    if (!svg) return null;
    return { svg, rarity: item.rarity };
  }

  // Render a slot's SVG wrapped in a rarity filter group
  function renderSlot(data: SlotRenderData | null) {
    if (!data) return null;
    const filterId = getRarityFilterId(data.rarity);
    const isLegendary = data.rarity === "legendary";
    return (
      <g
        filter={filterId ? `url(#${filterId})` : undefined}
        className={isLegendary ? "legendary-glow-group" : undefined}
        dangerouslySetInnerHTML={{ __html: data.svg }}
      />
    );
  }

  const bootsData = getSlotData("feet");
  const primaryData = getSlotData("primary");
  const secondaryData = getSlotData("secondary");
  const chestData = getSlotData("chest");
  const legsData = getSlotData("legs");
  const robeData = getSlotData("robe");
  const headData = getSlotData("head");
  const handsData = getSlotData("hands");

  // Count epic/legendary items for aggregate power aura
  const allSlotData = [bootsData, primaryData, secondaryData, chestData, legsData, robeData, headData, handsData];
  const highRarityCount = allSlotData.filter(
    (d) => d && (d.rarity === "epic" || d.rarity === "legendary")
  ).length;
  const showPowerAura = highRarityCount >= 3;

  return (
    <svg
      viewBox="330 245 450 665"
      width={size}
      height={size}
      className={className}
      style={{ filter: "drop-shadow(0 2px 4px rgba(80,50,15,0.2))" }}
      aria-label="Skipper character"
      role="img"
    >
      {/* === Rarity filter definitions === */}
      <defs>
        {/* Uncommon: subtle brightness boost — items look slightly more vivid */}
        <filter id="rarity-uncommon" x="-10%" y="-10%" width="120%" height="120%">
          <feComponentTransfer>
            <feFuncR type="linear" slope="1.15" intercept="0.03" />
            <feFuncG type="linear" slope="1.15" intercept="0.03" />
            <feFuncB type="linear" slope="1.15" intercept="0.03" />
          </feComponentTransfer>
        </filter>

        {/* Rare: soft blue-white outer glow */}
        <filter id="rarity-rare" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
          <feFlood floodColor="#5B7AA5" floodOpacity="0.45" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Epic: purple glow, more intense */}
        <filter id="rarity-epic" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
          <feFlood floodColor="#8B6BA5" floodOpacity="0.55" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Legendary: golden shimmer — CSS animation pulses opacity */}
        <filter id="rarity-legendary" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
          <feFlood floodColor="#C9943E" floodOpacity="0.6" result="glowColor" />
          <feComposite in="glowColor" in2="blur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Power aura gradient — shown when 3+ epic/legendary items equipped */}
        <radialGradient id="power-aura-gradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9943E" stopOpacity="0.18" />
          <stop offset="60%" stopColor="#8B6BA5" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#8B6BA5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* === Layer 0: Aggregate power aura (behind everything) === */}
      {showPowerAura && (
        <circle
          cx="555"
          cy="577"
          r="280"
          fill="url(#power-aura-gradient)"
          className="power-aura"
        />
      )}

      {/* === Layer 1: Feet (base) + boots overlay === */}
      <g id="sk-feet">
        <path fill="#f2a96d" d="M479.56,837.14c-2.47,8.47-37.64,56.95-51.54,57.19-10.34,.19-6.02-9.59-6.44-13.53-.41-3.93-3.08-7.59-12.86-5.52-9.78,2.06-21.89,8.3-30.54,7.81-8.66-.5-6.2-9.41,2.72-18.56,.94-.97,2-2,3.15-3.07-.67-1.22-1.77-1.95-3.15-2.36l-.01-.01c-6.44-1.94-18.95,3.07-22.62-2.04-2.9-4.03,9.01-14.44,21.6-20.88,12.59-6.45,28.68-12.05,28.68-12.05,1.33-.69,25.16-10.18,48.83-3.58,8.96,1.85,24.65,8.13,22.18,16.6Z"/>
        <path fill="#f2a96d" d="M669.92,852c7.483,.772,15.45,2.62,17.52-1.53,2.07-4.14-10.76-12.14-22.83-19.65-12.07-7.5-37.1-17.16-45.57-18.38-8.47-1.23-16.71-.58-30.36,4.87-18.01,6.8-20.29,10.43-21.3,15.65-1,5.22,9.59,27.56,25.65,41.94,16.05,14.38,31.15,23.55,34.99,18.84,3.83-4.7-7.19-12.85,3.35-20.28,10.55-7.43,37.15,8.15,43.38,1.44,2.73-2.94-7.685-14.576-17.215-22.826,.608-.123,4.902-.846,12.385-.074Z"/>
      </g>
      {renderSlot(bootsData)}

      {/* === Layer 2: Right arm (behind body) === */}
      <g id="sk-a-arm">
        <path fill="#3c324c" d="M430.976,518.971c-7.096,2.113-22.412,15.199-35.941,28.909-14.875,15.075-30.976,36.244-36.203,46.478-9.98,19.543-19.959,57.382-11.227,61.124s15.385-19.543,34.097-30.77c8.429-5.057,32.747-15.512,63.439-53.211,30.691-37.699-7.068-54.643-14.164-52.53Z"/>
      </g>

      {/* === Layer 3: Left arm (behind body) === */}
      <g id="sk-b-arm">
        <path fill="#3c324c" d="M655.169,528.413c4.145,0,12.838,11.204,23.192,17.925,10.353,6.721,35.399,17.585,56.292,39.744,20.893,22.159,34.517,60.853,24.759,66.327-6.625,3.297-15.403-12.784-36.109-23.256-20.706-10.472-46.124-10.679-57.071-20.913-10.948-10.234-19.447-33.896-19.447-45.904s4.239-33.923,8.385-33.923Z"/>
      </g>

      {/* === Layer 4: Weapons (on top of arms, behind body) === */}
      {renderSlot(primaryData)}
      {renderSlot(secondaryData)}

      {/* === Layer 5: Body (main torso — covers arm bases) === */}
      <g id="sk-body">
        <path fill="#3c324c" d="M684.555,612.92s16.79,59.49,14.87,128.09c-1.1,39.16-31.69,68.63-70.68,86.7,34.55-23,43.33-71.16,44.41-102.26,1.09-31.1-6.11-92.61-32.18-135.09-24.46-43.76-70.37-57.71-95.43-62.94-25.05-5.24-72.81-14.28-111.46,10.07-38.64,24.35-60.43,113.02-58.65,174.59,1.55,59.4,45.1,107.29,46.21,108.51-6.62-4.3-12.76-9.21-18.23-14.81-58.25-48.47-34.54-154.48-33.48-157.09,22.6-92.54,40.77-112.54,46.66-123.68,5.89-11.14,7.03-18.18,6.85-25.25-.14-5.75-4.17-13.42-4.17-13.42,0,0-6.32-11.67,4.18-22.7,10.5-11.02,62.68-19.68,94.27-17.06,31.58,2.62,132.54,20.4,137.92,32.38,5.37,11.98,8.32,27.32,7.01,32.96s-1.04,14.54,1.31,23.61l20.59,77.39Z"/>
        <path fill="#f5e5e4" d="M640.975,590.36c26.07,42.48,33.27,103.99,32.18,135.09-1.08,31.1-9.86,79.26-44.41,102.26-29.31,13.61-63.37,20.77-93.22,20.77-33.57,0-80.03-5.91-113.88-27.89-1.11-1.22-44.66-49.11-46.21-108.51-1.78-61.57,20.01-150.24,58.65-174.59,38.65-24.35,86.41-15.31,111.46-10.07,25.06,5.23,70.97,19.18,95.43,62.94Z"/>
      </g>

      {/* === Layer 6: Body equipment overlays (chest, legs, or robe) === */}
      {renderSlot(legsData)}
      {renderSlot(chestData)}
      {renderSlot(robeData)}
      {renderSlot(handsData)}

      {/* === Layer 7: Head (base) === */}
      <g id="sk-head">
        <path fill="#3c324c" d="M559.075,265.41c-.52-.28-10.86-5.82-14.54-8.75-3.73-2.96-7.93-11.36-8.05-11.62,.43,.29,14.21,9.82,17.11,11.4,2.95,1.62,13.96,8.52,20.71,10.68,6.76,2.15,44.69,14.14,64.1,31.3,19.41,17.17,62.46,71.51,49.75,144.22-6.3,36.56-18.92,61.38-26.36,70.35-7.43,8.98-78.48,10.59-106.83,9.77-28.35-.83-62.03-5.85-82.29-9.77s-42.97-12.34-48.69-17.69c-5.73-5.35-26.77-33.09-26.75-59.1,.49-15.14,5.3-14.44,17.14-50.39,15.61-47.37,39.32-71.16,39.32-71.16,19.66-21.8,49.63-41.27,106.9-44.36,0,0-5.63-.29-11.25-1.78-5.63-1.49-11.94-5.37-11.94-5.37,.06,.01,7.55-.74,11.8-.09,4.12,.64,9.54,2.26,9.87,2.36Zm81.65,229.31c37.66-29.74,32.15-83.67,32.15-83.67-3.93-46.23-22.33-71.65-52.49-80.13-34.55-9.4-61.11,21.23-67.79,51.66-6.68,30.44,6.68,53.45,6.68,53.45l-80.6-10.9c20.46-24.7,24.55-47.79,24.55-47.79,6.83-31.13,1.75-51.89-15.16-62.33-18.63-7.66-38.37,11.47-47.35,29.31-14.22,26.84-12.65,33.33-20.25,51.78-7.6,18.44-14.56,30.79-14.29,47.46,.19,12.17,7.57,38.84,30.98,49.65,23.41,10.81,45.03,19.55,87.75,23.03,42.72,3.48,97.78-4.11,115.82-21.52Z"/>
        <path fill="#f5e5e4" d="M672.875,411.05s5.51,53.93-32.15,83.67c-18.04,17.41-73.1,25-115.82,21.52-42.72-3.48-64.34-12.22-87.75-23.03-23.41-10.81-30.79-37.48-30.98-49.65-.27-16.67,6.69-29.02,14.29-47.46,7.6-18.45,6.03-24.94,20.25-51.78,8.98-17.84,28.72-36.97,47.35-29.31,16.91,10.44,21.99,31.2,15.16,62.33,0,0-4.09,23.09-24.55,47.79l80.6,10.9s-13.36-23.01-6.68-53.45c6.68-30.43,33.24-61.06,67.79-51.66,30.16,8.48,48.56,33.9,52.49,80.13Z"/>
      </g>

      {/* === Layer 8: Head equipment overlay === */}
      {renderSlot(headData)}

      {/* === Layer 9: Face — always on top, never covered by equipment === */}
      <g id="sk-peck">
        <path fill="#f2a96d" d="M580.485,438.7c0,2.89-9.34,18.3-20.12,25.54-10.77,7.23-33.47,14.79-48.64,13.34-23.31-2.22-39.88-19.16-44.78-25.02s-13.24-18.43-11.84-22.59c1.41-4.15,17.81-3.7,24.51-10.88,6.69-7.17,21.63-17.68,42.67-15.29,21.03,2.39,35.02,20.31,39.08,22.47,4.06,2.15,19.12,10.5,19.12,12.43Zm-23.02-1.93c.14-.42,.14-.89-.02-1.3-.08-.2-.19-.37-.34-.51-.43-.39-1.11-.41-1.61-.12-.49,.29-.8,.83-.91,1.4-.08,.38-.07,.79,.07,1.15,.14,.35,.46,.76,.85,.85,.43,.1,.9-.11,1.22-.39,.34-.29,.6-.66,.74-1.08Zm-4.52-.78c4.08-4.19-.59-11.9-4.96-16.97-4.37-5.07-15.49-12.77-30.72-13.5-15.22-.73-15.23,8.99-15.23,8.99-.39,1.89,.76,9.78,8.73,12.3,7.98,2.53,9.97,2.16,13.62,4.1s9.69,5.54,14.29,7.36c4.59,1.81,10.19,1.92,14.27-2.28Z"/>
        <path fill="#f5e5e4" d="M557.445,435.47c.16,.41,.16,.88,.02,1.3s-.4,.79-.74,1.08c-.32,.28-.79,.49-1.22,.39-.39-.09-.71-.5-.85-.85-.14-.36-.15-.77-.07-1.15,.11-.57,.42-1.11,.91-1.4,.5-.29,1.18-.27,1.61,.12,.15,.14,.26,.31,.34,.51Z"/>
        <path fill="#f5e5e4" d="M547.985,419.02c4.37,5.07,9.04,12.78,4.96,16.97-4.08,4.2-9.68,4.09-14.27,2.28-4.6-1.82-10.64-5.42-14.29-7.36s-5.64-1.57-13.62-4.1c-7.97-2.52-9.12-10.41-8.73-12.3,0,0,.01-9.72,15.23-8.99,15.23,.73,26.35,8.43,30.72,13.5Z"/>
      </g>
      <g id="sk-mouth">
        <path fill="#3c324c" d="M575.338,438.213s-25.894,16.429-62.778,16.25c-24.929-.567-51.122-22.792-51.122-22.792,0,0,16.106,25.032,52.07,26.307,41.454,1.469,61.83-19.764,61.83-19.764Z"/>
      </g>
      <g id="sk-eyes">
        {/* Right eye */}
        <path fill="#3c324c" d="M607.495,373.81c13.71,0,24.83,12.21,24.83,27.29s-11.12,27.28-24.83,27.28-24.83-12.21-24.83-27.28,11.11-27.29,24.83-27.29Zm16.33,27.05c3.62-2.54,3.75-8.59,.29-13.5-3.46-4.92-9.19-6.84-12.81-4.3-3.61,2.54-3.74,8.59-.29,13.5,3.46,4.92,9.19,6.85,12.81,4.3Zm-3.85,19.03c1.24-.87,1.42-2.74,.4-4.19s-2.85-1.92-4.08-1.05c-1.24,.87-1.41,2.75-.4,4.19,1.02,1.45,2.85,1.92,4.08,1.05Zm-13.1,2.06c.66-.46,.77-1.44,.25-2.17-.52-.74-1.47-.96-2.13-.5s-.77,1.44-.25,2.17c.51,.74,1.47,.96,2.13,.5Zm-7.17-6.55c.63-.44,.72-1.4,.2-2.14-.52-.73-1.45-.98-2.08-.53-.63,.44-.72,1.4-.2,2.14s1.45,.98,2.08,.53Zm-6.26-12.24c2.16-1.52,2.36-4.94,.46-7.64s-5.18-3.67-7.34-2.15c-2.15,1.51-2.36,4.93-.46,7.64,1.9,2.7,5.19,3.66,7.34,2.15Z"/>
        <path fill="#fff" d="M624.115,387.36c3.46,4.91,3.33,10.96-.29,13.5-3.62,2.55-9.35,.62-12.81-4.3-3.45-4.91-3.32-10.96,.29-13.5,3.62-2.54,9.35-.62,12.81,4.3Z"/>
        <path fill="#fff" d="M620.375,415.7c1.02,1.45,.84,3.32-.4,4.19-1.23,.87-3.06,.4-4.08-1.05-1.01-1.44-.84-3.32,.4-4.19,1.23-.87,3.06-.4,4.08,1.05Z"/>
        <path fill="#fff" d="M607.125,419.78c.52,.73,.41,1.71-.25,2.17s-1.62,.24-2.13-.5c-.52-.73-.41-1.71,.25-2.17s1.61-.24,2.13,.5Z"/>
        <path fill="#fff" d="M599.905,413.26c.52,.74,.43,1.7-.2,2.14-.63,.45-1.56,.21-2.08-.53s-.43-1.7,.2-2.14c.63-.45,1.56-.2,2.08,.53Z"/>
        <path fill="#fff" d="M593.905,395.52c1.9,2.7,1.7,6.12-.46,7.64-2.15,1.51-5.44,.55-7.34-2.15-1.9-2.71-1.69-6.13,.46-7.64s4.54-.11,5.9,2.22Z"/>
        {/* Left eye */}
        <path fill="#3c324c" d="M463.385,365.27c12.6,0,22.81,11.36,22.81,25.37s-10.21,25.37-22.81,25.37-22.82-11.36-22.82-25.37,10.22-25.37,22.82-25.37Zm15.51,25.53c3.2-1.87,3.63-7.11,.95-11.7s-7.46-6.79-10.66-4.92c-3.21,1.87-3.63,7.11-.95,11.7s7.45,6.8,10.66,4.92Zm-20.39,15.11c.5-.3,.59-1.07,.21-1.72-.38-.66-1.1-.96-1.6-.66-.51,.29-.6,1.06-.22,1.72,.39,.65,1.11,.95,1.61,.66Zm-5.49-4.54c.51-.29,.6-1.06,.22-1.72-.39-.65-1.11-.95-1.61-.66-.5,.3-.59,1.07-.21,1.72,.38,.66,1.1,.96,1.6,.66Zm-2.7-10.42c1.89-1.11,2.32-3.9,.96-6.24-1.36-2.33-4-3.33-5.9-2.22s-2.33,3.9-.96,6.23c1.36,2.34,4,3.33,5.9,2.23Z"/>
        <path fill="#fff" d="M479.845,379.1c2.68,4.59,2.25,9.83-.95,11.7-3.21,1.88-7.98-.33-10.66-4.92s-2.26-9.83,.95-11.7c3.2-1.87,7.98,.33,10.66,4.92Z"/>
        <path fill="#fff" d="M458.715,404.19c.38,.65,.29,1.42-.21,1.72-.5,.29-1.22-.01-1.61-.66-.38-.66-.29-1.43,.22-1.72,.5-.3,1.22,0,1.6,.66Z"/>
        <path fill="#fff" d="M453.235,399.65c.38,.66,.29,1.43-.22,1.72-.5,.3-1.22,0-1.6-.66-.38-.65-.29-1.42,.21-1.72,.5-.29,1.22,.01,1.61,.66Z"/>
        <path fill="#fff" d="M451.275,384.71c1.36,2.34,.93,5.13-.96,6.24-1.9,1.1-4.54,.11-5.9-2.23-1.37-2.33-.94-5.12,.96-6.23s4.54-.11,5.9,2.22Z"/>
      </g>
      <g id="sk-a-brow">
        <path fill="#3c324c" d="M438.954,371.018c.201-.29,15.007-18.424,31.244-12.142,16.237,6.283,19.232,25.224,19.353,25.113s1.124-22.841-18.841-29.563-31.756,16.592-31.756,16.592Z"/>
      </g>
      <g id="sk-b-brow">
        <path fill="#3c324c" d="M634.434,379.998s-13.222-14.128-29.419-10.201-25.335,21.826-25.49,22.164c0,0,4.65-23.665,26.995-26.562,20.543-2.663,27.915,14.599,27.915,14.599Z"/>
      </g>
    </svg>
  );
}
