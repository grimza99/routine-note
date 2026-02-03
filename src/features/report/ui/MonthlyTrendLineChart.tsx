'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyTrendSeries } from '../model/report.query';

const lineColors = ['var(--primary)', '#1a1a1a', '#666666', '#e0e0e0'];

type MonthlyTrendLineChartProps = {
  data: MonthlyTrendSeries[];
};

type ChartPoint = { x: string } & Record<string, number | null>;

const buildChartData = (series: MonthlyTrendSeries[]) => {
  const map = new Map<string, ChartPoint>();

  series.forEach((line) => {
    line.data.forEach((point) => {
      const key = String(point.x);
      const existing = map.get(key) ?? { x: key };
      map.set(key, { ...existing, [line.id]: point.y });
    });
  });

  return Array.from(map.values()).sort((a, b) => a.x.localeCompare(b.x));
};

export function MonthlyTrendLineChart({ data }: MonthlyTrendLineChartProps) {
  const chartData = buildChartData(data);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis dataKey="x" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: 'var(--border)' }}
            contentStyle={{
              background: 'var(--white)',
              borderRadius: 8,
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          />
          {data.map((line, index) => (
            <Line
              key={line.id}
              type="monotone"
              dataKey={line.id}
              stroke={lineColors[index % lineColors.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
