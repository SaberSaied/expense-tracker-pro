import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import { usePrefersReducedMotion } from "@/hooks";

interface SpendingTrendProps {
  data: ChartDataPoint[];
}

/**
 * 30-day spending trend area chart with emerald gradient fill.
 */
export const SpendingTrend: React.FC<SpendingTrendProps> = ({ data }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">
        Spending Trend
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart accessibilityLayer data={data}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-chart-grid)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-chart-axis)" }}
              axisLine={{ stroke: "var(--color-chart-grid)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-chart-axis)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-card)",
                borderRadius: "12px",
                color: "var(--color-text-primary)",
                fontSize: "13px",
                padding: "8px 12px",
              }}
              formatter={(value: any) => [`$${Number(value ?? 0).toFixed(2)}`, "Spent"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#spendGradient)"
              animationDuration={500}
              animationEasing="ease-out"
              isAnimationActive={!prefersReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
