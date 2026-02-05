'use client';

import { WeeklyVolumeItem } from '@/entities';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type WeeklyVolumeBarChartProps = {
  data: WeeklyVolumeItem[];
};

export function WeeklyVolumeBarChart({ data }: WeeklyVolumeBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 16, left: 4, bottom: 16 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
          <XAxis dataKey="day" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--surface)' }}
            contentStyle={{
              background: 'var(--white)',
              borderRadius: 8,
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          />
          <Bar dataKey="volume" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
