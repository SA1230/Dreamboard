/**
 * SVG content registry for equippable items.
 *
 * Each entry is a raw SVG string (one or more <g>, <path>, <rect>, etc.)
 * designed in Skipper's coordinate space (viewBox "330 245 450 665").
 * The SkipperCharacter component inserts these at the correct z-order position.
 *
 * Thumbnail registry uses a standalone viewBox (0 0 64 64) for shop card icons.
 */

export const ITEM_SVG_REGISTRY: Record<string, string> = {
  // --- HEAD SLOT ---
  "leather-cap": `
    <g id="item-leather-cap">
      <!-- Cap body — taller dome with lighter brown for contrast on dark head -->
      <path d="M475,308 Q478,270 540,262 Q602,270 605,308 Q602,318 540,322 Q478,318 475,308 Z" fill="#A0896B" opacity="0.9"/>
      <!-- Lighter top panel -->
      <path d="M490,302 Q494,278 540,272 Q586,278 590,302 Q586,310 540,313 Q494,310 490,302 Z" fill="#B8A888" opacity="0.85"/>
      <!-- Brim — extends forward -->
      <path d="M466,314 Q472,308 540,305 Q608,308 614,314 Q610,326 540,330 Q470,326 466,314 Z" fill="#8B7355" opacity="0.92"/>
      <!-- Band detail -->
      <path d="M484,310 Q488,304 540,301 Q592,304 596,310" fill="none" stroke="#7A6548" stroke-width="3" opacity="0.55"/>
      <!-- Stitching accent -->
      <line x1="540" y1="266" x2="540" y2="300" stroke="#7A6548" stroke-width="1.5" opacity="0.3"/>
      <!-- Side brim curve details -->
      <path d="M476,316 Q478,320 484,322" fill="none" stroke="#7A6548" stroke-width="1.2" opacity="0.3"/>
      <path d="M604,316 Q602,320 596,322" fill="none" stroke="#7A6548" stroke-width="1.2" opacity="0.3"/>
    </g>
  `,
  "iron-helm": `
    <g id="item-iron-helm">
      <!-- Helmet dome -->
      <path d="M472,318 Q474,268 540,258 Q606,268 608,318 Q606,325 540,328 Q474,325 472,318 Z" fill="#6B7B8D" opacity="0.92"/>
      <!-- Metallic highlight band -->
      <path d="M490,310 Q492,275 540,268 Q588,275 590,310 Q588,315 540,317 Q492,315 490,310 Z" fill="#8B9DAF" opacity="0.7"/>
      <!-- Top ridge / crest -->
      <path d="M530,260 Q535,248 540,245 Q545,248 550,260" fill="none" stroke="#5B6B7D" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
      <!-- Nose guard -->
      <path d="M535,318 L533,340 Q537,345 543,345 Q547,340 545,318" fill="#6B7B8D" opacity="0.85"/>
      <!-- Cheek guards -->
      <path d="M478,318 L474,338 Q478,342 486,340 L490,320" fill="#5B6B7D" opacity="0.75"/>
      <path d="M602,318 L606,338 Q602,342 594,340 L590,320" fill="#5B6B7D" opacity="0.75"/>
      <!-- Shine spot -->
      <ellipse cx="515" cy="285" rx="10" ry="6" fill="#fff" opacity="0.2" transform="rotate(-15,515,285)"/>
    </g>
  `,

  // --- CHEST SLOT ---
  "cloth-tunic": `
    <g id="item-cloth-tunic">
      <!-- Tunic body — wider coverage of Skipper's belly -->
      <path d="M465,540 Q478,525 540,520 Q602,525 615,540 L610,660 Q585,672 540,676 Q495,672 470,660 Z" fill="#7B6B5B" opacity="0.72"/>
      <!-- Lighter inner panel (V-neck opening) -->
      <path d="M510,528 Q522,522 540,520 Q558,522 570,528 L562,562 Q550,556 540,555 Q530,556 518,562 Z" fill="#f5e5e4" opacity="0.4"/>
      <!-- Hem line -->
      <path d="M470,657 Q495,670 540,673 Q585,670 610,657" fill="none" stroke="#6B5B4B" stroke-width="2.5" opacity="0.5"/>
      <!-- Belt / waist cinch -->
      <path d="M472,598 Q498,592 540,590 Q582,592 608,598" fill="none" stroke="#6B5B4B" stroke-width="3.5" opacity="0.55"/>
      <!-- Center stitch -->
      <line x1="540" y1="562" x2="540" y2="655" stroke="#6B5B4B" stroke-width="1.2" opacity="0.25"/>
      <!-- Side stitching -->
      <line x1="478" y1="555" x2="474" y2="645" stroke="#6B5B4B" stroke-width="1" opacity="0.2"/>
      <line x1="602" y1="555" x2="606" y2="645" stroke="#6B5B4B" stroke-width="1" opacity="0.2"/>
    </g>
  `,
  "chain-mail": `
    <g id="item-chain-mail">
      <!-- Mail body — slightly wider than tunic for armor bulk -->
      <path d="M478,540 Q488,522 540,516 Q592,522 602,540 L598,655 Q578,668 540,672 Q502,668 482,655 Z" fill="#6B7B8D" opacity="0.7"/>
      <!-- Inner highlight -->
      <path d="M488,545 Q496,530 540,525 Q584,530 592,545 L590,648 Q572,658 540,662 Q508,658 490,648 Z" fill="#8B9DAF" opacity="0.45"/>
      <!-- Chain link rows — horizontal lines suggesting woven mail -->
      <path d="M492,555 Q520,550 540,549 Q560,550 588,555" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.45"/>
      <path d="M490,575 Q518,570 540,569 Q562,570 590,575" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.4"/>
      <path d="M489,595 Q516,590 540,589 Q564,590 591,595" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.4"/>
      <path d="M490,615 Q517,610 540,609 Q563,610 590,615" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.35"/>
      <path d="M491,635 Q518,630 540,629 Q562,630 589,635" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.3"/>
      <!-- Collar / neckline reinforcement -->
      <path d="M500,538 Q520,530 540,528 Q560,530 580,538" fill="none" stroke="#5B6B7D" stroke-width="3" opacity="0.5"/>
      <!-- Metallic shine -->
      <ellipse cx="525" cy="560" rx="12" ry="5" fill="#fff" opacity="0.12" transform="rotate(-8,525,560)"/>
    </g>
  `,

  // --- PRIMARY SLOT (right hand / a_arm) ---
  "wooden-sword": `
    <g id="item-wooden-sword" transform="rotate(-22, 370, 570)">
      <!-- Blade — wider tapered wooden shape -->
      <path d="M358,478 L353,530 L357,537 Q363,539 370,539 Q377,539 383,537 L387,530 L382,478 Q370,470 358,478 Z" fill="#A09070" opacity="0.88"/>
      <!-- Blade edge highlight -->
      <path d="M360,484 L355,528" fill="none" stroke="#B8A888" stroke-width="2" opacity="0.5"/>
      <!-- Blade center groove -->
      <path d="M370,480 L370,532" fill="none" stroke="#8B7B65" stroke-width="1" opacity="0.3"/>
      <!-- Cross-guard -->
      <path d="M348,537 Q352,530 370,529 Q388,530 392,537 Q388,544 370,544 Q352,544 348,537 Z" fill="#6B5538" opacity="0.9"/>
      <!-- Handle / grip -->
      <rect x="364" y="544" width="12" height="38" rx="3" fill="#8B7355" opacity="0.9"/>
      <!-- Handle wrap lines -->
      <line x1="364" y1="553" x2="376" y2="553" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
      <line x1="364" y1="562" x2="376" y2="562" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
      <line x1="364" y1="571" x2="376" y2="571" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
      <!-- Pommel -->
      <circle cx="370" cy="586" r="7" fill="#6B5538" opacity="0.85"/>
    </g>
  `,
  "crystal-staff": `
    <g id="item-crystal-staff" transform="rotate(-20, 370, 550)">
      <!-- Staff shaft — wooden pole -->
      <rect x="366" y="480" width="8" height="130" rx="3" fill="#5B4B3B" opacity="0.88"/>
      <!-- Shaft grain detail -->
      <line x1="368" y1="500" x2="368" y2="600" stroke="#4A3C2E" stroke-width="1" opacity="0.3"/>
      <!-- Crystal holder / prongs -->
      <path d="M362,485 Q365,473 370,470 Q375,473 378,485" fill="none" stroke="#5B4B3B" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
      <!-- Crystal orb — outer glow -->
      <circle cx="370" cy="465" r="16" fill="#8B6BA5" opacity="0.55"/>
      <!-- Crystal orb — inner bright -->
      <circle cx="370" cy="465" r="11" fill="#C4A8D8" opacity="0.7"/>
      <!-- Crystal core -->
      <circle cx="370" cy="463" r="5" fill="#E0D0F0" opacity="0.8"/>
      <!-- Crystal shine -->
      <circle cx="365" cy="460" r="3" fill="#fff" opacity="0.45"/>
      <!-- Staff tip -->
      <circle cx="370" cy="612" r="4" fill="#5B4B3B" opacity="0.7"/>
    </g>
  `,

  // --- SECONDARY SLOT (left hand / b_arm) ---
  "buckler-shield": `
    <g id="item-buckler-shield">
      <!-- Shield body — round with slight 3D feel -->
      <circle cx="710" cy="580" r="30" fill="#8B7355" opacity="0.82"/>
      <!-- Shield face — lighter inner area -->
      <circle cx="710" cy="580" r="24" fill="#A0896B" opacity="0.75"/>
      <!-- Rim detail -->
      <circle cx="710" cy="580" r="28" fill="none" stroke="#6B5538" stroke-width="2" opacity="0.5"/>
      <!-- Boss (center bump) -->
      <circle cx="710" cy="580" r="8" fill="#6B5538" opacity="0.8"/>
      <circle cx="710" cy="579" r="5" fill="#8B7355" opacity="0.7"/>
      <!-- Boss shine -->
      <circle cx="708" cy="577" r="2" fill="#fff" opacity="0.25"/>
      <!-- Decorative cross pattern -->
      <line x1="710" y1="558" x2="710" y2="572" stroke="#6B5538" stroke-width="1.5" opacity="0.4"/>
      <line x1="710" y1="588" x2="710" y2="602" stroke="#6B5538" stroke-width="1.5" opacity="0.4"/>
      <line x1="688" y1="580" x2="702" y2="580" stroke="#6B5538" stroke-width="1.5" opacity="0.4"/>
      <line x1="718" y1="580" x2="732" y2="580" stroke="#6B5538" stroke-width="1.5" opacity="0.4"/>
      <!-- Rivet dots around the rim -->
      <circle cx="710" cy="554" r="2" fill="#6B5538" opacity="0.5"/>
      <circle cx="734" cy="580" r="2" fill="#6B5538" opacity="0.5"/>
      <circle cx="710" cy="606" r="2" fill="#6B5538" opacity="0.5"/>
      <circle cx="686" cy="580" r="2" fill="#6B5538" opacity="0.5"/>
    </g>
  `,

  // --- FEET SLOT ---
  "wanderer-boots": `
    <g id="item-wanderer-boots">
      <!-- Left boot -->
      <path d="M430,850 Q435,835 460,832 Q485,835 488,850 L490,862 Q485,870 460,872 Q435,870 428,862 Z" fill="#5B4B3B" opacity="0.82"/>
      <!-- Left boot fold detail -->
      <path d="M440,842 Q450,838 460,837 Q470,838 480,842" fill="none" stroke="#4A3C2E" stroke-width="1.5" opacity="0.45"/>
      <!-- Left boot sole -->
      <path d="M428,862 Q435,870 460,872 Q485,870 490,862 Q488,868 460,870 Q432,868 428,862 Z" fill="#3c324c" opacity="0.5"/>
      <!-- Left boot lace/strap -->
      <line x1="455" y1="835" x2="465" y2="835" stroke="#6B5538" stroke-width="1.2" opacity="0.5"/>

      <!-- Right boot -->
      <path d="M580,845 Q585,830 610,827 Q635,830 640,845 L642,857 Q637,865 610,867 Q583,865 578,857 Z" fill="#5B4B3B" opacity="0.82"/>
      <!-- Right boot fold detail -->
      <path d="M590,837 Q600,833 610,832 Q620,833 630,837" fill="none" stroke="#4A3C2E" stroke-width="1.5" opacity="0.45"/>
      <!-- Right boot sole -->
      <path d="M578,857 Q583,865 610,867 Q637,865 642,857 Q640,863 610,865 Q580,863 578,857 Z" fill="#3c324c" opacity="0.5"/>
      <!-- Right boot lace/strap -->
      <line x1="605" y1="830" x2="615" y2="830" stroke="#6B5538" stroke-width="1.2" opacity="0.5"/>
    </g>
  `,
};


