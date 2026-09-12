import { Zap } from "lucide-react";

export function TrainPoster({ games }: { games: number }) {
  const stage =
    games < 80
      ? { stamp: "UNTRAINED", line: "This brain is a newborn. It will wander, hang sides, and look lost." }
      : games < 500
        ? { stamp: "MESSY", line: "A few hundred games in. Still clumsy. Do not trust it in a fork." }
        : games < 2000
          ? { stamp: "LEARNING", line: "Getting the idea. Blocks more. Still not a finished brawler." }
          : { stamp: "SHARP", line: "Around 2,000 games it starts playing like it means it. Keep going." };

  return (
    <aside className="relative overflow-hidden rounded-plump border-4 border-ink bg-sun px-4 py-4 shadow-plush">
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rotate-12 rounded-full bg-hotpink/30" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/60">
            Training poster
          </p>
          <h3 className="font-display text-2xl leading-none sm:text-3xl">
            TRAIN IT OR IT STAYS DUMB
          </h3>
        </div>
        <span className="rounded-pill border-4 border-ink bg-hotpink px-3 py-1 font-display text-sm text-white shadow-stamp-sm">
          {stage.stamp}
        </span>
      </div>

      <p className="mt-3 max-w-xl font-sans text-sm font-medium leading-6 text-ink/85">
        {stage.line} Hit <span className="font-display text-sm">TRAIN LIVE</span> or{" "}
        <span className="font-display text-sm">BURST</span>. Every visitor starts at
        zero. Nobody inherits a saved champion.
      </p>

      <ol className="mt-4 grid gap-2 sm:grid-cols-3">
        {[
          { n: "0", label: "Newborn", hint: "Random-looking openings" },
          { n: "500", label: "Still messy", hint: "Knows a few traps" },
          { n: "2K+", label: "Can fight", hint: "Wins, blocks, forks" },
        ].map((step) => (
          <li
            key={step.n}
            className="rounded-clay border-4 border-ink bg-white px-3 py-2 shadow-plush-sm"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
              {step.label}
            </p>
            <p className="font-display text-xl leading-none">{step.n}</p>
            <p className="mt-1 font-sans text-xs font-medium text-ink/70">{step.hint}</p>
          </li>
        ))}
      </ol>

      <p className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/70">
        <Zap className="h-3.5 w-3.5" />
        Games so far · {games.toLocaleString()}
      </p>
    </aside>
  );
}
