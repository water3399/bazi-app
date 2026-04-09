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
      max_tokens: 10000,
      messages: [
        { role: 'system', content: FORTUNE_SYSTEM_PROMPT },
        { role: 'user', content: `根據以下八字和流年資料，輸出完整合法的 JSON 逐月運勢。JSON 必須完整，所有字串值中的雙引號用 \\" 轉義。只輸出 JSON。\n\n${chartContext}\n\n${fortuneContext}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    let fortune;
    const candidates = [
      cleaned,
      cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim(),
      (() => { const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}'); return s >= 0 && e > s ? cleaned.substring(s, e + 1) : null; })(),
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (!candidate) continue;
      try {
        fortune = JSON.parse(candidate);
        break;
      } catch {
        // 嘗試基本修復
        try {
          const fixed = candidate
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/[\r\n]+/g, ' ')
            .replace(/"\s+"/g, '","');
          fortune = JSON.parse(fixed);
          break;
        } catch {
          // JSON 被截斷：補齊缺少的 ] 和 }
          try {
            let truncFixed = candidate;
            // 去掉最後不完整的元素
            truncFixed = truncFixed.replace(/,\s*\{[^}]*$/, '');
            truncFixed = truncFixed.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, '');
            truncFixed = truncFixed.replace(/,\s*"[^"]*$/, '');

            const openB = (truncFixed.match(/\[/g) || []).length;
            const closeB = (truncFixed.match(/\]/g) || []).length;
            const openC = (truncFixed.match(/\{/g) || []).length;
            const closeC = (truncFixed.match(/\}/g) || []).length;

            for (let i = 0; i < openB - closeB; i++) truncFixed += ']';
            for (let i = 0; i < openC - closeC; i++) truncFixed += '}';

            fortune = JSON.parse(truncFixed);
            break;
          } catch { continue; }
        }
      }
    }

    if (!fortune) {
      console.error('[Fortune] Parse failed. First 500:', cleaned.substring(0, 500));
      throw new Error('AI 回應格式有誤，請重新分析');
    }

    return NextResponse.json({ fortune });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '流年分析失敗' }, { status: 500 });
  }
}
