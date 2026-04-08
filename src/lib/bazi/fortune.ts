import { Solar } from 'lunar-typescript';
import type { BirthData, LiuYueData } from './types';

export interface YearlyFortune {
  year: number;
  daYunGanZhi: string;
  liuNianGanZhi: string;
  liuNianAge: number;
  liuYue: LiuYueData[];
}

export function generateYearlyFortune(birthData: BirthData, year: number): YearlyFortune {
  const solar = Solar.fromYmdHms(birthData.year, birthData.month, birthData.day, birthData.hour, birthData.minute, 0);
  const bazi = solar.getLunar().getEightChar();
  const genderNum = birthData.gender === '男' ? 1 : 0;
  const yun = bazi.getYun(genderNum);
  const daYunList = yun.getDaYun();

  let daYunGanZhi = '';
  let liuNianGanZhi = '';
  let liuNianAge = year - birthData.year;
  const liuYue: LiuYueData[] = [];

  for (const dy of daYunList) {
    const lnList = dy.getLiuNian();
    const ln = lnList.find((l: { getYear: () => number }) => l.getYear() === year);
    if (ln) {
      daYunGanZhi = dy.getGanZhi() || '';
      liuNianGanZhi = ln.getGanZhi();
      liuNianAge = ln.getAge();
      const lmList = ln.getLiuYue();
      for (const lm of lmList) {
        liuYue.push({ month: lm.getMonthInChinese(), ganZhi: lm.getGanZhi() });
      }
      break;
    }
  }

  return { year, daYunGanZhi, liuNianGanZhi, liuNianAge, liuYue };
}

export function formatFortuneContext(fortune: YearlyFortune, birthData: BirthData): string {
  const lines: string[] = [];
  lines.push(`===== ${fortune.year}年流年資料 =====`);
  lines.push(`性別：${birthData.gender}`);
  lines.push(`大運：${fortune.daYunGanZhi}`);
  lines.push(`流年：${fortune.liuNianGanZhi}（${fortune.liuNianAge}歲）`);
  lines.push('');
  lines.push('流月：');
  for (const lm of fortune.liuYue) {
    lines.push(`  ${lm.month}月：${lm.ganZhi}`);
  }
  return lines.join('\n');
}
