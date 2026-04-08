'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { formatChartText } from '@/lib/bazi/engine';
import { useLang } from '@/lib/langContext';
import type { StoredReport, AnalysisResult } from '@/lib/bazi/types';
import BaziChart from '@/components/chart/BaziChart';
import VisualReport from '@/components/analysis/VisualReport';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }

const QUICK_QUESTIONS = [
  '我的日主代表什麼性格？',
  '我適合什麼類型的工作？',
  '今年的財運如何？',
  '我的感情運勢怎麼看？',
  '命盤中有什麼特別的格局？',
  '目前大運要注意什麼？',
];

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const [sidebarTab, setSidebarTab] = useState<'chart' | 'report'>('report');
  const endRef = useRef<HTMLDivElement>(null);
  const { lang, setLang, langLabel, langPrompt } = useLang();

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
    if (r) { try { setAnalysis(JSON.parse(r.analysisJson)); } catch {} }
  }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamContent]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || !report || streaming) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(''); setStreaming(true); setStreamContent('');
    try {
      const reportContext = `${langPrompt}\n\n${formatChartText(report.chartData)}\n\n【分析報告摘要】\n${report.analysisJson.substring(0, 2000)}`;
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })), reportContext }),
      });
      if (!res.ok) throw new Error('回應失敗');
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = '';
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; full += decoder.decode(value, { stream: true }); setStreamContent(full); } }
      setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: full, timestamp: new Date().toISOString() }]);
      setStreamContent('');
    } catch { setMessages([...updated, { id: crypto.randomUUID(), role: 'assistant', content: '抱歉，回覆時發生錯誤。', timestamp: new Date().toISOString() }]); }
    finally { setStreaming(false); }
  }, [messages, report, streaming]);

  if (!report) return <div className="min-h-screen bg-[#0f0a05] flex items-center justify-center"><Link href="/analysis" className="text-amber-400 underline">前往排盤</Link></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a05] via-[#1a1008] to-[#0f0a05] flex flex-col">
      <header className="border-b border-amber-700/20 bg-amber-950/20 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold">☰ 命理八字</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'zh-TW' ? 'zh-CN' : 'zh-TW')}
              className="px-2 py-1 rounded-lg border border-amber-700/30 text-amber-500 text-[10px] hover:border-amber-500/50">
              🌐 {langLabel}
            </button>
            <Link href={`/analysis/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📄 報告</Link>
            <Link href={`/fortune/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📅 流年</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ===== LEFT: Sidebar with report ===== */}
        <aside className="hidden lg:flex lg:w-[45%] xl:w-[40%] border-r border-amber-800/20 flex-col shrink-0">
          {/* Sidebar tabs */}
          <div className="flex border-b border-amber-800/20 shrink-0">
            <button onClick={() => setSidebarTab('report')}
              className={`flex-1 py-2.5 text-xs font-bold transition-all ${sidebarTab === 'report' ? 'text-amber-300 border-b-2 border-amber-500' : 'text-amber-600 hover:text-amber-400'}`}>
              📊 分析報告
            </button>
            <button onClick={() => setSidebarTab('chart')}
              className={`flex-1 py-2.5 text-xs font-bold transition-all ${sidebarTab === 'chart' ? 'text-amber-300 border-b-2 border-amber-500' : 'text-amber-600 hover:text-amber-400'}`}>
              ☰ 命盤
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'chart' && (
              <BaziChart chartData={report.chartData} />
            )}
            {sidebarTab === 'report' && analysis && (
              <div className="space-y-4">
                {/* Profile summary */}
                <div className="bg-amber-900/20 border border-amber-700/20 rounded-xl p-4 text-center">
                  <div className="text-amber-300 font-bold text-sm mb-1">{analysis.profile.headline}</div>
                  <div className="text-amber-500/60 text-xs">{analysis.profile.element} ｜ {analysis.profile.archetype}</div>
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {analysis.profile.personality.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-amber-800/30 text-amber-300 text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Scores */}
                <div className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-4">
                  <div className="text-amber-400 text-xs font-bold mb-3 text-center">五維指數</div>
                  {Object.keys(analysis.scores).map(k => {
                    const s = analysis.scores[k];
                    const color = s.score >= 80 ? 'bg-emerald-500' : s.score >= 60 ? 'bg-amber-500' : s.score >= 40 ? 'bg-orange-500' : 'bg-red-500';
                    const tc = s.score >= 80 ? 'text-emerald-400' : s.score >= 60 ? 'text-amber-300' : s.score >= 40 ? 'text-orange-400' : 'text-red-400';
                    return (
                      <div key={k} className="mb-2">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-amber-400/60">{s.label}</span>
                          <span className={tc}>{s.score}</span>
                        </div>
                        <div className="h-1.5 bg-amber-900/30 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Four Pillars insight */}
                {analysis.pillarsInsight?.map((pi, i) => (
                  <div key={i} className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-400 text-xs font-bold">{pi.pillar}</span>
                      <span className="text-amber-300 text-sm font-bold">{pi.ganZhi}</span>
                      <span className="text-amber-600 text-[10px]">{pi.shiShen}</span>
                    </div>
                    <p className="text-amber-200/60 text-xs leading-relaxed">{pi.insight}</p>
                  </div>
                ))}

                {/* Wu Xing */}
                {analysis.wuXingAnalysis && (
                  <div className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-3">
                    <div className="text-amber-400 text-xs font-bold mb-2">五行分析</div>
                    <p className="text-amber-200/60 text-xs mb-1">偏旺：{analysis.wuXingAnalysis.dominant}</p>
                    <p className="text-amber-200/60 text-xs mb-1">偏弱：{analysis.wuXingAnalysis.weak}</p>
                    <p className="text-amber-300/70 text-xs">💡 {analysis.wuXingAnalysis.advice}</p>
                  </div>
                )}

                {/* Current fortune */}
                {analysis.currentFortune && (
                  <div className="bg-amber-900/20 border border-amber-600/20 rounded-xl p-3">
                    <div className="text-amber-400 text-xs font-bold mb-2">當前運勢</div>
                    <div className="flex gap-2 mb-2">
                      <span className="text-amber-300 text-xs">大運：{analysis.currentFortune.daYun}</span>
                      <span className="text-amber-300 text-xs">流年：{analysis.currentFortune.liuNian}</span>
                    </div>
                    <p className="text-amber-200/60 text-xs">{analysis.currentFortune.theme}</p>
                  </div>
                )}

                {/* Life path */}
                {analysis.lifePath && (
                  <div className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-3">
                    <div className="text-amber-400 text-xs font-bold mb-2">人生藍圖</div>
                    <p className="text-amber-200/60 text-xs mb-2">{analysis.lifePath.title || analysis.lifePath.summary}</p>
                    {analysis.lifePath.mainAxis && <p className="text-amber-300/60 text-[10px]">{analysis.lifePath.mainAxis}</p>}
                    {analysis.lifePath.bestCareers && <div className="text-amber-300/60 text-[10px]">適合：{analysis.lifePath.bestCareers.join('、')}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* ===== RIGHT: Chat area ===== */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 && !streaming && (
              <div className="max-w-2xl mx-auto text-center">
                <div className="text-4xl mb-4">☰</div>
                <h2 className="text-amber-300 text-lg font-bold mb-2">命理大師</h2>
                <p className="text-amber-500 text-sm mb-6">根據你的八字命盤，我可以回答性格、事業、感情、健康、運勢等問題。</p>
                <p className="text-amber-600/50 text-xs mb-4 hidden lg:block">← 左側可以邊看報告邊提問</p>
                <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => send(q)} className="text-left px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-800/20 text-amber-400 text-xs hover:border-amber-600/40">{q}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-amber-700/30 text-amber-100' : 'bg-amber-950/50 border border-amber-800/20 text-amber-200'}`}>
                    {msg.role === 'assistant' && <span className="text-amber-400 text-xs font-bold block mb-1">☰ 命理大師</span>}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {streaming && streamContent && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl px-4 py-3 text-sm bg-amber-950/50 border border-amber-800/20 text-amber-200">
                    <span className="text-amber-400 text-xs font-bold block mb-1">☰ 命理大師</span>
                    <div className="whitespace-pre-wrap">{streamContent}<span className="inline-block w-1.5 h-4 bg-amber-400/60 animate-pulse ml-0.5" /></div>
                  </div>
                </div>
              )}
              {streaming && !streamContent && (
                <div className="flex justify-start"><div className="rounded-xl px-4 py-3 bg-amber-950/50 border border-amber-800/20">
                  <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-amber-500/50 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</div>
                </div></div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <div className="border-t border-amber-800/20 bg-amber-950/20 px-4 py-3 shrink-0">
            <div className="max-w-2xl mx-auto flex gap-2">
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="輸入問題...（Enter 送出）" rows={1} disabled={streaming}
                className="flex-1 bg-amber-950/40 border border-amber-700/30 rounded-xl px-4 py-2.5 text-sm text-amber-100 placeholder-amber-700 resize-none focus:border-amber-500/60 focus:outline-none" />
              <button onClick={() => send(input)} disabled={!input.trim() || streaming}
                className="px-4 py-2.5 rounded-xl bg-amber-600/80 text-white text-sm font-bold disabled:opacity-40 transition-all">送出</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
