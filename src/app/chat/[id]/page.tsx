'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import { formatChartText } from '@/lib/bazi/engine';
import type { StoredReport } from '@/lib/bazi/types';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setReport(getReport(id)); }, [id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamContent]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || !report || streaming) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(''); setStreaming(true); setStreamContent('');
    try {
      const reportContext = `${formatChartText(report.chartData)}\n\n【分析報告摘要】\n${report.analysisJson.substring(0, 2000)}`;
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
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold">☰ 命理八字</Link>
          <div className="flex gap-2">
            <Link href={`/analysis/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📄 報告</Link>
            <Link href={`/fortune/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📅 流年</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && !streaming && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-4xl mb-4">☰</div>
              <h2 className="text-amber-300 text-lg font-bold mb-2">命理大師</h2>
              <p className="text-amber-500 text-sm mb-6">根據你的八字命盤，我可以回答性格、事業、感情、健康、運勢等問題。</p>
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
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-amber-700/30 text-amber-100' : 'bg-amber-950/50 border border-amber-800/20 text-amber-200'}`}>
                  {msg.role === 'assistant' && <span className="text-amber-400 text-xs font-bold block mb-1">☰ 命理大師</span>}
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {streaming && streamContent && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm bg-amber-950/50 border border-amber-800/20 text-amber-200">
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
  );
}
