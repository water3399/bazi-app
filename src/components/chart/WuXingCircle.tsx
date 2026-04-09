'use client';

import type { ChartData } from '@/lib/bazi/types';

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

// 質感色系（莫蘭迪風格）
const WUXING_STYLES: Record<string, { bg: string; ring: string; text: string; emoji: string }> = {
  '木': { bg: 'bg-[#D4E8D0]', ring: 'ring-[#7BAF7B]', text: 'text-[#4A7C59]', emoji: '🌿' },
  '火': { bg: 'bg-[#F5D0C5]', ring: 'ring-[#D4856A]', text: 'text-[#B85C4A]', emoji: '🔥' },
  '土': { bg: 'bg-[#E8DDD0]', ring: 'ring-[#B8A48C]', text: 'text-[#8C7A62]', emoji: '⛰️' },
  '金': { bg: 'bg-[#F0E6C8]', ring: 'ring-[#C9A84C]', text: 'text-[#9A7B2E]', emoji: '⚔️' },
  '水': { bg: 'bg-[#C8DAE8]', ring: 'ring-[#6A9BBF]', text: 'text-[#3D6E8C]', emoji: '💧' },
};

const WUXING_ORDER = ['火', '土', '金', '水', '木'];

const LUCKY_COLORS: Record<string, { c1: string; c2: string }> = {
  '金': { c1: '#C9A84C', c2: '#E8DDD0' }, '木': { c1: '#4A7C59', c2: '#7BAF7B' },
  '水': { c1: '#3D6E8C', c2: '#6A9BBF' }, '火': { c1: '#B85C4A', c2: '#D4856A' },
  '土': { c1: '#8C7A62', c2: '#B8A48C' },
};
const LUCKY_DIRS: Record<string, string> = { '金': '🧭 正西', '木': '🧭 正東', '水': '🧭 正北', '火': '🧭 正南', '土': '🧭 中央' };
const LUCKY_NUMS: Record<string, string[]> = { '金': ['6', '7'], '木': ['3', '8'], '水': ['1', '6'], '火': ['2', '7'], '土': ['5', '0'] };

const POSITIONS = [
  { x: 50, y: 5 },   // 火
  { x: 92, y: 38 },  // 土
  { x: 78, y: 85 },  // 金
  { x: 22, y: 85 },  // 水
  { x: 8, y: 38 },   // 木
];

