'use client';

import { MonthlyTrendSeries } from '@/entities';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const COLORS = ['var(--primary)', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type MonthlyTrendLineChartProps = {
  data: MonthlyTrendSeries[];
};

type ChartPoint = { x: string } & { [key: string]: number | null | string };

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
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" stroke="var(--text-secondary)" tickLine={false} />
          <YAxis stroke="var(--text-secondary)" />
          {data.map((line, index) => (
            <Line
              key={line.id}
              type="monotone"
              dataKey={line.id}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
