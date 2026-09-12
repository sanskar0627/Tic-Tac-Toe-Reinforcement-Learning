"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "pink" | "lime" | "cyan" | "sun" | "white";

const tones: Record<Tone, string> = {
  pink: "bg-hotpink text-white",
  lime: "bg-lime text-ink",
  cyan: "bg-cyan text-ink",
  sun: "bg-sun text-ink",
  white: "bg-white text-ink",
};

interface ClayButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  tone?: Tone;
  size?: "sm" | "md";
  children: ReactNode;
}

export function ClayButton({
  tone = "white",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ClayButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.035, y: -1 }}
      whileTap={disabled ? undefined : { x: 5, y: 5 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-clay border-4 border-ink font-display uppercase tracking-wide shadow-plush-sm",
        "hover:shadow-plush active:shadow-plush-press",
        size === "md" ? "px-4 py-2.5 text-sm" : "px-3 py-1.5 text-[11px]",
        tones[tone],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
