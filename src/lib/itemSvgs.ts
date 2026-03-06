/**
 * SVG content registry for equippable items.
 *
 * Each entry is a raw SVG string (one or more <g>, <path>, <rect>, etc.)
 * designed in Skipper's coordinate space (viewBox "330 245 450 665").
 * The SkipperCharacter component inserts these at the correct z-order position.
 *
 * Phase 1: Colored placeholder shapes showing approximate item position/size.
 * These will be replaced with AI-generated art as items are designed.
 */

export const ITEM_SVG_REGISTRY: Record<string, string> = {
  // --- HEAD SLOT ---
  "leather-cap": `
    <g id="item-leather-cap">
      <ellipse cx="540" cy="310" rx="70" ry="25" fill="#8B7355" opacity="0.85"/>
      <ellipse cx="540" cy="305" rx="55" ry="20" fill="#A0896B" opacity="0.85"/>
      <ellipse cx="540" cy="300" rx="50" ry="15" fill="#B09878" opacity="0.7"/>
    </g>
  `,
  "iron-helm": `
    <g id="item-iron-helm">
      <ellipse cx="540" cy="310" rx="72" ry="28" fill="#6B7B8D" opacity="0.9"/>
      <ellipse cx="540" cy="300" rx="58" ry="22" fill="#8B9DAF" opacity="0.85"/>
      <rect x="500" y="275" width="80" height="12" rx="4" fill="#6B7B8D" opacity="0.7"/>
      <rect x="533" y="265" width="14" height="20" rx="3" fill="#8B9DAF" opacity="0.8"/>
    </g>
  `,

  // --- CHEST SLOT ---
  "cloth-tunic": `
    <g id="item-cloth-tunic">
      <path d="M480,540 Q540,520 600,540 L595,650 Q540,660 485,650 Z" fill="#7B6B5B" opacity="0.6"/>
      <path d="M490,545 Q540,530 590,545 L587,640 Q540,648 493,640 Z" fill="#8F7F6F" opacity="0.5"/>
    </g>
  `,
  "chain-mail": `
    <g id="item-chain-mail">
      <path d="M475,535 Q540,515 605,535 L600,660 Q540,672 480,660 Z" fill="#6B7B8D" opacity="0.65"/>
      <path d="M485,540 Q540,525 595,540 L592,650 Q540,660 488,650 Z" fill="#8B9DAF" opacity="0.5"/>
      <line x1="490" y1="560" x2="590" y2="560" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
      <line x1="490" y1="580" x2="590" y2="580" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
      <line x1="490" y1="600" x2="590" y2="600" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
      <line x1="490" y1="620" x2="590" y2="620" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
    </g>
  `,

  // --- PRIMARY SLOT (right hand / a_arm) ---
  "wooden-sword": `
    <g id="item-wooden-sword">
      <rect x="365" y="540" width="8" height="80" rx="2" fill="#8B7355" opacity="0.85" transform="rotate(-25, 369, 580)"/>
      <rect x="358" y="540" width="22" height="6" rx="2" fill="#6B5B45" opacity="0.8" transform="rotate(-25, 369, 543)"/>
      <rect x="363" y="530" width="12" height="16" rx="1" fill="#A09070" opacity="0.7" transform="rotate(-25, 369, 538)"/>
    </g>
  `,
  "crystal-staff": `
    <g id="item-crystal-staff">
      <rect x="367" y="490" width="6" height="120" rx="2" fill="#5B4B3B" opacity="0.85" transform="rotate(-20, 370, 550)"/>
      <circle cx="370" cy="490" r="12" fill="#8B6BA5" opacity="0.7" transform="rotate(-20, 370, 550)"/>
      <circle cx="370" cy="490" r="7" fill="#C4A8D8" opacity="0.6" transform="rotate(-20, 370, 550)"/>
    </g>
  `,

  // --- SECONDARY SLOT (left hand / b_arm) ---
  "buckler-shield": `
    <g id="item-buckler-shield">
      <circle cx="710" cy="580" r="28" fill="#8B7355" opacity="0.75"/>
      <circle cx="710" cy="580" r="20" fill="#A0896B" opacity="0.6"/>
      <circle cx="710" cy="580" r="6" fill="#6B5B45" opacity="0.7"/>
    </g>
  `,

  // --- FEET SLOT ---
  "wanderer-boots": `
    <g id="item-wanderer-boots">
      <ellipse cx="460" cy="860" rx="38" ry="14" fill="#5B4B3B" opacity="0.7"/>
      <ellipse cx="610" cy="855" rx="35" ry="13" fill="#5B4B3B" opacity="0.7"/>
    </g>
  `,
};
