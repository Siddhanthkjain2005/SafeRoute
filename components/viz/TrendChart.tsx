"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtTime } from "@/lib/utils";

interface Point {
  ts: string;
  risk_score: number;
  event_count?: number;
  upper?: number;
  lower?: number;
}

export function TrendChart({
  data,
  height = 240,
  showForecastBand = false,
}: {
  data: Point[];
  height?: number;
  showForecastBand?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12b76a" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#12b76a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,216,214,0.07)" vertical={false} />
        <XAxis
          dataKey="ts"
          tickFormatter={fmtTime}
          tick={{ fill: "#7d8884", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          minTickGap={40}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "#7d8884", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(10,13,12,0.95)",
            border: "1px solid rgba(212,216,214,0.14)",
            borderRadius: 12,
            color: "#e6eae8",
            fontSize: 12,
          }}
          labelFormatter={(v) => fmtTime(String(v))}
        />
        {showForecastBand && (
          <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(244,63,94,0.1)" />
        )}
        <Area
          type="monotone"
          dataKey="risk_score"
          stroke="#34d399"
          strokeWidth={2}
          fill="url(#riskFill)"
        />
        {showForecastBand && (
          <Line type="monotone" dataKey="lower" stroke="rgba(244,63,94,0.4)" dot={false} strokeDasharray="4 4" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
