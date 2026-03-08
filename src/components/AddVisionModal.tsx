"use client";

import { useState, useRef } from "react";
import { ModalBackdrop } from "./ModalBackdrop";
import { X, Sparkles, ImagePlus, Upload, PenLine } from "lucide-react";

interface AddVisionModalProps {
  onClose: () => void;
  onSave: (rawText: string, weavedText: string, imageBase64?: string) => void;
}

type ModalState = "input" | "imagining" | "preview" | "error";

function compressImage(dataUrl: string, maxSize: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

export function AddVisionModal({ onClose, onSave }: AddVisionModalProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<ModalState>("input");
  const [weavedText, setWeavedText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmedText = text.trim();
  const canSubmit = trimmedText.length > 0 && trimmedText.length <= 280;

  const handleImagine = async () => {
    if (!canSubmit) return;
    setState("imagining");

    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "imagine",
          rawText: trimmedText,
        }),
      });

      if (!response.ok) {
        throw new Error("The Oracle is resting. Try again later.");
      }

      const result = await response.json();
      setWeavedText(result.weavedText);
      setImageBase64(result.imageBase64);
      setState("preview");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
      setState("error");
    }
  };

  const handleWeaveTextOnly = async () => {
    if (!canSubmit) return;
    setState("imagining");

    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weave",
          rawText: trimmedText,
        }),
      });

      if (!response.ok) {
        // If even text weaving fails, just save the raw text
        onSave(trimmedText, trimmedText);
        return;
      }

      const result = await response.json();
      onSave(trimmedText, result.weavedText);
    } catch {
      // Fallback: save raw text as-is
      onSave(trimmedText, trimmedText);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      setState("error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const compressed = await compressImage(dataUrl, 512, 0.8);
        setImageBase64(compressed);
        setWeavedText(trimmedText || "My vision");
        setState("preview");
      };
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage("Could not process the image.");
      setState("error");
    }
  };

  return (
    <ModalBackdrop onClose={onClose} align="bottom" backdropStyle="medium">
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-6 animate-modalSlideUp">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-stone-700">
            {state === "preview" ? "Your vision" : "New Vision"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Input state */}
        {(state === "input" || state === "error") && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What are you dreaming about?"
              className="w-full h-24 p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-700 placeholder:text-stone-400 resize-none focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
              maxLength={280}
              autoFocus
            />
            <div className="flex items-center justify-between mt-1 mb-3">
              <span className="text-xs text-stone-400">
                {trimmedText.length}/280
              </span>
              {state === "error" && (
                <span className="text-xs text-red-500">{errorMessage}</span>
              )}
            </div>

            {/* Primary actions */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleUpload}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-50 flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                Upload
              </button>
              <button
                onClick={handleImagine}
                disabled={!canSubmit}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles size={14} />
                Imagine it
              </button>
            </div>

            {/* Text-only fallback */}
            <button
              onClick={handleWeaveTextOnly}
              disabled={!canSubmit}
              className="w-full py-2.5 text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PenLine size={12} />
              Just pin the words
            </button>
          </>
        )}

        {/* Imagining state (loading) */}
        {state === "imagining" && (
          <div className="py-12 flex flex-col items-center gap-3">
            <ImagePlus size={28} className="text-purple-400 animate-oracleShimmer" />
            <p className="text-sm text-stone-400">The Oracle is imagining...</p>
            <p className="text-xs text-stone-300">This may take a moment</p>
          </div>
        )}

        {/* Preview state — show image */}
        {state === "preview" && imageBase64 && (
          <>
            <div className="mb-4 rounded-xl overflow-hidden border border-stone-200">
              <img
                src={imageBase64}
                alt={trimmedText || "Vision"}
                className="w-full aspect-square object-cover"
              />
            </div>

            {weavedText && weavedText !== trimmedText && (
              <p className="text-sm text-stone-500 italic mb-4 px-1 leading-relaxed">
                {weavedText}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setState("input");
                  setImageBase64(null);
                  setWeavedText("");
                }}
                className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold transition-colors hover:bg-stone-50"
              >
                Try again
              </button>
              <button
                onClick={() => onSave(trimmedText || "My vision", weavedText, imageBase64)}
                className="flex-1 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <ImagePlus size={14} />
                Pin it
              </button>
            </div>
          </>
        )}
      </div>
    </ModalBackdrop>
  );
}
