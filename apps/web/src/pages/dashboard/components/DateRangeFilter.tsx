import React, { useState, useCallback } from "react";
import { clsx } from "clsx";
import { Calendar } from "lucide-react";
import type { DateRangePreset } from "@/services/dashboard";

// ─── Presets ───────────────────────────────────────────────────

interface PresetOption {
  label: string;
  value: DateRangePreset;
}

const PRESETS: PresetOption[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

// ─── Props ─────────────────────────────────────────────────────

export interface DateRangeFilterValue {
  range: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

interface DateRangeFilterProps {
  /** Currently selected preset value. */
  value: DateRangeFilterValue;
  /** Called when the filter changes. */
  onChange: (value: DateRangeFilterValue) => void;
  /** Optional className for the wrapper. */
  className?: string;
}

// ─── Component ─────────────────────────────────────────────────

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className,
}) => {
  const [showCustom, setShowCustom] = useState(value.range === "custom");

  const handlePresetClick = useCallback(
    (preset: DateRangePreset) => {
      setShowCustom(preset === "custom");
      if (preset === "custom") {
        // Keep existing custom dates or set defaults
        onChange({
          range: "custom",
          startDate: value.startDate || new Date().toISOString().slice(0, 10),
          endDate: value.endDate || new Date().toISOString().slice(0, 10),
        });
      } else {
        onChange({ range: preset });
      }
    },
    [onChange, value.startDate, value.endDate],
  );

  const handleCustomDateChange = useCallback(
    (field: "startDate" | "endDate", dateValue: string) => {
      onChange({
        range: "custom",
        startDate: field === "startDate" ? dateValue : value.startDate,
        endDate: field === "endDate" ? dateValue : value.endDate,
      });
    },
    [onChange, value.startDate, value.endDate],
  );

  return (
    <div className={clsx("flex flex-wrap items-center gap-1.5", className)}>
      {/* Preset buttons */}
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => handlePresetClick(preset.value)}
          className={clsx(
            "px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
            value.range === preset.value && preset.value !== "custom"
              ? "bg-primary text-text-inverse shadow-sm"
              : preset.value === "custom" && value.range === "custom"
                ? "bg-primary/15 text-primary border border-primary/30"
                : "text-text-secondary hover:text-text-primary hover:bg-white/5",
          )}
        >
          {preset.label}
        </button>
      ))}

      {/* Custom date range inputs */}
      {showCustom && (
        <div className="flex items-center gap-2 ml-1.5 pl-2.5 border-l border-border-glass">
          <Calendar className="size-3.5 text-text-muted shrink-0" />
          <input
            type="date"
            value={value.startDate?.slice(0, 10) ?? ""}
            onChange={(e) => handleCustomDateChange("startDate", e.target.value)}
            className="w-28 rounded-md bg-bg-input border border-border-input px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-border-focus"
            aria-label="Start date"
          />
          <span className="text-xs text-text-muted">—</span>
          <input
            type="date"
            value={value.endDate?.slice(0, 10) ?? ""}
            onChange={(e) => handleCustomDateChange("endDate", e.target.value)}
            className="w-28 rounded-md bg-bg-input border border-border-input px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-border-focus"
            aria-label="End date"
          />
        </div>
      )}
    </div>
  );
};

// ─── Helper to get human-readable label for current filter ─────

export function getDateRangeLabel(value: DateRangeFilterValue): string {
  const preset = PRESETS.find((p) => p.value === value.range);
  if (!preset) return "Custom Range";
  if (value.range === "custom") {
    if (value.startDate && value.endDate) {
      return `${value.startDate} – ${value.endDate}`;
    }
    return "Custom Range";
  }
  return preset.label;
}
