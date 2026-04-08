import type { ChartData, WuXingCount } from './types';

// ====== Types ======
export interface SynastryMember {
  name: string;
  chartData: ChartData;
  color: string;
}

export interface DayMasterRelation {
  from: string;       // person A name
  to: string;         // person B name
  fromGan: string;    // A's day master
  toGan: string;      // B's day master
  relation: string;   // 生/剋/同/被生/被剋
  emoji: string;
  description: string;
}

export interface WuXingComparison {
  element: string;
  emoji: string;
  members: { name: string; count: number; pct: number }[];
}

export interface ShiShenCross {
  personA: string;
  personB: string;
  aSeesB: string;  // A 看 B 的日干是什麼十神
  bSeesA: string;  // B 看 A 的日干是什麼十神
}

export interface SynastryResult {
  members: { name: string; dayMaster: string; element: string; color: string }[];
  dayMasterRelations: DayMasterRelation[];
  wuXingComparison: WuXingComparison[];
  wuXingComplementScore: number;
  shiShenCross: ShiShenCross[];
}

// ====== Constants ======
const GAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

const GAN_YINYANG: Record<string, string> = {
  '甲': '陽', '乙': '陰', '丙': '陽', '丁': '陰', '戊': '陽', '己': '陰', '庚': '陽', '辛': '陰', '壬': '陽', '癸': '陰',
};

// 五行生剋
const SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const KE: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

// 十神計算：日主看對方天干
function calcShiShen(dayGan: string, targetGan: string): string {
  const dayEl = GAN_WUXING[dayGan] || '';
  const dayYY = GAN_YINYANG[dayGan] || '';
  const tarEl = GAN_WUXING[targetGan] || '';
  const tarYY = GAN_YINYANG[targetGan] || '';
  const sameYY = dayYY === tarYY;

  if (dayEl === tarEl) return sameYY ? '比肩' : '劫財';
  if (SHENG[dayEl] === tarEl) return sameYY ? '食神' : '傷官';
  if (KE[dayEl] === tarEl) return sameYY ? '偏財' : '正財';
  if (KE[tarEl] === dayEl) return sameYY ? '七殺' : '正官';
  if (SHENG[tarEl] === dayEl) return sameYY ? '偏印' : '正印';
  return '?';
}

// ====== Main Analysis ======
export function analyzeSynastry(members: SynastryMember[]): SynastryResult {
  // 1. Day master relations
  const dayMasterRelations: DayMasterRelation[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i], b = members[j];
      const aEl = GAN_WUXING[a.chartData.dayMaster] || '';
      const bEl = GAN_WUXING[b.chartData.dayMaster] || '';

      let relation = '', emoji = '', description = '';
      if (aEl === bEl) {
        relation = '同類'; emoji = '🤝';
        description = `同屬${aEl}，天生有共鳴和理解`;
      } else if (SHENG[aEl] === bEl) {
        relation = `${a.name}生${b.name}`; emoji = '🌱';
        description = `${a.name}的${aEl}生${b.name}的${bEl}，是付出與滋養的關係`;
      } else if (SHENG[bEl] === aEl) {
        relation = `${b.name}生${a.name}`; emoji = '🌱';
        description = `${b.name}的${bEl}生${a.name}的${aEl}，是付出與滋養的關係`;
      } else if (KE[aEl] === bEl) {
        relation = `${a.name}剋${b.name}`; emoji = '⚡';
        description = `${a.name}的${aEl}剋${b.name}的${bEl}，有管教或約束的能量`;
      } else if (KE[bEl] === aEl) {
        relation = `${b.name}剋${a.name}`; emoji = '⚡';
        description = `${b.name}的${bEl}剋${a.name}的${aEl}，有管教或約束的能量`;
      }

      dayMasterRelations.push({
        from: a.name, to: b.name,
        fromGan: a.chartData.dayMaster, toGan: b.chartData.dayMaster,
        relation, emoji, description,
      });
    }
  }

  // 2. Wu Xing comparison
  const elements = ['木', '火', '土', '金', '水'];
  const emojis = ['🌿', '🔥', '⛰️', '⚔️', '💧'];
  const wxKeys: (keyof WuXingCount)[] = ['wood', 'fire', 'earth', 'metal', 'water'];

  const wuXingComparison: WuXingComparison[] = elements.map((el, idx) => ({
    element: el,
    emoji: emojis[idx],
    members: members.map(m => {
      const count = m.chartData.wuXing[wxKeys[idx]];
      const total = wxKeys.reduce((s, k) => s + m.chartData.wuXing[k], 0);
      return { name: m.name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
    }),
  }));

  // 3. Wu Xing complement score
  let complementScore = 0;
  for (const el of wxKeys) {
    const values = members.map(m => m.chartData.wuXing[el]);
    const hasStrong = values.some(v => v >= 2);
    const hasWeak = values.some(v => v === 0);
    if (hasStrong && hasWeak) complementScore += 20; // One person has what another lacks
  }
  complementScore = Math.min(100, complementScore);

  // 4. Shi Shen cross
  const shiShenCross: ShiShenCross[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i], b = members[j];
      shiShenCross.push({
        personA: a.name,
        personB: b.name,
        aSeesB: calcShiShen(a.chartData.dayMaster, b.chartData.dayMaster),
        bSeesA: calcShiShen(b.chartData.dayMaster, a.chartData.dayMaster),
      });
    }
  }

  return {
    members: members.map(m => ({
      name: m.name,
      dayMaster: m.chartData.dayMaster,
      element: `${GAN_WUXING[m.chartData.dayMaster] || ''}（${GAN_YINYANG[m.chartData.dayMaster] || ''}${GAN_WUXING[m.chartData.dayMaster] || ''}）`,
      color: m.color,
    })),
    dayMasterRelations,
    wuXingComparison,
    wuXingComplementScore: complementScore,
    shiShenCross,
  };
}

// Format for AI
export function formatSynastryContext(members: SynastryMember[], result: SynastryResult): string {
  const lines: string[] = [];
  lines.push('===== 合盤資料 =====');
  lines.push(`人數：${members.length}`);
  lines.push('');

  for (const m of members) {
    lines.push(`【${m.name}】`);
    lines.push(`日主：${m.chartData.dayMaster}（${GAN_WUXING[m.chartData.dayMaster]}）`);
    lines.push(`四柱：${m.chartData.yearPillar.ganZhi} ${m.chartData.monthPillar.ganZhi} ${m.chartData.dayPillar.ganZhi} ${m.chartData.hourPillar.ganZhi}`);
    lines.push(`五行：木${m.chartData.wuXing.wood} 火${m.chartData.wuXing.fire} 土${m.chartData.wuXing.earth} 金${m.chartData.wuXing.metal} 水${m.chartData.wuXing.water}`);
    lines.push('');
  }

  lines.push('【日主關係】');
  for (const r of result.dayMasterRelations) {
    lines.push(`${r.from}(${r.fromGan}) ↔ ${r.to}(${r.toGan})：${r.relation}`);
  }
  lines.push('');

  lines.push('【十神交叉】');
  for (const sc of result.shiShenCross) {
    lines.push(`${sc.personA}看${sc.personB}是${sc.aSeesB}，${sc.personB}看${sc.personA}是${sc.bSeesA}`);
  }
  lines.push('');
  lines.push(`【五行互補度】${result.wuXingComplementScore}%`);

  return lines.join('\n');
}
