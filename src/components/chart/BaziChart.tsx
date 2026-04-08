'use client';

import type { ChartData } from '@/lib/bazi/types';

const WUXING_COLORS: Record<string, string> = {
  '甲': 'text-green-400', '乙': 'text-green-300',
  '丙': 'text-red-400', '丁': 'text-red-300',
  '戊': 'text-yellow-400', '己': 'text-yellow-300',
  '庚': 'text-slate-300', '辛': 'text-slate-200',
  '壬': 'text-blue-400', '癸': 'text-blue-300',
  '寅': 'text-green-400', '卯': 'text-green-300',
  '巳': 'text-red-400', '午': 'text-red-300',
  '辰': 'text-yellow-400', '戌': 'text-yellow-300', '丑': 'text-yellow-200', '未': 'text-yellow-200',
  '申': 'text-slate-300', '酉': 'text-slate-200',
  '亥': 'text-blue-400', '子': 'text-blue-300',
};

const SHISHEN_COLORS: Record<string, string> = {
  '比肩': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  '劫财': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  '食神': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '伤官': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  '偏财': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '正财': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  '七杀': 'bg-red-500/20 text-red-300 border-red-500/30',
  '正官': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  '偏印': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  '正印': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  '日主': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

function WuXingBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-6 text-right">{label}</span>
      <div className="flex-1 h-3 bg-amber-900/20 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-amber-400/70 w-4">{count}</span>
    </div>
  );
}

interface BaziChartProps {
  chartData: ChartData;
  compact?: boolean;
}

export default function BaziChart({ chartData, compact }: BaziChartProps) {
  const pillars = [
    { label: '年柱', sub: '祖上', p: chartData.yearPillar },
    { label: '月柱', sub: '父母', p: chartData.monthPillar },
    { label: '日柱', sub: '自己', p: chartData.dayPillar },
    { label: '時柱', sub: '子女', p: chartData.hourPillar },
  ];

  const maxWx = Math.max(chartData.wuXing.wood, chartData.wuXing.fire, chartData.wuXing.earth, chartData.wuXing.metal, chartData.wuXing.water, 1);

  return (
    <div className="w-full max-w-[700px] mx-auto">
      {/* Center info */}
      {!compact && (
        <div className="text-center mb-4">
          <div className="text-amber-500/60 text-[10px] tracking-widest">八字命盤</div>
          <div className="text-amber-300 text-lg font-bold">
            {chartData.birthData.year}/{chartData.birthData.month}/{chartData.birthData.day}
          </div>
          <div className="text-amber-200/60 text-xs">
            {chartData.birthData.gender} ｜ {chartData.lunarDate} ｜ {chartData.shengXiao} ｜ {chartData.xingZuo}座
          </div>
          <div className="text-amber-400 text-sm mt-1">
            日主：<span className={`font-bold text-lg ${WUXING_COLORS[chartData.dayMaster] || ''}`}>{chartData.dayMaster}</span>
            <span className="text-amber-200/60 text-xs ml-1">（{chartData.dayMasterElement}）</span>
          </div>
        </div>
      )}

      {/* Four Pillars */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {pillars.map(({ label, sub, p }) => {
          const isDay = label === '日柱';
          return (
            <div key={label} className={`rounded-xl border p-3 text-center ${
              isDay ? 'bg-amber-900/20 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-amber-950/30 border-amber-800/30'
            }`}>
              {/* Header */}
              <div className="text-[10px] text-amber-500/60 mb-0.5">{label}</div>
              <div className="text-[9px] text-amber-600/40 mb-2">{sub}</div>

              {/* 十神 */}
              <div className="mb-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${SHISHEN_COLORS[p.shiShenGan] || 'border-amber-700/30 text-amber-400'}`}>
                  {p.shiShenGan}
                </span>
              </div>

              {/* 天干 */}
              <div className={`text-2xl font-bold mb-1 ${WUXING_COLORS[p.gan] || 'text-amber-200'}`}>
                {p.gan}
              </div>

              {/* 地支 */}
              <div className={`text-2xl font-bold mb-1 ${WUXING_COLORS[p.zhi] || 'text-amber-200'}`}>
                {p.zhi}
              </div>

              {/* 藏干 + 地支十神 */}
              {!compact && (
                <div className="mt-2 space-y-0.5">
                  {p.hideGan.map((hg, i) => (
                    <div key={i} className="flex items-center justify-center gap-1">
                      <span className={`text-[10px] ${WUXING_COLORS[hg] || ''}`}>{hg}</span>
                      {p.shiShenZhi[i] && (
                        <span className="text-[8px] text-amber-500/50">{p.shiShenZhi[i]}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 納音 + 長生 */}
              {!compact && (
                <div className="mt-2 border-t border-amber-800/20 pt-1">
                  <div className="text-[8px] text-amber-600/50">{p.naYin}</div>
                  <div className="text-[8px] text-amber-500/40">{p.diShi}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Five Elements Bar */}
      {!compact && (
        <div className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-4 mb-4">
          <div className="text-amber-400 text-xs font-bold text-center mb-3">五行分佈</div>
          <div className="space-y-2 max-w-xs mx-auto">
            <WuXingBar label="木" count={chartData.wuXing.wood} max={maxWx} color="bg-green-500" />
            <WuXingBar label="火" count={chartData.wuXing.fire} max={maxWx} color="bg-red-500" />
            <WuXingBar label="土" count={chartData.wuXing.earth} max={maxWx} color="bg-yellow-500" />
            <WuXingBar label="金" count={chartData.wuXing.metal} max={maxWx} color="bg-slate-400" />
            <WuXingBar label="水" count={chartData.wuXing.water} max={maxWx} color="bg-blue-500" />
          </div>
        </div>
      )}

      {/* Extra info */}
      {!compact && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-950/30 border border-amber-800/20 rounded-lg p-2">
            <div className="text-[9px] text-amber-500/50">胎元</div>
            <div className="text-amber-300 text-sm font-bold">{chartData.taiYuan}</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-800/20 rounded-lg p-2">
            <div className="text-[9px] text-amber-500/50">命宮</div>
            <div className="text-amber-300 text-sm font-bold">{chartData.mingGong}</div>
          </div>
          <div className="bg-amber-950/30 border border-amber-800/20 rounded-lg p-2">
            <div className="text-[9px] text-amber-500/50">身宮</div>
            <div className="text-amber-300 text-sm font-bold">{chartData.shenGong}</div>
          </div>
        </div>
      )}
    </div>
  );
}
