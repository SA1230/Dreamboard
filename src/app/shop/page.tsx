"use client";

import { useState, useEffect, useCallback } from "react";
import { GameData, EquipmentSlot, VisibleSlot } from "@/lib/types";
import { loadGameData, getPointsBalance, getInventory, purchaseItem, equipItem, unequipSlot, getOverallLevel, getTotalLifetimeXP, getMascotName } from "@/lib/storage";
import { ITEM_CATALOG, RARITY_COLORS, VISIBLE_SLOTS, getItemById } from "@/lib/items";
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

function ShopPageContent() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<VisibleSlot | "all">("all");
  const [actionToast, setActionToast] = useState<string | null>(null);

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

  const filteredItems = selectedSlot === "all"
    ? ITEM_CATALOG
    : ITEM_CATALOG.filter((item) => item.slot === selectedSlot);

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

      {/* Skipper Preview */}
      <div className="flex flex-col items-center mb-6 py-4 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, #fefcf9 0%, #f5f0e8 50%, #ede4d6 100%)",
          boxShadow: "0 2px 16px rgba(180, 150, 100, 0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <SkipperCharacter
          equippedItems={inventory.equippedItems}
          size={140}
        />
        <span className="text-xs text-stone-400 mt-2 font-medium">Lv. {overallLevel}</span>

        {/* Equipped items quick strip */}
        {Object.keys(inventory.equippedItems).length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-4">
            {Object.entries(inventory.equippedItems).map(([slot, itemId]) => {
              if (!itemId) return null;
              const item = getItemById(itemId);
              if (!item) return null;
              const rarityColors = RARITY_COLORS[item.rarity];
              return (
                <button
                  key={slot}
                  onClick={() => handleUnequip(slot as EquipmentSlot)}
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

              {/* Action button */}
              <div className="mt-2">
                {equipped ? (
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
