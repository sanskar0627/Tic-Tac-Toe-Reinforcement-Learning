import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ClayCardProps {
  children: ReactNode;
  className?: string;
  tone?: "white" | "pink" | "lime" | "cyan" | "sun" | "blush" | "ink";
  padded?: boolean;
}

const tones = {
  white: "bg-white text-ink",
  pink: "bg-hotpink text-white",
  lime: "bg-lime text-ink",
  cyan: "bg-cyan text-ink",
  sun: "bg-sun text-ink",
  blush: "bg-blush text-ink",
  ink: "bg-ink text-cream",
};

export function ClayCard({
  children,
  className,
  tone = "white",
  padded = true,
}: ClayCardProps) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-plump border-4 border-ink shadow-plush",
        tones[tone],
        padded && "p-3 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelLabel({
  kicker,
  title,
  extra,
}: {
  kicker: string;
  title: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2 sm:gap-3 lg:items-end">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] opacity-70 lg:tracking-[0.22em]">
          {kicker}
        </p>
        <h2 className="font-display text-lg leading-none sm:text-2xl">
          {title}
        </h2>
      </div>
      {extra}
    </div>
  );
}
