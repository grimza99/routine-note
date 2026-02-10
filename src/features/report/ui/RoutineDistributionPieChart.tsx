'use client';

import { RoutineDistributionItem } from '@/entities';
import { Pie, PieChart, PieLabelRenderProps, ResponsiveContainer, Sector } from 'recharts';

const COLORS = ['var(--primary)', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

type RoutineDistributionPieChartProps = {
  data: RoutineDistributionItem[];
};

export function RoutineDistributionPieChart({ data }: RoutineDistributionPieChartProps) {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name }: PieLabelRenderProps) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fontSize={12} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
        {name}
      </text>
    );
  };
  return (
    <div className="h-100 w-full">
      <ResponsiveContainer>
        <PieChart width={500} height={400}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            label={renderCustomizedLabel}
            labelLine={false}
            shape={(props) => {
              const fill = COLORS[props.index % COLORS.length];

              return <Sector {...props} fill={fill} />;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
