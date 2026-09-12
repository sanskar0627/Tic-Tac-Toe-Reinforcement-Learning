import { cn } from "@/lib/cn";

export function StatPill({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: string;
  tone?: "white" | "pink" | "lime" | "cyan" | "sun";
}) {
  const tones = {
    white: "bg-white",
    pink: "bg-hotpink text-white",
    lime: "bg-lime",
    cyan: "bg-cyan",
    sun: "bg-sun",
  };

  return (
    <div
      className={cn(
        "rounded-clay border-4 border-ink px-3 py-2 shadow-plush-sm",
        tones[tone],
      )}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-70 lg:tracking-[0.18em]">
        {label}
      </p>
      <p className="font-display text-lg leading-none">{value}</p>
    </div>
  );
}
