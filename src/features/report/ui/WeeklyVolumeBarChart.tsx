'use client';

import { WeeklyVolumeItem } from '@/entities';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type WeeklyVolumeBarChartProps = {
  data: WeeklyVolumeItem[];
};

export function WeeklyVolumeBarChart({ data }: WeeklyVolumeBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: -30, right: 30, top: 12 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" stroke="var(--text-secondary)" tickLine={false} axisLine={true} />
          <YAxis
            yAxisId="volume"
            stroke="var(--text-secondary)"
            tickLine={false}
            axisLine={true}
            allowDecimals={false}
          />
          <YAxis yAxisId="cardio" orientation="right" hide />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'volume') {
                return [`${value}`, '웨이트'];
              }

              if (name === 'cardioValue') {
                return [`${value}`, '유산소'];
              }

              return [value, name];
            }}
          />
          <Bar dataKey="volume" fill="#e60023" radius={[6, 6, 0, 0]} />
          <Line
            yAxisId="cardio"
            type="monotone"
            dataKey="cardioValue"
            stroke="var(--text-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--text-primary)' }}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
