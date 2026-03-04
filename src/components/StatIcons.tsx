import { StatKey } from "@/lib/types";

interface StatIconProps {
  stat: StatKey;
  className?: string;
}

export function StatIcon({ stat, className = "w-12 h-12" }: StatIconProps) {
  const icons: Record<StatKey, React.ReactNode> = {
    strength: <StrengthIcon className={className} />,
    wisdom: <WisdomIcon className={className} />,
    vitality: <VitalityIcon className={className} />,
    charisma: <CharismaIcon className={className} />,
    craft: <CraftIcon className={className} />,
    discipline: <DisciplineIcon className={className} />,
    spirit: <SpiritIcon className={className} />,
    wealth: <WealthIcon className={className} />,
  };

  return <>{icons[stat]}</>;
}

function StrengthIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Flexing arm */}
      <path
        d="M16 40C16 40 18 32 22 28C26 24 28 20 28 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 16C28 16 32 14 34 18C36 22 34 26 30 28"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bicep bump */}
      <ellipse cx="31" cy="20" rx="5" ry="4" fill="currentColor" opacity="0.2" />
      <path
        d="M30 28C30 28 34 30 38 32C42 34 46 38 48 42"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Little strength lines */}
      <path d="M36 12L38 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 14L44 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 18L42 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Fist */}
      <circle cx="16" cy="42" r="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="48" cy="44" r="3.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function WisdomIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Open book */}
      <path
        d="M32 16V50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left page */}
      <path
        d="M32 16C32 16 28 12 18 12C12 12 10 14 10 14V48C10 48 12 46 18 46C28 46 32 50 32 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Right page */}
      <path
        d="M32 16C32 16 36 12 46 12C52 12 54 14 54 14V48C54 48 52 46 46 46C36 46 32 50 32 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Page lines */}
      <path d="M16 22H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 28H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 34H26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 22H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 28H46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M38 34H48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Little glow sparkle */}
      <circle cx="32" cy="10" r="2" fill="currentColor" opacity="0.3" />
      <path d="M32 6V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M28 10H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M34 10H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function VitalityIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Leaf / sprout */}
      <path
        d="M32 52V32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Main leaf */}
      <path
        d="M32 32C32 32 20 30 16 20C12 10 20 8 28 10C36 12 40 18 40 26C40 34 32 32 32 32Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Leaf vein */}
      <path
        d="M32 32C28 28 24 22 22 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Small second leaf */}
      <path
        d="M32 40C32 40 40 38 44 32C46 28 42 26 38 28C34 30 32 36 32 40Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Little dewdrop */}
      <circle cx="22" cy="24" r="2" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function CharismaIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Star / sparkle shape */}
      <path
        d="M32 8L36 24L52 20L40 32L52 44L36 40L32 56L28 40L12 44L24 32L12 20L28 24L32 8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Inner glow */}
      <circle cx="32" cy="32" r="6" fill="currentColor" opacity="0.15" />
      {/* Little sparkle dots */}
      <circle cx="20" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="48" cy="14" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="50" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="14" cy="52" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function CraftIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Hammer handle */}
      <path
        d="M22 52L38 28"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Hammer head */}
      <path
        d="M34 30L30 22L42 16L50 20L46 28L34 30Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Impact lines */}
      <path d="M16 42L12 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M14 36L8 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <path d="M20 46L16 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      {/* Little spark */}
      <circle cx="44" cy="12" r="1.5" fill="currentColor" opacity="0.35" />
      <path d="M48 8L50 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function DisciplineIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Shield shape */}
      <path
        d="M32 8L12 16V32C12 44 20 52 32 56C44 52 52 44 52 32V16L32 8Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Inner shield line */}
      <path
        d="M32 14L18 20V32C18 40 24 47 32 50C40 47 46 40 46 32V20L32 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
      />
      {/* Checkmark inside */}
      <path
        d="M24 32L30 38L42 26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpiritIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Crystal / lotus base */}
      <path
        d="M32 10L22 30L32 54L42 30L32 10Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Left petal */}
      <path
        d="M32 30L14 24L22 30L14 40L32 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Right petal */}
      <path
        d="M32 30L50 24L42 30L50 40L32 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner glow */}
      <circle cx="32" cy="30" r="4" fill="currentColor" opacity="0.15" />
      {/* Sparkles around */}
      <circle cx="32" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="10" cy="20" r="1" fill="currentColor" opacity="0.25" />
      <circle cx="54" cy="20" r="1" fill="currentColor" opacity="0.25" />
      <path d="M32 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function WealthIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      {/* Coin - outer circle */}
      <ellipse cx="32" cy="32" rx="20" ry="22" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
      {/* Coin inner ring */}
      <ellipse cx="32" cy="32" rx="14" ry="16" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      {/* Dollar / gem symbol in center */}
      <path
        d="M28 26C28 26 28 22 32 22C36 22 36 26 32 28C28 30 28 30 28 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 34C28 34 28 38 32 38"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M36 30C36 30 36 34 32 34C28 34 28 30 32 28C36 26 36 26 36 26"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36 38C36 38 36 42 32 42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Little shine */}
      <path d="M18 18L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M14 22L10 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}
