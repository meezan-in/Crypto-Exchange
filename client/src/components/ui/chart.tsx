import { Component, ReactNode } from "react";

// Chart components for recharts
export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
  };
}

export interface ChartContainerProps {
  config: ChartConfig;
  children: ReactNode;
  className?: string;
}

export function ChartContainer({ children, className = "" }: ChartContainerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      {children}
    </div>
  );
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  config?: ChartConfig;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm text-gray-600">
          <span className="font-medium" style={{ color: entry.color }}>
            {entry.name}:
          </span>{" "}
          {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ChartTooltipContent({ active, payload, label }: ChartTooltipProps) {
  return <ChartTooltip active={active} payload={payload} label={label} />;
}