function getWuXingPcts(chart: ChartData): Record<string, number> {
  const t = chart.wuXing.wood + chart.wuXing.fire + chart.wuXing.earth + chart.wuXing.metal + chart.wuXing.water;
  if (t === 0) return { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  return { '木': Math.round((chart.wuXing.wood / t) * 100), '火': Math.round((chart.wuXing.fire / t) * 100), '土': Math.round((chart.wuXing.earth / t) * 100), '金': Math.round((chart.wuXing.metal / t) * 100), '水': Math.round((chart.wuXing.water / t) * 100) };
}

function getXiYong(chart: ChartData): string[] {
  const dayEl = GAN_WUXING[chart.dayMaster] || '金';
  const t = chart.wuXing.wood + chart.wuXing.fire + chart.wuXing.earth + chart.wuXing.metal + chart.wuXing.water;
  const dc = { '金': chart.wuXing.metal, '木': chart.wuXing.wood, '水': chart.wuXing.water, '火': chart.wuXing.fire, '土': chart.wuXing.earth }[dayEl] || 0;
  const r = t > 0 ? dc / t : 0;
  const sheng: Record<string, string> = { '金': '土', '木': '水', '水': '金', '火': '木', '土': '火' };
  const xie: Record<string, string> = { '金': '水', '木': '火', '水': '木', '火': '土', '土': '金' };
  const ke: Record<string, string> = { '金': '火', '木': '金', '水': '土', '火': '水', '土': '木' };
  return r < 0.3 ? [sheng[dayEl], dayEl] : [ke[dayEl], xie[dayEl]];
}

export default function WuXingCircle({ chartData }: { chartData: ChartData }) {
  // 使用專業五行數據（如果有的話）
  const hasPro = !!chartData.wuXingPro;
  const pcts = hasPro ? chartData.wuXingPro!.percentages : getWuXingPcts(chartData);
  const dayEl = GAN_WUXING[chartData.dayMaster] || '金';
  const xiYong = getXiYong(chartData);
  const strength = hasPro
    ? `${chartData.wuXingPro!.strength}型`
    : (() => {
        const t = chartData.wuXing.wood + chartData.wuXing.fire + chartData.wuXing.earth + chartData.wuXing.metal + chartData.wuXing.water;
        const dc = { '金': chartData.wuXing.metal, '木': chartData.wuXing.wood, '水': chartData.wuXing.water, '火': chartData.wuXing.fire, '土': chartData.wuXing.earth }[dayEl] || 0;
        const r = t > 0 ? dc / t : 0;
        return r >= 0.35 ? '偏旺型' : r >= 0.2 ? '中和型' : '偏弱型';
      })();
  const relations = WUXING_RELATION[dayEl] || {};

  return (
    <div className="bg-[#1E1810] rounded-2xl p-6 border border-[#3D3020]">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[#C9A84C] font-bold text-lg">【{strength}】</span>
        <span className="text-[#8C7A62] text-xs">日主：{chartData.dayMaster}（{dayEl}）</span>
      </div>

      {/* Circle */}
      <div className="relative w-[320px] h-[320px] mx-auto mb-6">
        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
          {/* 相生箭頭 */}
          {[0,1,2,3,4].map(i => {
            const f = POSITIONS[i], to = POSITIONS[(i+1)%5];
            const mx = (f.x+to.x)/2, my = (f.y+to.y)/2;
            return (<g key={`s${i}`}>
              <line x1={f.x} y1={f.y} x2={to.x} y2={to.y} stroke="rgba(160,140,100,0.15)" strokeWidth="0.5"/>
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fill="rgba(140,120,80,0.5)">生</text>
            </g>);
          })}
          {/* 相剋 */}
          {[0,1,2,3,4].map(i => {
            const f = POSITIONS[i], to = POSITIONS[(i+2)%5];
            const mx = (f.x+to.x)/2 + (i%2===0?4:-4), my = (f.y+to.y)/2;
            return (<g key={`k${i}`}>
              <line x1={f.x} y1={f.y} x2={to.x} y2={to.y} stroke="rgba(160,140,100,0.08)" strokeWidth="0.3" strokeDasharray="1,1"/>
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="rgba(140,120,80,0.3)">剋</text>
            </g>);
          })}
        </svg>

        {WUXING_ORDER.map((wx, i) => {
          const pos = POSITIONS[i];
          const s = WUXING_STYLES[wx];
          const pct = pcts[wx];
          const isDay = wx === dayEl;
          const size = Math.max(56, Math.min(80, 48 + pct * 0.5));
          return (
            <div key={wx} className={`absolute flex flex-col items-center justify-center rounded-full ${s.bg} ${isDay ? `ring-3 ${s.ring} shadow-xl` : 'ring-1 ring-black/5'}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', width: size, height: size }}>
              <span className="text-lg">{s.emoji}</span>
              <span className={`font-bold text-base ${s.text}`}>{wx}</span>
              <span className={`text-xs ${s.text} opacity-60`}>{pct}%</span>
              {isDay && <span className="text-[7px] bg-[#C9A84C] text-white px-1.5 py-0.5 rounded-full mt-0.5">日主</span>}
            </div>
          );
        })}

        {WUXING_ORDER.map((wx, i) => {
          const pos = POSITIONS[i];
          const rel = relations[wx] || '';
          if (!rel || wx === dayEl) return null;
          const ox = pos.x > 50 ? 16 : -16;
          return <span key={`r${wx}`} className="absolute text-[10px] text-[#8C7A62]/70 font-medium"
            style={{ left: `${pos.x+ox}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}>{rel}</span>;
        })}
      </div>

      {/* 得令/得地/得生 標記 */}
      {hasPro && (
        <div className="flex justify-center gap-3 mb-4">
          <span className={`text-xs px-2 py-1 rounded-lg border ${chartData.wuXingPro!.deLing ? 'bg-[#5B9E7A]/10 border-[#5B9E7A]/30 text-[#5B9E7A]' : 'bg-[#3D3020] border-[#3D3020] text-[#6B5B3E]'}`}>
            {chartData.wuXingPro!.deLing ? '✅ 得令' : '❌ 失令'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg border ${chartData.wuXingPro!.deDi ? 'bg-[#5B9E7A]/10 border-[#5B9E7A]/30 text-[#5B9E7A]' : 'bg-[#3D3020] border-[#3D3020] text-[#6B5B3E]'}`}>
            {chartData.wuXingPro!.deDi ? '✅ 得地' : '❌ 失地'}
          </span>
          <span className={`text-xs px-2 py-1 rounded-lg border ${chartData.wuXingPro!.deSheng ? 'bg-[#5B9E7A]/10 border-[#5B9E7A]/30 text-[#5B9E7A]' : 'bg-[#3D3020] border-[#3D3020] text-[#6B5B3E]'}`}>
            {chartData.wuXingPro!.deSheng ? '✅ 得生' : '❌ 失生'}
          </span>
        </div>
      )}

      {/* 喜用神 */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
          <span className="text-[#C9A84C] font-bold text-lg">【喜用 {xiYong.join('、')}】</span>
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
        </div>
      </div>

      {/* Lucky info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-[#8C7A62] text-xs mb-2">🎨 幸運顏色</div>
          <div className="flex justify-center gap-2">
            {xiYong.map((wx, i) => <div key={i} className="w-9 h-9 rounded-full border-2 border-white shadow-md" style={{ background: LUCKY_COLORS[wx]?.c1 || '#ccc' }} />)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[#8C7A62] text-xs mb-2">🧭 幸運方位</div>
          <div className="flex justify-center gap-2">
            {xiYong.map((wx, i) => <span key={i} className="px-2 py-1 rounded-lg bg-[#1E1810] border border-[#D4C5A8] text-[#C9A84C] text-xs font-bold">{LUCKY_DIRS[wx]?.replace('🧭 ','')}</span>)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[#8C7A62] text-xs mb-2">🔢 幸運數字</div>
          <div className="flex justify-center gap-2">
            {xiYong.flatMap(wx => LUCKY_NUMS[wx] || []).slice(0, 2).map((n, i) => (
              <span key={i} className="w-9 h-9 rounded-full bg-[#1E1810] border border-[#D4C5A8] text-[#C9A84C] text-sm font-bold flex items-center justify-center">{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
