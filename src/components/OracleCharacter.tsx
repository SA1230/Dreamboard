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
      {/* === Layer 1: Wings (behind body) === */}
      <g id="or-wings">
        <path
          fill="#3d2f5c"
          d="M48,152 C28,165 20,198 28,228 C33,244 42,246 46,236 C50,222 48,188 50,160Z"
        />
        <path
          fill="#3d2f5c"
          d="M152,152 C172,165 180,198 172,228 C167,244 158,246 154,236 C150,222 152,188 150,160Z"
        />
        {/* Wing feather lines */}
        <path
          d="M36,195 C40,188 44,183 48,180"
          fill="none"
          stroke="#352850"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M32,210 C38,202 43,196 48,192"
          fill="none"
          stroke="#352850"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M164,195 C160,188 156,183 152,180"
          fill="none"
          stroke="#352850"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M168,210 C162,202 157,196 152,192"
          fill="none"
          stroke="#352850"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* === Layer 2: Body (plump egg shape) === */}
      <path
        id="or-body"
        fill="#4a3a6a"
        d="M100,120 C55,123 34,170 40,215 C46,252 74,262 100,262 C126,262 154,252 160,215 C166,170 145,123 100,120Z"
      />

      {/* === Layer 3: Belly patch === */}
      <ellipse id="or-belly" cx="100" cy="198" rx="33" ry="46" fill="#e8dff5" />

      {/* Belly feather chevrons */}
      <g id="or-belly-marks" fill="none" stroke="#c9bde0" strokeWidth="1.5" strokeLinecap="round">
        <path d="M87,176 L100,184 L113,176" />
        <path d="M85,193 L100,201 L115,193" />
        <path d="M87,210 L100,218 L113,210" />
      </g>

      {/* === Layer 4: Head (overlaps top of body) === */}
      <path
        id="or-head"
        fill="#4a3a6a"
        d="M100,28 C58,28 38,56 38,86 C38,118 58,134 100,134 C142,134 162,118 162,86 C162,56 142,28 100,28Z"
      />

      {/* === Layer 5: Ear tufts === */}
      <g id="or-ears">
        <path fill="#4a3a6a" d="M55,45 C50,22 55,4 66,14 C72,20 65,36 60,48Z" />
        <path fill="#4a3a6a" d="M145,45 C150,22 145,4 134,14 C128,20 135,36 140,48Z" />
        {/* Inner tuft highlights */}
        <path fill="#5a4a7a" d="M57,42 C54,28 58,12 64,18 C68,22 64,35 61,44Z" />
        <path fill="#5a4a7a" d="M143,42 C146,28 142,12 136,18 C132,22 136,35 139,44Z" />
      </g>

      {/* === Layer 6: Facial disk === */}
      <path
        id="or-face"
        fill="#e8dff5"
        d="M100,46 C66,46 50,65 50,90 C50,115 68,130 100,132 C132,130 150,115 150,90 C150,65 134,46 100,46Z"
      />

      {/* === Layer 7: Eyes === */}
      {thinking ? (
        /* Closed eyes — peaceful upward arcs */
        <g id="or-eyes-closed">
          <path
            d="M64,88 Q80,76 96,88"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M104,88 Q120,76 136,88"
            fill="none"
            stroke="#2a1f3d"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      ) : (
        /* Open eyes — full detail with amber irises */
        <g id="or-eyes-open" className="oracle-eyes-blink">
          {/* Left eye */}
          <circle cx="80" cy="88" r="16" fill="#2a1f3d" />
          <circle cx="80" cy="88" r="12.5" fill="#d4a853" />
          <circle cx="80" cy="88" r="7" fill="#2a1f3d" />
          <circle cx="77" cy="84" r="3.5" fill="#fff" />
          <circle cx="84" cy="92" r="1.5" fill="#fff" />
          {/* Right eye */}
          <circle cx="120" cy="88" r="16" fill="#2a1f3d" />
          <circle cx="120" cy="88" r="12.5" fill="#d4a853" />
          <circle cx="120" cy="88" r="7" fill="#2a1f3d" />
          <circle cx="117" cy="84" r="3.5" fill="#fff" />
          <circle cx="124" cy="92" r="1.5" fill="#fff" />
        </g>
      )}

      {/* === Layer 8: Brow marks === */}
      <g id="or-brows" fill="none" stroke="#4a3a6a" strokeWidth="2" strokeLinecap="round">
        <path d="M62,72 Q80,64 96,74" />
        <path d="M138,72 Q120,64 104,74" />
      </g>

      {/* === Layer 9: Beak === */}
      <path id="or-beak" fill="#d4a853" d="M94,104 Q100,118 106,104 Q100,108 94,104Z" />

      {/* === Layer 10: Feet === */}
      <g id="or-feet" fill="#d4a853">
        <path d="M82,254 L74,264 L78,262 L82,268 L86,262 L90,264 L86,254" />
        <path d="M118,254 L110,264 L114,262 L118,268 L122,262 L126,264 L122,254" />
      </g>

      {/* === Layer 11: Crescent moon accent (forehead) === */}
      <path
        id="or-moon"
        fill="#d4a853"
        opacity="0.55"
        d="M97,56 C94,49 97,42 103,44 C99,45 96,50 97,56Z"
      />
    </svg>
  );
}
