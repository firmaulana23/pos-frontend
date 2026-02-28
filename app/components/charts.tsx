'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  color?: string;
}

export const SimpleLineChart = ({ data, title, height = 300, color = '#3b82f6' }: SimpleChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="w-full h-64 flex items-center justify-center text-slate-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
          <p className="text-sm font-bold" style={{ color: payload[0].color || color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card w-full p-0 sm:p-4">
      {title && <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white px-4 pt-4 sm:p-0">{title}</h3>}
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => {
                if (value === 0) return '0';
                if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
                return `Rp ${value}`;
              }}
              width={80}
            />
            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: ChartDataPoint[];
  title?: string;
  color?: string;
}

export const SimpleBarChart = ({ data, title, color = '#3b82f6' }: BarChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="w-full h-64 flex items-center justify-center text-slate-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="card">
      {title && <h3 className="text-lg font-semibold mb-6">{title}</h3>}
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{item.value.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  formatValue?: (value: number) => string;
}

export const SimpleDonutChart = ({ data, title, formatValue }: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const segments = data.map((item, i) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    return {
      ...item,
      percentage,
      color: item.color || colors[i % colors.length],
    };
  });

  let currentAngle = -90;
  const radius = 80;
  const centerX = 120;
  const centerY = 120;
  const innerRadius = 60;

  const pathSegments = segments.map((segment) => {
    const segmentAngle = (segment.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + segmentAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + innerRadius * Math.cos(startRad);
    const y1 = centerY + innerRadius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(startRad);
    const y2 = centerY + radius * Math.sin(startRad);
    const x3 = centerX + radius * Math.cos(endRad);
    const y3 = centerY + radius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(endRad);
    const y4 = centerY + innerRadius * Math.sin(endRad);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x2} ${y2}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x3} ${y3}`,
      `L ${x4} ${y4}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
      'Z',
    ].join(' ');

    currentAngle = endAngle;

    return { pathData, color: segment.color, label: segment.label, percentage: segment.percentage, value: segment.value };
  });

  return (
    <div className="card">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex flex-col items-center">
        <svg width="240" height="240" viewBox="0 0 240 240" className="mb-6">
          {pathSegments.map((segment, i) => (
            <path key={i} d={segment.pathData} fill={segment.color} stroke="white" strokeWidth="2" />
          ))}
        </svg>

        <div className="w-full space-y-2">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }}></div>
                <span className="text-slate-700 dark:text-slate-300">{segment.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-50">{segment.percentage.toFixed(1)}%</span>
                {formatValue && <span className="text-xs text-slate-600 dark:text-slate-400">{formatValue(segment.value)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
