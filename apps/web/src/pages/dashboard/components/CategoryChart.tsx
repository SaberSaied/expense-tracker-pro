import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface CategoryChartProps {
  data: ChartDataPoint[];
  totalSpent: number;
}

/**
 * Category breakdown doughnut chart using Recharts.
 * Shows interactive hover tooltips and center summary text.
 */
export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  totalSpent,
}) => {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-base font-semibold text-text-primary mb-4">
        Category Breakdown
      </h3>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              nameKey="label"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color ?? "#6366F1"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(217, 33%, 17%)",
                border: "1px solid hsl(215, 25%, 27%)",
                borderRadius: "12px",
                color: "hsl(210, 40%, 98%)",
                fontSize: "13px",
                padding: "8px 12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-text-muted">Total</span>
          <span className="text-xl font-bold text-text-primary tabular-nums">
            ${totalSpent.toLocaleString()}
          </span>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((entry) => (
          <div key={entry.label} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-text-secondary truncate">
              {entry.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
