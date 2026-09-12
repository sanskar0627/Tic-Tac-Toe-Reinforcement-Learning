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
        "rounded-plump border-4 border-ink shadow-plush",
        tones[tone],
        padded && "p-4 sm:p-5",
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
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
          {kicker}
        </p>
        <h2 className="font-display text-xl leading-none sm:text-2xl">
          {title}
        </h2>
      </div>
      {extra}
    </div>
  );
}
