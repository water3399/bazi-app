import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';
import { FORTUNE_SYSTEM_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { chartContext, fortuneContext } = await request.json();
    if (!fortuneContext) return NextResponse.json({ error: '缺少流年資料' }, { status: 400 });

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7-highspeed',
      temperature: 0.3,
      max_tokens: 6000,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: `根據以下八字和流年資料，輸出 JSON 逐月運勢（只輸出 JSON）：\n\n${chartContext}\n\n${fortuneContext}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    let fortune;
    try { fortune = JSON.parse(cleaned); } catch {
      const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) fortune = JSON.parse(m[1].trim());
      else { const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}'); if (s >= 0 && e > s) fortune = JSON.parse(cleaned.substring(s, e + 1)); else throw new Error('無法解析'); }
    }
    return NextResponse.json({ fortune });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '流年分析失敗' }, { status: 500 });
  }
}
