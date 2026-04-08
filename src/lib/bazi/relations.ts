/**
 * 四柱地支的刑沖合害分析 + 神煞提取
 */

import { Solar } from 'lunar-typescript';
import type { BirthData, ChartData } from './types';

// ====== 刑沖合害 ======

const CHONG: Record<string, string> = {
  '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
};
const LIUHE: Record<string, string> = {
  '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午',
};
const SANHE: [string[], string][] = [
  [['申', '子', '辰'], '水'], [['寅', '午', '戌'], '火'],
  [['亥', '卯', '未'], '木'], [['巳', '酉', '丑'], '金'],
];
const XING_GROUPS: string[][] = [['寅', '巳', '申'], ['丑', '戌', '未'], ['子', '卯']];
const HAI: Record<string, string> = {
  '子': '未', '未': '子', '丑': '午', '午': '丑', '寅': '巳', '巳': '寅',
  '卯': '辰', '辰': '卯', '申': '亥', '亥': '申', '酉': '戌', '戌': '酉',
};

const PILLAR_LABELS = ['年', '月', '日', '時'];
const PILLAR_MEANINGS = ['祖上/童年', '父母/青年', '自己/中年', '子女/晚年'];

export interface BranchRelation {
  type: '沖' | '合' | '三合' | '半合' | '刑' | '害';
  emoji: string;
  pillars: string;       // 如「年酉 沖 月卯」
  meaning: string;       // 現代解讀
  level: 'positive' | 'neutral' | 'attention';
}

export function analyzeBranchRelations(chart: ChartData): BranchRelation[] {
  const zhis = [chart.yearPillar.zhi, chart.monthPillar.zhi, chart.dayPillar.zhi, chart.hourPillar.zhi];
  const results: BranchRelation[] = [];

  // 六沖
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (CHONG[zhis[i]] === zhis[j]) {
        results.push({
          type: '沖', emoji: '⚡',
          pillars: `${PILLAR_LABELS[i]}${zhis[i]} 沖 ${PILLAR_LABELS[j]}${zhis[j]}`,
          meaning: `${PILLAR_MEANINGS[i]}與${PILLAR_MEANINGS[j]}之間有衝突能量，代表這兩個人生階段可能有較大的變動或轉折。沖不一定是壞事，有時是推動改變的力量。`,
          level: 'attention',
        });
      }
    }
  }

  // 六合
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (LIUHE[zhis[i]] === zhis[j]) {
        results.push({
          type: '合', emoji: '🤝',
          pillars: `${PILLAR_LABELS[i]}${zhis[i]} 合 ${PILLAR_LABELS[j]}${zhis[j]}`,
          meaning: `${PILLAR_MEANINGS[i]}與${PILLAR_MEANINGS[j]}之間有和諧能量，容易得到助力和支持。`,
          level: 'positive',
        });
      }
    }
  }

  // 三合 / 半合
  for (const [combo, element] of SANHE) {
    const found = combo.filter(z => zhis.includes(z));
    const indices = found.map(z => zhis.indexOf(z));
    if (found.length === 3) {
      results.push({
        type: '三合', emoji: '🔮',
        pillars: `${found.join('')} 三合${element}局`,
        meaning: `四柱中形成完整的三合${element}局，是很強的格局。${element}的能量在命盤中被大幅增強，代表該元素相關的特質會特別突出。`,
        level: 'positive',
      });
    } else if (found.length === 2) {
      results.push({
        type: '半合', emoji: '✨',
        pillars: `${indices.map(i => PILLAR_LABELS[i] + zhis[i]).join(' ')} 半合${element}局`,
        meaning: `部分三合${element}的能量，${element}元素有增強的傾向。`,
        level: 'positive',
      });
    }
  }

  // 三刑
  for (const group of XING_GROUPS) {
    const found = group.filter(z => zhis.includes(z));
    if (found.length >= 2) {
      const indices = found.map(z => zhis.indexOf(z));
      const isFullXing = found.length === group.length;
      results.push({
        type: '刑', emoji: '⚠️',
        pillars: `${indices.map(i => PILLAR_LABELS[i] + zhis[i]).join(' ')} ${isFullXing ? '三刑' : '相刑'}`,
        meaning: isFullXing
          ? '三刑代表人生中需要面對的重大課題，通常涉及人際摩擦或自我矛盾。但刑也是磨練和成長的動力。'
          : '相刑代表某些面向有張力，需要更多包容和調整。不是災難，而是成長的契機。',
        level: 'attention',
      });
    }
  }

  // 六害
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      if (HAI[zhis[i]] === zhis[j]) {
        results.push({
          type: '害', emoji: '💫',
          pillars: `${PILLAR_LABELS[i]}${zhis[i]} 害 ${PILLAR_LABELS[j]}${zhis[j]}`,
          meaning: `${PILLAR_MEANINGS[i]}與${PILLAR_MEANINGS[j]}之間有微妙的不協調，可能表現為心意不通或期望落差。需要更多溝通和理解。`,
          level: 'neutral',
        });
      }
    }
  }

  return results;
}

// ====== 神煞系統 ======

export interface ShenShaInfo {
  type: '吉神' | '凶煞';
  name: string;
  emoji: string;
  meaning: string;
}

