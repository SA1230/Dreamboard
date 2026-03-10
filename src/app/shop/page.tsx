"use client";

import { useState, useEffect, useCallback } from "react";
import { GameData, EquipmentSlot, VisibleSlot, ShopItem, StatKey } from "@/lib/types";
import { loadGameData, getPointsBalance, getInventory, purchaseItem, equipItem, unequipSlot, getOverallLevel, getTotalLifetimeXP, getMascotName, getEffectiveDefinitions, getEquippedBonuses } from "@/lib/storage";
import { ITEM_CATALOG, LEVEL_REWARD_ITEMS, RARITY_COLORS, VISIBLE_SLOTS, SECONDARY_STAT_LABELS, RESIST_LABELS, getItemById } from "@/lib/items";
import { ITEM_THUMBNAIL_REGISTRY } from "@/lib/itemSvgs";
import { track } from "@/lib/tracker";
import { playSoundWithHaptic } from "@/lib/sound";
import { SkipperCharacter } from "@/components/SkipperCharacter";
import { ArrowLeft, ShoppingBag, Check, Sword } from "lucide-react";
import Link from "next/link";
import { AuthGate } from "@/components/AuthProvider";

export default function ShopPage() {
  return (
    <AuthGate>
      <ShopPageContent />
    </AuthGate>
  );
}

