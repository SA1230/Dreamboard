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

  // --- LEGS SLOT ---
  "cloth-pants": `
    <g id="item-cloth-pants">
      <!-- Pant body — starts below chest armor hem (~y:690) -->
      <path d="M476,695 Q500,689 540,687 Q580,689 604,695 L612,820 Q590,838 540,842 Q490,838 468,820 Z" fill="#7B6B5B" opacity="0.7"/>
      <!-- Waistband -->
      <path d="M478,697 Q502,690 540,688 Q578,690 602,697" fill="none" stroke="#6B5B4B" stroke-width="3.5" opacity="0.55"/>
      <!-- Center seam -->
      <line x1="540" y1="700" x2="540" y2="830" stroke="#6B5B4B" stroke-width="1.2" opacity="0.25"/>
      <!-- Knee wrinkle details -->
      <path d="M488,762 Q503,757 518,760" fill="none" stroke="#6B5B4B" stroke-width="1.5" opacity="0.3"/>
      <path d="M562,760 Q577,757 592,762" fill="none" stroke="#6B5B4B" stroke-width="1.5" opacity="0.3"/>
      <!-- Hem -->
      <path d="M470,818 Q492,836 540,840 Q588,836 610,818" fill="none" stroke="#6B5B4B" stroke-width="2.5" opacity="0.45"/>
      <!-- Side stitching -->
      <line x1="480" y1="702" x2="472" y2="816" stroke="#6B5B4B" stroke-width="1" opacity="0.2"/>
      <line x1="600" y1="702" x2="608" y2="816" stroke="#6B5B4B" stroke-width="1" opacity="0.2"/>
    </g>
  `,
  "plate-greaves": `
    <g id="item-plate-greaves">
      <!-- Greave body — starts below chest armor hem (~y:690) -->
      <path d="M480,695 Q502,687 540,685 Q578,687 600,695 L608,815 Q586,833 540,838 Q494,833 472,815 Z" fill="#6B7B8D" opacity="0.72"/>
      <!-- Inner highlight -->
      <path d="M488,700 Q508,693 540,691 Q572,693 592,700 L588,808 Q570,823 540,828 Q510,823 492,808 Z" fill="#8B9DAF" opacity="0.4"/>
      <!-- Horizontal plate segments -->
      <path d="M486,722 Q512,716 540,714 Q568,716 594,722" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.45"/>
      <path d="M482,750 Q510,744 540,742 Q570,744 598,750" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.4"/>
      <path d="M478,778 Q508,772 540,770 Q572,772 602,778" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.35"/>
      <!-- Knee guards -->
      <ellipse cx="504" cy="760" rx="16" ry="12" fill="#5B6B7D" opacity="0.5"/>
      <ellipse cx="576" cy="760" rx="16" ry="12" fill="#5B6B7D" opacity="0.5"/>
      <!-- Knee rivets -->
      <circle cx="504" cy="760" r="3" fill="#8B9DAF" opacity="0.6"/>
      <circle cx="576" cy="760" r="3" fill="#8B9DAF" opacity="0.6"/>
      <!-- Metallic shine -->
      <ellipse cx="522" cy="712" rx="12" ry="5" fill="#fff" opacity="0.12" transform="rotate(-8,522,712)"/>
    </g>
  `,

  // --- HANDS SLOT ---
  "leather-gloves": `
    <g id="item-leather-gloves">
      <!-- Right glove (on a_arm tip ~348,655) -->
      <path d="M330,635 Q340,625 360,620 Q380,625 390,635 L393,660 Q383,672 360,675 Q337,672 327,660 Z" fill="#8B7355" opacity="0.78"/>
      <!-- Right glove cuff -->
      <path d="M337,632 Q345,624 360,621 Q375,624 383,632" fill="none" stroke="#6B5538" stroke-width="2" opacity="0.45"/>
      <!-- Right glove stitching -->
      <path d="M333,648 Q345,643 360,641 Q375,643 387,648" fill="none" stroke="#7A6548" stroke-width="1.2" opacity="0.35"/>

      <!-- Left glove (on b_arm tip ~759,652) -->
      <path d="M721,628 Q733,618 750,614 Q767,618 777,628 L779,653 Q770,666 750,668 Q730,666 719,653 Z" fill="#8B7355" opacity="0.78"/>
      <!-- Left glove cuff -->
      <path d="M727,625 Q737,617 750,614 Q763,617 773,625" fill="none" stroke="#6B5538" stroke-width="2" opacity="0.45"/>
      <!-- Left glove stitching -->
      <path d="M723,642 Q735,637 750,635 Q765,637 775,642" fill="none" stroke="#7A6548" stroke-width="1.2" opacity="0.35"/>
    </g>
  `,
  "iron-gauntlets": `
    <g id="item-iron-gauntlets">
      <!-- Right gauntlet (on a_arm tip ~348,655) -->
      <path d="M327,632 Q339,620 360,616 Q381,620 393,632 L397,662 Q385,676 360,678 Q335,676 323,662 Z" fill="#6B7B8D" opacity="0.8"/>
      <!-- Right gauntlet cuff -->
      <path d="M333,630 Q343,622 360,618 Q377,622 387,630" fill="none" stroke="#5B6B7D" stroke-width="2.5" opacity="0.5"/>
      <!-- Plate segments -->
      <path d="M331,645 Q343,640 360,638 Q377,640 389,645" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.4"/>
      <path d="M329,658 Q343,653 360,651 Q377,653 391,658" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.35"/>
      <!-- Rivet -->
      <circle cx="360" cy="635" r="3" fill="#8B9DAF" opacity="0.5"/>
      <!-- Shine -->
      <ellipse cx="350" cy="638" rx="6" ry="3" fill="#fff" opacity="0.15" transform="rotate(-10,350,638)"/>

      <!-- Left gauntlet (on b_arm tip ~759,652) -->
      <path d="M717,625 Q731,614 750,610 Q769,614 783,625 L787,655 Q773,670 750,672 Q727,670 713,655 Z" fill="#6B7B8D" opacity="0.8"/>
      <!-- Left gauntlet cuff -->
      <path d="M723,623 Q735,615 750,611 Q765,615 777,623" fill="none" stroke="#5B6B7D" stroke-width="2.5" opacity="0.5"/>
      <!-- Plate segments -->
      <path d="M719,638 Q733,633 750,631 Q767,633 781,638" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.4"/>
      <path d="M715,651 Q733,646 750,644 Q767,646 785,651" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.35"/>
      <!-- Rivet -->
      <circle cx="750" cy="628" r="3" fill="#8B9DAF" opacity="0.5"/>
      <!-- Shine -->
      <ellipse cx="740" cy="631" rx="6" ry="3" fill="#fff" opacity="0.15" transform="rotate(-10,740,631)"/>
    </g>
  `,

  // --- ROBE SLOT ---
  "wanderer-robe": `
    <g id="item-wanderer-robe">
      <!-- Robe body — full length from shoulders to ankles -->
      <path d="M460,530 Q480,518 540,514 Q600,518 620,530 L628,800 Q598,822 540,828 Q482,822 452,800 Z" fill="#5B4B5D" opacity="0.75"/>
      <!-- Inner panel — lighter front -->
      <path d="M500,524 Q520,518 540,516 Q560,518 580,524 L576,790 Q558,802 540,805 Q522,802 504,790 Z" fill="#7B6B7D" opacity="0.5"/>
      <!-- Collar opening -->
      <path d="M490,534 Q515,524 540,522 Q565,524 590,534" fill="none" stroke="#4A3C4E" stroke-width="3" opacity="0.6"/>
      <!-- Belt/sash at waist -->
      <path d="M458,600 Q495,590 540,588 Q585,590 622,600" fill="none" stroke="#8B6BA5" stroke-width="4" opacity="0.6"/>
      <!-- Belt clasp -->
      <circle cx="540" cy="594" r="5" fill="#C4A8D8" opacity="0.7"/>
      <!-- Center front opening line -->
      <line x1="540" y1="540" x2="540" y2="810" stroke="#4A3C4E" stroke-width="1.5" opacity="0.3"/>
      <!-- Hem embroidery -->
      <path d="M456,796 Q482,818 540,824 Q598,818 624,796" fill="none" stroke="#8B6BA5" stroke-width="2.5" opacity="0.45"/>
      <path d="M462,786 Q486,806 540,812 Q594,806 618,786" fill="none" stroke="#C4A8D8" stroke-width="1" opacity="0.25"/>
      <!-- Side draping lines -->
      <path d="M466,545 Q460,650 454,795" fill="none" stroke="#4A3C4E" stroke-width="1.2" opacity="0.25"/>
      <path d="M614,545 Q620,650 626,795" fill="none" stroke="#4A3C4E" stroke-width="1.2" opacity="0.25"/>
      <!-- Subtle fabric folds -->
      <path d="M490,650 Q510,645 530,648" fill="none" stroke="#4A3C4E" stroke-width="1" opacity="0.2"/>
      <path d="M550,648 Q570,645 590,650" fill="none" stroke="#4A3C4E" stroke-width="1" opacity="0.2"/>
    </g>
  `,

  // --- REWARD: HANDS SLOT (Lv 2) ---
  "adventurer-band": `
    <g id="item-adventurer-band">
      <!-- Right wrist band (a_arm tip ~348,655) -->
      <path d="M336,638 Q348,630 360,628 Q372,630 384,638 L386,652 Q374,658 360,660 Q346,658 334,652 Z" fill="#A0896B" opacity="0.75"/>
      <!-- Right band stitching -->
      <path d="M340,644 Q350,640 360,639 Q370,640 380,644" fill="none" stroke="#7A6548" stroke-width="1.5" opacity="0.45"/>
      <!-- Right band buckle -->
      <rect x="356" y="632" width="8" height="5" rx="1" fill="#8B7355" opacity="0.7"/>

      <!-- Left wrist band (b_arm tip ~759,652) -->
      <path d="M726,631 Q740,623 750,621 Q760,623 774,631 L776,645 Q764,651 750,653 Q736,651 724,645 Z" fill="#A0896B" opacity="0.75"/>
      <!-- Left band stitching -->
      <path d="M730,637 Q740,633 750,632 Q760,633 770,637" fill="none" stroke="#7A6548" stroke-width="1.5" opacity="0.45"/>
      <!-- Left band buckle -->
      <rect x="746" y="625" width="8" height="5" rx="1" fill="#8B7355" opacity="0.7"/>
    </g>
  `,

  // --- REWARD: PRIMARY SLOT (Lv 5) ---
  "pathfinder-blade": `
    <g id="item-pathfinder-blade" transform="rotate(-22, 370, 570)">
      <!-- Blade — iron short sword -->
      <path d="M362,468 L358,530 L362,538 Q366,540 370,540 Q374,540 378,538 L382,530 L378,468 Q370,462 362,468 Z" fill="#8B9DAF" opacity="0.88"/>
      <!-- Blade edge highlight -->
      <path d="M364,474 L360,528" fill="none" stroke="#A8B8C8" stroke-width="1.5" opacity="0.5"/>
      <!-- Blade center fuller -->
      <path d="M370,472 L370,530" fill="none" stroke="#6B7B8D" stroke-width="1.5" opacity="0.35"/>
      <!-- Cross-guard — iron -->
      <path d="M350,538 Q356,532 370,530 Q384,532 390,538 Q384,544 370,545 Q356,544 350,538 Z" fill="#5B6B7D" opacity="0.9"/>
      <!-- Handle -->
      <rect x="365" y="544" width="10" height="34" rx="2" fill="#6B5538" opacity="0.9"/>
      <!-- Handle wrap -->
      <line x1="365" y1="552" x2="375" y2="552" stroke="#8B7355" stroke-width="1.5" opacity="0.5"/>
      <line x1="365" y1="560" x2="375" y2="560" stroke="#8B7355" stroke-width="1.5" opacity="0.5"/>
      <line x1="365" y1="568" x2="375" y2="568" stroke="#8B7355" stroke-width="1.5" opacity="0.5"/>
      <!-- Pommel -->
      <circle cx="370" cy="582" r="6" fill="#5B6B7D" opacity="0.85"/>
    </g>
  `,

  // --- REWARD: HEAD SLOT (Lv 8) ---
  "seeker-hood": `
    <g id="item-seeker-hood">
      <!-- Hood body — cloth draping over head -->
      <path d="M470,318 Q475,260 540,248 Q605,260 610,318 Q605,332 540,338 Q475,332 470,318 Z" fill="#5B6B5B" opacity="0.85"/>
      <!-- Hood lighter inner panel -->
      <path d="M488,310 Q492,272 540,264 Q588,272 592,310 Q588,318 540,322 Q492,318 488,310 Z" fill="#7B8B7B" opacity="0.65"/>
      <!-- Hood peak -->
      <path d="M530,252 Q535,238 540,234 Q545,238 550,252" fill="#5B6B5B" stroke="#4A5A4A" stroke-width="1.5" opacity="0.85"/>
      <!-- Cloth folds -->
      <path d="M480,306 Q500,300 520,302" fill="none" stroke="#4A5A4A" stroke-width="1.5" opacity="0.3"/>
      <path d="M560,302 Q580,300 600,306" fill="none" stroke="#4A5A4A" stroke-width="1.5" opacity="0.3"/>
      <!-- Chin drape -->
      <path d="M494,330 Q510,336 540,338 Q570,336 586,330" fill="none" stroke="#4A5A4A" stroke-width="2" opacity="0.35"/>
    </g>
  `,

  // --- REWARD: LEGS SLOT (Lv 12) ---
  "guardian-greaves": `
    <g id="item-guardian-greaves">
      <!-- Greave body — steel plated leg armor -->
      <path d="M478,695 Q500,686 540,684 Q580,686 602,695 L610,818 Q588,836 540,840 Q492,836 470,818 Z" fill="#6B7B8D" opacity="0.74"/>
      <!-- Inner highlight -->
      <path d="M486,700 Q506,692 540,690 Q574,692 594,700 L590,810 Q572,825 540,830 Q508,825 490,810 Z" fill="#8B9DAF" opacity="0.42"/>
      <!-- Plate segment lines -->
      <path d="M484,720 Q510,714 540,712 Q570,714 596,720" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.5"/>
      <path d="M480,748 Q508,742 540,740 Q572,742 600,748" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.42"/>
      <path d="M476,776 Q506,770 540,768 Q574,770 604,776" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.38"/>
      <!-- Knee guards — larger, more ornate -->
      <ellipse cx="506" cy="758" rx="18" ry="14" fill="#5B6B7D" opacity="0.55"/>
      <ellipse cx="574" cy="758" rx="18" ry="14" fill="#5B6B7D" opacity="0.55"/>
      <!-- Knee rivets with highlights -->
      <circle cx="506" cy="758" r="4" fill="#8B9DAF" opacity="0.65"/>
      <circle cx="574" cy="758" r="4" fill="#8B9DAF" opacity="0.65"/>
      <circle cx="504" cy="756" r="1.5" fill="#fff" opacity="0.2"/>
      <circle cx="572" cy="756" r="1.5" fill="#fff" opacity="0.2"/>
      <!-- Metallic shine -->
      <ellipse cx="520" cy="710" rx="14" ry="5" fill="#fff" opacity="0.12" transform="rotate(-8,520,710)"/>
    </g>
  `,

  // --- REWARD: SECONDARY SLOT (Lv 16) ---
  "mentor-shield": `
    <g id="item-mentor-shield">
      <!-- Shield body — larger kite shield shape -->
      <path d="M680,555 Q690,540 710,535 Q730,540 740,555 L735,615 Q722,630 710,635 Q698,630 685,615 Z" fill="#6B5538" opacity="0.84"/>
      <!-- Shield face — lighter oak inner -->
      <path d="M685,558 Q694,545 710,540 Q726,545 735,558 L731,610 Q720,624 710,628 Q700,624 689,610 Z" fill="#A0896B" opacity="0.72"/>
      <!-- Rim detail -->
      <path d="M682,556 Q692,542 710,537 Q728,542 738,556 L733,614 Q721,628 710,633 Q699,628 687,614 Z" fill="none" stroke="#5B4530" stroke-width="2" opacity="0.5"/>
      <!-- Cross emblem -->
      <line x1="710" y1="555" x2="710" y2="600" stroke="#5B4530" stroke-width="3" opacity="0.45"/>
      <line x1="694" y1="575" x2="726" y2="575" stroke="#5B4530" stroke-width="3" opacity="0.45"/>
      <!-- Boss center -->
      <circle cx="710" cy="575" r="6" fill="#5B4530" opacity="0.7"/>
      <circle cx="710" cy="574" r="3.5" fill="#8B7355" opacity="0.6"/>
      <!-- Corner rivets -->
      <circle cx="710" cy="548" r="2" fill="#5B4530" opacity="0.5"/>
      <circle cx="695" cy="565" r="2" fill="#5B4530" opacity="0.5"/>
      <circle cx="725" cy="565" r="2" fill="#5B4530" opacity="0.5"/>
      <!-- Wood grain hint -->
      <path d="M698,560 Q704,558 710,560 Q716,562 722,560" fill="none" stroke="#7A6548" stroke-width="0.8" opacity="0.25"/>
      <path d="M696,590 Q703,588 710,590 Q717,592 724,590" fill="none" stroke="#7A6548" stroke-width="0.8" opacity="0.25"/>
    </g>
  `,

  // --- REWARD: CHEST SLOT (Lv 20) ---
  "wayfarer-vestment": `
    <g id="item-wayfarer-vestment">
      <!-- Vestment body — enchanted linen tunic -->
      <path d="M462,536 Q476,522 540,518 Q604,522 618,536 L614,665 Q588,678 540,682 Q492,678 466,665 Z" fill="#6B6B4B" opacity="0.72"/>
      <!-- Inner lighter panel -->
      <path d="M506,524 Q520,518 540,516 Q560,518 574,524 L568,560 Q554,552 540,550 Q526,552 512,560 Z" fill="#E8DEC8" opacity="0.4"/>
      <!-- Enchanted thread lines — golden shimmer hints -->
      <path d="M470,560 Q505,554 540,552 Q575,554 610,560" fill="none" stroke="#C4A060" stroke-width="1.5" opacity="0.3"/>
      <path d="M468,590 Q503,584 540,582 Q577,584 612,590" fill="none" stroke="#C4A060" stroke-width="1" opacity="0.25"/>
      <path d="M466,620 Q501,614 540,612 Q579,614 614,620" fill="none" stroke="#C4A060" stroke-width="1" opacity="0.2"/>
      <!-- Belt / sash -->
      <path d="M466,598 Q498,590 540,588 Q582,590 614,598" fill="none" stroke="#8B7B4B" stroke-width="3.5" opacity="0.55"/>
      <!-- Belt clasp -->
      <circle cx="540" cy="593" r="4" fill="#C4A060" opacity="0.6"/>
      <!-- Hem -->
      <path d="M468,662 Q492,676 540,680 Q588,676 612,662" fill="none" stroke="#8B7B4B" stroke-width="2.5" opacity="0.45"/>
      <!-- Center stitch -->
      <line x1="540" y1="560" x2="540" y2="660" stroke="#8B7B4B" stroke-width="1" opacity="0.22"/>
    </g>
  `,

  // --- REWARD: ROBE SLOT (Lv 25) ---
  "dreamer-cloak": `
    <g id="item-dreamer-cloak">
      <!-- Cloak body — full flowing robe, dreamweave silk -->
      <path d="M456,526 Q476,514 540,510 Q604,514 624,526 L632,808 Q600,830 540,836 Q480,830 448,808 Z" fill="#3B4B6B" opacity="0.78"/>
      <!-- Inner panel — starlit shimmer -->
      <path d="M496,520 Q516,514 540,512 Q564,514 584,520 L580,798 Q562,810 540,814 Q518,810 500,798 Z" fill="#5B6B8B" opacity="0.45"/>
      <!-- Collar -->
      <path d="M486,530 Q512,520 540,518 Q568,520 594,530" fill="none" stroke="#2B3B5B" stroke-width="3.5" opacity="0.6"/>
      <!-- Dream silk sash at waist -->
      <path d="M454,596 Q492,586 540,584 Q588,586 626,596" fill="none" stroke="#8BA0C4" stroke-width="4" opacity="0.55"/>
      <!-- Sash clasp — dreamy amethyst -->
      <circle cx="540" cy="590" r="5" fill="#A888C8" opacity="0.75"/>
      <circle cx="540" cy="589" r="2.5" fill="#D0C0E8" opacity="0.6"/>
      <!-- Center front opening -->
      <line x1="540" y1="536" x2="540" y2="818" stroke="#2B3B5B" stroke-width="1.5" opacity="0.28"/>
      <!-- Hem embroidery — ethereal shimmer -->
      <path d="M452,804 Q480,826 540,832 Q600,826 628,804" fill="none" stroke="#8BA0C4" stroke-width="2.5" opacity="0.5"/>
      <path d="M458,794 Q484,814 540,820 Q596,814 622,794" fill="none" stroke="#A888C8" stroke-width="1.2" opacity="0.3"/>
      <!-- Starlight sparkle accents -->
      <circle cx="480" cy="650" r="1.5" fill="#D0C0E8" opacity="0.5"/>
      <circle cx="600" cy="700" r="1.5" fill="#D0C0E8" opacity="0.45"/>
      <circle cx="500" cy="750" r="1" fill="#A888C8" opacity="0.4"/>
      <circle cx="580" cy="640" r="1" fill="#D0C0E8" opacity="0.4"/>
      <!-- Side draping -->
      <path d="M462,542 Q456,646 450,804" fill="none" stroke="#2B3B5B" stroke-width="1.2" opacity="0.22"/>
      <path d="M618,542 Q624,646 630,804" fill="none" stroke="#2B3B5B" stroke-width="1.2" opacity="0.22"/>
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
  "cloth-pants": `
    <!-- Cloth pants icon -->
    <path d="M16,16 Q22,12 32,10 Q42,12 48,16 L50,46 Q44,54 40,56 L36,56 L34,42 L30,42 L28,56 L24,56 Q20,54 14,46 Z" fill="#7B6B5B"/>
    <path d="M18,18 Q25,14 32,12 Q39,14 46,18" fill="none" stroke="#6B5B4B" stroke-width="2" opacity="0.55"/>
    <line x1="32" y1="20" x2="32" y2="42" stroke="#6B5B4B" stroke-width="1" opacity="0.25"/>
    <path d="M14,44 Q20,52 24,54" fill="none" stroke="#6B5B4B" stroke-width="1.2" opacity="0.4"/>
    <path d="M50,44 Q44,52 40,54" fill="none" stroke="#6B5B4B" stroke-width="1.2" opacity="0.4"/>
  `,
  "plate-greaves": `
    <!-- Plate greaves icon -->
    <path d="M14,14 Q22,10 32,8 Q42,10 50,14 L52,48 Q44,56 32,58 Q20,56 12,48 Z" fill="#6B7B8D"/>
    <path d="M18,16 Q25,12 32,11 Q39,12 46,16 L47,46 Q41,52 32,54 Q23,52 17,46 Z" fill="#8B9DAF" opacity="0.45"/>
    <path d="M18,24 Q25,21 32,20 Q39,21 46,24" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.45"/>
    <path d="M16,34 Q25,31 32,30 Q39,31 48,34" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.4"/>
    <path d="M15,44 Q24,41 32,40 Q40,41 49,44" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.35"/>
    <ellipse cx="24" cy="34" rx="6" ry="4" fill="#5B6B7D" opacity="0.5"/>
    <ellipse cx="40" cy="34" rx="6" ry="4" fill="#5B6B7D" opacity="0.5"/>
    <circle cx="24" cy="34" r="2" fill="#8B9DAF" opacity="0.6"/>
    <circle cx="40" cy="34" r="2" fill="#8B9DAF" opacity="0.6"/>
  `,
  "leather-gloves": `
    <!-- Leather gloves icon -->
    <path d="M6,22 Q10,14 20,12 Q30,14 34,22 L35,42 Q30,50 20,52 Q10,50 5,42 Z" fill="#8B7355"/>
    <path d="M10,20 Q15,15 20,14 Q25,15 30,20" fill="none" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
    <path d="M8,30 Q14,27 20,26 Q26,27 32,30" fill="none" stroke="#7A6548" stroke-width="1" opacity="0.35"/>
    <path d="M30,20 Q34,12 44,10 Q54,12 58,20 L59,40 Q54,48 44,50 Q34,48 29,40 Z" fill="#8B7355"/>
    <path d="M34,18 Q39,13 44,12 Q49,13 54,18" fill="none" stroke="#6B5538" stroke-width="1.5" opacity="0.5"/>
    <path d="M32,28 Q38,25 44,24 Q50,25 56,28" fill="none" stroke="#7A6548" stroke-width="1" opacity="0.35"/>
  `,
  "iron-gauntlets": `
    <!-- Iron gauntlets icon -->
    <path d="M6,20 Q10,10 20,8 Q30,10 34,20 L36,44 Q30,52 20,54 Q10,52 4,44 Z" fill="#6B7B8D"/>
    <path d="M10,18 Q15,12 20,10 Q25,12 30,18" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.5"/>
    <path d="M8,30 Q14,27 20,26 Q26,27 32,30" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
    <path d="M6,40 Q14,37 20,36 Q26,37 34,40" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.35"/>
    <circle cx="20" cy="22" r="2.5" fill="#8B9DAF" opacity="0.5"/>
    <ellipse cx="16" cy="24" rx="4" ry="2" fill="#fff" opacity="0.15"/>
    <path d="M30,18 Q34,8 44,6 Q54,8 58,18 L60,42 Q54,50 44,52 Q34,50 28,42 Z" fill="#6B7B8D"/>
    <path d="M34,16 Q39,10 44,8 Q49,10 54,16" fill="none" stroke="#5B6B7D" stroke-width="2" opacity="0.5"/>
    <path d="M32,28 Q38,25 44,24 Q50,25 56,28" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.4"/>
    <path d="M30,38 Q38,35 44,34 Q50,35 58,38" fill="none" stroke="#5B6B7D" stroke-width="1" opacity="0.35"/>
    <circle cx="44" cy="20" r="2.5" fill="#8B9DAF" opacity="0.5"/>
  `,
  "wanderer-robe": `
    <!-- Wanderer robe icon -->
    <path d="M14,12 Q22,6 32,4 Q42,6 50,12 L52,56 Q44,62 32,64 Q20,62 12,56 Z" fill="#5B4B5D"/>
    <path d="M22,10 Q27,7 32,6 Q37,7 42,10 L40,54 Q36,58 32,60 Q28,58 24,54 Z" fill="#7B6B7D" opacity="0.5"/>
    <path d="M18,14 Q25,9 32,8 Q39,9 46,14" fill="none" stroke="#4A3C4E" stroke-width="2" opacity="0.55"/>
    <path d="M14,30 Q22,27 32,26 Q42,27 50,30" fill="none" stroke="#8B6BA5" stroke-width="2" opacity="0.55"/>
    <circle cx="32" cy="28" r="2.5" fill="#C4A8D8" opacity="0.7"/>
    <line x1="32" y1="14" x2="32" y2="56" stroke="#4A3C4E" stroke-width="1" opacity="0.3"/>
    <path d="M14,54 Q22,60 32,62 Q42,60 50,54" fill="none" stroke="#8B6BA5" stroke-width="1.5" opacity="0.4"/>
  `,

  // --- REWARD ITEM THUMBNAILS ---
  "adventurer-band": `
    <!-- Adventurer's band — leather wrist wrap -->
    <path d="M12,28 Q16,20 32,17 Q48,20 52,28 L53,38 Q48,44 32,46 Q16,44 11,38 Z" fill="#A0896B"/>
    <path d="M16,30 Q22,24 32,22 Q42,24 48,30" fill="none" stroke="#7A6548" stroke-width="2" opacity="0.5"/>
    <path d="M14,36 Q22,32 32,31 Q42,32 50,36" fill="none" stroke="#7A6548" stroke-width="1.2" opacity="0.4"/>
    <rect x="29" y="19" width="6" height="4" rx="1" fill="#8B7355" opacity="0.7"/>
  `,
  "pathfinder-blade": `
    <!-- Pathfinder's blade — iron short sword -->
    <path d="M29,6 L27,30 L29,33 Q31,34 33,34 Q35,34 35,33 L37,30 L35,6 Q32,3 29,6 Z" fill="#8B9DAF"/>
    <path d="M30,8 L28,28" fill="none" stroke="#A8B8C8" stroke-width="1" opacity="0.5"/>
    <path d="M32,8 L32,30" fill="none" stroke="#6B7B8D" stroke-width="0.8" opacity="0.35"/>
    <path d="M22,34 Q26,31 32,30 Q38,31 42,34 Q38,37 32,37 Q26,37 22,34 Z" fill="#5B6B7D"/>
    <rect x="30" y="37" width="4" height="14" rx="1" fill="#6B5538"/>
    <line x1="30" y1="41" x2="34" y2="41" stroke="#8B7355" stroke-width="0.8" opacity="0.5"/>
    <line x1="30" y1="46" x2="34" y2="46" stroke="#8B7355" stroke-width="0.8" opacity="0.5"/>
    <circle cx="32" cy="54" r="3" fill="#5B6B7D"/>
  `,
  "seeker-hood": `
    <!-- Seeker's hood — cloth hood with peak -->
    <path d="M12,40 Q15,18 32,10 Q49,18 52,40 Q49,46 32,48 Q15,46 12,40 Z" fill="#5B6B5B"/>
    <path d="M18,38 Q20,22 32,16 Q44,22 46,38 Q44,42 32,44 Q20,42 18,38 Z" fill="#7B8B7B" opacity="0.6"/>
    <path d="M28,12 Q30,6 32,4 Q34,6 36,12" fill="#5B6B5B" stroke="#4A5A4A" stroke-width="1.2"/>
    <path d="M18,34 Q25,30 32,30 Q39,30 46,34" fill="none" stroke="#4A5A4A" stroke-width="1.2" opacity="0.35"/>
    <path d="M22,44 Q27,47 32,48 Q37,47 42,44" fill="none" stroke="#4A5A4A" stroke-width="1.5" opacity="0.35"/>
  `,
  "guardian-greaves": `
    <!-- Guardian's greaves — steel leg armor -->
    <path d="M14,14 Q22,10 32,8 Q42,10 50,14 L52,48 Q44,56 32,58 Q20,56 12,48 Z" fill="#6B7B8D"/>
    <path d="M18,16 Q25,12 32,11 Q39,12 46,16 L47,46 Q41,52 32,54 Q23,52 17,46 Z" fill="#8B9DAF" opacity="0.45"/>
    <path d="M18,24 Q25,21 32,20 Q39,21 46,24" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.5"/>
    <path d="M16,34 Q25,31 32,30 Q39,31 48,34" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.42"/>
    <path d="M15,44 Q24,41 32,40 Q40,41 49,44" fill="none" stroke="#5B6B7D" stroke-width="1.5" opacity="0.38"/>
    <ellipse cx="24" cy="34" rx="7" ry="5" fill="#5B6B7D" opacity="0.55"/>
    <ellipse cx="40" cy="34" rx="7" ry="5" fill="#5B6B7D" opacity="0.55"/>
    <circle cx="24" cy="34" r="2.5" fill="#8B9DAF" opacity="0.65"/>
    <circle cx="40" cy="34" r="2.5" fill="#8B9DAF" opacity="0.65"/>
  `,
  "mentor-shield": `
    <!-- Mentor's shield — kite shield with cross -->
    <path d="M16,18 Q22,10 32,6 Q42,10 48,18 L46,48 Q40,56 32,60 Q24,56 18,48 Z" fill="#6B5538"/>
    <path d="M19,20 Q24,13 32,10 Q40,13 45,20 L43,46 Q38,53 32,56 Q26,53 21,46 Z" fill="#A0896B" opacity="0.7"/>
    <path d="M17,19 Q23,11 32,8 Q41,11 47,19 L45,47 Q39,55 32,58 Q25,55 19,47 Z" fill="none" stroke="#5B4530" stroke-width="1.5" opacity="0.5"/>
    <line x1="32" y1="18" x2="32" y2="48" stroke="#5B4530" stroke-width="2" opacity="0.45"/>
    <line x1="22" y1="32" x2="42" y2="32" stroke="#5B4530" stroke-width="2" opacity="0.45"/>
    <circle cx="32" cy="32" r="4" fill="#5B4530" opacity="0.6"/>
    <circle cx="32" cy="31" r="2" fill="#8B7355" opacity="0.5"/>
  `,
  "wayfarer-vestment": `
    <!-- Wayfarer's vestment — enchanted linen tunic -->
    <path d="M18,18 Q22,14 32,12 Q42,14 46,18 L44,52 Q38,56 32,56 Q26,56 20,52 Z" fill="#6B6B4B"/>
    <path d="M26,14 Q29,12 32,12 Q35,12 38,14 L36,26 Q34,24 32,24 Q30,24 28,26 Z" fill="#E8DEC8" opacity="0.4"/>
    <path d="M20,28 Q26,26 32,25 Q38,26 44,28" fill="none" stroke="#C4A060" stroke-width="1" opacity="0.35"/>
    <path d="M20,36 Q26,34 32,33 Q38,34 44,36" fill="none" stroke="#C4A060" stroke-width="0.8" opacity="0.28"/>
    <path d="M20,44 Q26,42 32,41 Q38,42 44,44" fill="none" stroke="#C4A060" stroke-width="0.8" opacity="0.22"/>
    <path d="M21,34 Q26,32 32,31 Q38,32 43,34" fill="none" stroke="#8B7B4B" stroke-width="2" opacity="0.5"/>
    <circle cx="32" cy="32" r="2" fill="#C4A060" opacity="0.55"/>
    <path d="M20,50 Q26,54 32,55 Q38,54 44,50" fill="none" stroke="#8B7B4B" stroke-width="1.2" opacity="0.45"/>
  `,
  "dreamer-cloak": `
    <!-- Dreamer's cloak — flowing dreamweave silk -->
    <path d="M12,10 Q20,4 32,2 Q44,4 52,10 L54,58 Q46,64 32,64 Q18,64 10,58 Z" fill="#3B4B6B"/>
    <path d="M20,8 Q26,5 32,4 Q38,5 44,8 L42,56 Q38,60 32,62 Q26,60 22,56 Z" fill="#5B6B8B" opacity="0.45"/>
    <path d="M16,12 Q24,7 32,6 Q40,7 48,12" fill="none" stroke="#2B3B5B" stroke-width="2" opacity="0.55"/>
    <path d="M12,28 Q22,25 32,24 Q42,25 52,28" fill="none" stroke="#8BA0C4" stroke-width="2" opacity="0.5"/>
    <circle cx="32" cy="26" r="2.5" fill="#A888C8" opacity="0.7"/>
    <circle cx="32" cy="25.5" r="1.2" fill="#D0C0E8" opacity="0.55"/>
    <line x1="32" y1="14" x2="32" y2="58" stroke="#2B3B5B" stroke-width="1" opacity="0.28"/>
    <path d="M12,56 Q20,62 32,64 Q44,62 52,56" fill="none" stroke="#8BA0C4" stroke-width="1.5" opacity="0.45"/>
    <path d="M14,52 Q22,58 32,60 Q42,58 50,52" fill="none" stroke="#A888C8" stroke-width="0.8" opacity="0.3"/>
    <!-- Starlight sparkles -->
    <circle cx="20" cy="36" r="1" fill="#D0C0E8" opacity="0.5"/>
    <circle cx="44" cy="42" r="1" fill="#D0C0E8" opacity="0.45"/>
    <circle cx="26" cy="50" r="0.8" fill="#A888C8" opacity="0.4"/>
  `,
};
