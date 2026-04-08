'use client';

import type { ChartData } from '@/lib/bazi/types';

// 五行對應十神（相對於日主）
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const WUXING_RELATION: Record<string, Record<string, string>> = {
  '金': { '金': '比劫', '水': '食傷', '木': '正偏財', '火': '正偏官', '土': '正偏印' },
  '木': { '木': '比劫', '火': '食傷', '土': '正偏財', '金': '正偏官', '水': '正偏印' },
  '水': { '水': '比劫', '木': '食傷', '火': '正偏財', '土': '正偏官', '金': '正偏印' },
  '火': { '火': '比劫', '土': '食傷', '金': '正偏財', '水': '正偏官', '木': '正偏印' },
  '土': { '土': '比劫', '金': '食傷', '水': '正偏財', '木': '正偏官', '火': '正偏印' },
};

const WUXING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '木': { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  '火': { bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-300' },
  '土': { bg: 'bg-stone-200', text: 'text-stone-600', border: 'border-stone-300' },
  '金': { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
  '水': { bg: 'bg-blue-100', text: 'text-blue-500', border: 'border-blue-300' },
};

// 五行相生順序（圓環排列）
const WUXING_ORDER = ['火', '土', '金', '水', '木'];

// 幸運顏色
const LUCKY_COLORS: Record<string, string[]> = {
  '金': ['#F5F5DC', '#C0C0C0'], '木': ['#228B22', '#8FBC8F'],
  '水': ['#000080', '#4169E1'], '火': ['#DC143C', '#FF6347'],
  '土': ['#DAA520', '#D2B48C'],
};

// 幸運方位
const LUCKY_DIRS: Record<string, string> = {
  '金': '正西', '木': '正東', '水': '正北', '火': '正南', '土': '中央',
};

// 幸運數字
const LUCKY_NUMS: Record<string, string[]> = {
  '金': ['6', '7'], '木': ['3', '8'], '水': ['1', '6'], '火': ['2', '7'], '土': ['5', '0'],
};

function getWuXingPercentages(chart: ChartData): Record<string, number> {
  const total = chart.wuXing.wood + chart.wuXing.fire + chart.wuXing.earth + chart.wuXing.metal + chart.wuXing.water;
  if (total === 0) return { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  return {
    '木': Math.round((chart.wuXing.wood / total) * 100),
    '火': Math.round((chart.wuXing.fire / total) * 100),
    '土': Math.round((chart.wuXing.earth / total) * 100),
    '金': Math.round((chart.wuXing.metal / total) * 100),
    '水': Math.round((chart.wuXing.water / total) * 100),
  };
}

function getXiYong(chart: ChartData): string[] {
  // 簡化版喜用神：日主五行偏弱則喜生扶，偏旺則喜剋洩
  const dayElement = GAN_WUXING[chart.dayMaster] || '金';
  const total = chart.wuXing.wood + chart.wuXing.fire + chart.wuXing.earth + chart.wuXing.metal + chart.wuXing.water;
  const dayCount = {
    '金': chart.wuXing.metal, '木': chart.wuXing.wood, '水': chart.wuXing.water,
    '火': chart.wuXing.fire, '土': chart.wuXing.earth,
  }[dayElement] || 0;
  const ratio = total > 0 ? dayCount / total : 0;

  const sheng: Record<string, string> = { '金': '土', '木': '水', '水': '金', '火': '木', '土': '火' };
  const ke: Record<string, string> = { '金': '火', '木': '金', '水': '土', '火': '水', '土': '木' };

  if (ratio < 0.3) {
    // 偏弱：喜印（生我的）和比劫（同類）
    return [sheng[dayElement], dayElement];
  } else {
    // 偏旺或中和：喜官（剋我的）和食傷（我生的）
    return [ke[dayElement], { '金': '水', '木': '火', '水': '木', '火': '土', '土': '金' }[dayElement] || ''];
  }
}

// 圓環上的位置（5個元素均勻分佈）
const POSITIONS = [
  { x: 50, y: 8 },   // 火（上）
  { x: 90, y: 38 },  // 土（右上）
  { x: 78, y: 82 },  // 金（右下）
  { x: 22, y: 82 },  // 水（左下）
  { x: 10, y: 38 },  // 木（左上）
];

export default function WuXingCircle({ chartData }: { chartData: ChartData }) {
  const pcts = getWuXingPercentages(chartData);
  const dayElement = GAN_WUXING[chartData.dayMaster] || '金';
  const xiYong = getXiYong(chartData);
  const total = chartData.wuXing.wood + chartData.wuXing.fire + chartData.wuXing.earth + chartData.wuXing.metal + chartData.wuXing.water;
  const dayRatio = total > 0 ? ({
    '金': chartData.wuXing.metal, '木': chartData.wuXing.wood, '水': chartData.wuXing.water,
    '火': chartData.wuXing.fire, '土': chartData.wuXing.earth,
  }[dayElement] || 0) / total : 0;
  const strength = dayRatio >= 0.35 ? '偏旺型' : dayRatio >= 0.2 ? '中和型' : '偏弱型';

  const relations = WUXING_RELATION[dayElement] || {};

  return (
    <div className="bg-amber-50/90 rounded-2xl p-6 border border-amber-200/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-amber-800 font-bold text-lg">【{strength}】</span>
        <span className="text-amber-500 text-xs">日主：{chartData.dayMaster}（{dayElement}）</span>
      </div>

      {/* Circle */}
      <div className="relative w-[280px] h-[280px] mx-auto mb-6">
        {/* 生剋箭頭用文字表示 */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
          {/* 相生箭頭（外圈順時針） */}
          {[0,1,2,3,4].map(i => {
            const from = POSITIONS[i];
            const to = POSITIONS[(i+1) % 5];
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <g key={`sheng-${i}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(160,120,60,0.15)" strokeWidth="0.5" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="4" fill="rgba(160,120,60,0.4)">生</text>
              </g>
            );
          })}
          {/* 相剋箭頭（星形） */}
          {[0,1,2,3,4].map(i => {
            const from = POSITIONS[i];
            const to = POSITIONS[(i+2) % 5];
            const mx = (from.x + to.x) / 2 + (i % 2 === 0 ? 3 : -3);
            const my = (from.y + to.y) / 2;
            return (
              <g key={`ke-${i}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(160,120,60,0.08)" strokeWidth="0.3" strokeDasharray="1,1" />
                <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="rgba(160,120,60,0.25)">剋</text>
              </g>
            );
          })}
        </svg>

        {/* 五行圓球 */}
        {WUXING_ORDER.map((wx, i) => {
          const pos = POSITIONS[i];
          const colors = WUXING_COLORS[wx];
          const pct = pcts[wx];
          const isDay = wx === dayElement;
          const relation = relations[wx] || '';
          const size = Math.max(48, Math.min(72, 40 + pct));

          return (
            <div
              key={wx}
              className={`absolute flex flex-col items-center justify-center rounded-full border-2 ${colors.bg} ${colors.border} ${isDay ? 'ring-2 ring-amber-400 shadow-lg' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -50%)',
                width: size,
                height: size,
              }}
            >
              <span className={`font-bold text-lg ${colors.text}`}>{wx}</span>
              <span className={`text-xs ${colors.text} opacity-70`}>{pct}%</span>
              {isDay && <span className="text-[8px] bg-amber-500 text-white px-1.5 rounded-full mt-0.5">日主</span>}
            </div>
          );
        })}

        {/* 十神標籤 */}
        {WUXING_ORDER.map((wx, i) => {
          const pos = POSITIONS[i];
          const relation = relations[wx] || '';
          if (!relation || wx === dayElement) return null;
          const offsetX = pos.x > 50 ? 14 : -14;
          return (
            <span
              key={`rel-${wx}`}
              className="absolute text-[10px] text-amber-600/70"
              style={{ left: `${pos.x + offsetX}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {relation}
            </span>
          );
        })}
      </div>

      {/* 喜用神 */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-amber-800 font-bold text-lg">【喜用 {xiYong.join('、')}】</span>
          <span className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
      </div>

      {/* 幸運資訊 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-amber-600 text-xs mb-2">幸運顏色</div>
          <div className="flex justify-center gap-2">
            {xiYong.map((wx, i) => (
              <div key={i} className="w-8 h-8 rounded-full border border-amber-200" style={{ background: LUCKY_COLORS[wx]?.[0] || '#ccc' }} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-amber-600 text-xs mb-2">幸運方位</div>
          <div className="flex justify-center gap-2">
            {xiYong.map((wx, i) => (
              <span key={i} className="px-2 py-1 rounded bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold">
                {LUCKY_DIRS[wx] || ''}
              </span>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-amber-600 text-xs mb-2">幸運數字</div>
          <div className="flex justify-center gap-2">
            {xiYong.flatMap(wx => LUCKY_NUMS[wx] || []).slice(0, 2).map((n, i) => (
              <span key={i} className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-sm font-bold flex items-center justify-center">
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
