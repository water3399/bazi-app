'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { useLang } from '@/lib/langContext';
import { generateYearlyFortune, formatFortuneContext, type YearlyFortune } from '@/lib/bazi/fortune';
import { formatChartText } from '@/lib/bazi/engine';
import type { StoredReport } from '@/lib/bazi/types';
import AnalysisLoading from '@/components/analysis/AnalysisLoading';

const currentYear = new Date().getFullYear();
const MONTH_NAMES = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','臘月'];

interface MonthData { month: number; score: number; theme: string; highlight: string; career: string|null; money: string|null; love: string|null; health: string|null; doThis: string|null; avoidThis: string|null; }
interface FortuneData { yearSummary: { theme: string; keywords: string[]; bestMonths: number[]; cautionMonths: number[]; overview: string }; months: MonthData[]; }

function scoreColor(s: number) { return s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-300' : s >= 40 ? 'text-orange-400' : 'text-red-400'; }
function scoreBg(s: number) { return s >= 80 ? 'bg-emerald-500/15 border-emerald-500/30' : s >= 60 ? 'bg-amber-500/10 border-amber-500/25' : s >= 40 ? 'bg-orange-500/10 border-orange-500/25' : 'bg-red-500/10 border-red-500/25'; }
function scoreBar(s: number) { return s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : s >= 40 ? 'bg-orange-500' : 'bg-red-500'; }
function scoreLabel(s: number) { return s >= 80 ? '大吉' : s >= 60 ? '平穩' : s >= 40 ? '留意' : '調整'; }

export default function FortunePage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [fortune, setFortune] = useState<YearlyFortune | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const { langPrompt } = useLang();

  // Life events for verification
  const [events, setEvents] = useState<Array<{ category: string; detail: string; feeling: 'positive' | 'negative' }>>([]);
  const [showEventForm, setShowEventForm] = useState(false);

  useEffect(() => { setReport(getReport(id)); }, [id]);
  useEffect(() => { if (report) { setFortune(generateYearlyFortune(report.birthData, selectedYear)); setFortuneData(null); setExpandedMonth(null); } }, [report, selectedYear]);

  const handleAnalyze = useCallback(async () => {
    if (!report || !fortune) return;
    setAnalyzing(true); setError(null);
    try {
      const chartCtx = formatChartText(report.chartData).substring(0, 3000);
      const fortuneCtx = formatFortuneContext(fortune, report.birthData);
      // Add life events context if any
      let eventsCtx = '';
      if (events.length > 0) {
        eventsCtx = '\n\n===== 用戶提供的真實事件（用來交叉驗證和個人化分析）=====\n' +
          events.map(e => `• ${e.category}：${e.detail}（${e.feeling === 'positive' ? '正面結果' : '負面結果'}）`).join('\n') +
          '\n請在分析中結合這些真實事件，解釋為什麼命盤在這一年會出現這些事。如果事件與流年干支吻合，請明確指出吻合之處。';
      }

      const res = await fetch('/api/fortune', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chartContext: `${langPrompt}\n\n${chartCtx}${eventsCtx}`, fortuneContext: fortuneCtx }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const data = await res.json();
      setFortuneData(data.fortune);
    } catch (err) { setError(err instanceof Error ? err.message : '流年分析失敗'); }
    finally { setAnalyzing(false); }
  }, [report, fortune]);

  if (!report) return <div className="min-h-screen bg-[#0f0a05] flex items-center justify-center"><Link href="/analysis" className="text-amber-400 underline">前往排盤</Link></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a05] via-[#1a1008] to-[#0f0a05]">
      <header className="border-b border-amber-700/20 bg-amber-950/20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold text-lg">☰ 命理八字</Link>
          <div className="flex gap-2">
            <Link href={`/analysis/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📄 報告</Link>
            <Link href={`/chat/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">💬 提問</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-center text-amber-300 text-2xl font-bold mb-2">📅 流年運勢</h1>
        <p className="text-center text-amber-500/60 text-sm mb-2">日主：{report.chartData.dayMaster}（{report.chartData.dayMasterElement}）</p>
        <p className="text-center text-[#8C7A62] text-xs mb-6 max-w-lg mx-auto">
          🌊 流年分析是你人生的「潮汐表」——它標注的是每個月的能量節奏，不是行程預報。告訴你浪什麼時候來，但衝不衝得到看你自己。
        </p>

        {/* Year selector: dropdown from birth year to +30 */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-[#8C7A62] text-sm">選擇年份：</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#2A2018] border border-[#C9A84C]/40 rounded-lg px-4 py-2.5 text-amber-300 text-sm font-bold focus:border-[#C9A84C] focus:outline-none appearance-none cursor-pointer min-w-[120px] text-center"
          >
            {Array.from({ length: (currentYear + 30) - report.birthData.year + 1 }, (_, i) => report.birthData.year + i).map(y => (
              <option key={y} value={y}>
                {y}年{y === currentYear ? '（今年）' : ''}
              </option>
            ))}
          </select>
          <button onClick={() => setSelectedYear(currentYear)}
            className="px-3 py-2 rounded-lg text-xs bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20">
            📍 今年
          </button>
        </div>

        {fortune && !fortuneData && !analyzing && (
          <div>
            <div className="text-center">
              <div className="bg-amber-950/40 border border-amber-600/30 rounded-xl p-6 mb-6 inline-block">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center"><div className="text-amber-500/50 text-xs mb-1">大運</div><div className="text-amber-300 font-bold">{fortune.daYunGanZhi}</div></div>
                  <div className="text-center"><div className="text-amber-500/50 text-xs mb-1">流年</div><div className="text-amber-300 font-bold text-lg">{fortune.liuNianGanZhi}</div><div className="text-amber-500/50 text-xs">{fortune.liuNianAge}歲</div></div>
                </div>
              </div>
            </div>

            {/* Life Events Input (optional) */}
            <div className="max-w-xl mx-auto mb-6">
              <button onClick={() => setShowEventForm(!showEventForm)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1E1810] border border-[#3D3020] hover:border-amber-600/30 transition-all">
                <div className="flex items-center gap-2">
                  <span>📝</span>
                  <span className="text-amber-300 text-sm font-bold">這一年有發生什麼大事嗎？</span>
                  <span className="text-[#8C7A62] text-xs">（選填，讓分析更精準）</span>
                </div>
                <span className="text-[#8C7A62] text-xs">{showEventForm ? '收起 ▲' : '展開 ▼'}</span>
              </button>

              {showEventForm && (
                <div className="mt-3 bg-[#1E1810] border border-[#3D3020] rounded-xl p-4 space-y-3">
                  <p className="text-[#8C7A62] text-xs">填入這一年發生的重大事件，AI 會結合你的真實經歷來分析，讓報告更有針對性。</p>

                  {events.map((evt, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#2A2018] rounded-lg p-2">
                      <span className="text-amber-300 text-xs">{evt.category}</span>
                      <span className="text-amber-200/60 text-xs flex-1">{evt.detail}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${evt.feeling === 'positive' ? 'bg-[#5B9E7A]/20 text-[#5B9E7A]' : 'bg-[#D4856A]/20 text-[#D4856A]'}`}>
                        {evt.feeling === 'positive' ? '✅ 順利' : '⚠️ 不順'}
                      </span>
                      <button onClick={() => setEvents(events.filter((_, j) => j !== i))} className="text-[#8C7A62] text-xs hover:text-red-400">✕</button>
                    </div>
                  ))}

                  {/* Add event form */}
                  {(() => {
                    const categories = [
                      { label: '💼 事業', value: '事業' },
                      { label: '💕 感情', value: '感情' },
                      { label: '💰 財務', value: '財務' },
                      { label: '🏥 健康', value: '健康' },
                      { label: '📚 學業', value: '學業' },
                      { label: '🏠 家庭', value: '家庭' },
                      { label: '✈️ 搬遷', value: '搬遷' },
                    ];
                    return (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {categories.map(cat => (
                            <button key={cat.value}
                              onClick={() => {
                                const detail = prompt(`${cat.label} 發生了什麼？（簡短描述）`);
                                if (detail) {
                                  const feeling = confirm('這件事的結果是正面的嗎？\n（確定=正面，取消=負面）') ? 'positive' as const : 'negative' as const;
                                  setEvents([...events, { category: cat.value, detail, feeling }]);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#2A2018] border border-[#3D3020] text-amber-400 text-xs hover:border-amber-600/40 transition-all">
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Analyze button */}
            <div className="text-center">
              <button onClick={handleAnalyze} className="px-10 py-3 rounded-xl bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white font-bold">
                ☰ 分析 {selectedYear} 年逐月運勢{events.length > 0 ? `（含 ${events.length} 件事件驗證）` : ''}
              </button>
            </div>
          </div>
        )}

        {analyzing && <AnalysisLoading type="fortune" />}
        {error && <div className="text-center py-4"><div className="text-red-400 text-sm bg-red-500/10 rounded-lg p-4 mb-4">{error}</div><button onClick={handleAnalyze} className="text-amber-400 text-sm underline">重新分析</button></div>}

        {fortuneData && (
          <div>
            <div className="bg-amber-950/40 border border-amber-600/30 rounded-xl p-6 mb-8">
              <h2 className="text-amber-300 font-bold text-xl mb-2 text-center">{selectedYear}：{fortuneData.yearSummary.theme}</h2>
              <p className="text-amber-200/60 text-sm text-center mb-4">{fortuneData.yearSummary.overview}</p>
              <div className="flex justify-center gap-2 mb-4">
                {fortuneData.yearSummary.keywords.map((kw, i) => <span key={i} className="px-3 py-1 rounded-full bg-amber-800/30 border border-amber-700/30 text-amber-300 text-xs">{kw}</span>)}
              </div>
              <div className="flex justify-center gap-6 text-xs">
                <div><span className="text-emerald-400">最佳：</span>{fortuneData.yearSummary.bestMonths.map(m => MONTH_NAMES[m] || m+'月').join('、')}</div>
                <div><span className="text-orange-400">留意：</span>{fortuneData.yearSummary.cautionMonths.map(m => MONTH_NAMES[m] || m+'月').join('、')}</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-amber-400/60 text-sm font-bold mb-3 text-center">全年運勢走勢</h3>
              <div className="flex items-end justify-center gap-1.5 h-32 px-4">
                {fortuneData.months.map(m => (
                  <button key={m.month} onClick={() => setExpandedMonth(expandedMonth === m.month ? null : m.month)}
                    className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${expandedMonth === m.month ? 'scale-110' : ''}`}>
                    <span className={`text-[10px] font-bold ${scoreColor(m.score)}`}>{m.score}</span>
                    <div className={`w-8 rounded-t-md transition-all ${scoreBar(m.score)} ${expandedMonth === m.month ? 'opacity-100 ring-2 ring-amber-400/50' : 'opacity-70 hover:opacity-100'}`} style={{ height: `${Math.max(15, m.score)}%` }} />
                    <span className="text-[10px] text-amber-600">{m.month}月</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fortuneData.months.map(m => {
                const isExpanded = expandedMonth === m.month;
                const isBest = fortuneData.yearSummary.bestMonths.includes(m.month);
                const isCaution = fortuneData.yearSummary.cautionMonths.includes(m.month);
                return (
                  <div key={m.month} onClick={() => setExpandedMonth(isExpanded ? null : m.month)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${scoreBg(m.score)} ${isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 ring-2 ring-amber-500/30' : 'hover:scale-[1.02]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-amber-100">{m.month}月</span>
                        {isBest && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">最佳</span>}
                        {isCaution && <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">留意</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${scoreColor(m.score)}`}>{m.score}</div>
                        <div className={`text-[10px] ${scoreColor(m.score)}`}>{scoreLabel(m.score)}</div>
                      </div>
                    </div>
                    <p className="text-amber-300/90 text-sm font-medium mb-1">{m.theme}</p>
                    <p className="text-amber-400/60 text-xs">{m.highlight}</p>
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-amber-700/20 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.career && <div className="flex gap-2"><span>💼</span><div><span className="text-amber-500/50 text-xs">事業</span><p className="text-amber-200 text-xs">{m.career}</p></div></div>}
                        {m.money && <div className="flex gap-2"><span>💰</span><div><span className="text-amber-500/50 text-xs">財務</span><p className="text-amber-200 text-xs">{m.money}</p></div></div>}
                        {m.love && <div className="flex gap-2"><span>💕</span><div><span className="text-amber-500/50 text-xs">感情</span><p className="text-amber-200 text-xs">{m.love}</p></div></div>}
                        {m.health && <div className="flex gap-2"><span>🏥</span><div><span className="text-amber-500/50 text-xs">健康</span><p className="text-amber-200 text-xs">{m.health}</p></div></div>}
                        {(m.doThis || m.avoidThis) && (
                          <div className="md:col-span-2 flex gap-4 mt-1">
                            {m.doThis && <div className="flex-1 bg-emerald-500/5 rounded-lg p-2 border border-emerald-500/15"><span className="text-emerald-400 text-[10px] font-bold">✓ 適合</span><p className="text-amber-200 text-xs mt-0.5">{m.doThis}</p></div>}
                            {m.avoidThis && <div className="flex-1 bg-red-500/5 rounded-lg p-2 border border-red-500/15"><span className="text-red-400 text-[10px] font-bold">✗ 避免</span><p className="text-amber-200 text-xs mt-0.5">{m.avoidThis}</p></div>}
                          </div>
                        )}
                      </div>
                    )}
                    {!isExpanded && <div className="text-amber-700/50 text-[10px] text-right mt-1">點擊展開 ▼</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