// 常見神煞的現代化解讀
const SHEN_SHA_DICT: Record<string, { emoji: string; meaning: string }> = {
  // 吉神
  '天德': { emoji: '🌟', meaning: '貴人星，逢凶化吉，一生容易得到他人幫助' },
  '月德': { emoji: '🌙', meaning: '月貴人，遇困難時有人伸出援手' },
  '天德合': { emoji: '🌟', meaning: '天德的延伸，貴人運強' },
  '月德合': { emoji: '🌙', meaning: '月德的延伸，人緣佳' },
  '天乙贵人': { emoji: '👑', meaning: '最強的貴人星，事業和社交都有助力' },
  '文昌': { emoji: '📚', meaning: '學業和考試運佳，適合從事文字、教育工作' },
  '驿马': { emoji: '🐎', meaning: '驛馬星動，一生與旅行、搬遷、異地發展有緣' },
  '华盖': { emoji: '🎭', meaning: '藝術和靈性天賦，獨特的精神世界' },
  '金舆': { emoji: '🚗', meaning: '座驕星，出行平安，物質生活優越' },
  '将星': { emoji: '⭐', meaning: '領導能力強，適合管理和指揮' },
  '太极贵人': { emoji: '☯️', meaning: '智慧和學問的貴人，適合研究和教學' },
  '禄神': { emoji: '💰', meaning: '祿神，代表薪資和正財收入穩定' },
  '天厨': { emoji: '🍳', meaning: '食祿豐厚，衣食無憂' },
  '国印': { emoji: '🏛️', meaning: '適合公職或體制內工作' },
  '三奇贵人': { emoji: '🌈', meaning: '三奇貴人，才華出眾，異於常人' },
  // 凶煞（現代化解讀）
  '劫煞': { emoji: '🔄', meaning: '行動力強但需注意衝動決策，適合把能量導向運動或創業' },
  '灾煞': { emoji: '🛡️', meaning: '代表需要額外注意安全的面向，提醒你做好保護措施' },
  '亡神': { emoji: '🌊', meaning: '變動星，人生轉折較多，適應力會因此變強' },
  '桃花': { emoji: '🌸', meaning: '人際魅力強，異性緣佳，適合社交和公關工作' },
  '咸池': { emoji: '🌸', meaning: '同桃花，魅力和感染力強' },
  '红鸾': { emoji: '💕', meaning: '戀愛和婚姻的吉星，感情生活豐富' },
  '天喜': { emoji: '🎊', meaning: '喜慶之星，人生中好事不斷' },
  '孤辰': { emoji: '🏔️', meaning: '獨立性強，享受獨處，適合專業技術工作' },
  '寡宿': { emoji: '🏔️', meaning: '內向深沉，適合研究和創作' },
  '空亡': { emoji: '🕳️', meaning: '某些面向的能量被「留白」，反而給了自由發揮的空間' },
  '羊刃': { emoji: '🗡️', meaning: '意志力極強，適合軍警、外科、競技運動，需注意脾氣管理' },
  '阳刃': { emoji: '🗡️', meaning: '同羊刃' },
  '天罡': { emoji: '⚡', meaning: '正義感強，不畏強權，適合法律或執法工作' },
  '大耗': { emoji: '💸', meaning: '花費較多的階段，適合投資自己而非單純消費' },
  '天贼': { emoji: '🔒', meaning: '提醒注意財物安全和合約細節' },
};

export function extractShenSha(birthData: BirthData): ShenShaInfo[] {
  const solar = Solar.fromYmdHms(birthData.year, birthData.month, birthData.day, birthData.hour, birthData.minute, 0);
  const lunar = solar.getLunar();
  const results: ShenShaInfo[] = [];

  // 日吉神
  try {
    const jiShen = lunar.getDayJiShen();
    if (Array.isArray(jiShen)) {
      for (const name of jiShen) {
        const dict = SHEN_SHA_DICT[name];
        results.push({
          type: '吉神',
          name,
          emoji: dict?.emoji || '🌟',
          meaning: dict?.meaning || '吉星，帶來正面能量',
        });
      }
    }
  } catch { /* ignore */ }

  // 日凶煞
  try {
    const xiongSha = lunar.getDayXiongSha();
    if (Array.isArray(xiongSha)) {
      for (const name of xiongSha) {
        const dict = SHEN_SHA_DICT[name];
        results.push({
          type: '凶煞',
          name,
          emoji: dict?.emoji || '⚠️',
          meaning: dict?.meaning || '提醒需要注意的面向',
        });
      }
    }
  } catch { /* ignore */ }

  return results;
}

// Format for AI context
export function formatRelationsContext(relations: BranchRelation[], shenSha: ShenShaInfo[]): string {
  const lines: string[] = [];

  if (relations.length > 0) {
    lines.push('【刑沖合害】');
    for (const r of relations) {
      lines.push(`${r.emoji} ${r.pillars}：${r.meaning}`);
    }
    lines.push('');
  }

  if (shenSha.length > 0) {
    lines.push('【神煞系統】');
    const ji = shenSha.filter(s => s.type === '吉神');
    const xiong = shenSha.filter(s => s.type === '凶煞');
    if (ji.length > 0) {
      lines.push('吉神：' + ji.map(s => s.name).join('、'));
    }
    if (xiong.length > 0) {
      lines.push('凶煞：' + xiong.map(s => s.name).join('、'));
    }
    lines.push('');
  }

  return lines.join('\n');
}