/**
 * Thumbnail SVG registry for shop card icons.
 * Each entry is a self-contained SVG inner content designed for viewBox "0 0 64 64".
 * Used by the shop page to show unique item previews instead of a generic icon.
 */
export const ITEM_THUMBNAIL_REGISTRY: Record<string, string> = {
  "leather-cap": `
    <!-- Leather cap icon -->
    <path d="M14,38 Q16,22 32,18 Q48,22 50,38 Q48,42 32,44 Q16,42 14,38 Z" fill="#8B7355"/>
    <path d="M19,36 Q20,25 32,22 Q44,25 45,36 Q44,38 32,40 Q20,38 19,36 Z" fill="#A0896B"/>
    <path d="M10,40 Q14,36 32,34 Q50,36 54,40 Q52,46 32,48 Q12,46 10,40 Z" fill="#7A6548"/>
    <path d="M20,37 Q25,34 32,33 Q39,34 44,37" fill="none" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
  `,
  "iron-helm": `
    <!-- Iron helmet icon -->
    <path d="M12,40 Q14,18 32,12 Q50,18 52,40 Q50,44 32,46 Q14,44 12,40 Z" fill="#6B7B8D"/>
    <path d="M18,38 Q20,22 32,17 Q44,22 46,38 Q44,41 32,42 Q20,41 18,38 Z" fill="#8B9DAF" opacity="0.7"/>
    <path d="M29,14 Q31,8 33,8 Q35,8 35,14" fill="none" stroke="#5B6B7D" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M28,44 L27,52 Q30,54 34,54 Q37,52 36,44" fill="#6B7B8D"/>
    <ellipse cx="26" cy="28" rx="5" ry="3" fill="#fff" opacity="0.2" transform="rotate(-15,26,28)"/>
  `,
  "cloth-tunic": `
    <!-- Cloth tunic icon -->
    <path d="M18,18 Q22,14 32,12 Q42,14 46,18 L44,52 Q38,56 32,56 Q26,56 20,52 Z" fill="#7B6B5B"/>
    <path d="M26,14 Q29,12 32,12 Q35,12 38,14 L36,26 Q34,24 32,24 Q30,24 28,26 Z" fill="#f5e5e4" opacity="0.5"/>
    <path d="M20,50 Q26,54 32,55 Q38,54 44,50" fill="none" stroke="#6B5B4B" stroke-width="1.2" opacity="0.5"/>
    <path d="M21,34 Q26,32 32,32 Q38,32 43,34" fill="none" stroke="#6B5B4B" stroke-width="1.5" opacity="0.5"/>
    <line x1="32" y1="26" x2="32" y2="50" stroke="#6B5B4B" stroke-width="0.8" opacity="0.25"/>
  `,
  "chain-mail": `
    <!-- Chain mail icon -->
    <path d="M16,16 Q20,10 32,8 Q44,10 48,16 L46,54 Q40,58 32,58 Q24,58 18,54 Z" fill="#6B7B8D"/>
    <path d="M20,18 Q24,13 32,11 Q40,13 44,18 L43,52 Q38,55 32,56 Q26,55 21,52 Z" fill="#8B9DAF" opacity="0.5"/>
    <path d="M22,24 Q27,22 32,22 Q37,22 42,24" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.5"/>
    <path d="M21,32 Q27,30 32,30 Q37,30 43,32" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.45"/>
    <path d="M21,40 Q27,38 32,38 Q37,38 43,40" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
    <path d="M22,48 Q27,46 32,46 Q37,46 42,48" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.35"/>
    <path d="M24,16 Q28,14 32,13 Q36,14 40,16" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.5"/>
  `,
  "wooden-sword": `
    <!-- Wooden sword icon -->
    <path d="M29,8 L27,32 L29,34 Q31,35 33,35 Q35,35 35,34 L37,32 L35,8 Q32,5 29,8 Z" fill="#A09070"/>
    <path d="M30,10 L28,30" fill="none" stroke="#B8A888" stroke-width="1" opacity="0.5"/>
    <path d="M22,34 Q26,31 32,31 Q38,31 42,34 Q38,37 32,37 Q26,37 22,34 Z" fill="#6B5538"/>
    <rect x="30" y="37" width="4" height="16" rx="1" fill="#8B7355"/>
    <line x1="30" y1="42" x2="34" y2="42" stroke="#6B5538" stroke-width="0.8" opacity="0.5"/>
    <line x1="30" y1="47" x2="34" y2="47" stroke="#6B5538" stroke-width="0.8" opacity="0.5"/>
    <circle cx="32" cy="56" r="3" fill="#6B5538"/>
  `,
  "crystal-staff": `
    <!-- Crystal staff icon — thicker shaft, larger orb -->
    <rect x="30" y="24" width="5" height="36" rx="2" fill="#5B4B3B"/>
    <path d="M26,28 Q29,19 32.5,16 Q36,19 39,28" fill="none" stroke="#5B4B3B" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32.5" cy="12" r="11" fill="#8B6BA5" opacity="0.6"/>
    <circle cx="32.5" cy="12" r="7.5" fill="#C4A8D8" opacity="0.75"/>
    <circle cx="32.5" cy="11" r="3.5" fill="#E0D0F0" opacity="0.85"/>
    <circle cx="30" cy="9" r="2" fill="#fff" opacity="0.5"/>
    <circle cx="32.5" cy="61" r="3" fill="#5B4B3B"/>
  `,
  "buckler-shield": `
    <!-- Buckler shield icon -->
    <circle cx="32" cy="32" r="22" fill="#8B7355"/>
    <circle cx="32" cy="32" r="18" fill="#A0896B"/>
    <circle cx="32" cy="32" r="20" fill="none" stroke="#6B5538" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="6" fill="#6B5538"/>
    <circle cx="32" cy="31" r="3.5" fill="#8B7355" opacity="0.8"/>
    <circle cx="31" cy="30" r="1.5" fill="#fff" opacity="0.25"/>
    <line x1="32" y1="14" x2="32" y2="26" stroke="#6B5538" stroke-width="1" opacity="0.4"/>
    <line x1="32" y1="38" x2="32" y2="50" stroke="#6B5538" stroke-width="1" opacity="0.4"/>
    <line x1="14" y1="32" x2="26" y2="32" stroke="#6B5538" stroke-width="1" opacity="0.4"/>
    <line x1="38" y1="32" x2="50" y2="32" stroke="#6B5538" stroke-width="1" opacity="0.4"/>
  `,
  "wanderer-boots": `
    <!-- Wanderer boots icon — taller with cuff and sole detail -->
    <path d="M6,34 Q8,20 20,17 Q32,20 34,34 L35,46 Q32,52 20,53 Q8,52 5,46 Z" fill="#5B4B3B"/>
    <path d="M9,22 Q14,18 20,17 Q26,18 31,22" fill="none" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
    <path d="M11,28 Q15,25 20,24 Q25,25 29,28" fill="none" stroke="#4A3C2E" stroke-width="1.2" opacity="0.4"/>
    <path d="M5,46 Q8,52 20,53 Q32,52 35,46 Q34,50 20,51 Q6,50 5,46 Z" fill="#3c324c" opacity="0.6"/>
    <path d="M30,32 Q32,18 44,15 Q56,18 58,32 L59,44 Q56,50 44,51 Q32,50 29,44 Z" fill="#5B4B3B"/>
    <path d="M33,20 Q38,16 44,15 Q50,16 55,20" fill="none" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
    <path d="M35,26 Q39,23 44,22 Q49,23 53,26" fill="none" stroke="#4A3C2E" stroke-width="1.2" opacity="0.4"/>
    <path d="M29,44 Q32,50 44,51 Q56,50 59,44 Q58,48 44,49 Q30,48 29,44 Z" fill="#3c324c" opacity="0.6"/>
  `,
};
