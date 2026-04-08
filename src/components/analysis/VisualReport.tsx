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
          <h3 className="text-amber-300 font-bold text-center mb-2">🔮 十神亮點</h3>
          <p className="text-[#8C7A62] text-xs text-center mb-5">十神就是你性格裡的「不同角色設定」，以下是你命盤中最重要的幾個：</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.tenGodsHighlights.map((tg, i) => {
              const strengthColor = tg.strength?.includes('旺') ? 'text-[#C9A84C]' : tg.strength?.includes('弱') ? 'text-[#8C7A62]' : 'text-amber-300';
              return (
                <div key={i} className={`rounded-xl p-4 border ${SHISHEN_BG[tg.god] || 'border-amber-800/20 bg-amber-900/10'}`}>
                  {/* Header: name + strength */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tg.emoji && <span className="text-lg">{tg.emoji}</span>}
                      <span className="text-amber-300 font-bold text-base">{tg.god}</span>
                    </div>
                    <span className={`text-xs font-bold ${strengthColor}`}>{tg.strength}</span>
                  </div>

                  {/* One-liner */}
                  {tg.oneLiner && (
                    <p className="text-amber-200 text-sm font-medium mb-2">👉 {tg.oneLiner}</p>
                  )}

                  {/* Personality */}
                  {tg.personality && (
                    <div className="mb-2">
                      <span className="text-[10px] text-[#8C7A62]">個性：</span>
                      <p className="text-amber-200/70 text-xs leading-relaxed">{tg.personality}</p>
                    </div>
                  )}

                  {/* Advice */}
                  {tg.advice && (
                    <div className="bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
                      <span className="text-amber-400 text-[10px] font-bold">💡 建議：</span>
                      <span className="text-amber-200/70 text-xs ml-1">{tg.advice}</span>
                    </div>
                  )}

                  {/* Fallback for old format */}
                  {!tg.oneLiner && tg.meaning && (
                    <p className="text-amber-200/70 text-xs">{tg.meaning}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Patterns */}
      {data.patterns?.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-2">🎮 格局</h3>
          <p className="text-[#8C7A62] text-xs text-center mb-5">格局就是你在人生遊戲裡的「天生職業屬性」和「最佳生存策略」</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.patterns.map((p, i) => {
              const isHigh = p.type === 'high-energy';
              return (
                <div key={i} className={`rounded-xl p-5 border ${
                  isHigh ? 'bg-[#D4856A]/5 border-[#D4856A]/25' : 'bg-[#5B9E7A]/5 border-[#5B9E7A]/25'
                }`}>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    {p.emoji && <span className="text-xl">{p.emoji}</span>}
                    <span className={`font-bold text-lg ${isHigh ? 'text-[#D4856A]' : 'text-[#5B9E7A]'}`}>{p.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                      isHigh ? 'text-[#D4856A] border-[#D4856A]/30 bg-[#D4856A]/10' : 'text-[#5B9E7A] border-[#5B9E7A]/30 bg-[#5B9E7A]/10'
                    }`}>
                      {isHigh ? '高能量' : '穩定型'}
                    </span>
                  </div>

                  {/* One-liner */}
                  {p.oneLiner && (
                    <p className="text-amber-200 text-sm font-medium mb-3">👉 {p.oneLiner}</p>
                  )}

                  {/* Trait */}
                  {p.trait && (
                    <div className="mb-3">
                      <span className="text-[10px] text-[#8C7A62]">特質：</span>
                      <p className="text-amber-200/70 text-xs leading-relaxed">{p.trait}</p>
                    </div>
                  )}

                  {/* Strategy */}
                  {p.strategy && (
                    <div className="bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
                      <span className="text-amber-400 text-[10px] font-bold">🎯 生存策略：</span>
                      <p className="text-amber-200/70 text-xs mt-0.5 leading-relaxed">{p.strategy}</p>
                    </div>
                  )}

                  {/* Fallback for old format */}
                  {!p.oneLiner && p.effect && (
                    <>
                      <p className="text-amber-200/70 text-xs">{p.effect}</p>
                      {p.tip && <p className="text-amber-400/50 text-[10px] mt-1">💡 {p.tip}</p>}
                    </>
                  )}
                </div>
              );
            })}
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
      {Array.isArray(data.branchRelations) && data.branchRelations.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/20 rounded-2xl p-6">
          <h3 className="text-amber-300 font-bold text-center mb-2">⚡ 刑沖合害</h3>
          <p className="text-[#8C7A62] text-xs text-center mb-5">四柱地支之間的化學反應：合=助力、沖=轉折、刑=磨練、害=需要溝通</p>
          <div className="space-y-4">
            {(data.branchRelations as Array<{type: string; pillars: string; emoji: string; whatItMeans: string; realLifeImpact: string; advice: string}>).map((br, i) => {
              const levelColor = br.type === '合' || br.type === '三合' || br.type === '半合'
                ? 'border-[#5B9E7A]/30 bg-[#5B9E7A]/5'
                : br.type === '沖' || br.type === '刑'
                  ? 'border-[#D4856A]/30 bg-[#D4856A]/5'
                  : 'border-amber-700/20 bg-amber-900/10';
              return (
                <div key={i} className={`rounded-xl p-4 border ${levelColor}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{br.emoji || '⚡'}</span>
                    <span className="text-amber-300 font-bold text-sm">{br.pillars}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-800/30 text-amber-400 border border-amber-700/20">{br.type}</span>
                  </div>
                  <p className="text-amber-200/80 text-sm font-medium mb-2">{br.whatItMeans}</p>
                  <p className="text-amber-200/60 text-xs leading-relaxed mb-2">{br.realLifeImpact}</p>
                  <div className="bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
                    <span className="text-amber-400 text-[10px] font-bold">💡 建議：</span>
                    <span className="text-amber-200/70 text-xs ml-1">{br.advice}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
