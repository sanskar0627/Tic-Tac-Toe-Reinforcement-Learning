"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClayCard, PanelLabel } from "@/components/ui/ClayCard";
import { chartInk, tooltipStyle } from "@/components/charts/chartTheme";
import type { EpochMetric } from "@/lib/types";

export function OutcomeChart({ data }: { data: EpochMetric[] }) {
  const latest = data[data.length - 1];

  return (
    <ClayCard tone="cyan" className="min-h-[320px]">
      <PanelLabel
        kicker="Training Telemetry"
        title="WIN / LOSS / DRAW"
        extra={
          <span className="rounded-pill border-3 border-ink bg-white px-2.5 py-1 font-mono text-[10px] shadow-stamp-sm">
            vs random · {latest ? `${Math.round(latest.winRate * 100)}% W` : "—"}
          </span>
        }
      />
      <div className="h-[240px] rounded-clay border-4 border-ink bg-white p-2 shadow-clay">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid stroke={chartInk} strokeWidth={1.25} strokeDasharray="0" />
            <XAxis
              dataKey="epoch"
              stroke={chartInk}
              tick={{ fill: chartInk, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={{ stroke: chartInk, strokeWidth: 2 }}
              axisLine={{ stroke: chartInk, strokeWidth: 3 }}
            />
            <YAxis
              domain={[0, 1]}
              stroke={chartInk}
              tickFormatter={(v) => `${Math.round(v * 100)}`}
              tick={{ fill: chartInk, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              tickLine={{ stroke: chartInk, strokeWidth: 2 }}
              axisLine={{ stroke: chartInk, strokeWidth: 3 }}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [`${(((value as number) ?? 0) * 100).toFixed(1)}%`]}
            />
            <Legend
              wrapperStyle={{ fontFamily: "IBM Plex Mono", fontSize: 11, color: chartInk }}
            />
            <Line type="monotone" dataKey="winRate" name="Win" stroke="#FF2E93" strokeWidth={3.5} dot={false} />
            <Line type="monotone" dataKey="drawRate" name="Draw" stroke="#111111" strokeWidth={3.5} dot={false} />
            <Line type="monotone" dataKey="lossRate" name="Loss" stroke="#E01074" strokeWidth={3} dot={false} strokeDasharray="6 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ClayCard>
  );
}
