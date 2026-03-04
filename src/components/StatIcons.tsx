interface IconComponentProps {
  className: string;
}

type IconComponent = (props: IconComponentProps) => React.ReactNode;

export interface IconOption {
  key: string;
  label: string;
  component: IconComponent;
}

// Registry of all available icons
const ICON_COMPONENTS: Record<string, IconComponent> = {
  strength: StrengthIcon,
  wisdom: WisdomIcon,
  vitality: VitalityIcon,
  charisma: CharismaIcon,
  craft: CraftIcon,
  discipline: DisciplineIcon,
  spirit: SpiritIcon,
  wealth: WealthIcon,
  heart: HeartIcon,
  flame: FlameIcon,
  moon: MoonIcon,
  sun: SunIcon,
  mountain: MountainIcon,
  music: MusicIcon,
  compass: CompassIcon,
  crown: CrownIcon,
  feather: FeatherIcon,
  lightning: LightningIcon,
  eye: EyeIcon,
  potion: PotionIcon,
};

// Ordered list for the icon picker UI
export const ICON_OPTIONS: IconOption[] = [
  { key: "strength", label: "Flexing Arm", component: StrengthIcon },
  { key: "wisdom", label: "Open Book", component: WisdomIcon },
  { key: "vitality", label: "Sprout", component: VitalityIcon },
  { key: "charisma", label: "Sparkle Star", component: CharismaIcon },
  { key: "craft", label: "Hammer", component: CraftIcon },
  { key: "discipline", label: "Shield", component: DisciplineIcon },
  { key: "spirit", label: "Crystal", component: SpiritIcon },
  { key: "wealth", label: "Coin", component: WealthIcon },
  { key: "heart", label: "Heart", component: HeartIcon },
  { key: "flame", label: "Flame", component: FlameIcon },
  { key: "moon", label: "Moon", component: MoonIcon },
  { key: "sun", label: "Sun", component: SunIcon },
  { key: "mountain", label: "Mountain", component: MountainIcon },
  { key: "music", label: "Music Note", component: MusicIcon },
  { key: "compass", label: "Compass", component: CompassIcon },
  { key: "crown", label: "Crown", component: CrownIcon },
  { key: "feather", label: "Feather", component: FeatherIcon },
  { key: "lightning", label: "Lightning", component: LightningIcon },
  { key: "eye", label: "Eye", component: EyeIcon },
  { key: "potion", label: "Potion", component: PotionIcon },
];

interface StatIconProps {
  iconKey: string;
  className?: string;
}

export function StatIcon({ iconKey, className = "w-12 h-12" }: StatIconProps) {
  const Component = ICON_COMPONENTS[iconKey] || ICON_COMPONENTS["strength"];
  return <Component className={className} />;
}

// ─── Original 8 stat icons ───────────────────────────────────────────

function StrengthIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M16 40C16 40 18 32 22 28C26 24 28 20 28 16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 16C28 16 32 14 34 18C36 22 34 26 30 28" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="31" cy="20" rx="5" ry="4" fill="currentColor" opacity="0.2" />
      <path d="M30 28C30 28 34 30 38 32C42 34 46 38 48 42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 12L38 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 14L44 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 18L42 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="42" r="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="48" cy="44" r="3.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function WisdomIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 16V50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 16C32 16 28 12 18 12C12 12 10 14 10 14V48C10 48 12 46 18 46C28 46 32 50 32 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <path d="M32 16C32 16 36 12 46 12C52 12 54 14 54 14V48C54 48 52 46 46 46C36 46 32 50 32 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <path d="M16 22H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 28H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 34H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 22H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 28H46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 34H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <circle cx="32" cy="10" r="2" fill="currentColor" opacity="0.3" />
      <path d="M32 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M28 10H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M34 10H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function VitalityIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 52V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 32C32 32 20 30 16 20C12 10 20 8 28 10C36 12 40 18 40 26C40 34 32 32 32 32Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      <path d="M32 32C28 28 24 22 22 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M32 40C32 40 40 38 44 32C46 28 42 26 38 28C34 30 32 36 32 40Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <circle cx="22" cy="24" r="2" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function CharismaIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 8L36 24L52 20L40 32L52 44L36 40L32 56L28 40L12 44L24 32L12 20L28 24L32 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.15" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="48" cy="14" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="14" cy="52" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function CraftIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M22 52L38 28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 30L30 22L42 16L50 20L46 28L34 30Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.2" />
      <path d="M16 42L12 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M14 36L8 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M20 46L16 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <circle cx="44" cy="12" r="1.5" fill="currentColor" opacity="0.35" />
      <path d="M48 8L50 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function DisciplineIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 8L12 16V32C12 44 20 52 32 56C44 52 52 44 52 32V16L32 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <path d="M32 14L18 20V32C18 40 24 47 32 50C40 47 46 40 46 32V20L32 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path d="M24 32L30 38L42 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpiritIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 10L22 30L32 54L42 30L32 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <path d="M32 30L14 24L22 30L14 40L32 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <path d="M32 30L50 24L42 30L50 40L32 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <circle cx="32" cy="30" r="4" fill="currentColor" opacity="0.15" />
      <circle cx="32" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="10" cy="20" r="1" fill="currentColor" opacity="0.25" />
      <circle cx="54" cy="20" r="1" fill="currentColor" opacity="0.25" />
      <path d="M32 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function WealthIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <ellipse cx="32" cy="32" rx="20" ry="22" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
      <ellipse cx="32" cy="32" rx="14" ry="16" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path d="M28 26C28 26 28 22 32 22C36 22 36 26 32 28C28 30 28 30 28 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 34C28 34 28 38 32 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 30C36 30 36 34 32 34C28 34 28 30 32 28C36 26 36 26 36 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36 38C36 38 36 42 32 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 18L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M14 22L10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

