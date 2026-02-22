'use client';

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

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Calculate SVG path for line chart
  const width = 100;
  const svgHeight = height;
  const padding = 40;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - padding * 2) + padding;
    const y = svgHeight - ((d.value - minValue) / range) * (svgHeight - padding * 2) - padding;
    return { x, y, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="card">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = (height / 5) * (i + 1);
            return (
              <line
                key={`grid-${i}`}
                x1="0"
                y1={y}
                x2={width}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4"
                strokeWidth="1"
              />
            );
          })}

          {/* Line */}
          <path d={pathD} stroke={color} strokeWidth="2" fill="none" />

          {/* Points */}
          {points.map((p, i) => (
            <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={color} />
          ))}

          {/* X axis */}
          <line x1="0" y1={height - padding + 20} x2={width} y2={height - padding + 20} stroke="#d1d5db" strokeWidth="2" />
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-4 px-10 text-xs text-slate-600">
          {data.map((d, i) => (
            <span key={i} className="truncate">
              {d.label}
            </span>
          ))}
        </div>
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
