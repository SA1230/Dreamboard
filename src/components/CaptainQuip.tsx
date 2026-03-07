interface CaptainQuipProps {
  quipText: string;
}

export function CaptainQuip({ quipText }: CaptainQuipProps) {
  return (
    <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border border-amber-100 bg-[#FFFCF5] animate-fadeIn">
      <img
        src="/mascots/judge-hero.svg"
        alt=""
        className="w-7 h-7 rounded-full bg-white border border-amber-200 p-0.5 flex-shrink-0 mt-0.5"
      />
      <p className="text-xs text-stone-500 italic leading-relaxed">
        &ldquo;{quipText}&rdquo;
      </p>
    </div>
  );
}
