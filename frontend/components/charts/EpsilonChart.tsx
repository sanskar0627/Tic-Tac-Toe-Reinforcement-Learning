"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClayCard, PanelLabel } from "@/components/ui/ClayCard";
import { chartInk, tooltipStyle } from "@/components/charts/chartTheme";
import type { EpochMetric } from "@/lib/types";

export function EpsilonChart({ data }: { data: EpochMetric[] }) {
  const latest = data[data.length - 1];

  return (
    <ClayCard tone="sun" className="min-h-[300px]">
      <PanelLabel
        kicker="Exploration vs Exploitation"
        title="EPSILON DECAY"
        extra={
          <span className="rounded-pill border-3 border-ink bg-white px-2.5 py-1 font-mono text-[10px] shadow-stamp-sm">
            ε {latest ? latest.epsilon.toFixed(3) : "—"}
          </span>
        }
      />
      <div className="h-[220px] rounded-clay border-4 border-ink bg-white p-2 shadow-clay">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={chartInk} strokeWidth={1.25} />
            <XAxis
              dataKey="epoch"
              stroke={chartInk}
              tick={{ fill: chartInk, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={{ stroke: chartInk, strokeWidth: 2 }}
              axisLine={{ stroke: chartInk, strokeWidth: 3 }}
            />
            <YAxis
              yAxisId="eps"
              domain={[0, 1]}
              stroke={chartInk}
              tick={{ fill: chartInk, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={{ stroke: chartInk, strokeWidth: 2 }}
              axisLine={{ stroke: chartInk, strokeWidth: 3 }}
            />
            <YAxis
              yAxisId="td"
              orientation="right"
              stroke={chartInk}
              tick={{ fill: chartInk, fontSize: 10, fontFamily: "IBM Plex Mono" }}
              tickLine={{ stroke: chartInk, strokeWidth: 2 }}
              axisLine={{ stroke: chartInk, strokeWidth: 3 }}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              yAxisId="eps"
              type="monotone"
              dataKey="epsilon"
              name="Epsilon"
              fill="#20E3FF"
              stroke="#111111"
              strokeWidth={3.5}
              fillOpacity={0.55}
            />
            <Line
              yAxisId="td"
              type="monotone"
              dataKey="avgTd"
              name="|TD|"
              stroke="#FF2E93"
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink/80">
        Cyan fill = ε-greedy exploration. Pink stroke = mean absolute TD error
        after each sampled burst. Same decay the Python trainer would stream.
      </p>
    </ClayCard>
  );
}
