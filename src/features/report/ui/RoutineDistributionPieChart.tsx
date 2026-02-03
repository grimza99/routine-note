'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { RoutineDistributionItem } from '../model/report.query';

const pieColors = ['var(--primary)', '#1a1a1a', '#666666', '#e0e0e0', '#f7f7f7'];

type RoutineDistributionPieChartProps = {
  data: RoutineDistributionItem[];
};

export function RoutineDistributionPieChart({ data }: RoutineDistributionPieChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            contentStyle={{
              background: 'var(--white)',
              borderRadius: 8,
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              fontSize: 12,
            }}
          />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="50%" outerRadius="80%">
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
