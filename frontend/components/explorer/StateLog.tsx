"use client";

import { useEffect, useRef } from "react";
import { ClayCard, PanelLabel } from "@/components/ui/ClayCard";
import { prettyState } from "@/lib/game";
import type { TdLogEntry } from "@/lib/types";

export function StateLog({ logs }: { logs: TdLogEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <ClayCard tone="ink" className="min-h-[300px]">
      <PanelLabel
        kicker="State Explorer"
        title="TD UPDATE TAPE"
        extra={
          <span className="rounded-pill border-3 border-cream bg-hotpink px-2.5 py-1 font-mono text-[10px] text-white shadow-stamp-sm">
            {logs.length} frames
          </span>
        }
      />
      <div className="relative h-[236px] overflow-auto rounded-clay border-4 border-cream/30 bg-[#070707] p-3 font-mono text-[11px] leading-5 text-lime shadow-clay-deep">
        <div className="pointer-events-none absolute inset-0 bg-scan" />
        <p className="text-cyan">// s = +me / -opp / .empty · a = cell · δ = TD error</p>
        {logs.map((entry) => {
          const hot = Math.abs(entry.tdError) > 0.25;
          return (
            <p key={entry.id} className={hot ? "text-hotpink" : "text-lime"}>
              <span className="text-sun">e{entry.epoch}</span>
              {"  "}
              <span className="text-white/80">{prettyState(entry.state)}</span>
              {"  a="}
              {entry.action}
              {"  r="}
              {entry.reward.toFixed(0)}
              {"  Q "}
              {entry.qOld.toFixed(2)}→{entry.qNew.toFixed(2)}
              {"  δ="}
              {entry.tdError >= 0 ? "+" : ""}
              {entry.tdError.toFixed(3)}
              {"  ε="}
              {entry.epsilon.toFixed(2)}
              <span className="text-white/40">  #{entry.note}</span>
            </p>
          );
        })}
        <div ref={endRef} />
      </div>
    </ClayCard>
  );
}
