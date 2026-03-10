"use client";

interface OracleCharacterProps {
  /** Pixel size (width and height) — defaults to 80 */
  size?: number;
  /** CSS class name passed to the root <svg> element */
  className?: string;
  /** When true, eyes close peacefully (for loading/thinking states) */
  thinking?: boolean;
}

/**
 * Inline SVG character for the Oracle — a mystical owl.
 *
 * Hand-drawn in the same chunky style as SkipperCharacter.
 * Uses a purple-indigo palette with warm gold accents
 * to match the Vision Board's ethereal atmosphere.
 *
 * Rendering order (back to front):
 *   wings → body → belly → head → ear tufts → facial disk → eyes → brows → beak → feet → moon accent
 */
export function OracleCharacter({
  size = 80,
  className = "",
  thinking = false,
}: OracleCharacterProps) {
  return (
    <svg
      viewBox="0 0 200 275"
      width={size}
      height={size}
      className={className}
      style={{ filter: "drop-shadow(0 2px 6px rgba(74, 58, 106, 0.3))" }}
      aria-label="Oracle character"
      role="img"
    >
      {/* === Layer 1: Wings (outstretched, round, waving hello) === */}
      <g id="or-wings">
        {/* Left wing — outstretched with scalloped feather tips */}
        <path
          fill="#2a4a6a"
          d="M50,162 C30,155 8,168 4,190 C2,200 6,210 14,212 C22,214 30,208 34,198 C36,192 38,186 42,182 L50,170Z"
        />
        {/* Left wing feather scallops */}
        <path
          fill="#3a5a7a"
          d="M8,194 C10,186 16,182 22,184 C16,188 12,194 8,194Z M18,204 C20,196 26,192 32,194 C26,198 22,204 18,204Z"
        />
        {/* Left wing inner highlight */}
        <path
          fill="#4a6a8a"
          d="M42,168 C32,162 20,170 16,184 C20,178 28,170 42,168Z"
        />

        {/* Right wing — outstretched with scalloped feather tips */}
        <path
          fill="#2a4a6a"
          d="M150,162 C170,155 192,168 196,190 C198,200 194,210 186,212 C178,214 170,208 166,198 C164,192 162,186 158,182 L150,170Z"
        />
        {/* Right wing feather scallops */}
        <path
          fill="#3a5a7a"
          d="M192,194 C190,186 184,182 178,184 C184,188 188,194 192,194Z M182,204 C180,196 174,192 168,194 C174,198 178,204 182,204Z"
        />
        {/* Right wing inner highlight */}
        <path
          fill="#4a6a8a"
          d="M158,168 C168,162 180,170 184,184 C180,178 172,170 158,168Z"
        />
      </g>

      {/* === Layer 2: Body (squat round bean) === */}
      <path
        id="or-body"
        fill="#4a3a6a"
        d="M100,140 C54,142 30,180 38,226 C44,260 74,272 100,272 C126,272 156,260 162,226 C170,180 146,142 100,140Z"
      />

      {/* === Layer 3: Belly patch (big soft tummy) === */}
      <ellipse id="or-belly" cx="100" cy="214" rx="40" ry="42" fill="#ede6f6" />

      {/* Belly feather chevrons */}
      <g id="or-belly-marks" fill="none" stroke="#d5cbe8" strokeWidth="1.3" strokeLinecap="round">
        <path d="M86,198 L100,204 L114,198" />
        <path d="M84,214 L100,220 L116,214" />
        <path d="M86,230 L100,236 L114,230" />
      </g>

      {/* === Layer 4: Head (enormous — the whole personality) === */}
      <path
        id="or-head"
        fill="#4a3a6a"
        d="M100,4 C44,4 18,44 18,86 C18,130 48,152 100,152 C152,152 182,130 182,86 C182,44 156,4 100,4Z"
      />

      {/* === Layer 5: Ear tufts (soft round floofy puffs) === */}
      <g id="or-ears">
        <path fill="#4a3a6a" d="M44,30 C38,14 44,2 56,12 C60,16 54,26 48,34Z" />
        <path fill="#4a3a6a" d="M156,30 C162,14 156,2 144,12 C140,16 146,26 152,34Z" />
        {/* Inner tuft highlights */}
        <path fill="#5a4a7a" d="M46,28 C42,18 46,10 54,15 C56,18 52,26 48,32Z" />
        <path fill="#5a4a7a" d="M154,28 C158,18 154,10 146,15 C144,18 148,26 152,32Z" />
      </g>

      {/* === Layer 6: Facial disk (massive round face — nearly fills head) === */}
      <path
        id="or-face"
        fill="#ede6f6"
        d="M100,28 C52,28 30,56 30,90 C30,126 54,148 100,148 C146,148 170,126 170,90 C170,56 148,28 100,28Z"
      />

      {/* === Layer 7: Eyes (Puss in Boots level enormous) === */}
      {thinking ? (
        /* Closed eyes — blissful upward smile arcs */
        <g id="or-eyes-closed">
          <path
            d="M48,92 Q74,72 100,92"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M100,92 Q126,72 152,92"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      ) : (
        /* Open eyes — absolutely massive, dewy, sparkle-filled */
        <g id="or-eyes-open" className="oracle-eyes-blink">
          {/* Left eye */}
          <circle cx="72" cy="90" r="28" fill="#2a1f3d" />
          <circle cx="72" cy="90" r="22" fill="#d4a853" />
          <circle cx="72" cy="91" r="13" fill="#2a1f3d" />
          <circle cx="64" cy="80" r="8" fill="#fff" />
          <circle cx="80" cy="98" r="4" fill="#fff" />
          <circle cx="62" cy="96" r="2.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="78" cy="82" r="2" fill="rgba(255,255,255,0.4)" />
          {/* Right eye */}
          <circle cx="128" cy="90" r="28" fill="#2a1f3d" />
          <circle cx="128" cy="90" r="22" fill="#d4a853" />
          <circle cx="128" cy="91" r="13" fill="#2a1f3d" />
          <circle cx="120" cy="80" r="8" fill="#fff" />
          <circle cx="136" cy="98" r="4" fill="#fff" />
          <circle cx="118" cy="96" r="2.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="134" cy="82" r="2" fill="rgba(255,255,255,0.4)" />
        </g>
      )}

      {/* === Layer 8: Rosy cheeks (plump and warm) === */}
      <ellipse cx="44" cy="108" rx="16" ry="13" fill="#d4a0b0" opacity="0.4" />
      <ellipse cx="156" cy="108" rx="16" ry="13" fill="#d4a0b0" opacity="0.4" />

      {/* === Layer 9: Tiny star sparkles === */}
      <g id="or-sparkles" fill="#d4a853" opacity="0.55">
        <path d="M38,62 L40,57 L42,62 L47,60 L42,62 L40,67 L38,62 L33,60Z" />
        <path d="M160,66 L162,61 L164,66 L169,64 L164,66 L162,71 L160,66 L155,64Z" />
        <circle cx="34" cy="78" r="1.5" />
        <circle cx="168" cy="80" r="1.5" />
      </g>

      {/* === Layer 10: Beak (cute rounded diamond with highlight) === */}
      <path
        id="or-beak"
        fill="#d4a853"
        d="M100,118 C95,118 92,122 92,124 C92,127 95,131 100,134 C105,131 108,127 108,124 C108,122 105,118 100,118Z"
      />
      <ellipse cx="97" cy="122" rx="3.5" ry="2.5" fill="#e8c46e" opacity="0.55" />

      {/* === Layer 11: Feet (round little bean toes) === */}
      <g id="or-feet" fill="#d4a853">
        <ellipse cx="84" cy="268" rx="8" ry="4" />
        <ellipse cx="116" cy="268" rx="8" ry="4" />
        {/* Toe lines */}
        <line x1="80" y1="268" x2="80" y2="272" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
        <line x1="84" y1="268" x2="84" y2="273" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
        <line x1="88" y1="268" x2="88" y2="272" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
        <line x1="112" y1="268" x2="112" y2="272" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
        <line x1="116" y1="268" x2="116" y2="273" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
        <line x1="120" y1="268" x2="120" y2="272" stroke="#c49640" strokeWidth="1" strokeLinecap="round" />
      </g>

      {/* === Layer 12: Crescent moon accent (forehead) === */}
      <path
        id="or-moon"
        fill="#d4a853"
        opacity="0.7"
        d="M96,44 C91,35 96,26 104,28 C98,30 94,38 96,44Z"
      />
    </svg>
  );
}
