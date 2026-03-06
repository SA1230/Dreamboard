"use client";

interface ModalBackdropProps {
  /** Called when clicking the backdrop (outside the modal content). */
  onClose?: () => void;
  /** Alignment of the modal content. "center" (default) or "bottom" for bottom-sheet style. */
  align?: "center" | "bottom";
  /** Backdrop opacity variant. Default is "light". */
  backdropStyle?: "light" | "medium" | "dark";
  /** Whether to apply backdrop blur. Default true for "light", false otherwise. */
  blur?: boolean;
  /** Keyboard handler on the outer container (e.g. for Escape key). */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Extra className on the outer container. */
  className?: string;
  children: React.ReactNode;
}

const BACKDROP_CLASSES = {
  light: "bg-black/20",
  medium: "bg-black/30",
  dark: "bg-black/50",
} as const;

/**
 * Shared modal wrapper: fixed overlay + animated backdrop + positioned content.
 * The children should be the modal panel (with its own styling and animation).
 */
export function ModalBackdrop({
  onClose,
  align = "center",
  backdropStyle = "light",
  blur,
  onKeyDown,
  className,
  children,
}: ModalBackdropProps) {
  const shouldBlur = blur ?? backdropStyle === "light";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        align === "bottom" ? "items-end" : "items-center"
      } justify-center ${align === "center" ? "p-4" : ""} ${className ?? ""}`}
      onClick={onClose}
      onKeyDown={onKeyDown}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 ${BACKDROP_CLASSES[backdropStyle]} ${
          shouldBlur ? "backdrop-blur-sm" : ""
        } animate-fadeIn`}
      />

      {/* Content (stop propagation so clicking inside doesn't close) */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
