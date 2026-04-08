/**
 * Server-side knowledge loader for Bazi
 * Reads classical texts and extracts relevant sections based on chart data
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/lib/bazi/data');

// Cache loaded files
const cache: Record<string, string> = {};

function loadFile(filename: string): string {
  if (!cache[filename]) {
    try {
      cache[filename] = fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
    } catch { cache[filename] = ''; }
  }
  return cache[filename];
}

// ============================================================
// 1. 子平真詮 — 格局理論精髓
// ============================================================
function extractZiPingSection(topic: string): string {
  const data = loadFile('zipingzhenquan.md');
  // Find section by topic keyword
  const patterns = [
    new RegExp(`#+\\s*[^\\n]*${topic}[\\s\\S]*?(?=\\n#+\\s|$)`, 'i'),
    new RegExp(`[^\\n]*${topic}[\\s\\S]{0,2000}`, 'i'),
  ];
  for (const p of patterns) {
    const match = data.match(p);
    if (match) return match[0].substring(0, 2000).trim();
  }
  return '';
}

// ============================================================
// 2. 三命通會 — 最全面的八字百科
// ============================================================
function extractSanMingSection(keyword: string): string {
  const data = loadFile('sanming-tonghui.txt');
  const lines = data.split('\n');
  const results: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(keyword)) {
      const start = Math.max(0, i - 2);
      const end = Math.min(lines.length, i + 15);
      const passage = lines.slice(start, end).join('\n').trim();
      if (passage.length > 20 && !results.includes(passage)) {
        results.push(passage);
      }
      if (results.length >= 5) break;
    }
  }
  return results.join('\n\n---\n\n').substring(0, 4000);
}

// ============================================================
// 3. 淵海子平 — 十神基礎
// ============================================================
function extractYuanHaiSection(dayGan: string): string {
  const data = loadFile('yuanhai-ziping.txt');
  // Find the section about this day master
  const pattern = new RegExp(`以${dayGan}为例[\\s\\S]*?(?=以[甲乙丙丁戊己庚辛壬癸]为例|$)`, 'i');
  const match = data.match(pattern);
  if (match) return match[0].substring(0, 2000).trim();

  // Fallback: find any mention of the day gan
  const lines = data.split('\n');
  const results: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(dayGan) && lines[i].length > 10) {
      const passage = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join('\n').trim();
      if (passage.length > 15) results.push(passage);
      if (results.length >= 8) break;
    }
  }
  return results.join('\n').substring(0, 2000);
}

// ============================================================
// 4. 格局论命 — 格局判斷
// ============================================================
function extractGeJuSection(shiShenList: string[]): string {
  const data = loadFile('geju-lunming.txt');
  const results: string[] = [];

  for (const shiShen of shiShenList) {
    const pattern = new RegExp(`[^\\n]*${shiShen}[格局][\\s\\S]*?(?=\\n[○●■□▶]|\\n{3,}|$)`, 'i');
    const match = data.match(pattern);
    if (match) {
      results.push(match[0].substring(0, 1500).trim());
    }
  }

  if (results.length === 0) {
    // Fallback: search for any shiShen mentions
    for (const ss of shiShenList) {
      const lines = data.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(ss) && lines[i].length > 15) {
          results.push(lines.slice(i, Math.min(lines.length, i + 8)).join('\n').trim());
          if (results.length >= 3) break;
        }
      }
      if (results.length >= 3) break;
    }
  }

  return results.join('\n\n---\n\n').substring(0, 3000);
}

// ============================================================
// 5. 子平真詮评注 — 徐樂吾註解
// ============================================================
function extractPingZhuSection(topic: string): string {
  const data = loadFile('zipingzhenquan-pingzhu.md');
  const pattern = new RegExp(`[^\\n]*${topic}[\\s\\S]{0,1500}`, 'i');
  const match = data.match(pattern);
  return match ? match[0].substring(0, 1500).trim() : '';
}

// ============================================================
// 6. 古典摘要 — 九本古典核心原則
// ============================================================
function getClassicalSummary(): string {
  return loadFile('classical-texts.md').substring(0, 3000);
}

// ============================================================
// 7. 五行表 + 大運規則
// ============================================================
function getWuXingTables(): string {
  return loadFile('wuxing-tables.md').substring(0, 2000);
}

// ============================================================
// Main: Build knowledge context for a Bazi chart
// ============================================================
export function buildBaziKnowledge(
  dayGan: string,        // 日主天干
  shiShenList: string[],  // 四柱出現的十神列表
  ganZhiList: string[],   // 四柱干支列表（如 ['辛酉','辛卯','庚子','癸未']）
  wuXingDominant: string, // 偏旺的五行
): string {
  const sections: string[] = [];

  // 1. 淵海子平 — 日主基礎
  const yuanHai = extractYuanHaiSection(dayGan);
  if (yuanHai) {
    sections.push('===== 淵海子平·日主論 =====');
    sections.push(yuanHai);
  }

  // 2. 子平真詮 — 用神和格局
  const uniqueShiShen = Array.from(new Set(shiShenList.filter(s => s && s !== '日主')));
  if (uniqueShiShen.length > 0) {
    sections.push('\n===== 子平真詮·十神論 =====');
    // 找用神相關章節
    const yongShen = extractZiPingSection('用神');
    if (yongShen) sections.push(yongShen.substring(0, 1500));

    // 找月令相關
    for (const ss of uniqueShiShen.slice(0, 3)) {
      const ssSection = extractZiPingSection(ss);
      if (ssSection) sections.push(ssSection.substring(0, 800));
    }
  }

  // 3. 子平真詮评注 — 補充解讀
  if (uniqueShiShen.length > 0) {
    const pingzhu = extractPingZhuSection(uniqueShiShen[0]);
    if (pingzhu) {
      sections.push('\n===== 子平真詮评注·補充 =====');
      sections.push(pingzhu);
    }
  }

  // 4. 三命通會 — 日柱斷語
  for (const gz of ganZhiList) {
    const sanMing = extractSanMingSection(gz);
    if (sanMing) {
      sections.push(`\n===== 三命通會·${gz} =====`);
      sections.push(sanMing.substring(0, 1500));
      break; // 只取日柱的
    }
  }

  // 5. 三命通會 — 日主五行論
  const wuXingSanMing = extractSanMingSection(`论${dayGan}`);
  if (wuXingSanMing) {
    sections.push('\n===== 三命通會·日主論 =====');
    sections.push(wuXingSanMing.substring(0, 1500));
  }

  // 6. 格局论命 — 格局判定
  const geju = extractGeJuSection(uniqueShiShen);
  if (geju) {
    sections.push('\n===== 格局论命 =====');
    sections.push(geju);
  }

  // 7. 古典摘要
  sections.push('\n===== 九本古典核心原則 =====');
  sections.push(getClassicalSummary());

  // 8. 五行表
  sections.push('\n===== 五行對照表 =====');
  sections.push(getWuXingTables());

  return sections.join('\n\n');
}
