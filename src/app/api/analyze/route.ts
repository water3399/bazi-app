import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();
    if (!context) return NextResponse.json({ error: '缺少命盤資料' }, { status: 400 });

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7',
      temperature: 0.3,
      max_tokens: 6000,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: `根據以下八字命盤資料，輸出 JSON 格式分析（只輸出 JSON）：\n\n${context}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch {
      const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) { analysis = JSON.parse(m[1].trim()); }
      else {
        const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
        if (s >= 0 && e > s) analysis = JSON.parse(cleaned.substring(s, e + 1));
        else throw new Error('無法解析 AI 回應');
      }
    }

    if (!analysis?.profile) throw new Error('AI 回應格式異常');
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '分析失敗' }, { status: 500 });
  }
}