// ─── Additional icons for customization ──────────────────────────────

function HeartIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 52C32 52 8 36 8 22C8 14 14 8 22 8C26 8 30 10 32 14C34 10 38 8 42 8C50 8 56 14 56 22C56 36 32 52 32 52Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <path d="M20 18C18 18 16 20 16 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function FlameIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M32 6C32 6 20 20 20 36C20 44 25 52 32 56C39 52 44 44 44 36C44 20 32 6 32 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 56C32 56 26 48 26 40C26 34 32 28 32 28C32 28 38 34 38 40C38 48 32 56 32 56Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <circle cx="32" cy="42" r="3" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

function MoonIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M40 10C30 14 24 24 24 36C24 48 30 54 40 56C28 56 16 46 16 32C16 18 28 8 40 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <circle cx="42" cy="16" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="24" r="1" fill="currentColor" opacity="0.25" />
      <circle cx="48" cy="36" r="1.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function SunIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="12" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.12" />
      <path d="M32 8V14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 50V56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M8 32H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 32H56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 15L19 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M45 45L49 49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M49 15L45 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M19 45L15 49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function MountainIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M8 52L24 16L36 36L44 24L56 52H8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <path d="M24 16L28 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="46" cy="14" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}

function MusicIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M24 48V16L48 10V42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="18" cy="48" rx="6" ry="5" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
      <ellipse cx="42" cy="42" rx="6" ry="5" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.15" />
      <path d="M24 24L48 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function CompassIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.05" />
      <path d="M24 40L28 28L40 24L36 36L24 40Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
      <circle cx="32" cy="32" r="2" fill="currentColor" opacity="0.4" />
      <path d="M32 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M32 48V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M12 32H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M48 32H52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function CrownIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 44L8 18L22 30L32 12L42 30L56 18L52 44H12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <path d="M12 44H52V50H12V44Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <circle cx="32" cy="24" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="22" cy="34" r="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="42" cy="34" r="1.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

function FeatherIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M12 52L20 44C20 44 16 32 24 20C32 8 48 8 52 12C56 16 52 32 44 40C36 48 24 44 24 44L12 52Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08" />
      <path d="M24 44L42 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M20 40L36 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      <path d="M28 44L44 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

function LightningIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M36 6L14 34H30L28 58L50 30H34L36 6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.12" />
      <path d="M24 28L32 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

function EyeIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M8 32C8 32 18 16 32 16C46 16 56 32 56 32C56 32 46 48 32 48C18 48 8 32 8 32Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
      <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.12" />
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="29" cy="29" r="1.5" fill="currentColor" opacity="0.15" />
    </svg>
  );
}

function PotionIcon({ className }: IconComponentProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M24 8H40V18L48 42C50 48 46 54 40 54H24C18 54 14 48 16 42L24 18V8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1" />
      <path d="M22 8H42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 38H44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <circle cx="28" cy="44" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="36" cy="46" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="32" cy="42" r="1" fill="currentColor" opacity="0.25" />
    </svg>
  );
}
