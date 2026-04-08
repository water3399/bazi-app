'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getReport } from '@/lib/reportStore';
import type { StoredReport, AnalysisResult } from '@/lib/bazi/types';
import BaziChart from '@/components/chart/BaziChart';
import VisualReport from '@/components/analysis/VisualReport';

export default function ReportDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<StoredReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const r = getReport(id);
    setReport(r);
    if (r) { try { setAnalysis(JSON.parse(r.analysisJson)); } catch {} }
  }, [id]);

  if (!report) return <div className="min-h-screen bg-[#0f0a05] flex items-center justify-center"><Link href="/analysis" className="text-amber-400 underline">前往排盤</Link></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a05] via-[#1a1008] to-[#0f0a05]">
      <header className="border-b border-amber-700/20 bg-amber-950/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-amber-400 font-bold text-lg">☰ 命理八字</Link>
          <div className="flex gap-2">
            <Link href={`/fortune/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">📅 流年</Link>
            <Link href={`/chat/${id}`} className="px-3 py-1.5 rounded-lg border border-amber-700/30 text-amber-500 text-xs">💬 提問</Link>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-center text-amber-300 text-2xl font-bold mb-6">命盤分析報告</h1>
        <div className="mb-6"><BaziChart chartData={report.chartData} compact /></div>
        {analysis && <VisualReport data={analysis} />}
      </main>
    </div>
  );
}