/** Compact EQ-style stat block for an item card */
function ItemStats({ item, effectiveDefinitions }: { item: ShopItem; effectiveDefinitions: Record<StatKey, { color: string; name: string }> }) {
  const hasWeaponStats = !!item.weaponStats;
  const hasStatMods = item.statModifiers && item.statModifiers.length > 0;
  const hasSecondary = item.secondaryStats && Object.keys(item.secondaryStats).length > 0;
  const hasResists = item.resistances && Object.keys(item.resistances).length > 0;
  const hasFocus = !!item.focusEffect;
  const hasProps = item.weight !== undefined || item.material;

  if (!hasWeaponStats && !hasStatMods && !hasSecondary && !hasResists && !hasFocus && !hasProps) return null;

  return (
    <div className="mt-1.5 pt-1.5 border-t border-dashed" style={{ borderColor: "#e0d8ce" }}>
      {/* Weapon stats — DMG / DLY monospace row */}
      {hasWeaponStats && item.weaponStats && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold text-stone-600">
            DMG: {item.weaponStats.damage} &nbsp; DLY: {item.weaponStats.delay}
          </span>
          {item.weaponStats.weaponType && (
            <span className="text-[9px] text-stone-400 font-mono">{item.weaponStats.weaponType}</span>
          )}
        </div>
      )}

      {/* Primary stat modifiers */}
      {hasStatMods && item.statModifiers && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
          {item.statModifiers.map((mod, i) => {
            const def = effectiveDefinitions[mod.stat];
            return (
              <span key={i} className="text-[10px] font-bold" style={{ color: def?.color ?? "#6B7B8D" }}>
                +{mod.flatBonus} {def?.name ?? mod.stat}
              </span>
            );
          })}
        </div>
      )}

      {/* Secondary stats — compact grid */}
      {hasSecondary && item.secondaryStats && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
          {Object.entries(item.secondaryStats).map(([key, value]) => {
            if (!value) return null;
            const label = SECONDARY_STAT_LABELS[key];
            return (
              <span key={key} className="text-[9px] text-stone-500">
                {label?.label ?? key}: <span className="font-bold text-stone-600">{value}{label?.suffix ?? ""}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Resistances */}
      {hasResists && item.resistances && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
          {Object.entries(item.resistances).map(([key, value]) => {
            if (!value) return null;
            const label = RESIST_LABELS[key];
            return (
              <span key={key} className="text-[9px] font-bold" style={{ color: label?.color ?? "#6B7B8D" }}>
                +{value} {label?.label ?? key}
              </span>
            );
          })}
        </div>
      )}

      {/* Focus effect */}
      {hasFocus && item.focusEffect && (
        <div className="mb-1">
          <span className="text-[9px] text-purple-600 font-semibold">
            Focus: {item.focusEffect.name}{item.focusEffect.tier ? ` ${["", "I", "II", "III", "IV", "V"][item.focusEffect.tier] ?? item.focusEffect.tier}` : ""}
          </span>
        </div>
      )}

      {/* Weight & Material */}
      {hasProps && (
        <div className="text-[9px] text-stone-300 flex gap-2">
          {item.material && <span>{item.material}</span>}
          {item.weight !== undefined && <span>WT: {item.weight}</span>}
        </div>
      )}
    </div>
  );
}

/** Total Bonuses summary for equipped items */
function TotalBonuses({ gameData, effectiveDefinitions }: { gameData: GameData; effectiveDefinitions: Record<StatKey, { color: string; name: string }> }) {
  const bonuses = getEquippedBonuses(gameData);

  const hasStatMods = Object.keys(bonuses.statModifiers).length > 0;
  const hasSecondary = Object.values(bonuses.secondaryStats).some((v) => v && v > 0);
  const hasResists = Object.values(bonuses.resistances).some((v) => v && v > 0);

  if (!hasStatMods && !hasSecondary && !hasResists) return null;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 mb-4">
      <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Equipment Bonuses</h3>

      {/* Stat modifiers */}
      {hasStatMods && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
          {(Object.entries(bonuses.statModifiers) as [StatKey, { flatBonus: number }][]).map(([stat, mod]) => {
            const def = effectiveDefinitions[stat];
            return (
              <span key={stat} className="text-[10px] font-bold" style={{ color: def?.color ?? "#6B7B8D" }}>
                +{mod.flatBonus} {def?.name ?? stat}
              </span>
            );
          })}
        </div>
      )}

      {/* Secondary stats */}
      {hasSecondary && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
          {Object.entries(bonuses.secondaryStats).map(([key, value]) => {
            if (!value) return null;
            const label = SECONDARY_STAT_LABELS[key];
            return (
              <span key={key} className="text-[10px] text-stone-500">
                {label?.label ?? key}: <span className="font-bold text-stone-600">{value}{label?.suffix ?? ""}</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Resistances */}
      {hasResists && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(bonuses.resistances).map(([key, value]) => {
            if (!value) return null;
            const label = RESIST_LABELS[key];
            return (
              <span key={key} className="text-[10px] font-bold" style={{ color: label?.color ?? "#6B7B8D" }}>
                +{value} {label?.label ?? key}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShopPageContent() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<VisibleSlot | "all">("all");
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Preview Mode — try on any item without owning it (visual only, no localStorage writes)
  const [previewMode, setPreviewMode] = useState(false);
  const [previewEquipped, setPreviewEquipped] = useState<Partial<Record<EquipmentSlot, string>>>({});

  useEffect(() => {
    setGameData(loadGameData());
  }, []);

  const showToast = useCallback((message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(null), 1500);
  }, []);

  const handlePurchase = useCallback((itemId: string) => {
    const freshData = loadGameData();
    const result = purchaseItem(freshData, itemId);
    if (result) {
      setGameData(result);
      showToast("Purchased!");
      playSoundWithHaptic("purchase", 0.5, [30, 20, 50]);
      const item = getItemById(itemId);
      track("shop_purchase", { itemId, itemName: item?.name, rarity: item?.rarity });
    }
  }, [showToast]);

  const handleEquip = useCallback((itemId: string) => {
    const freshData = loadGameData();
    const result = equipItem(freshData, itemId);
    if (result) {
      setGameData(result);
      showToast("Equipped!");
    }
  }, [showToast]);

  const handleUnequip = useCallback((slot: EquipmentSlot) => {
    const freshData = loadGameData();
    const result = unequipSlot(freshData, slot);
    setGameData(result);
    showToast("Unequipped!");
  }, [showToast]);

  // Preview mode handlers — must be before the early return (rules of hooks)
  const handlePreviewEquip = useCallback((itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;
    setPreviewEquipped((prev) => ({ ...prev, [item.slot]: itemId }));
    showToast("Preview equipped!");
  }, [showToast]);

  const handlePreviewUnequip = useCallback((slot: EquipmentSlot) => {
    setPreviewEquipped((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
    showToast("Preview unequipped!");
  }, [showToast]);

  const handlePreviewEquipAll = useCallback(() => {
    const allEquipped: Partial<Record<EquipmentSlot, string>> = {};
    const rarityRank = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
    const allItems = [...ITEM_CATALOG, ...LEVEL_REWARD_ITEMS];
    for (const item of allItems) {
      const existing = allEquipped[item.slot];
      if (!existing) {
        allEquipped[item.slot] = item.id;
      } else {
        const existingItem = getItemById(existing);
        if (existingItem && rarityRank[item.rarity] > rarityRank[existingItem.rarity]) {
          allEquipped[item.slot] = item.id;
        }
      }
    }
    setPreviewEquipped(allEquipped);
    showToast("All best items equipped!");
  }, [showToast]);

  const handlePreviewClear = useCallback(() => {
    setPreviewEquipped({});
    showToast("All items removed!");
  }, [showToast]);


  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  const inventory = getInventory(gameData);
  const pointsBalance = getPointsBalance(gameData);
  const totalXP = getTotalLifetimeXP(gameData);
  const { level: overallLevel } = getOverallLevel(totalXP);
  const effectiveDefinitions = getEffectiveDefinitions(gameData);

  // In preview mode, use preview equipped items instead of real inventory
  const displayEquipped = previewMode ? previewEquipped : inventory.equippedItems;

  // Include owned reward items alongside shop items so they appear in inventory
  const ownedRewardItems = LEVEL_REWARD_ITEMS.filter(
    (item) => inventory.ownedItemIds.includes(item.id)
  );
  const allDisplayItems = [...ITEM_CATALOG, ...ownedRewardItems];

  const filteredItems = selectedSlot === "all"
    ? allDisplayItems
    : allDisplayItems.filter((item) => item.slot === selectedSlot);

  return (
    <main className="min-h-screen p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-stone-700 flex items-center gap-2">
          <ShoppingBag size={20} className="text-amber-500" />
          Power-Up Store
        </h1>
        {/* Balance pill */}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M11.5 1L4 11h5.5L8.5 19 16 9h-5.5L11.5 1z" fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-bold text-amber-700">{pointsBalance.balance}</span>
        </div>
      </div>

      {/* PP explainer — expanded for new users, compact for experienced */}
      {pointsBalance.balance === 0 && inventory.ownedItemIds.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 -mt-2 mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-1.5">What are Power Points?</p>
          <p className="text-xs text-amber-700/80 leading-relaxed">
            Complete daily habits to earn PP. Damage behaviors subtract PP.
            Spend PP here to equip {getMascotName(gameData)} with gear.
          </p>
          <Link
            href="/settings"
            className="inline-block mt-2.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
          >
            Enable habits in Settings &rarr;
          </Link>
        </div>
      ) : (
        <p className="text-[11px] text-stone-400 -mt-4 mb-4 text-right">
          Earn PP by completing daily habits
        </p>
      )}

      {/* Preview Mode Toggle */}
      {/* Preview Mode — dev only (MMO-style: no try-on for users) */}
      {process.env.NODE_ENV === "development" && (
        <>
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={() => {
                if (!previewMode) {
                  setPreviewEquipped({ ...inventory.equippedItems });
                }
                setPreviewMode(!previewMode);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewMode
                  ? "bg-violet-100 text-violet-700 border border-violet-300"
                  : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {previewMode ? "Preview Mode ON" : "Preview Mode"}
            </button>
            {previewMode && (
              <div className="flex gap-1.5">
                <button
                  onClick={handlePreviewEquipAll}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 hover:bg-violet-100 transition-colors"
                >
                  Equip Best
                </button>
                <button
                  onClick={handlePreviewClear}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-stone-500 bg-stone-50 border border-stone-200 hover:bg-stone-100 transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {previewMode && (
            <div className="rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 mb-4">
              <p className="text-[11px] text-violet-600 font-medium text-center">
                Try on any item — changes are visual only, nothing is saved
              </p>
            </div>
          )}
        </>
      )}

      {/* Skipper Preview */}
      <div className="flex flex-col items-center mb-6 py-4 rounded-2xl"
        style={{
          background: previewMode
            ? "linear-gradient(135deg, #faf8ff 0%, #f0ecf8 50%, #e8e0f0 100%)"
            : "linear-gradient(135deg, #fefcf9 0%, #f5f0e8 50%, #ede4d6 100%)",
          boxShadow: "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
          border: previewMode ? "2px solid rgba(139, 107, 165, 0.2)" : "none",
        }}
      >
        <SkipperCharacter
          equippedItems={displayEquipped}
          size={140}
        />
        <span className="text-xs text-stone-400 mt-2 font-medium">Lv. {overallLevel}</span>

        {/* Equipped items quick strip */}
        {Object.keys(displayEquipped).length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-4">
            {Object.entries(displayEquipped).map(([slot, itemId]) => {
              if (!itemId) return null;
              const item = getItemById(itemId);
              if (!item) return null;
              const rarityColors = RARITY_COLORS[item.rarity];
              return (
                <button
                  key={slot}
                  onClick={() => previewMode ? handlePreviewUnequip(slot as EquipmentSlot) : handleUnequip(slot as EquipmentSlot)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors hover:opacity-80"
                  style={{
                    color: rarityColors.text,
                    background: rarityColors.background,
                    borderColor: rarityColors.border,
                  }}
                  title={`Unequip ${item.name}`}
                >
                  {item.name}
                  <span className="text-stone-400 ml-0.5">&times;</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Total Equipment Bonuses */}
      <TotalBonuses gameData={gameData} effectiveDefinitions={effectiveDefinitions} />

      {/* Slot filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setSelectedSlot("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedSlot === "all"
              ? "bg-stone-700 text-white"
              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
          }`}
        >
          All
        </button>
        {VISIBLE_SLOTS.map(({ slot, label }) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSlot === slot
                ? "bg-stone-700 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const owned = inventory.ownedItemIds.includes(item.id);
          const equipped = Object.values(inventory.equippedItems).includes(item.id);
          const canAfford = pointsBalance.balance >= item.cost;
          const meetsLevel = (item.levelRequirement ?? 0) <= overallLevel;
          const rarityColors = RARITY_COLORS[item.rarity];

          return (
            <div
              key={item.id}
              className="relative rounded-xl border-2 p-3 transition-all"
              style={{
                borderColor: owned ? rarityColors.border : "#e7e0d5",
                background: owned ? rarityColors.background : "#fefcf9",
              }}
            >
              {/* Rarity badge */}
              <span
                className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: rarityColors.text,
                  background: rarityColors.background,
                  border: `1px solid ${rarityColors.border}`,
                }}
              >
                {item.rarity}
              </span>

              {/* Item thumbnail */}
              <div
                className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center"
                style={{ background: `${rarityColors.border}30` }}
              >
                {item.svgAssetKey && ITEM_THUMBNAIL_REGISTRY[item.svgAssetKey] ? (
                  <svg
                    viewBox="0 0 64 64"
                    className="w-16 h-16"
                    aria-label={item.name}
                    dangerouslySetInnerHTML={{ __html: ITEM_THUMBNAIL_REGISTRY[item.svgAssetKey] }}
                  />
                ) : (
                  <Sword size={28} style={{ color: rarityColors.text, opacity: 0.5 }} />
                )}
              </div>

              {/* Item name + description */}
              <h3 className="text-sm font-bold text-stone-700 leading-tight">{item.name}</h3>
              <p className="text-[10px] text-stone-400 mt-0.5 leading-snug line-clamp-2">{item.description}</p>

              {/* Slot label */}
              <span className="text-[9px] text-stone-300 font-medium uppercase tracking-wide mt-1 block">
                {item.slot}
              </span>

              {/* Level requirement — always visible if item has one */}
              {item.levelRequirement && (
                <span className={`text-[9px] font-medium mt-0.5 block ${meetsLevel ? "text-stone-300" : "text-red-400"}`}>
                  Requires Lv. {item.levelRequirement}
                </span>
              )}

              {/* Level reward badge — distinguish from shop-purchasable items */}
              {item.levelReward && (
                <span className="text-[9px] font-semibold mt-0.5 block text-amber-500">
                  Lv. {item.levelReward} Reward
                </span>
              )}

              {/* Item stats */}
              <ItemStats item={item} effectiveDefinitions={effectiveDefinitions} />

              {/* Action button */}
              <div className="mt-2">
                {previewMode ? (
                  // Preview mode: try on / remove any item
                  Object.values(previewEquipped).includes(item.id) ? (
                    <button
                      onClick={() => handlePreviewUnequip(item.slot)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold border border-violet-300 text-violet-600 bg-violet-50 flex items-center justify-center gap-1"
                    >
                      <Check size={12} />
                      Trying On
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePreviewEquip(item.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold border border-violet-300 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
                    >
                      Try On
                    </button>
                  )
                ) : equipped ? (
                  <button
                    onClick={() => handleUnequip(item.slot)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold border border-emerald-300 text-emerald-600 bg-emerald-50 flex items-center justify-center gap-1"
                  >
                    <Check size={12} />
                    Equipped
                  </button>
                ) : owned ? (
                  <button
                    onClick={() => handleEquip(item.id)}
                    className="w-full py-1.5 rounded-lg text-xs font-bold border border-stone-300 text-stone-600 bg-stone-50 hover:bg-stone-100 transition-colors"
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={!canAfford || !meetsLevel}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                      canAfford && meetsLevel
                        ? "bg-amber-500 text-white hover:bg-amber-600 border border-amber-600"
                        : "bg-stone-100 text-stone-300 border border-stone-200 cursor-not-allowed"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path d="M11.5 1L4 11h5.5L8.5 19 16 9h-5.5L11.5 1z" fill="currentColor" />
                    </svg>
                    {item.cost}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-stone-400 text-sm">
          No items in this slot yet.
        </div>
      )}

      {/* Action toast */}
      {actionToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="px-4 py-2 rounded-full bg-stone-700 text-white text-sm font-semibold shadow-lg">
            {actionToast}
          </div>
        </div>
      )}
    </main>
  );
}
