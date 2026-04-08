'use client';

import { useEffect, useState } from 'react';

interface AnalysisLoadingProps {
  type?: 'chart' | 'fortune';
}

const CHART_STAGES = [
  { text: '☰ 載入四柱命盤資料...', duration: 3000 },
  { text: '📚 查閱窮通寶典、三命通會...', duration: 5000 },
  { text: '🔍 分析日主旺衰與十神...', duration: 8000 },
  { text: '⚖️ 判定格局與用神...', duration: 10000 },
  { text: '🌿 解讀五行生剋互動...', duration: 15000 },
  { text: '📅 整合大運流年運勢...', duration: 20000 },
  { text: '✍️ 撰寫完整報告中...', duration: 30000 },
  { text: '✨ 報告即將完成...', duration: 45000 },
];

const FORTUNE_STAGES = [
  { text: '📅 載入流年干支資料...', duration: 2000 },
  { text: '⚖️ 計算大運 × 流年十神互動...', duration: 5000 },
  { text: '🌸 分析正月至三月流月...', duration: 10000 },
  { text: '☀️ 分析四月至六月流月...', duration: 18000 },
  { text: '🍂 分析七月至九月流月...', duration: 28000 },
  { text: '❄️ 分析十月至臘月流月...', duration: 38000 },
  { text: '📊 整合全年運勢走勢...', duration: 50000 },
  { text: '✨ 報告即將完成...', duration: 65000 },
];

export default function AnalysisLoading({ type = 'chart' }: AnalysisLoadingProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stages = type === 'fortune' ? FORTUNE_STAGES : CHART_STAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nextStage = stages.findIndex(s => s.duration > elapsed);
    if (nextStage >= 0) setStageIndex(nextStage);
    else setStageIndex(stages.length - 1);
  }, [elapsed, stages]);

  const progress = Math.min(95, (elapsed / (stages[stages.length - 1].duration)) * 95);
  const seconds = Math.floor(elapsed / 1000);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Spinning rings */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-3 rounded-full border-2 border-amber-600/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-6 rounded-full border-2 border-amber-400/40 animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-pulse">✦</span>
        </div>
      </div>

      {/* Stage text */}
      <div className="text-amber-300 text-lg font-bold mb-2 transition-all duration-500">
        {stages[stageIndex].text}
      </div>

      {/* Progress bar */}
      <div className="w-64 bg-purple-900/40 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-600 to-amber-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Timer + stage indicator */}
      <div className="flex items-center gap-3 text-amber-600 text-xs">
        <span>已用時 {seconds} 秒</span>
        <span>•</span>
        <span>步驟 {stageIndex + 1} / {stages.length}</span>
      </div>

      {/* Stage dots */}
      <div className="mt-4 flex gap-1.5">
        {stages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < stageIndex ? 'bg-amber-500/80' :
              i === stageIndex ? 'bg-amber-400 animate-pulse scale-125' :
              'bg-purple-800/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
