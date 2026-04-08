'use client';

import { useState } from 'react';
import type { AnalysisResult } from '@/lib/bazi/types';

function ScoreBar({ score, label, brief }: { score: number; label: string; brief: string }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const tc = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-300' : score >= 40 ? 'text-orange-400' : 'text-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-amber-200/70 text-xs">{label}</span>
        <span className={`text-sm font-bold ${tc}`}>{score}</span>
      </div>
      <div className="h-2 bg-amber-900/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-amber-400/50 text-[10px]">{brief}</p>
    </div>
  );
}

const SHISHEN_BG: Record<string, string> = {
  '比肩': 'border-slate-500/30 bg-slate-500/5', '劫财': 'border-slate-500/30 bg-slate-500/5',
  '食神': 'border-orange-500/30 bg-orange-500/5', '伤官': 'border-orange-500/30 bg-orange-500/5',
  '偏财': 'border-emerald-500/30 bg-emerald-500/5', '正财': 'border-emerald-500/30 bg-emerald-500/5',
  '七杀': 'border-red-500/30 bg-red-500/5', '正官': 'border-purple-500/30 bg-purple-500/5',
  '偏印': 'border-sky-500/30 bg-sky-500/5', '正印': 'border-sky-500/30 bg-sky-500/5',
  '日主': 'border-amber-500/30 bg-amber-500/5',
};

