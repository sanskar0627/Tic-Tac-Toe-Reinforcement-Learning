"use client";

import { Github, Twitter } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  {
    href: "https://github.com/sanskar0627",
    label: "GITHUB",
    handle: "@sanskar0627",
    icon: Github,
    tone: "bg-sun",
  },
  {
    href: "https://x.com/sanskar0627",
    label: "X / TWITTER",
    handle: "@sanskar0627",
    icon: Twitter,
    tone: "bg-cyan",
  },
] as const;

export function CreatorBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "grid gap-2" : "grid gap-3"}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/70 lg:tracking-[0.24em]">
        Built by
      </p>
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <motion.a
            key={badge.href}
            href={badge.href}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.03, rotate: -0.6 }}
            whileTap={{ x: 4, y: 4 }}
            className={`${badge.tone} flex items-center gap-3 rounded-clay border-4 border-ink px-3 py-2.5 shadow-plush-sm`}
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl border-4 border-ink bg-white shadow-clay">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[9px] tracking-[0.12em] opacity-70 lg:tracking-[0.2em]">
                {badge.label}
              </span>
              <span className="block truncate font-display text-sm leading-none">
                {badge.handle}
              </span>
            </span>
          </motion.a>
        );
      })}
    </div>
  );
}
