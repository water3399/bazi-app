'use client';

import type { ChartData } from '@/lib/bazi/types';

const DAYUN_THEMES = [
  '🌱 厚積薄發\n穩紮穩打', '💪 一分耕耘\n一分收穫', '🧘 崇德修身\n以柔克剛',
  '💰 修心養性\n勤能生財', '🔮 心寧如鏡\n世事洞明', '🌊 閱盡千帆\n圓融通達',
  '🍃 靜享清寧\n順遂無虞', '☕ 知止常樂\n安然自得', '🌅 返璞歸真\n萬事隨心',
  '🎐 晚霞如詩\n歲月靜好',
];

export default function DaYunChart({ chartData }: { chartData: ChartData }) {
  const daYunList = chartData.daYun.filter(dy => dy.ganZhi && dy.startAge > 0);
  const currentAge = new Date().getFullYear() - chartData.birthData.year;

  const stableScores = daYunList.map((dy, i) => {
    const hash = (dy.ganZhi.charCodeAt(0) * 31 + dy.ganZhi.charCodeAt(1) * 17 + i * 7) % 40;
    return 50 + hash;
  });

  return (
    <div className="bg-[#F5F0E8] rounded-2xl p-6 border border-[#E0D5C0]">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[#6B5B3E] font-bold text-xl">📊 大運</span>
        <span className="text-[#B8A48C] text-sm">十年一運</span>
      </div>

      {/* Horizontally scrollable */}
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex items-end gap-5" style={{ minWidth: daYunList.length * 120 }}>
          {daYunList.slice(0, 8).map((dy, i) => {
            const score = stableScores[i] || 60;
            const isCurrent = currentAge >= dy.startAge && currentAge <= dy.endAge;
            const theme = DAYUN_THEMES[i] || '';
            // Bar height: minimum 60px, scale to max 200px
            const barHeight = Math.max(60, (score / 100) * 200);

            return (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0" style={{ width: 100 }}>
                {/* Theme */}
                <div className="text-[10px] text-[#8C7A62] text-center leading-relaxed whitespace-pre-line min-h-[36px] flex items-end justify-center">
                  {theme}
                </div>

                {/* Score */}
                <span className={`text-lg font-bold ${isCurrent ? 'text-[#C9A84C]' : 'text-[#A69070]'}`}>
                  {score}
                </span>

                {/* Bar */}
                <div
                  className={`w-full rounded-2xl transition-all duration-700 ${
                    isCurrent
                      ? 'bg-gradient-to-t from-[#D4A843] to-[#E8C870] shadow-lg shadow-[#D4A843]/30 ring-2 ring-[#C9A84C]/40'
                      : 'bg-gradient-to-t from-[#E0D5C0] to-[#EDE5D5]'
                  }`}
                  style={{ height: barHeight }}
                />

                {/* Label */}
                <div className={`text-center ${isCurrent ? 'font-bold' : ''}`}>
                  <div className={`text-xs ${isCurrent ? 'text-[#6B5B3E]' : 'text-[#A69070]'}`}>
                    {dy.startAge}-{dy.endAge}歲
                  </div>
                  <div className={`text-sm ${isCurrent ? 'text-[#6B5B3E] font-bold' : 'text-[#8C7A62]'}`}>
                    {dy.ganZhi}
                  </div>
                  {isCurrent && (
                    <span className="inline-block text-[9px] bg-[#C9A84C] text-white px-2 py-0.5 rounded-full mt-1">
                      📍 當前
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
