"use client";

import { useState, useRef, useEffect } from "react";
import { StatDefinition } from "@/lib/stats";
import { StatIcon } from "./StatIcons";

interface AddXPModalProps {
  definition: StatDefinition;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function AddXPModal({ definition, onConfirm, onCancel }: AddXPModalProps) {
  const [note, setNote] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Small delay so the modal animation finishes before focusing
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onConfirm(note.trim());
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onCancel();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-modalSlideUp">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ color: definition.color }}>
            <StatIcon iconKey={definition.iconKey} className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg" style={{ color: definition.color }}>
              +1 {definition.name}
            </h3>
            <p className="text-sm text-stone-400">{definition.earnsXP}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            placeholder="What did you do? (optional)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border-2 text-sm transition-colors duration-200 bg-stone-50 text-stone-700 placeholder:text-stone-300 outline-none"
            style={{
              borderColor: `${definition.color}30`,
            }}
            onFocus={(event) => {
              event.target.style.borderColor = definition.color;
            }}
            onBlur={(event) => {
              event.target.style.borderColor = `${definition.color}30`;
            }}
            maxLength={100}
          />

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 bg-stone-100 hover:bg-stone-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: definition.color }}
            >
              Log It!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
