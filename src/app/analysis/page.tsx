'use client';

import { useReducer, useCallback } from 'react';
import type { AnalysisState, AnalysisAction, BirthData } from '@/lib/bazi/types';
import { generateChart, formatChartText } from '@/lib/bazi/engine';
import { saveReport } from '@/lib/reportStore';
import StepIndicator from '@/components/analysis/StepIndicator';
import BirthForm from '@/components/analysis/BirthForm';
import BaziChart from '@/components/chart/BaziChart';
import WuXingCircle from '@/components/chart/WuXingCircle';
import DaYunChart from '@/components/chart/DaYunChart';
import LiuNianChart from '@/components/chart/LiuNianChart';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';
import VisualReport from '@/components/analysis/VisualReport';
import Link from 'next/link';

const initialBirth: BirthData = { year: 2000, month: 1, day: 1, hour: 12, minute: 0, gender: '女' };

const initialState: AnalysisState = {
  step: 1, birthData: initialBirth, chartData: null, chartError: null, generating: false,
  analyzing: false, analysisData: null, reportId: null, analysisError: null,
};

function reducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
  switch (action.type) {
    case 'UPDATE_BIRTH': return { ...state, birthData: { ...state.birthData, ...action.data } };
    case 'GENERATE_CHART_START': return { ...state, generating: true, chartError: null };
    case 'GENERATE_CHART_SUCCESS': return { ...state, generating: false, chartData: action.chartData, step: 2 };
    case 'GENERATE_CHART_ERROR': return { ...state, generating: false, chartError: action.error };
    case 'SET_STEP': return { ...state, step: action.step };
    case 'ANALYZE_START': return { ...state, analyzing: true, analysisError: null, step: 3 };
    case 'ANALYZE_SUCCESS': return { ...state, analyzing: false, analysisData: action.data, reportId: action.id };
    case 'ANALYZE_ERROR': return { ...state, analyzing: false, analysisError: action.error };
    case 'RESET': return initialState;
    default: return state;
  }
}

export default function AnalysisPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleGenerate = useCallback(() => {
    dispatch({ type: 'GENERATE_CHART_START' });
    try {
      const chartData = generateChart(state.birthData);
      dispatch({ type: 'GENERATE_CHART_SUCCESS', chartData });
    } catch (err) {
      dispatch({ type: 'GENERATE_CHART_ERROR', error: err instanceof Error ? err.message : '排盤失敗' });
    }
  }, [state.birthData]);

  const handleAnalyze = useCallback(async () => {
    if (!state.chartData) return;
    dispatch({ type: 'ANALYZE_START' });
    try {
      const chart = state.chartData;
      const context = formatChartText(chart);

      // Extract data for server-side knowledge lookup
      const shiShenList = [
        chart.yearPillar.shiShenGan,
        chart.monthPillar.shiShenGan,
        chart.hourPillar.shiShenGan,
        ...chart.yearPillar.shiShenZhi,
        ...chart.monthPillar.shiShenZhi,
        ...chart.dayPillar.shiShenZhi,
        ...chart.hourPillar.shiShenZhi,
      ].filter(Boolean);

      const ganZhiList = [
        chart.yearPillar.ganZhi,
        chart.monthPillar.ganZhi,
        chart.dayPillar.ganZhi,
        chart.hourPillar.ganZhi,
      ];

      // Find dominant element
      const wx = chart.wuXing;
      const maxEl = Object.entries(wx).sort(([,a], [,b]) => b - a)[0]?.[0] || '';
      const elMap: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          dayGan: chart.dayMaster,
          shiShenList,
          ganZhiList,
          wuXingDominant: elMap[maxEl] || '',
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || '分析失敗'); }
      const data = await res.json();
      if (!data.analysis?.profile) throw new Error('AI 回應格式異常，請重新分析');
      const id = crypto.randomUUID();
      saveReport({ id, createdAt: new Date().toISOString(), birthData: state.birthData, chartData: state.chartData, analysisJson: JSON.stringify(data.analysis) });
      dispatch({ type: 'ANALYZE_SUCCESS', data: data.analysis, id });
    } catch (err) {
      dispatch({ type: 'ANALYZE_ERROR', error: err instanceof Error ? err.message : '分析失敗' });
    }
  }, [state.chartData, state.birthData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a05] via-[#1a1008] to-[#0f0a05]">
      <header className="border-b border-amber-700/20 bg-amber-950/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold text-lg hover:text-amber-300">☰ 命理八字</Link>
          {state.step > 1 && <button onClick={() => dispatch({ type: 'RESET' })} className="text-amber-500 text-sm hover:text-amber-400">重新排盤</button>}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <StepIndicator currentStep={state.step} />

        {state.step === 1 && (
          <div>
            <h2 className="text-center text-amber-300 text-xl font-bold mb-2">輸入出生資料</h2>
            <p className="text-center text-amber-500 text-sm mb-8">請填入準確的出生日期和時辰</p>
            <BirthForm birthData={state.birthData} onChange={d => dispatch({ type: 'UPDATE_BIRTH', data: d })} onSubmit={handleGenerate} disabled={state.generating} />
            {state.chartError && <div className="mt-4 text-center text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{state.chartError}</div>}
          </div>
        )}

        {state.step === 2 && state.chartData && (
          <div>
            <h2 className="text-center text-amber-300 text-xl font-bold mb-6">確認命盤</h2>
            <BaziChart chartData={state.chartData} />
            <div className="mt-6"><WuXingCircle chartData={state.chartData} /></div>
            <div className="mt-6"><DaYunChart chartData={state.chartData} /></div>
            <div className="mt-6"><LiuNianChart chartData={state.chartData} /></div>
            <div className="flex gap-3 justify-center mt-8">
              <button onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} className="px-6 py-2.5 rounded-lg border border-amber-700/30 text-amber-500 text-sm">← 修改</button>
              <button onClick={handleAnalyze} className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white font-bold text-sm shadow-lg shadow-amber-900/20">☰ AI 深度分析</button>
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div>
            {state.analyzing && <AnalysisLoading />}
            {state.analysisError && (
              <div className="text-center py-10">
                <div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-4 mb-4">{state.analysisError}</div>
                <button onClick={handleAnalyze} className="text-amber-400 text-sm underline">重新分析</button>
              </div>
            )}
            {state.analysisData && (
              <div>
                <h2 className="text-center text-amber-300 text-xl font-bold mb-6">命盤分析報告</h2>
                {state.chartData && <div className="mb-6"><BaziChart chartData={state.chartData} compact /></div>}
                <VisualReport data={state.analysisData} />
                <div className="flex flex-wrap gap-3 justify-center mt-8">
                  {state.reportId && (
                    <>
                      <Link href={`/fortune/${state.reportId}`} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white text-sm font-bold">📅 流年逐月</Link>
                      <Link href={`/chat/${state.reportId}`} className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-700/80 to-amber-800/80 text-white text-sm font-bold">💬 命理大師</Link>
                    </>
                  )}
                  <button onClick={() => window.print()} className="px-6 py-2.5 rounded-lg border border-amber-700/30 text-amber-500 text-sm">🖨️ 列印</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
