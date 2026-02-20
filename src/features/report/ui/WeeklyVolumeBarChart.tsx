'use client';

import { WeeklyVolumeItem } from '@/entities';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type WeeklyVolumeBarChartProps = {
  data: WeeklyVolumeItem[];
};

export function WeeklyVolumeBarChart({ data }: WeeklyVolumeBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -30, right: 30 }}>
          <XAxis dataKey="day" stroke="var(--text-secondary)" tickLine={false} axisLine={true} />
          <YAxis stroke="var(--text-secondary)" tickLine={false} axisLine={true} />
          <Bar dataKey="volume" fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
