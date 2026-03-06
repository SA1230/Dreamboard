"use client";

import { useState, useEffect, useCallback } from "react";
import { GameData, Prize } from "@/lib/types";
import {
  loadGameData,
  getOverallLevel,
  getTotalLifetimeXP,
  getPrizes,
  addPrize,
  updatePrize,
  deletePrize,
  checkPrizeUnlocks,
} from "@/lib/storage";
import { MAX_USER_PRIZES } from "@/lib/prizes";
import { getRankTitle } from "@/lib/ranks";
import { PrizeTimeline } from "@/components/PrizeTimeline";
import { ArrowLeft, Trophy, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";

interface PrizeFormState {
  name: string;
  unlockLevel: number;
  link: string;
}

export default function PrizesPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formState, setFormState] = useState<PrizeFormState>({
    name: "",
    unlockLevel: 5,
    link: "",
  });

  useEffect(() => {
    const data = loadGameData();
    const totalXP = getTotalLifetimeXP(data);
    const { level } = getOverallLevel(totalXP);
    const updated = checkPrizeUnlocks(data, level);
    setGameData(updated);
  }, []);

  const currentLevel = gameData
    ? getOverallLevel(getTotalLifetimeXP(gameData)).level
    : 1;
  const prizes = gameData ? getPrizes(gameData) : [];
  const atLimit = prizes.length >= MAX_USER_PRIZES;

  const openAddForm = useCallback(() => {
    setEditingPrize(null);
    setFormState({ name: "", unlockLevel: currentLevel + 1, link: "" });
    setShowForm(true);
  }, [currentLevel]);

  const openEditForm = useCallback((prize: Prize) => {
    setEditingPrize(prize);
    setFormState({
      name: prize.name,
      unlockLevel: prize.unlockLevel,
      link: prize.link ?? "",
    });
    setShowDeleteConfirm(false);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingPrize(null);
    setShowDeleteConfirm(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!gameData || !formState.name.trim()) return;

    let result: GameData | null;

    if (editingPrize) {
      result = updatePrize(gameData, editingPrize.id, {
        name: formState.name,
        unlockLevel: formState.unlockLevel,
        link: formState.link || null,
      });
    } else {
      result = addPrize(
        gameData,
        formState.name,
        formState.unlockLevel,
        formState.link || undefined
      );
    }

    if (result) {
      // Check for newly unlocked prizes after add/edit
      const level = getOverallLevel(getTotalLifetimeXP(result)).level;
      const updated = checkPrizeUnlocks(result, level);
      setGameData(updated);
      closeForm();
    }
  }, [gameData, formState, editingPrize, closeForm]);

  const handleDelete = useCallback(() => {
    if (!gameData || !editingPrize) return;
    const result = deletePrize(gameData, editingPrize.id);
    setGameData(result);
    closeForm();
  }, [gameData, editingPrize, closeForm]);

  if (!gameData) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-stone-400 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 max-w-lg mx-auto w-full">
        <Link
          href="/"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold text-stone-700 flex items-center gap-2">
          <Trophy size={20} className="text-amber-500" />
          Prize Track
        </h1>
        {/* Level pill */}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
          <span className="text-sm font-bold text-amber-700">Lv. {currentLevel}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-stone-400 mb-4 leading-relaxed max-w-lg mx-auto w-full">
        Set IRL prizes for yourself as you level up. System rewards (top) unlock
        at rank milestones. Your prizes (bottom) are goals you create.
      </p>

      {/* Timeline — fills remaining vertical space, centered */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <PrizeTimeline
          currentLevel={currentLevel}
          prizes={prizes}
          onEditPrize={openEditForm}
        />

        {/* Empty state for user prizes */}
        {prizes.length === 0 && (
          <p className="text-xs text-stone-400 mt-2">
            No prizes set yet. Tap + to add your first reward!
          </p>
        )}
      </div>

      {/* Add Prize FAB */}
      <button
        onClick={openAddForm}
        disabled={atLimit}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all z-40 ${
          atLimit
            ? "bg-stone-300 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600 active:scale-95"
        }`}
        title={atLimit ? `Prize limit reached (${MAX_USER_PRIZES})` : "Add a prize"}
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Prize Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeForm}
          />
          {/* Modal */}
          <div className="relative w-full max-w-lg bg-[#FDF8F4] rounded-t-2xl p-5 animate-modalSlideUp">
            {/* Close button */}
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold text-stone-700 mb-4">
              {editingPrize ? "Edit Prize" : "Add Prize"}
            </h2>

            {/* Name field */}
            <label className="block mb-3">
              <span className="text-xs font-semibold text-stone-500 mb-1 block">
                Prize Name
              </span>
              <input
                type="text"
                value={formState.name}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, name: e.target.value }))
                }
                maxLength={60}
                placeholder="e.g., New running shoes"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200"
              />
            </label>

            {/* Unlock Level field */}
            <label className="block mb-3">
              <span className="text-xs font-semibold text-stone-500 mb-1 block">
                Unlock at Level
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={formState.unlockLevel}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      unlockLevel: Number(e.target.value),
                    }))
                  }
                  className="flex-1 accent-amber-500"
                />
                <span className="text-sm font-bold text-stone-700 w-8 text-center">
                  {formState.unlockLevel}
                </span>
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                {getRankTitle(formState.unlockLevel)} rank
              </span>
            </label>

            {/* Link field */}
            <label className="block mb-5">
              <span className="text-xs font-semibold text-stone-500 mb-1 block">
                Link (optional)
              </span>
              <input
                type="url"
                value={formState.link}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, link: e.target.value }))
                }
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-200"
              />
            </label>

            {/* Action buttons */}
            <div className="flex gap-2">
              {editingPrize && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} className="inline mr-1" />
                  Delete
                </button>
              )}
              {showDeleteConfirm && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Confirm Delete
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!formState.name.trim()}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  formState.name.trim()
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {editingPrize ? "Save Changes" : "Add Prize"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
