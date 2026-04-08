'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { BirthData, ChartData } from '@/lib/bazi/types';
import { SHICHEN_LIST } from '@/lib/bazi/types';
import { generateChart, formatChartText } from '@/lib/bazi/engine';
import { analyzeSynastry, formatSynastryContext, type SynastryMember, type SynastryResult } from '@/lib/bazi/synastry';
import { useLang } from '@/lib/langContext';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';

const MEMBER_COLORS = ['#C9A84C', '#6B8DB5', '#C47A7A', '#5B9E7A', '#8B7EC8'];
const MEMBER_EMOJIS = ['👤', '👥', '👶', '🧑', '👩'];

interface Member {
  name: string;
  birthData: BirthData;
  chartData: ChartData | null;
}

interface AIPairAnalysis {
  personA: string; personB: string; score: number; relation: string; strengths: string; challenges: string; advice: string;
}
interface AIResult {
  overallScore: number; overallComment: string;
  dimensions: Record<string, { score: number; label: string; brief: string }>;
  pairAnalysis: AIPairAnalysis[];
  groupDynamic: string; bestCombination: string; advice: string;
}

const defaultBirth: BirthData = { year: 1990, month: 1, day: 1, hour: 12, minute: 0, gender: '男' };

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 10) / 2, c = 2 * Math.PI * r, offset = c - (score / 100) * c;
  const color = score >= 80 ? '#5B9E7A' : score >= 60 ? '#C9A84C' : score >= 40 ? '#D4856A' : '#B85C5C';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-[#8C7A62]">契合度</span>
      </div>
    </div>
  );
}

