/**
 * 專業五行力量計算（加權藏干法）
 * 考慮：藏干權重 + 月令得失 + 得地得生
 */

// 天干五行
const GAN_WX: Record<string, string> = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水',
};

// 地支藏干（本氣、中氣、餘氣）帶權重
const ZHI_CANG: Record<string, [string, number][]> = {
  '子': [['癸', 100]],
  '丑': [['己', 60], ['癸', 30], ['辛', 10]],
  '寅': [['甲', 60], ['丙', 30], ['戊', 10]],
  '卯': [['乙', 100]],
  '辰': [['戊', 60], ['乙', 30], ['癸', 10]],
  '巳': [['丙', 60], ['庚', 30], ['戊', 10]],
  '午': [['丁', 60], ['己', 30], ['丙', 10]],  // 午的餘氣有丙
  '未': [['己', 60], ['丁', 30], ['乙', 10]],
  '申': [['庚', 60], ['壬', 30], ['戊', 10]],
  '酉': [['辛', 100]],
  '戌': [['戊', 60], ['辛', 30], ['丁', 10]],
  '亥': [['壬', 70], ['甲', 30]],
};

// 月支對應的當令五行
const MONTH_LING: Record<string, string> = {
  '寅': '木', '卯': '木',       // 春：木旺
  '巳': '火', '午': '火',       // 夏：火旺
  '申': '金', '酉': '金',       // 秋：金旺
  '亥': '水', '子': '水',       // 冬：水旺
  '辰': '土', '戌': '土', '丑': '土', '未': '土',  // 四季：土旺
};

export interface WuXingScore {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface WuXingAnalysis {
  scores: WuXingScore;
  percentages: Record<string, number>;  // 木火土金水的百分比
  dayMasterElement: string;
  dayMasterScore: number;
  totalScore: number;
  dayMasterPercent: number;
  strength: '偏旺' | '中和' | '偏弱';
  deLing: boolean;     // 得令（月令是否幫助日主）
  deDi: boolean;       // 得地（地支有無日主的根）
  deSheng: boolean;    // 得生（有無印星生扶）
}

const WX_KEY: Record<string, keyof WuXingScore> = {
  '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water',
};

// 五行相生關係：X 生 Y
const SHENG: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };

export function calculateWuXingScore(
  yearGan: string, yearZhi: string,
  monthGan: string, monthZhi: string,
  dayGan: string, dayZhi: string,
  hourGan: string, hourZhi: string,
): WuXingAnalysis {
  const scores: WuXingScore = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // 1. 天干計分（每個天干 = 10 分）
  for (const gan of [yearGan, monthGan, dayGan, hourGan]) {
    const wx = GAN_WX[gan];
    if (wx && WX_KEY[wx]) scores[WX_KEY[wx]] += 10;
  }

  // 2. 地支藏干計分（按權重）
  for (const zhi of [yearZhi, monthZhi, dayZhi, hourZhi]) {
    const cang = ZHI_CANG[zhi];
    if (cang) {
      for (const [gan, weight] of cang) {
        const wx = GAN_WX[gan];
        if (wx && WX_KEY[wx]) scores[WX_KEY[wx]] += weight / 10; // 正規化
      }
    }
  }

  // 3. 月令加成（月令五行額外 +15 分）
  const monthElement = MONTH_LING[monthZhi];
  if (monthElement && WX_KEY[monthElement]) {
    scores[WX_KEY[monthElement]] += 15;
  }

  // 計算總分和百分比
  const total = scores.wood + scores.fire + scores.earth + scores.metal + scores.water;
  const percentages: Record<string, number> = {
    '木': total > 0 ? Math.round((scores.wood / total) * 100) : 0,
    '火': total > 0 ? Math.round((scores.fire / total) * 100) : 0,
    '土': total > 0 ? Math.round((scores.earth / total) * 100) : 0,
    '金': total > 0 ? Math.round((scores.metal / total) * 100) : 0,
    '水': total > 0 ? Math.round((scores.water / total) * 100) : 0,
  };

  // 日主五行
  const dayElement = GAN_WX[dayGan] || '火';
  const dayKey = WX_KEY[dayElement];
  const dayScore = dayKey ? scores[dayKey] : 0;
  const dayPercent = total > 0 ? Math.round((dayScore / total) * 100) : 0;

  // 得令判斷
  const deLing = monthElement === dayElement;

  // 得地判斷（日主在地支有根）
  const roots = [yearZhi, monthZhi, dayZhi, hourZhi].some(zhi => {
    const cang = ZHI_CANG[zhi];
    return cang?.some(([gan]) => GAN_WX[gan] === dayElement);
  });
  const deDi = roots;

  // 得生判斷（有印星 = 生我的五行）
  const shengWo = Object.entries(SHENG).find(([, v]) => v === dayElement)?.[0];
  const deSheng = shengWo ? (scores[WX_KEY[shengWo]] || 0) > 5 : false;

  // 綜合判斷旺衰
  // 幫助日主的力量 = 日主本身 + 印星（生我的）+ 比劫（同類）
  const helpScore = dayScore + (shengWo ? (scores[WX_KEY[shengWo]] || 0) : 0);
  const helpPercent = total > 0 ? (helpScore / total) * 100 : 0;

  let strength: '偏旺' | '中和' | '偏弱';
  if (helpPercent >= 45) {
    strength = '偏旺';
  } else if (helpPercent >= 30) {
    strength = '中和';
  } else {
    strength = '偏弱';
  }

  // 額外修正：得令但力量不足仍可能中和
  if (deLing && strength === '偏弱') strength = '中和';
  if (!deLing && !deDi && !deSheng && strength === '中和') strength = '偏弱';

  return {
    scores,
    percentages,
    dayMasterElement: dayElement,
    dayMasterScore: dayScore,
    totalScore: total,
    dayMasterPercent: dayPercent,
    strength,
    deLing,
    deDi,
    deSheng,
  };
}
