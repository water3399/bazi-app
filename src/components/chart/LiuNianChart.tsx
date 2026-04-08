'use client';

import type { ChartData } from '@/lib/bazi/types';

// 十神質感色系
const SHISHEN_STYLES: Record<string, { color: string; emoji: string }> = {
  '比肩': { color: '#9BA4B0', emoji: '🛡️' },
  '劫财': { color: '#D4A843', emoji: '⚡' },
  '食神': { color: '#8B7EC8', emoji: '🎨' },
  '伤官': { color: '#6B8DB5', emoji: '💡' },
  '正财': { color: '#5B9E7A', emoji: '🌿' },
  '偏财': { color: '#6BC4A0', emoji: '🍀' },
  '正官': { color: '#C47A7A', emoji: '👔' },
  '七杀': { color: '#B85C5C', emoji: '⚔️' },
  '正印': { color: '#A07850', emoji: '📚' },
  '偏印': { color: '#8C8C8C', emoji: '🔮' },
};

const SHISHEN_LIST = ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印'];

function calcShiShenDist(chart: ChartData): Record<string, number> {
  const dist: Record<string, number> = {};
  [chart.yearPillar.shiShenGan, chart.monthPillar.shiShenGan, chart.hourPillar.shiShenGan,
    ...chart.yearPillar.shiShenZhi, ...chart.monthPillar.shiShenZhi,
    ...chart.dayPillar.shiShenZhi, ...chart.hourPillar.shiShenZhi,
  ].filter(s => s && s !== '日主').forEach(s => { dist[s] = (dist[s] || 0) + 1; });
  return dist;
}

