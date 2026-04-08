'use client';

import type { ChartData } from '@/lib/bazi/types';

// 十神分佈計算
function calcShiShenDistribution(chart: ChartData): Record<string, number> {
  const dist: Record<string, number> = {};
  const allShiShen = [
    chart.yearPillar.shiShenGan,
    chart.monthPillar.shiShenGan,
    chart.hourPillar.shiShenGan,
    ...chart.yearPillar.shiShenZhi,
    ...chart.monthPillar.shiShenZhi,
    ...chart.dayPillar.shiShenZhi,
    ...chart.hourPillar.shiShenZhi,
  ].filter(s => s && s !== '日主');

  for (const ss of allShiShen) {
    dist[ss] = (dist[ss] || 0) + 1;
  }
  return dist;
}

const SHISHEN_COLORS: Record<string, string> = {
  '比肩': '#9CA3AF', '劫财': '#F59E0B',
  '食神': '#6366F1', '伤官': '#3B82F6',
  '正财': '#10B981', '偏财': '#34D399',
  '正官': '#EF4444', '七杀': '#DC2626',
  '正印': '#92400E', '偏印': '#A3A3A3',
};

const SHISHEN_LIST = ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'];

export default function LiuNianChart({ chartData }: { chartData: ChartData }) {
  const currentYear = new Date().getFullYear();

  // Find current da yun's liu nian
  let liuNianData: { year: number; ganZhi: string; age: number }[] = [];
  for (const dy of chartData.daYun) {
    if (dy.liuNian.some(ln => ln.year >= currentYear - 2 && ln.year <= currentYear + 8)) {
      liuNianData = dy.liuNian.filter(ln => ln.year >= currentYear - 1 && ln.year <= currentYear + 9);
      break;
    }
  }

  // Generate scores for each year
  const yearScores = liuNianData.map(ln => {
    const hash = (ln.ganZhi.charCodeAt(0) * 37 + ln.ganZhi.charCodeAt(1) * 13 + ln.year * 3) % 30;
    return { ...ln, score: 58 + hash };
  });

  const maxScore = Math.max(...yearScores.map(y => y.score), 100);
  const minScore = Math.min(...yearScores.map(y => y.score), 0);

  // 十神分佈
  const shiShenDist = calcShiShenDistribution(chartData);
  const totalShiShen = Object.values(shiShenDist).reduce((a, b) => a + b, 0);
  const maxShiShen = Math.max(...Object.values(shiShenDist), 1);

  return (
    <div className="space-y-6">
      {/* 流年折線圖 */}
      <div className="bg-amber-50/90 rounded-2xl p-6 border border-amber-200/50">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-amber-400 text-lg">大運</span>
          <span className="text-amber-800 font-bold text-xl border-b-2 border-amber-500 pb-0.5">流年</span>
        </div>

        {/* Line chart area */}
        <div className="relative h-[180px] mb-2">
          <svg viewBox={`0 0 ${yearScores.length * 60} 180`} className="w-full h-full" preserveAspectRatio="none">
            {/* Background grid */}
            {[0, 45, 90, 135].map(y => (
              <line key={y} x1="0" y1={y} x2={yearScores.length * 60} y2={y} stroke="rgba(180,150,80,0.1)" strokeWidth="0.5" />
            ))}

            {/* Area fill */}
            <path
              d={`M ${yearScores.map((y, i) => `${i * 60 + 30},${180 - ((y.score - minScore + 10) / (maxScore - minScore + 20)) * 160}`).join(' L ')} L ${(yearScores.length - 1) * 60 + 30},180 L 30,180 Z`}
              fill="rgba(245, 158, 11, 0.08)"
            />

            {/* Line */}
            <polyline
              points={yearScores.map((y, i) => `${i * 60 + 30},${180 - ((y.score - minScore + 10) / (maxScore - minScore + 20)) * 160}`).join(' ')}
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Points + labels */}
            {yearScores.map((y, i) => {
              const cx = i * 60 + 30;
              const cy = 180 - ((y.score - minScore + 10) / (maxScore - minScore + 20)) * 160;
              const isCurrent = y.year === currentYear;
              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={isCurrent ? 5 : 3} fill={isCurrent ? '#D97706' : '#FFF'} stroke="#D97706" strokeWidth={isCurrent ? 2 : 1.5} />
                  <text x={cx} y={cy - 10} textAnchor="middle" fontSize="10" fill={isCurrent ? '#92400E' : '#B45309'} fontWeight={isCurrent ? 'bold' : 'normal'}>
                    {y.score}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Da yun transition marker */}
          {chartData.daYun.map(dy => {
            const transitionYear = chartData.birthData.year + dy.startAge;
            const idx = yearScores.findIndex(y => y.year === transitionYear);
            if (idx < 0) return null;
            return (
              <div key={dy.ganZhi} className="absolute bottom-0" style={{ left: `${(idx / yearScores.length) * 100}%`, transform: 'translateX(-50%)' }}>
                <div className="border-l border-dashed border-amber-400/50 h-[180px]" />
                <span className="text-[9px] text-amber-500/60">{dy.ganZhi}</span>
              </div>
            );
          })}
        </div>

        {/* Year labels */}
        <div className="flex">
          {yearScores.map((y, i) => {
            const isCurrent = y.year === currentYear;
            return (
              <div key={i} className="flex-1 text-center">
                <div className={`text-xs ${isCurrent ? 'text-amber-800 font-bold' : 'text-amber-500/60'}`}>{y.year}</div>
                <div className={`text-[10px] ${isCurrent ? 'text-amber-700 font-bold' : 'text-amber-400/50'}`}>{y.age}歲</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 十神占比 */}
      <div className="bg-amber-50/90 rounded-2xl p-6 border border-amber-200/50">
        <div className="text-amber-800 font-bold text-lg mb-4">【十神占比】</div>
        <div className="flex items-end gap-2 h-[150px] mb-3">
          {SHISHEN_LIST.map(ss => {
            const count = shiShenDist[ss] || 0;
            const pct = totalShiShen > 0 ? Math.round((count / totalShiShen) * 100) : 0;
            const height = maxShiShen > 0 ? (count / maxShiShen) * 100 : 0;
            const color = SHISHEN_COLORS[ss] || '#999';

            return (
              <div key={ss} className="flex-1 flex flex-col items-center min-w-0">
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.max(height, 5)}%`, background: `${color}80`, minHeight: 4 }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          {SHISHEN_LIST.map(ss => {
            const count = shiShenDist[ss] || 0;
            const pct = totalShiShen > 0 ? Math.round((count / totalShiShen) * 100) : 0;
            const color = SHISHEN_COLORS[ss] || '#999';
            return (
              <div key={ss} className="flex-1 text-center min-w-0">
                <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ background: color }} />
                <div className="text-[9px] text-amber-700 truncate">{ss}</div>
                <div className="text-[9px] text-amber-500/60">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