export default function VisualReport({ data }: { data: AnalysisResult }) {
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);
  const scoreKeys = Object.keys(data.scores || {});

  return (
    <div className="space-y-6">
      {/* Profile */}
      <div className="bg-gradient-to-br from-amber-900/30 to-amber-950/50 border border-amber-600/30 rounded-2xl p-6 text-center">
        <div className="text-amber-500/50 text-[10px] tracking-widest mb-2">命格畫像</div>
        <h2 className="text-amber-300 text-xl font-bold mb-2">{data.profile.headline}</h2>
        <p className="text-amber-200/60 text-sm mb-1">{data.profile.element} ｜ {data.profile.archetype}</p>
        <p className="text-amber-200/50 text-xs mb-4 max-w-md mx-auto">{data.profile.dayMasterDescription}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {data.profile.personality.map((t, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-amber-800/30 border border-amber-700/30 text-amber-200 text-xs">{t}</span>
          ))}
        </div>
      </div>

      {/* Scores */}
      <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
        <h3 className="text-amber-300 font-bold text-center mb-5">五維命格指數</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          {scoreKeys.map(k => <ScoreBar key={k} score={data.scores[k].score} label={data.scores[k].label} brief={data.scores[k].brief} />)}
        </div>
      </div>

      {/* Pillars Insight */}
      <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
        <h3 className="text-amber-300 font-bold text-center mb-4">四柱解讀</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(data.pillarsInsight || []).map((pi, i) => (
            <div key={i} onClick={() => setExpandedPillar(expandedPillar === i ? null : i)}
              className={`rounded-xl border p-3 cursor-pointer transition-all hover:border-amber-500/40 ${
                SHISHEN_BG[pi.shiShen] || 'border-amber-800/20 bg-amber-900/10'
              } ${expandedPillar === i ? 'col-span-2 md:col-span-4 ring-1 ring-amber-500/30' : ''}`}>
              <div className="text-amber-400 text-xs font-bold">{pi.pillar}</div>
              <div className="text-amber-300 text-lg font-bold my-1">{pi.ganZhi}</div>
              <div className="text-[10px] text-amber-500/60">{pi.shiShen}</div>
              {expandedPillar === i && <p className="text-amber-200/70 text-xs mt-2 leading-relaxed">{pi.insight}</p>}
              {expandedPillar !== i && <div className="text-amber-700/50 text-[9px] text-right mt-1">▼</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Wu Xing */}
      {data.wuXingAnalysis && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-4">五行分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/15 text-center">
              <div className="text-emerald-400 text-xs font-bold mb-1">偏旺</div>
              <p className="text-amber-200 text-xs">{data.wuXingAnalysis.dominant}</p>
            </div>
            <div className="bg-orange-500/5 rounded-xl p-3 border border-orange-500/15 text-center">
              <div className="text-orange-400 text-xs font-bold mb-1">偏弱</div>
              <p className="text-amber-200 text-xs">{data.wuXingAnalysis.weak}</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/15 text-center">
              <div className="text-amber-300 text-xs font-bold mb-1">💡 調和建議</div>
              <p className="text-amber-200 text-xs">{data.wuXingAnalysis.advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Ten Gods */}
      {data.tenGodsHighlights?.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-4">十神亮點</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.tenGodsHighlights.map((tg, i) => (
              <div key={i} className={`rounded-xl p-3 border ${SHISHEN_BG[tg.god] || 'border-amber-800/20'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-amber-300 text-sm font-bold">{tg.god}</span>
                  <span className="text-[10px] text-amber-500/60">{tg.strength}</span>
                </div>
                <p className="text-amber-200/70 text-xs">{tg.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {data.patterns?.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-4">格局</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.patterns.map((p, i) => (
              <div key={i} className={`rounded-xl p-4 border ${p.type === 'high-energy' ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${p.type === 'high-energy' ? 'text-red-300' : 'text-emerald-300'}`}>{p.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${p.type === 'high-energy' ? 'text-red-400 border-red-500/30' : 'text-emerald-400 border-emerald-500/30'}`}>
                    {p.type === 'high-energy' ? '高能量' : '穩定型'}
                  </span>
                </div>
                <p className="text-amber-200/70 text-xs">{p.effect}</p>
                <p className="text-amber-400/50 text-[10px] mt-1">💡 {p.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Eight Life Topics ===== */}
      {data.lifeTopics && Object.keys(data.lifeTopics).length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-5">🎯 八大人生主題</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(data.lifeTopics).map(([key, topic]) => {
              const sc = topic.score;
              const color = sc >= 80 ? '#5B9E7A' : sc >= 60 ? '#C9A84C' : sc >= 40 ? '#D4856A' : '#B85C5C';
              const icons: Record<string, string> = {
                career: '💼', love: '💕', marriage: '💍', wealth: '💰',
                health: '🏥', children: '👶', social: '🤝', study: '📚',
              };
              const details = Object.entries(topic).filter(([k]) => !['score', 'title'].includes(k));
              return (
                <div key={key} className="bg-[#2A2018] rounded-xl p-4 border border-amber-800/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icons[key] || '📋'}</span>
                      <span className="text-amber-300 font-bold text-sm">{topic.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-2 bg-amber-900/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${sc}%`, background: color }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color }}>{sc}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {details.map(([k, v]) => (
                      <p key={k} className="text-amber-200/60 text-xs">
                        {typeof v === 'string' ? v : Array.isArray(v) ? (v as string[]).join('、') : ''}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Branch Relations (刑沖合害) ===== */}
      {data.branchRelations && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-3">⚡ 刑沖合害</h3>
          <p className="text-amber-200/70 text-sm text-center mb-2">{data.branchRelations.summary}</p>
          <p className="text-amber-400/50 text-xs text-center">💡 {data.branchRelations.impact}</p>
        </div>
      )}

      {/* ===== Shen Sha (神煞) ===== */}
      {data.shenSha && data.shenSha.highlights?.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-3">🌟 神煞系統</h3>
          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {data.shenSha.highlights.map((h, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-[#2A2018] border border-amber-800/20 text-amber-200 text-xs">{h}</span>
            ))}
          </div>
          <p className="text-amber-400/50 text-xs text-center">{data.shenSha.summary}</p>
        </div>
      )}

      {/* Current Fortune */}
      {data.currentFortune && (
        <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/40 border border-amber-600/30 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-4">當前運勢</h3>
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-amber-900/30 rounded-lg px-4 py-2 text-center border border-amber-800/20">
              <div className="text-amber-500/50 text-[10px]">大運</div>
              <div className="text-amber-300 font-bold">{data.currentFortune.daYun}</div>
            </div>
            <div className="bg-amber-900/30 rounded-lg px-4 py-2 text-center border border-amber-500/30">
              <div className="text-amber-500/50 text-[10px]">流年</div>
              <div className="text-amber-300 font-bold">{data.currentFortune.liuNian}</div>
            </div>
          </div>
          <p className="text-amber-200/80 text-center text-sm mb-4">{data.currentFortune.theme}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/15 text-center">
              <div className="text-emerald-400 text-xs font-bold mb-1">🎯 機會</div>
              <p className="text-amber-200 text-xs">{data.currentFortune.opportunity}</p>
            </div>
            <div className="bg-orange-500/5 rounded-xl p-3 border border-orange-500/15 text-center">
              <div className="text-orange-400 text-xs font-bold mb-1">⚡ 課題</div>
              <p className="text-amber-200 text-xs">{data.currentFortune.challenge}</p>
            </div>
            <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/15 text-center">
              <div className="text-amber-300 text-xs font-bold mb-1">💡 建議</div>
              <p className="text-amber-200 text-xs">{data.currentFortune.advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Life Path */}
      {data.lifePath && (
        <div className="bg-amber-950/40 border border-amber-600/30 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-4">人生藍圖</h3>
          <p className="text-amber-200/70 text-sm text-center mb-6 max-w-lg mx-auto">{data.lifePath.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-emerald-400 text-xs font-bold mb-2 text-center">✦ 核心優勢</div>
              {data.lifePath.strengths.map((s, i) => (
                <div key={i} className="bg-emerald-500/5 rounded-lg px-3 py-2 text-xs text-amber-200 border border-emerald-500/10 mb-1.5">{s}</div>
              ))}
            </div>
            <div>
              <div className="text-orange-400 text-xs font-bold mb-2 text-center">✦ 成長方向</div>
              {data.lifePath.growthAreas.map((s, i) => (
                <div key={i} className="bg-orange-500/5 rounded-lg px-3 py-2 text-xs text-amber-200 border border-orange-500/10 mb-1.5">{s}</div>
              ))}
            </div>
            <div>
              <div className="text-sky-400 text-xs font-bold mb-2 text-center">✦ 適合職業</div>
              {data.lifePath.bestCareers.map((s, i) => (
                <div key={i} className="bg-sky-500/5 rounded-lg px-3 py-2 text-xs text-amber-200 border border-sky-500/10 mb-1.5">{s}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
