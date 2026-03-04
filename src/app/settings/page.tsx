"use client";

import { useState, useEffect } from "react";
import { GameData, StatKey, CustomStatOverride } from "@/lib/types";
import { STAT_DEFINITIONS, STAT_KEYS, COLOR_PRESETS, StatDefinition } from "@/lib/stats";
import { loadGameData, saveCustomDefinitions, getEffectiveDefinitions } from "@/lib/storage";
import { StatIcon, ICON_OPTIONS } from "@/components/StatIcons";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [overrides, setOverrides] = useState<Partial<Record<StatKey, CustomStatOverride>>>({});
  const [editingStat, setEditingStat] = useState<StatKey | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = loadGameData();
    setGameData(data);
    setOverrides(data.customDefinitions ?? {});
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
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: updated };
    });
    setSaved(false);
  }

  function resetStat(key: StatKey) {
    setOverrides((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
    setSaved(false);
  }

  function resetAll() {
    setOverrides({});
    setSaved(false);
  }

  function handleSave() {
    if (!gameData) return;
    const newData = saveCustomDefinitions(gameData, overrides);
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
          <h1 className="text-2xl font-extrabold text-stone-700">Customize Stats</h1>
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

      {/* Stat Editor Grid */}
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
    </main>
  );
}
