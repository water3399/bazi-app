// ====== Birth Input ======
export type Gender = '男' | '女';

export const SHICHEN_LIST = [
  { label: '子時（早子）', value: '00:30', range: '00:00–01:00', zhi: '子' },
  { label: '丑時', value: '02:00', range: '01:00–03:00', zhi: '丑' },
  { label: '寅時', value: '04:00', range: '03:00–05:00', zhi: '寅' },
  { label: '卯時', value: '06:00', range: '05:00–07:00', zhi: '卯' },
  { label: '辰時', value: '08:00', range: '07:00–09:00', zhi: '辰' },
  { label: '巳時', value: '10:00', range: '09:00–11:00', zhi: '巳' },
  { label: '午時', value: '12:00', range: '11:00–13:00', zhi: '午' },
  { label: '未時', value: '14:00', range: '13:00–15:00', zhi: '未' },
  { label: '申時', value: '16:00', range: '15:00–17:00', zhi: '申' },
  { label: '酉時', value: '18:00', range: '17:00–19:00', zhi: '酉' },
  { label: '戌時', value: '20:00', range: '19:00–21:00', zhi: '戌' },
  { label: '亥時', value: '22:00', range: '21:00–23:00', zhi: '亥' },
  { label: '子時（晚子）', value: '23:30', range: '23:00–00:00', zhi: '子' },
] as const;

export interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: Gender;
}

// ====== Pillar 柱 ======
export interface Pillar {
  gan: string;        // 天干
  zhi: string;        // 地支
  ganZhi: string;     // 干支組合（如「辛酉」）
  naYin: string;      // 納音（如「石榴木」）
  shiShenGan: string; // 天干十神
  shiShenZhi: string[];  // 地支十神（藏干對應）
  hideGan: string[];  // 地支藏干
  diShi: string;      // 十二長生
  xunKong: string;    // 旬空
}

// ====== Da Yun 大運 ======
export interface DaYunPeriod {
  ganZhi: string;
  startAge: number;
  endAge: number;
  liuNian: LiuNianData[];
}

export interface LiuNianData {
  year: number;
  ganZhi: string;
  age: number;
}

export interface LiuYueData {
  month: string;
  ganZhi: string;
}

// ====== Five Elements 五行 ======
export interface WuXingCount {
  wood: number;   // 木
  fire: number;   // 火
  earth: number;  // 土
  metal: number;  // 金
  water: number;  // 水
}

// ====== Chart Data 命盤 ======
export interface ChartData {
  birthData: BirthData;
  // 基本資料
  lunarDate: string;
  lunarYear: string;
  lunarMonth: string;
  lunarDay: string;
  shengXiao: string;    // 生肖
  xingZuo: string;      // 星座
  // 四柱
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  // 日主
  dayMaster: string;      // 日干（命主）
  dayMasterElement: string; // 日主五行
  // 特殊宮位
  taiYuan: string;   // 胎元
  mingGong: string;  // 命宮
  shenGong: string;  // 身宮
  // 五行統計
  wuXing: WuXingCount;
  // 大運
  startAge: number;
  daYun: DaYunPeriod[];
  // 當前大運/流年
  currentDaYun: DaYunPeriod | null;
  currentLiuNian: LiuNianData | null;
  currentLiuYue: LiuYueData[];
}

// ====== Analysis State ======
export interface AnalysisState {
  step: 1 | 2 | 3;
  birthData: BirthData;
  chartData: ChartData | null;
  chartError: string | null;
  generating: boolean;
  analyzing: boolean;
  analysisData: AnalysisResult | null;
  reportId: string | null;
  analysisError: string | null;
}

export type AnalysisAction =
  | { type: 'UPDATE_BIRTH'; data: Partial<BirthData> }
  | { type: 'GENERATE_CHART_START' }
  | { type: 'GENERATE_CHART_SUCCESS'; chartData: ChartData }
  | { type: 'GENERATE_CHART_ERROR'; error: string }
  | { type: 'SET_STEP'; step: 1 | 2 | 3 }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_SUCCESS'; data: AnalysisResult; id: string }
  | { type: 'ANALYZE_ERROR'; error: string }
  | { type: 'RESET' };

// ====== AI Analysis Result ======
export interface AnalysisResult {
  profile: {
    headline: string;
    dayMasterDescription: string;
    personality: string[];
    element: string;
    archetype: string;
  };
  scores: Record<string, { score: number; label: string; brief: string }>;
  pillarsInsight: Array<{
    pillar: string;
    ganZhi: string;
    shiShen: string;
    insight: string;
  }>;
  wuXingAnalysis: {
    dominant: string;
    weak: string;
    advice: string;
  };
  tenGodsHighlights: Array<{
    god: string;
    strength: string;
    meaning: string;
  }>;
  patterns: Array<{
    name: string;
    type: string;
    effect: string;
    tip: string;
  }>;
  lifeTopics?: Record<string, {
    score: number;
    title: string;
    [key: string]: unknown;
  }>;
  branchRelations?: {
    summary: string;
    impact: string;
  };
  shenSha?: {
    highlights: string[];
    summary: string;
  };
  currentFortune: {
    daYun: string;
    liuNian: string;
    theme: string;
    opportunity: string;
    challenge: string;
    advice: string;
  };
  lifePath: {
    summary: string;
    strengths: string[];
    growthAreas: string[];
    bestCareers: string[];
  };
}

// ====== Stored Report ======
export interface StoredReport {
  id: string;
  createdAt: string;
  birthData: BirthData;
  chartData: ChartData;
  analysisJson: string;
}
