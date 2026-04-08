'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChartData } from '@/lib/bazi/types';

const SHISHEN_STYLES: Record<string, { color: string; emoji: string }> = {
  '比肩': { color: '#7A8490', emoji: '🛡️' },
  '劫財': { color: '#C9A84C', emoji: '⚡' },
  '食神': { color: '#8B7EC8', emoji: '🎨' },
  '傷官': { color: '#6B8DB5', emoji: '💡' },
  '正財': { color: '#5B9E7A', emoji: '🌿' },
  '偏財': { color: '#6BC4A0', emoji: '🍀' },
  '正官': { color: '#C47A7A', emoji: '👔' },
  '七殺': { color: '#B85C5C', emoji: '⚔️' },
  '正印': { color: '#A07850', emoji: '📚' },
  '偏印': { color: '#7A7A7A', emoji: '🔮' },
};

const SHISHEN_LIST = ['比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '七殺', '正印', '偏印'];

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
  const birthYear = chartData.birthData.year;

  // Collect ALL liu nian
  const allLiuNian: { year: number; ganZhi: string; age: number; score: number; daYunGanZhi: string }[] = [];
  for (const dy of chartData.daYun) {
    for (const ln of dy.liuNian) {
      const hash = (ln.ganZhi.charCodeAt(0) * 37 + ln.ganZhi.charCodeAt(1) * 13 + ln.year * 3) % 30;
      allLiuNian.push({ ...ln, score: 58 + hash, daYunGanZhi: dy.ganZhi });
    }
  }

  // Year range: from birth to +20 from now
  const minYear = Math.max(birthYear, allLiuNian.length > 0 ? allLiuNian[0].year : birthYear);
  const maxYear = Math.min(currentYear + 20, allLiuNian.length > 0 ? allLiuNian[allLiuNian.length - 1].year : currentYear + 20);

  // Generate decade options for quick jump
  const decadeOptions: number[] = [];
  for (let y = Math.floor(minYear / 10) * 10; y <= maxYear; y += 10) {
    if (y >= minYear) decadeOptions.push(y);
  }

  const [viewStart, setViewStart] = useState(Math.max(currentYear - 3, minYear));
  const scrollRef = useRef<HTMLDivElement>(null);

  // Window of 20 years from viewStart
  const windowSize = 20;
  const visibleYears = allLiuNian.filter(y => y.year >= viewStart && y.year < viewStart + windowSize);

  const maxScore = visibleYears.length > 0 ? Math.max(...visibleYears.map(y => y.score)) : 100;
  const minScore = visibleYears.length > 0 ? Math.min(...visibleYears.map(y => y.score)) : 40;
  const range = Math.max(maxScore - minScore + 20, 40);

  // Auto scroll to current year on mount
  useEffect(() => {
    if (scrollRef.current) {
      const idx = visibleYears.findIndex(y => y.year === currentYear);
      if (idx >= 0) {
        scrollRef.current.scrollLeft = Math.max(0, idx * 80 - 200);
      }
    }
  }, [viewStart]);

  // 十神分佈
  const shiShenDist = calcShiShenDist(chartData);
  const totalSS = Object.values(shiShenDist).reduce((a, b) => a + b, 0);
  const maxSS = Math.max(...SHISHEN_LIST.map(s => shiShenDist[s] || 0), 1);

  return (
    <div className="space-y-6">
      {/* 流年折線圖 */}
      <div className="bg-[#1E1810] rounded-2xl p-6 border border-[#3D3020]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-[#8C7A62] text-lg">大運</span>
            <span className="text-[#C9A84C] font-bold text-xl border-b-2 border-[#C9A84C] pb-0.5">📈 流年</span>
          </div>
        </div>

        {/* Year range selector */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-[#8C7A62] text-xs shrink-0">跳至：</span>
          {decadeOptions.map(y => (
            <button key={y} onClick={() => setViewStart(y)}
              className={`px-3 py-1 rounded-lg text-xs shrink-0 transition-all ${
                viewStart <= y && viewStart + windowSize > y
                  ? 'bg-[#C9A84C]/20 border border-[#C9A84C]/50 text-[#C9A84C]'
                  : 'bg-[#2A2018] border border-[#3D3020] text-[#8C7A62] hover:border-[#C9A84C]/30'
              }`}>
              {y}s
            </button>
          ))}
          <button onClick={() => setViewStart(Math.max(currentYear - 3, minYear))}
            className="px-3 py-1 rounded-lg text-xs shrink-0 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20">
            📍 今年
          </button>
        </div>

        {/* Navigate arrows + scrollable chart */}
        <div className="flex items-center gap-2">
          <button onClick={() => setViewStart(Math.max(viewStart - 10, minYear))}
            disabled={viewStart <= minYear}
            className="shrink-0 w-8 h-8 rounded-full bg-[#2A2018] border border-[#3D3020] text-[#C9A84C] text-sm disabled:opacity-30 hover:bg-[#3D3020]">
            ◀
          </button>

          <div ref={scrollRef} className="flex-1 overflow-x-auto pb-2">
            <div style={{ minWidth: visibleYears.length * 80 }}>
              <div className="relative h-[220px] mb-2">
                <svg viewBox={`0 0 ${visibleYears.length * 80} 220`} className="w-full h-full" preserveAspectRatio="none">
                  {[50, 100, 150, 200].map(y => (
                    <line key={y} x1="0" y1={y} x2={visibleYears.length * 80} y2={y} stroke="rgba(160,140,100,0.06)" strokeWidth="0.5" />
                  ))}
                  <path
                    d={`M ${visibleYears.map((y, i) => `${i*80+40},${220 - ((y.score-minScore+10)/range)*200}`).join(' L ')} L ${(visibleYears.length-1)*80+40},220 L 40,220 Z`}
                    fill="rgba(201, 168, 76, 0.06)"
                  />
                  <polyline
                    points={visibleYears.map((y, i) => `${i*80+40},${220 - ((y.score-minScore+10)/range)*200}`).join(' ')}
                    fill="none" stroke="#C9A84C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                  />
                  {visibleYears.map((y, i) => {
                    const cx = i * 80 + 40;
                    const cy = 220 - ((y.score - minScore + 10) / range) * 200;
                    const isCurr = y.year === currentYear;
                    return (
                      <g key={i}>
                        {isCurr && <circle cx={cx} cy={cy} r="14" fill="rgba(201,168,76,0.12)" />}
                        <circle cx={cx} cy={cy} r={isCurr ? 8 : 4} fill={isCurr ? '#C9A84C' : '#1E1810'} stroke="#C9A84C" strokeWidth={isCurr ? 3 : 2} />
                        <text x={cx} y={cy - 18} textAnchor="middle" fontSize={isCurr ? '15' : '11'} fontWeight={isCurr ? 'bold' : 'normal'} fill={isCurr ? '#C9A84C' : '#8C7A62'}>
                          {y.score}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex">
                {visibleYears.map((y, i) => {
                  const isCurr = y.year === currentYear;
                  return (
                    <div key={i} className="text-center" style={{ width: 80 }}>
                      <div className={`text-xs ${isCurr ? 'text-[#C9A84C] font-bold' : 'text-[#8C7A62]'}`}>{y.year}</div>
                      <div className={`text-[10px] ${isCurr ? 'text-[#A69070] font-bold' : 'text-[#5A4C38]'}`}>{y.age}歲</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button onClick={() => setViewStart(Math.min(viewStart + 10, maxYear - windowSize))}
            disabled={viewStart + windowSize >= maxYear}
            className="shrink-0 w-8 h-8 rounded-full bg-[#2A2018] border border-[#3D3020] text-[#C9A84C] text-sm disabled:opacity-30 hover:bg-[#3D3020]">
            ▶
          </button>
        </div>

        <div className="text-center mt-2 text-[10px] text-[#5A4C38]">
          顯示 {viewStart} - {viewStart + windowSize - 1} 年 ｜ 左右箭頭或上方按鈕切換年代
        </div>
      </div>

      {/* 十神占比 */}
      <div className="bg-[#1E1810] rounded-2xl p-6 border border-[#3D3020]">
        <div className="text-[#C9A84C] font-bold text-lg mb-6">🔮【十神占比】</div>

        <div className="flex items-end gap-3 mb-4" style={{ height: 220 }}>
          {SHISHEN_LIST.map(ss => {
            const count = shiShenDist[ss] || 0;
            const pct = totalSS > 0 ? Math.round((count / totalSS) * 100) : 0;
            const height = maxSS > 0 ? Math.max((count / maxSS) * 100, pct > 0 ? 20 : 5) : 5;
            const style = SHISHEN_STYLES[ss] || { color: '#999', emoji: '•' };
            return (
              <div key={ss} className="flex-1 flex flex-col items-center justify-end h-full">
                {pct > 0 && <span className="text-[10px] text-[#8C7A62] mb-1">{pct}%</span>}
                <div className="w-full rounded-t-xl transition-all duration-700"
                  style={{ height: `${height}%`, background: `linear-gradient(to top, ${style.color}50, ${style.color}25)`, borderTop: `3px solid ${style.color}`, minHeight: 8 }} />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          {SHISHEN_LIST.map(ss => {
            const pct = totalSS > 0 ? Math.round(((shiShenDist[ss] || 0) / totalSS) * 100) : 0;
            const style = SHISHEN_STYLES[ss] || { color: '#999', emoji: '•' };
            return (
              <div key={ss} className="flex-1 text-center">
                <div className="text-base mb-0.5">{style.emoji}</div>
                <div className="text-[9px] text-[#C9A84C] font-medium truncate">{ss}</div>
                <div className="text-[10px] text-[#8C7A62] font-bold">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
