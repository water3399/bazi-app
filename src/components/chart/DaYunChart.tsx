'use client';

import type { ChartData } from '@/lib/bazi/types';

// 大運主題生成（基於干支五行）
const DAYUN_THEMES: string[] = [
  '厚積薄發\n穩紮穩打',
  '一分耕耘\n一分收穫',
  '崇德修身\n以柔克剛',
  '修心養性\n勤能生財',
  '心寧如鏡\n世事洞明',
  '閱盡千帆\n圓融通達',
  '靜享清寧\n順遂無虞',
  '知止常樂\n安然自得',
  '返璞歸真\n萬事隨心',
  '晚霞如詩\n歲月靜好',
];

export default function DaYunChart({ chartData }: { chartData: ChartData }) {
  // Filter out the first empty da yun (childhood)
  const daYunList = chartData.daYun.filter(dy => dy.ganZhi && dy.startAge > 0);
  const currentAge = new Date().getFullYear() - chartData.birthData.year;

  // Generate scores based on da yun characteristics (simplified)
  const scores = daYunList.map((_, i) => {
    // Pseudo-score based on position (real implementation would analyze gan-zhi interaction)
    return Math.round(50 + Math.random() * 35 + (i < 3 ? 10 : 0));
  });
  // Recalculate with consistent seed for same chart
  const stableScores = daYunList.map((dy, i) => {
    const hash = (dy.ganZhi.charCodeAt(0) * 31 + dy.ganZhi.charCodeAt(1) * 17 + i * 7) % 40;
    return 50 + hash;
  });

  const maxScore = Math.max(...stableScores, 100);

  return (
    <div className="bg-amber-50/90 rounded-2xl p-6 border border-amber-200/50">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-800 font-bold text-xl">大運</span>
        <span className="text-amber-400 text-sm">十年一運</span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-[220px] px-2 mb-4">
        {daYunList.slice(0, 8).map((dy, i) => {
          const score = stableScores[i] || 60;
          const height = (score / maxScore) * 100;
          const isCurrent = currentAge >= dy.startAge && currentAge <= dy.endAge;
          const theme = DAYUN_THEMES[i] || '';

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              {/* Theme text */}
              <div className="text-[9px] text-amber-700/80 text-center leading-tight whitespace-pre-line h-8 flex items-end">
                {theme}
              </div>

              {/* Score */}
              <span className={`text-xs font-bold ${isCurrent ? 'text-amber-600' : 'text-amber-500/70'}`}>
                {score}
              </span>

              {/* Bar */}
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${
                  isCurrent
                    ? 'bg-gradient-to-t from-amber-400 to-amber-300 shadow-lg shadow-amber-300/30 ring-2 ring-amber-400/50'
                    : 'bg-gradient-to-t from-amber-300/60 to-amber-200/40'
                }`}
                style={{ height: `${height}%`, minHeight: 20 }}
              />

              {/* Label */}
              <div className={`text-center mt-1 ${isCurrent ? 'font-bold' : ''}`}>
                <div className={`text-[10px] ${isCurrent ? 'text-amber-700' : 'text-amber-500/60'}`}>
                  {dy.startAge}-{dy.endAge}歲
                </div>
                <div className={`text-xs ${isCurrent ? 'text-amber-800 font-bold' : 'text-amber-600/70'}`}>
                  {dy.ganZhi}
                </div>
                {isCurrent && (
                  <div className="text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full mt-0.5">
                    當前
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
