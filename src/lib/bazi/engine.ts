import { Solar } from 'lunar-typescript';
import type { BirthData, ChartData, Pillar, DaYunPeriod, LiuNianData, LiuYueData, WuXingCount } from './types';
import { toTraditional } from './traditionalChinese';

// 天干對應五行
const GAN_WUXING: Record<string, keyof WuXingCount> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water',
};

// 地支對應五行（本氣）
const ZHI_WUXING: Record<string, keyof WuXingCount> = {
  '寅': 'wood', '卯': 'wood',
  '巳': 'fire', '午': 'fire',
  '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '亥': 'water', '子': 'water',
};

// 天干五行中文
const GAN_ELEMENT_CN: Record<string, string> = {
  '甲': '陽木', '乙': '陰木',
  '丙': '陽火', '丁': '陰火',
  '戊': '陽土', '己': '陰土',
  '庚': '陽金', '辛': '陰金',
  '壬': '陽水', '癸': '陰水',
};

function countWuXing(yearGan: string, monthGan: string, dayGan: string, hourGan: string,
  yearZhi: string, monthZhi: string, dayZhi: string, hourZhi: string): WuXingCount {
  const count: WuXingCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  // 天干
  [yearGan, monthGan, dayGan, hourGan].forEach(g => {
    const el = GAN_WUXING[g];
    if (el) count[el]++;
  });
  // 地支（本氣）
  [yearZhi, monthZhi, dayZhi, hourZhi].forEach(z => {
    const el = ZHI_WUXING[z];
    if (el) count[el]++;
  });
  return count;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPillar(bazi: any, pillarName: 'Year' | 'Month' | 'Day' | 'Time'): Pillar {
  const gan = bazi[`get${pillarName}Gan`]();
  const zhi = bazi[`get${pillarName}Zhi`]();
  const ganZhi = pillarName === 'Year' ? bazi.getYear() :
    pillarName === 'Month' ? bazi.getMonth() :
    pillarName === 'Day' ? bazi.getDay() : bazi.getTime();
  const naYin = bazi[`get${pillarName}NaYin`]();
  const shiShenGan = pillarName === 'Day' ? '日主' : toTraditional(bazi[`get${pillarName}ShiShenGan`]());
  const rawShiShenZhi = bazi[`get${pillarName}ShiShenZhi`]() || [];
  const shiShenZhi = rawShiShenZhi.map((s: string) => toTraditional(s));
  const hideGan = bazi[`get${pillarName}HideGan`]() || [];
  const diShi = toTraditional(bazi[`get${pillarName}DiShi`]());
  const xunKong = bazi[`get${pillarName}XunKong`]();

  return { gan, zhi, ganZhi, naYin: toTraditional(naYin), shiShenGan, shiShenZhi, hideGan, diShi, xunKong };
}

export function generateChart(birthData: BirthData): ChartData {
  const solar = Solar.fromYmdHms(
    birthData.year, birthData.month, birthData.day,
    birthData.hour, birthData.minute, 0
  );
  const lunar = solar.getLunar();
  const bazi = lunar.getEightChar();

  // 四柱
  const yearPillar = extractPillar(bazi, 'Year');
  const monthPillar = extractPillar(bazi, 'Month');
  const dayPillar = extractPillar(bazi, 'Day');
  const hourPillar = extractPillar(bazi, 'Time');

  // 五行統計
  const wuXing = countWuXing(
    yearPillar.gan, monthPillar.gan, dayPillar.gan, hourPillar.gan,
    yearPillar.zhi, monthPillar.zhi, dayPillar.zhi, hourPillar.zhi,
  );

  // 大運
  const genderNum = birthData.gender === '男' ? 1 : 0;
  const yun = bazi.getYun(genderNum);
  const daYunRaw = yun.getDaYun();
  const daYun: DaYunPeriod[] = daYunRaw.map((dy: { getGanZhi: () => string; getStartAge: () => number; getEndAge: () => number; getLiuNian: () => Array<{ getYear: () => number; getGanZhi: () => string; getAge: () => number }> }) => {
    const liuNianRaw = dy.getLiuNian();
    const liuNian: LiuNianData[] = liuNianRaw.map((ln: { getYear: () => number; getGanZhi: () => string; getAge: () => number }) => ({
      year: ln.getYear(),
      ganZhi: ln.getGanZhi(),
      age: ln.getAge(),
    }));
    return {
      ganZhi: dy.getGanZhi(),
      startAge: dy.getStartAge(),
      endAge: dy.getEndAge(),
      liuNian,
    };
  });

  // 當前大運/流年
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthData.year;
  let currentDaYun: DaYunPeriod | null = null;
  let currentLiuNian: LiuNianData | null = null;
  let currentLiuYue: LiuYueData[] = [];

  for (const dy of daYun) {
    if (currentAge >= dy.startAge && currentAge <= dy.endAge) {
      currentDaYun = dy;
      const ln = dy.liuNian.find(l => l.year === currentYear);
      if (ln) currentLiuNian = ln;
      break;
    }
  }

  // 流月
  try {
    const dyRaw = daYunRaw.find((dy: { getLiuNian: () => Array<{ getYear: () => number }> }) =>
      dy.getLiuNian().some((ln: { getYear: () => number }) => ln.getYear() === currentYear)
    );
    if (dyRaw) {
      const lnRaw = dyRaw.getLiuNian().find((ln: { getYear: () => number }) => ln.getYear() === currentYear);
      if (lnRaw) {
        const lmRaw = lnRaw.getLiuYue();
        currentLiuYue = lmRaw.map((lm: { getMonthInChinese: () => string; getGanZhi: () => string }) => ({
          month: lm.getMonthInChinese(),
          ganZhi: lm.getGanZhi(),
        }));
      }
    }
  } catch { /* ignore */ }

  return {
    birthData,
    lunarDate: lunar.toString(),
    lunarYear: lunar.getYearInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    shengXiao: toTraditional(lunar.getYearShengXiao()),
    xingZuo: toTraditional(solar.getXingZuo()),
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster: dayPillar.gan,
    dayMasterElement: GAN_ELEMENT_CN[dayPillar.gan] || '',
    taiYuan: bazi.getTaiYuan(),
    mingGong: bazi.getMingGong(),
    shenGong: bazi.getShenGong(),
    wuXing,
    startAge: yun.getStartYear(),
    daYun,
    currentDaYun,
    currentLiuNian,
    currentLiuYue,
  };
}

// Format chart as text for AI context
export function formatChartText(chart: ChartData): string {
  const lines: string[] = [];
  lines.push('===== 八字命盤資料 =====');
  lines.push(`出生：${chart.birthData.year}/${chart.birthData.month}/${chart.birthData.day} ${chart.birthData.hour}:${String(chart.birthData.minute).padStart(2,'0')}`);
  lines.push(`性別：${chart.birthData.gender}`);
  lines.push(`農曆：${chart.lunarDate}`);
  lines.push(`生肖：${chart.shengXiao}　星座：${chart.xingZuo}`);
  lines.push('');

  lines.push('【四柱】');
  lines.push(`年柱：${chart.yearPillar.ganZhi}（${chart.yearPillar.naYin}）十神：${chart.yearPillar.shiShenGan} 長生：${chart.yearPillar.diShi}`);
  lines.push(`月柱：${chart.monthPillar.ganZhi}（${chart.monthPillar.naYin}）十神：${chart.monthPillar.shiShenGan} 長生：${chart.monthPillar.diShi}`);
  lines.push(`日柱：${chart.dayPillar.ganZhi}（${chart.dayPillar.naYin}）日主：${chart.dayMaster}（${chart.dayMasterElement}）長生：${chart.dayPillar.diShi}`);
  lines.push(`時柱：${chart.hourPillar.ganZhi}（${chart.hourPillar.naYin}）十神：${chart.hourPillar.shiShenGan} 長生：${chart.hourPillar.diShi}`);
  lines.push('');

  lines.push('【地支藏干】');
  lines.push(`年支${chart.yearPillar.zhi}藏：${chart.yearPillar.hideGan.join('、')}（${chart.yearPillar.shiShenZhi.join('、')}）`);
  lines.push(`月支${chart.monthPillar.zhi}藏：${chart.monthPillar.hideGan.join('、')}（${chart.monthPillar.shiShenZhi.join('、')}）`);
  lines.push(`日支${chart.dayPillar.zhi}藏：${chart.dayPillar.hideGan.join('、')}（${chart.dayPillar.shiShenZhi.join('、')}）`);
  lines.push(`時支${chart.hourPillar.zhi}藏：${chart.hourPillar.hideGan.join('、')}（${chart.hourPillar.shiShenZhi.join('、')}）`);
  lines.push('');

  lines.push('【五行統計】');
  lines.push(`木：${chart.wuXing.wood}　火：${chart.wuXing.fire}　土：${chart.wuXing.earth}　金：${chart.wuXing.metal}　水：${chart.wuXing.water}`);
  lines.push('');

  lines.push('【特殊宮位】');
  lines.push(`胎元：${chart.taiYuan}　命宮：${chart.mingGong}　身宮：${chart.shenGong}`);
  lines.push('');

  lines.push('【旬空】');
  lines.push(`年空：${chart.yearPillar.xunKong}　月空：${chart.monthPillar.xunKong}　日空：${chart.dayPillar.xunKong}　時空：${chart.hourPillar.xunKong}`);
  lines.push('');

  if (chart.currentDaYun) {
    lines.push('【當前大運】');
    lines.push(`${chart.currentDaYun.ganZhi}（${chart.currentDaYun.startAge}-${chart.currentDaYun.endAge}歲）`);
  }
  if (chart.currentLiuNian) {
    lines.push(`【${chart.currentLiuNian.year}年流年】${chart.currentLiuNian.ganZhi}（${chart.currentLiuNian.age}歲）`);
  }
  if (chart.currentLiuYue.length > 0) {
    lines.push('【流月】');
    chart.currentLiuYue.forEach(lm => {
      lines.push(`  ${lm.month}月：${lm.ganZhi}`);
    });
  }
  lines.push('');

  lines.push('【大運列表】');
  chart.daYun.forEach(dy => {
    if (dy.ganZhi) {
      lines.push(`${dy.ganZhi}（${dy.startAge}-${dy.endAge}歲）`);
    }
  });

  return lines.join('\n');
}
