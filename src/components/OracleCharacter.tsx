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
      {/* === Layer 1: Wings (tiny nubs — maximum cute) === */}
      <g id="or-wings">
        <path
          fill="#3d2f5c"
          d="M52,165 C38,174 32,196 36,214 C39,224 44,225 46,218 C48,210 50,190 52,170Z"
        />
        <path
          fill="#3d2f5c"
          d="M148,165 C162,174 168,196 164,214 C161,224 156,225 154,218 C152,210 150,190 148,170Z"
        />
      </g>

      {/* === Layer 2: Body (round dumpling shape) === */}
      <path
        id="or-body"
        fill="#4a3a6a"
        d="M100,132 C56,134 34,176 40,222 C46,256 74,268 100,268 C126,268 154,256 160,222 C166,176 144,134 100,132Z"
      />

      {/* === Layer 3: Belly patch (big round tummy) === */}
      <ellipse id="or-belly" cx="100" cy="208" rx="38" ry="44" fill="#ede6f6" />

      {/* Belly feather chevrons */}
      <g id="or-belly-marks" fill="none" stroke="#d5cbe8" strokeWidth="1.5" strokeLinecap="round">
        <path d="M86,192 L100,198 L114,192" />
        <path d="M84,208 L100,214 L116,208" />
        <path d="M86,224 L100,230 L114,224" />
      </g>

      {/* === Layer 4: Head (huge — dominates the silhouette) === */}
      <path
        id="or-head"
        fill="#4a3a6a"
        d="M100,10 C48,10 24,46 24,84 C24,124 50,144 100,144 C150,144 176,124 176,84 C176,46 152,10 100,10Z"
      />

      {/* === Layer 5: Ear tufts (tiny fluffy puffs) === */}
      <g id="or-ears">
        <path fill="#4a3a6a" d="M48,34 C44,18 48,6 58,14 C62,18 58,30 52,38Z" />
        <path fill="#4a3a6a" d="M152,34 C156,18 152,6 142,14 C138,18 142,30 148,38Z" />
        {/* Inner tuft highlights */}
        <path fill="#5a4a7a" d="M50,32 C47,22 50,12 56,17 C59,20 56,28 52,34Z" />
        <path fill="#5a4a7a" d="M150,32 C153,22 150,12 144,17 C141,20 144,28 148,34Z" />
      </g>

      {/* === Layer 6: Facial disk (huge round face) === */}
      <path
        id="or-face"
        fill="#ede6f6"
        d="M100,34 C56,34 36,58 36,90 C36,122 58,142 100,142 C142,142 164,122 164,90 C164,58 144,34 100,34Z"
      />

      {/* === Layer 7: Eyes (huge saucer eyes — maximum sparkle) === */}
      {thinking ? (
        /* Closed eyes — happy smile arcs */
        <g id="or-eyes-closed">
          <path
            d="M54,92 Q76,76 98,92"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M102,92 Q124,76 146,92"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ) : (
        /* Open eyes — massive with lots of sparkle */
        <g id="or-eyes-open" className="oracle-eyes-blink">
          {/* Left eye */}
          <circle cx="76" cy="90" r="24" fill="#2a1f3d" />
          <circle cx="76" cy="90" r="19" fill="#d4a853" />
          <circle cx="76" cy="90" r="11" fill="#2a1f3d" />
          <circle cx="70" cy="82" r="6.5" fill="#fff" />
          <circle cx="83" cy="96" r="3.5" fill="#fff" />
          <circle cx="68" cy="94" r="2" fill="rgba(255,255,255,0.5)" />
          {/* Right eye */}
          <circle cx="124" cy="90" r="24" fill="#2a1f3d" />
          <circle cx="124" cy="90" r="19" fill="#d4a853" />
          <circle cx="124" cy="90" r="11" fill="#2a1f3d" />
          <circle cx="118" cy="82" r="6.5" fill="#fff" />
          <circle cx="131" cy="96" r="3.5" fill="#fff" />
          <circle cx="116" cy="94" r="2" fill="rgba(255,255,255,0.5)" />
        </g>
      )}

      {/* === Layer 8: Rosy cheeks (bigger, warmer) === */}
      <circle cx="52" cy="106" r="14" fill="#d4a0b0" opacity="0.35" />
      <circle cx="148" cy="106" r="14" fill="#d4a0b0" opacity="0.35" />

      {/* === Layer 9: Tiny star sparkles near eyes === */}
      <g id="or-sparkles" fill="#d4a853" opacity="0.5">
        <path d="M46,68 L48,64 L50,68 L54,66 L50,68 L48,72 L46,68 L42,66Z" />
        <path d="M152,72 L154,68 L156,72 L160,70 L156,72 L154,76 L152,72 L148,70Z" />
      </g>

      {/* === Layer 10: Beak (cute rounded diamond — sits between cheeks) === */}
      <path
        id="or-beak"
        fill="#d4a853"
        d="M100,114 C94,114 90,119 90,122 C90,125 94,130 100,134 C106,130 110,125 110,122 C110,119 106,114 100,114Z"
      />
      {/* Beak highlight — catches the light on the upper-left */}
      <ellipse cx="97" cy="119" rx="4" ry="3" fill="#e8c46e" opacity="0.55" />

      {/* === Layer 11: Feet (stubby little beans) === */}
      <g id="or-feet" fill="#d4a853">
        <path d="M84,260 L78,268 L82,266 L86,272 L90,266 L94,268 L90,260" />
        <path d="M110,260 L104,268 L108,266 L112,272 L116,266 L120,268 L116,260" />
      </g>

      {/* === Layer 12: Crescent moon accent (forehead) === */}
      <path
        id="or-moon"
        fill="#d4a853"
        opacity="0.65"
        d="M96,48 C92,40 96,32 103,34 C98,36 95,42 96,48Z"
      />
    </svg>
  );
}