export default function SynastryPage() {
  const { lang, setLang, langLabel, langPrompt } = useLang();
  const [members, setMembers] = useState<Member[]>([
    { name: '', birthData: { ...defaultBirth }, chartData: null },
    { name: '', birthData: { ...defaultBirth, gender: '女' }, chartData: null },
  ]);
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(null);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'result'>('input');

  const updateMember = (idx: number, updates: Partial<Member>) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, ...updates } : m));
  };

  const updateBirth = (idx: number, data: Partial<BirthData>) => {
    setMembers(prev => prev.map((m, i) => i === idx ? { ...m, birthData: { ...m.birthData, ...data } } : m));
  };

  const addMember = () => {
    if (members.length >= 5) return;
    setMembers(prev => [...prev, { name: '', birthData: { ...defaultBirth }, chartData: null }]);
  };

  const removeMember = (idx: number) => {
    if (members.length <= 2) return;
    setMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAnalyze = useCallback(async () => {
    // Validate
    for (const m of members) {
      if (!m.name.trim()) { setError('請輸入每個人的名字'); return; }
    }

    setAnalyzing(true); setError(null);
    try {
      // Generate charts
      const charted = members.map((m, i) => {
        const chart = generateChart(m.birthData);
        return { ...m, chartData: chart, color: MEMBER_COLORS[i] || '#999' };
      });
      setMembers(charted);

      // Calculate synastry
      const synMembers: SynastryMember[] = charted.map((m, i) => ({
        name: m.name, chartData: m.chartData!, color: MEMBER_COLORS[i],
      }));
      const result = analyzeSynastry(synMembers);
      setSynastryResult(result);

      // AI analysis
      const context = `${langPrompt}\n\n${formatSynastryContext(synMembers, result)}\n\n` +
        charted.map(m => `【${m.name} 完整命盤】\n${formatChartText(m.chartData!).substring(0, 1500)}`).join('\n\n');

      const res = await fetch('/api/synastry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setAiResult(data.analysis);
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失敗');
    } finally { setAnalyzing(false); }
  }, [members, langPrompt]);

  const years = Array.from({ length: 80 }, (_, i) => 2025 - i);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a05] via-[#1a1008] to-[#0f0a05]">
      <header className="border-b border-amber-700/20 bg-amber-950/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold text-lg">☰ 命理八字</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'zh-TW' ? 'zh-CN' : 'zh-TW')} className="px-2 py-1 rounded-lg border border-amber-700/30 text-amber-500 text-xs">🌐 {langLabel}</button>
            <Link href="/analysis" className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📄 個人排盤</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-center text-amber-300 text-2xl font-bold mb-2">🤝 合盤分析</h1>
        <p className="text-center text-[#8C7A62] text-sm mb-8">輸入 2-5 人的出生資料，分析彼此的命格關係</p>

        {step === 'input' && (
          <div>
            {/* Member forms */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {members.map((m, idx) => (
                <div key={idx} className="bg-[#1E1810] border border-[#3D3020] rounded-xl p-4" style={{ borderLeftColor: MEMBER_COLORS[idx], borderLeftWidth: 3 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{MEMBER_EMOJIS[idx]}</span>
                      <span className="text-amber-300 text-sm font-bold">成員 {idx + 1}</span>
                    </div>
                    {members.length > 2 && (
                      <button onClick={() => removeMember(idx)} className="text-[#8C7A62] text-xs hover:text-red-400">✕ 移除</button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2 md:col-span-1">
                      <input value={m.name} onChange={e => updateMember(idx, { name: e.target.value })} placeholder="姓名"
                        className="w-full bg-[#2A2018] border border-[#3D3020] rounded-lg px-3 py-2 text-amber-100 text-sm focus:border-amber-500/50 focus:outline-none" />
                    </div>
                    <select value={m.birthData.year} onChange={e => updateBirth(idx, { year: Number(e.target.value) })}
                      className="bg-[#2A2018] border border-[#3D3020] rounded-lg px-2 py-2 text-amber-100 text-sm focus:outline-none">
                      {years.map(y => <option key={y} value={y}>{y}年</option>)}
                    </select>
                    <select value={m.birthData.month} onChange={e => updateBirth(idx, { month: Number(e.target.value) })}
                      className="bg-[#2A2018] border border-[#3D3020] rounded-lg px-2 py-2 text-amber-100 text-sm focus:outline-none">
                      {Array.from({length:12},(_,i)=>i+1).map(mo => <option key={mo} value={mo}>{mo}月</option>)}
                    </select>
                    <select value={m.birthData.day} onChange={e => updateBirth(idx, { day: Number(e.target.value) })}
                      className="bg-[#2A2018] border border-[#3D3020] rounded-lg px-2 py-2 text-amber-100 text-sm focus:outline-none">
                      {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}日</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <select value={`${m.birthData.hour}:${m.birthData.minute}`}
                      onChange={e => { const [h,mi] = e.target.value.split(':').map(Number); updateBirth(idx, { hour: h, minute: mi }); }}
                      className="bg-[#2A2018] border border-[#3D3020] rounded-lg px-2 py-2 text-amber-100 text-sm focus:outline-none">
                      {SHICHEN_LIST.map(sc => <option key={sc.value} value={sc.value}>{sc.label.split('（')[0]} {sc.range}</option>)}
                    </select>
                    <div className="flex gap-2">
                      {(['男', '女'] as const).map(g => (
                        <button key={g} onClick={() => updateBirth(idx, { gender: g })}
                          className={`flex-1 py-2 rounded-lg text-sm ${m.birthData.gender === g ? 'bg-amber-600/20 border border-amber-500/50 text-amber-300' : 'bg-[#2A2018] border border-[#3D3020] text-[#8C7A62]'}`}>
                          {g === '男' ? '♂ 男' : '♀ 女'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add member */}
            {members.length < 5 && (
              <div className="text-center mt-4">
                <button onClick={addMember} className="px-6 py-2 rounded-lg border border-dashed border-amber-700/30 text-amber-500 text-sm hover:border-amber-500/50">
                  ＋ 添加成員（最多 5 人）
                </button>
              </div>
            )}

            {error && <div className="text-center mt-4 text-red-400 text-sm bg-red-500/10 rounded-lg p-3 max-w-2xl mx-auto">{error}</div>}

            <div className="text-center mt-8">
              <button onClick={handleAnalyze} disabled={analyzing}
                className="px-10 py-3 rounded-xl bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white font-bold disabled:opacity-50 shadow-lg shadow-amber-900/20">
                {analyzing ? '分析中...' : `🤝 開始合盤分析（${members.length} 人）`}
              </button>
            </div>

            {analyzing && <AnalysisLoading />}
          </div>
        )}

        {step === 'result' && synastryResult && (
          <div>
            <button onClick={() => { setStep('input'); setAiResult(null); setSynastryResult(null); }}
              className="text-amber-500 text-sm mb-6 hover:text-amber-400">← 重新輸入</button>

            {/* Overall score */}
            {aiResult && (
              <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <ScoreRing score={aiResult.overallScore} size={120} />
                </div>
                <h2 className="text-amber-300 font-bold text-lg mb-2">{aiResult.overallComment}</h2>
                <p className="text-[#8C7A62] text-sm">{aiResult.groupDynamic}</p>
              </div>
            )}

            {/* Members */}
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {synastryResult.members.map((m, i) => (
                <div key={i} className="bg-[#1E1810] border rounded-xl px-4 py-3 text-center" style={{ borderColor: m.color + '50' }}>
                  <span className="text-lg">{MEMBER_EMOJIS[i]}</span>
                  <div className="font-bold text-sm" style={{ color: m.color }}>{m.name}</div>
                  <div className="text-[#8C7A62] text-xs">{m.dayMaster} · {m.element}</div>
                </div>
              ))}
            </div>

            {/* Day master relation network */}
            <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6">
              <h3 className="text-amber-300 font-bold text-center mb-4">🔗 日主關係網</h3>
              <div className="space-y-3">
                {synastryResult.dayMasterRelations.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#2A2018] rounded-xl p-3">
                    <span className="text-lg">{r.emoji}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-amber-300 font-bold text-sm">{r.from}（{r.fromGan}）</span>
                      <span className="text-[#C9A84C] text-xs px-2 py-0.5 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/20">{r.relation}</span>
                      <span className="text-amber-300 font-bold text-sm">{r.to}（{r.toGan}）</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wu Xing comparison bars */}
            <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6">
              <h3 className="text-amber-300 font-bold text-center mb-1">🌿 五行對照</h3>
              <p className="text-center text-[#8C7A62] text-xs mb-4">互補度：{synastryResult.wuXingComplementScore}%</p>
              <div className="space-y-4">
                {synastryResult.wuXingComparison.map(wx => (
                  <div key={wx.element}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{wx.emoji}</span>
                      <span className="text-amber-300 text-sm font-bold w-6">{wx.element}</span>
                    </div>
                    {wx.members.map((m, mi) => (
                      <div key={mi} className="flex items-center gap-2 mb-1 pl-8">
                        <span className="text-xs w-16 text-right" style={{ color: MEMBER_COLORS[mi] }}>{m.name}</span>
                        <div className="flex-1 h-4 bg-[#2A2018] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(m.pct, 3)}%`, background: MEMBER_COLORS[mi] + '80' }} />
                        </div>
                        <span className="text-xs text-[#8C7A62] w-10">{m.pct}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Shi Shen cross */}
            <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6">
              <h3 className="text-amber-300 font-bold text-center mb-4">⚖️ 十神交叉</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {synastryResult.shiShenCross.map((sc, i) => (
                  <div key={i} className="bg-[#2A2018] rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-amber-300 text-sm font-bold">{sc.personA} ↔ {sc.personB}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#1E1810] rounded-lg p-2 text-center">
                        <span className="text-[#8C7A62]">{sc.personA} 看 {sc.personB}</span>
                        <div className="text-amber-300 font-bold mt-1">{sc.aSeesB}</div>
                      </div>
                      <div className="bg-[#1E1810] rounded-lg p-2 text-center">
                        <span className="text-[#8C7A62]">{sc.personB} 看 {sc.personA}</span>
                        <div className="text-amber-300 font-bold mt-1">{sc.bSeesA}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI dimensions */}
            {aiResult?.dimensions && (
              <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6">
                <h3 className="text-amber-300 font-bold text-center mb-4">📊 五維關係指數</h3>
                <div className="space-y-3 max-w-lg mx-auto">
                  {Object.keys(aiResult.dimensions).map(k => {
                    const d = aiResult.dimensions[k];
                    const color = d.score >= 80 ? '#5B9E7A' : d.score >= 60 ? '#C9A84C' : d.score >= 40 ? '#D4856A' : '#B85C5C';
                    return (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-amber-200/70">{d.label}</span>
                          <span style={{ color }} className="font-bold">{d.score}</span>
                        </div>
                        <div className="h-2.5 bg-[#2A2018] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${d.score}%`, background: color }} />
                        </div>
                        <p className="text-[10px] text-[#8C7A62] mt-0.5">{d.brief}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pair analysis */}
            {aiResult?.pairAnalysis && (
              <div className="bg-[#1E1810] border border-[#3D3020] rounded-2xl p-6 mb-6">
                <h3 className="text-amber-300 font-bold text-center mb-4">👥 配對分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiResult.pairAnalysis.map((pa, i) => {
                    const color = pa.score >= 80 ? '#5B9E7A' : pa.score >= 60 ? '#C9A84C' : '#D4856A';
                    return (
                      <div key={i} className="bg-[#2A2018] rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-300 text-sm font-bold">{pa.personA} × {pa.personB}</span>
                          <span className="text-lg font-bold" style={{ color }}>{pa.score}</span>
                        </div>
                        <p className="text-amber-200/60 text-xs mb-2">{pa.relation}</p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-[#5B9E7A]/5 rounded p-1.5 border border-[#5B9E7A]/15">
                            <span className="text-[#5B9E7A]">✦ 優勢</span>
                            <p className="text-amber-200/60 mt-0.5">{pa.strengths}</p>
                          </div>
                          <div className="bg-[#D4856A]/5 rounded p-1.5 border border-[#D4856A]/15">
                            <span className="text-[#D4856A]">⚡ 注意</span>
                            <p className="text-amber-200/60 mt-0.5">{pa.challenges}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#C9A84C] mt-2">💡 {pa.advice}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Best combination */}
            {aiResult && (
              <div className="bg-[#1E1810] border border-[#C9A84C]/30 rounded-2xl p-6 text-center">
                <div className="text-amber-300 font-bold mb-2">🎯 {aiResult.bestCombination}</div>
                <p className="text-[#8C7A62] text-sm">💡 {aiResult.advice}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
