"use client";

import { useState, useEffect, useRef } from "react";
import { GameData, StatKey, HabitKey, DamageKey, CustomStatOverride } from "@/lib/types";
import { STAT_DEFINITIONS, STAT_KEYS, COLOR_PRESETS, StatDefinition } from "@/lib/stats";
import { loadGameData, saveCustomDefinitions, getEnabledHabits, saveEnabledHabits, getEnabledDamage, saveEnabledDamage, resetAllData, saveProfilePicture, getProfilePicture } from "@/lib/storage";
import { StatIcon, ICON_OPTIONS } from "@/components/StatIcons";
import { ArrowLeft, RotateCcw, Trash2, Camera, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HABIT_DEFINITIONS } from "@/lib/habits";
import { DAMAGE_DEFINITIONS } from "@/lib/damage";
import { ModalBackdrop } from "@/components/ModalBackdrop";

const ALL_HABITS = HABIT_DEFINITIONS;
const ALL_DAMAGE = DAMAGE_DEFINITIONS;

export default function SettingsPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [overrides, setOverrides] = useState<Partial<Record<StatKey, CustomStatOverride>>>({});
  const [enabledHabits, setEnabledHabits] = useState<HabitKey[]>([]);
  const [enabledDamage, setEnabledDamage] = useState<DamageKey[]>([]);
  const [editingStat, setEditingStat] = useState<StatKey | null>(null);
  const [saved, setSaved] = useState(false);
  const [showResetDataConfirm, setShowResetDataConfirm] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const data = loadGameData();
    setGameData(data);
    setOverrides(data.customDefinitions ?? {});
    setEnabledHabits(getEnabledHabits(data));
    setEnabledDamage(getEnabledDamage(data));
    setProfilePicture(getProfilePicture(data));
  }, []);

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-500 animate-spin" />
      </div>
    );
  }

  function getEffectiveDefinition(key: StatKey): StatDefinition {
    const base = STAT_DEFINITIONS[key];
    const override = overrides[key];
    if (!override) return base;

    let backgroundColor = base.backgroundColor;
    let progressColor = base.progressColor;
    if (override.color) {
      const preset = COLOR_PRESETS.find((p) => p.color === override.color);
      if (preset) {
        backgroundColor = preset.backgroundColor;
        progressColor = preset.progressColor;
      }
    }

    return {
      ...base,
      name: override.name ?? base.name,
      description: override.description ?? base.description,
      earnsXP: override.earnsXP ?? base.earnsXP,
      color: override.color ?? base.color,
      backgroundColor,
      progressColor,
      iconKey: override.iconKey ?? base.iconKey,
    };
  }

  function updateOverride(key: StatKey, field: keyof CustomStatOverride, value: string) {
    const defaultValue = STAT_DEFINITIONS[key][field as keyof StatDefinition] as string;
    setOverrides((prev) => {
      const current = prev[key] ?? {};
      const updated = { ...current, [field]: value === defaultValue ? undefined : value };
      // Clean up empty overrides
      const hasValues = Object.values(updated).some((v) => v !== undefined);
      if (!hasValues) {
        return Object.fromEntries(
          Object.entries(prev).filter(([k]) => k !== key)
        ) as typeof prev;
      }
      return { ...prev, [key]: updated };
    });
    setSaved(false);
  }

  function resetStat(key: StatKey) {
    setOverrides((prev) => {
      return Object.fromEntries(
        Object.entries(prev).filter(([k]) => k !== key)
      ) as typeof prev;
    });
    setSaved(false);
  }

  function resetAll() {
    setOverrides({});
    setSaved(false);
  }

  function toggleHabit(habitKey: HabitKey) {
    if (!gameData) return;
    const updated = enabledHabits.includes(habitKey)
      ? enabledHabits.filter((k) => k !== habitKey)
      : [...enabledHabits, habitKey];
    setEnabledHabits(updated);
    const newData = saveEnabledHabits(gameData, updated);
    setGameData(newData);
  }

  function toggleDamageItem(damageKey: DamageKey) {
    if (!gameData) return;
    const updated = enabledDamage.includes(damageKey)
      ? enabledDamage.filter((k) => k !== damageKey)
      : [...enabledDamage, damageKey];
    setEnabledDamage(updated);
    const newData = saveEnabledDamage(gameData, updated);
    setGameData(newData);
  }

  function handleProfilePictureUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!gameData) return;
    const file = event.target.files?.[0];
    if (!file) return;

    // Resize to 128x128 and compress to JPEG to keep localStorage usage small
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext("2d")!;

        // Crop to center square
        const size = Math.min(img.width, img.height);
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, 128, 128);

        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        setProfilePicture(base64);
        const newData = saveProfilePicture(gameData, base64);
        setGameData(newData);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset file input so re-uploading the same file works
    event.target.value = "";
  }

  function removeProfilePicture() {
    if (!gameData) return;
    setProfilePicture(null);
    const newData = saveProfilePicture(gameData, null);
    setGameData(newData);
  }

  function handleSave() {
    if (!gameData) return;
    let newData = saveCustomDefinitions(gameData, overrides);
    newData = saveEnabledHabits(newData, enabledHabits);
    newData = saveEnabledDamage(newData, enabledDamage);
    setGameData(newData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-700">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <RotateCcw size={14} />
            Reset All
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-stone-600 hover:bg-stone-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </header>

      {/* Section: Profile Picture */}
      <h2 className="text-lg font-bold text-stone-500 mb-4">Profile</h2>
      <div className="rounded-2xl bg-stone-50 border-2 border-stone-200 p-5 mb-8">
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center border-2 border-stone-300">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              )}
            </div>
            {profilePicture && (
              <button
                onClick={removeProfilePicture}
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                aria-label="Remove profile picture"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Upload controls */}
          <div className="flex-1">
            <p className="text-sm font-bold text-stone-600 mb-1">Profile Picture</p>
            <p className="text-xs text-stone-400 mb-3">Shows next to your messages in the Captain chat.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 bg-white border-2 border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors"
            >
              <Camera size={14} />
              {profilePicture ? "Change Photo" : "Upload Photo"}
            </button>
          </div>
        </div>
      </div>

      {/* Section: Stats */}
      <h2 className="text-lg font-bold text-stone-500 mb-4">Stats</h2>
      <div className="space-y-4">
        {STAT_KEYS.map((key) => {
          const definition = getEffectiveDefinition(key);
          const isEditing = editingStat === key;
          const hasOverride = !!overrides[key];

          return (
            <div
              key={key}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{ backgroundColor: definition.backgroundColor }}
            >
              {/* Stat preview / click to expand */}
              <button
                onClick={() => setEditingStat(isEditing ? null : key)}
                className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:opacity-80"
              >
                <div style={{ color: definition.color }}>
                  <StatIcon iconKey={definition.iconKey} className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold" style={{ color: definition.color }}>
                      {definition.name}
                    </h3>
                    {hasOverride && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/50 text-stone-400">
                        customized
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-60" style={{ color: definition.color }}>
                    {definition.description}
                  </p>
                </div>
                <div
                  className="text-sm transition-transform duration-200"
                  style={{
                    color: definition.color,
                    transform: isEditing ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▾
                </div>
              </button>

              {/* Editor panel */}
              {isEditing && (
                <div className="px-4 pb-5 space-y-4 animate-fadeIn">
                  <div className="h-px bg-black/5" />

                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={definition.name}
                      onChange={(e) => updateOverride(key, "name", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm bg-white/80 text-stone-700 outline-none transition-colors"
                      style={{ borderColor: `${definition.color}20` }}
                      onFocus={(e) => { e.target.style.borderColor = definition.color; }}
                      onBlur={(e) => { e.target.style.borderColor = `${definition.color}20`; }}
                      maxLength={20}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">Vibe</label>
                    <input
                      type="text"
                      value={definition.description}
                      onChange={(e) => updateOverride(key, "description", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm bg-white/80 text-stone-700 outline-none transition-colors"
                      style={{ borderColor: `${definition.color}20` }}
                      onFocus={(e) => { e.target.style.borderColor = definition.color; }}
                      onBlur={(e) => { e.target.style.borderColor = `${definition.color}20`; }}
                      maxLength={30}
                    />
                  </div>

                  {/* Earns XP */}
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-1 block">What earns XP</label>
                    <input
                      type="text"
                      value={definition.earnsXP}
                      onChange={(e) => updateOverride(key, "earnsXP", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 text-sm bg-white/80 text-stone-700 outline-none transition-colors"
                      style={{ borderColor: `${definition.color}20` }}
                      onFocus={(e) => { e.target.style.borderColor = definition.color; }}
                      onBlur={(e) => { e.target.style.borderColor = `${definition.color}20`; }}
                      maxLength={60}
                    />
                  </div>

                  {/* Color picker */}
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-2 block">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.color}
                          onClick={() => updateOverride(key, "color", preset.color)}
                          className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: preset.color,
                            boxShadow: definition.color === preset.color
                              ? `0 0 0 3px ${definition.backgroundColor}, 0 0 0 5px ${preset.color}`
                              : "none",
                          }}
                          title={preset.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Icon picker */}
                  <div>
                    <label className="text-xs font-semibold text-stone-500 mb-2 block">Icon</label>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {ICON_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => updateOverride(key, "iconKey", option.key)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                          style={{
                            backgroundColor: definition.iconKey === option.key
                              ? `${definition.color}20`
                              : "rgba(255,255,255,0.5)",
                            color: definition.iconKey === option.key
                              ? definition.color
                              : "#9CA3AF",
                            boxShadow: definition.iconKey === option.key
                              ? `0 0 0 2px ${definition.color}`
                              : "none",
                          }}
                          title={option.label}
                        >
                          <StatIcon iconKey={option.key} className="w-6 h-6" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset this stat */}
                  {hasOverride && (
                    <button
                      onClick={() => resetStat(key)}
                      className="flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-stone-500 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Reset to default
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section: Daily Habits */}
      <h2 className="text-lg font-bold text-stone-500 mt-12 mb-2">Daily Habits</h2>
      <p className="text-xs text-stone-400 mb-4">Choose which habits appear on your dashboard and calendar.</p>
      <div className="space-y-2">
        {ALL_HABITS.map((habit) => {
          const isEnabled = enabledHabits.includes(habit.key);
          return (
            <button
              key={habit.key}
              onClick={() => toggleHabit(habit.key)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
              style={{
                backgroundColor: isEnabled ? habit.enabledBackground : "#fafaf9",
                border: isEnabled ? `2px solid ${habit.color}30` : "2px solid #e7e5e4",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: isEnabled ? `${habit.color}20` : "#f5f5f4",
                }}
              >
                {habit.emoji}
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm" style={{ color: isEnabled ? habit.color : "#a8a29e" }}>
                  {habit.label}
                </div>
                <div className="text-xs" style={{ color: isEnabled ? `${habit.color}99` : "#d6d3d1" }}>
                  {habit.description}
                </div>
              </div>
              {/* Toggle switch */}
              <div
                className="w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                style={{ backgroundColor: isEnabled ? habit.color : "#d6d3d1" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm"
                  style={{ left: isEnabled ? "22px" : "2px" }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Section: Daily Damage */}
      <h2 className="text-lg font-bold text-stone-500 mt-12 mb-2">Daily Damage</h2>
      <p className="text-xs text-stone-400 mb-4">Choose which damage items appear on your dashboard.</p>
      <div className="space-y-2">
        {ALL_DAMAGE.map((damage) => {
          const isEnabled = enabledDamage.includes(damage.key);
          return (
            <button
              key={damage.key}
              onClick={() => toggleDamageItem(damage.key)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-200"
              style={{
                backgroundColor: isEnabled ? damage.enabledBackground : "#fafaf9",
                border: isEnabled ? `2px solid ${damage.color}30` : "2px solid #e7e5e4",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  backgroundColor: isEnabled ? `${damage.color}20` : "#f5f5f4",
                }}
              >
                {damage.emoji}
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm" style={{ color: isEnabled ? damage.color : "#a8a29e" }}>
                  {damage.label}
                </div>
                <div className="text-xs" style={{ color: isEnabled ? `${damage.color}99` : "#d6d3d1" }}>
                  {damage.description}
                </div>
              </div>
              {/* Toggle switch */}
              <div
                className="w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                style={{ backgroundColor: isEnabled ? damage.color : "#d6d3d1" }}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-200 shadow-sm"
                  style={{ left: isEnabled ? "22px" : "2px" }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Section: Danger Zone */}
      <h2 className="text-lg font-bold text-stone-500 mt-12 mb-2">Danger Zone</h2>
      <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-red-600">Reset All Data</h3>
            <p className="text-xs text-red-400 mt-0.5">
              Permanently erase all XP, levels, activities, and habits. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowResetDataConfirm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Trash2 size={14} />
            Reset Data
          </button>
        </div>
      </div>

      {/* Reset Data Confirmation Modal */}
      {showResetDataConfirm && (
        <ModalBackdrop onClose={() => setShowResetDataConfirm(false)} backdropStyle="dark">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-modalSlideUp">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-extrabold text-stone-700 mb-2">
                Are you absolutely sure?
              </h3>
              <p className="text-sm text-stone-500 mb-6">
                This will permanently delete <span className="font-bold text-red-500">all of your data</span> — every activity, XP point, level, streak, and habit log. You&apos;ll start completely fresh at Level 1. This cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowResetDataConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetAllData();
                    router.push("/");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all"
                >
                  Yes, wipe everything
                </button>
              </div>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </main>
  );
}