export default function LiuNianChart({ chartData }: { chartData: ChartData }) {
  const currentYear = new Date().getFullYear();

  // Collect ALL liu nian across all da yun (for full timeline)
  const allLiuNian: { year: number; ganZhi: string; age: number; score: number; daYunGanZhi: string }[] = [];
  for (const dy of chartData.daYun) {
    for (const ln of dy.liuNian) {
      const hash = (ln.ganZhi.charCodeAt(0) * 37 + ln.ganZhi.charCodeAt(1) * 13 + ln.year * 3) % 30;
      allLiuNian.push({ ...ln, score: 58 + hash, daYunGanZhi: dy.ganZhi });
    }
  }

  // Show ±10 years from current year (scrollable)
  const startYear = currentYear - 5;
  const endYear = currentYear + 15;
  const visibleYears = allLiuNian.filter(y => y.year >= startYear && y.year <= endYear);

  const maxScore = Math.max(...visibleYears.map(y => y.score), 100);
  const minScore = Math.min(...visibleYears.map(y => y.score), 40);
  const range = maxScore - minScore + 20;

  // 十神分佈
  const shiShenDist = calcShiShenDist(chartData);
  const totalSS = Object.values(shiShenDist).reduce((a, b) => a + b, 0);
  const maxSS = Math.max(...SHISHEN_LIST.map(s => shiShenDist[s] || 0), 1);

  return (
    <div className="space-y-6">
      {/* 流年折線圖 */}
      <div className="bg-[#F5F0E8] rounded-2xl p-6 border border-[#E0D5C0]">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[#A69070] text-lg">大運</span>
          <span className="text-[#6B5B3E] font-bold text-xl border-b-2 border-[#C9A84C] pb-0.5">📈 流年</span>
        </div>

        {/* Scrollable chart */}
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div style={{ minWidth: visibleYears.length * 80 }}>
            {/* SVG line chart */}
            <div className="relative h-[200px] mb-2">
              <svg viewBox={`0 0 ${visibleYears.length * 80} 200`} className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[40, 80, 120, 160].map(y => (
                  <line key={y} x1="0" y1={y} x2={visibleYears.length * 80} y2={y} stroke="rgba(160,140,100,0.08)" strokeWidth="0.5" />
                ))}

                {/* Area fill */}
                <path
                  d={`M ${visibleYears.map((y, i) => `${i*80+40},${200 - ((y.score-minScore+10)/range)*180}`).join(' L ')} L ${(visibleYears.length-1)*80+40},200 L 40,200 Z`}
                  fill="rgba(201, 168, 76, 0.08)"
                />

                {/* Line */}
                <polyline
                  points={visibleYears.map((y, i) => `${i*80+40},${200 - ((y.score-minScore+10)/range)*180}`).join(' ')}
                  fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                />

                {/* Points */}
                {visibleYears.map((y, i) => {
                  const cx = i * 80 + 40;
                  const cy = 200 - ((y.score - minScore + 10) / range) * 180;
                  const isCurr = y.year === currentYear;
                  return (
                    <g key={i}>
                      {isCurr && <circle cx={cx} cy={cy} r="12" fill="rgba(201,168,76,0.15)" />}
                      <circle cx={cx} cy={cy} r={isCurr ? 7 : 4} fill={isCurr ? '#C9A84C' : '#F5F0E8'} stroke="#C9A84C" strokeWidth={isCurr ? 3 : 2} />
                      <text x={cx} y={cy - 16} textAnchor="middle" fontSize={isCurr ? '14' : '11'} fontWeight={isCurr ? 'bold' : 'normal'} fill={isCurr ? '#6B5B3E' : '#A69070'}>
                        {y.score}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Da yun transition markers */}
              {chartData.daYun.filter(dy => dy.ganZhi).map(dy => {
                const tYear = chartData.birthData.year + dy.startAge;
                const idx = visibleYears.findIndex(y => y.year === tYear);
                if (idx < 0) return null;
                return (
                  <div key={dy.ganZhi} className="absolute top-0 h-full" style={{ left: `${((idx * 80 + 40) / (visibleYears.length * 80)) * 100}%` }}>
                    <div className="border-l border-dashed border-[#C9A84C]/30 h-full" />
                    <span className="absolute bottom-0 text-[8px] text-[#C9A84C]/50 -translate-x-1/2">{dy.ganZhi}</span>
                  </div>
                );
              })}
            </div>

            {/* Year labels */}
            <div className="flex">
              {visibleYears.map((y, i) => {
                const isCurr = y.year === currentYear;
                return (
                  <div key={i} className="text-center" style={{ width: 80 }}>
                    <div className={`text-xs ${isCurr ? 'text-[#6B5B3E] font-bold' : 'text-[#A69070]'}`}>{y.year}</div>
                    <div className={`text-[10px] ${isCurr ? 'text-[#8C7A62] font-bold' : 'text-[#B8A48C]'}`}>{y.age}歲</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 十神占比 */}
      <div className="bg-[#F5F0E8] rounded-2xl p-6 border border-[#E0D5C0]">
        <div className="text-[#6B5B3E] font-bold text-lg mb-6">🔮【十神占比】</div>

        {/* Vertical bars */}
        <div className="flex items-end gap-3 mb-4" style={{ height: 200 }}>
          {SHISHEN_LIST.map(ss => {
            const count = shiShenDist[ss] || 0;
            const pct = totalSS > 0 ? Math.round((count / totalSS) * 100) : 0;
            const height = maxSS > 0 ? Math.max((count / maxSS) * 100, pct > 0 ? 15 : 5) : 5;
            const style = SHISHEN_STYLES[ss] || { color: '#999', emoji: '•' };

            return (
              <div key={ss} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t-xl transition-all duration-700"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, ${style.color}40, ${style.color}20)`,
                    borderTop: `3px solid ${style.color}`,
                    minHeight: 8,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels */}
        <div className="flex gap-3">
          {SHISHEN_LIST.map(ss => {
            const pct = totalSS > 0 ? Math.round(((shiShenDist[ss] || 0) / totalSS) * 100) : 0;
            const style = SHISHEN_STYLES[ss] || { color: '#999', emoji: '•' };
            return (
              <div key={ss} className="flex-1 text-center">
                <div className="w-5 h-5 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px]" style={{ background: style.color }}>
                  <span className="text-white text-[8px]">{style.emoji}</span>
                </div>
                <div className="text-[9px] text-[#6B5B3E] font-medium truncate">{ss}</div>
                <div className="text-[10px] text-[#A69070] font-bold">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
