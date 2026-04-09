import { NextRequest, NextResponse } from 'next/server';
import { callOpenRouter, stripThinkBlocks } from '@/lib/openrouter';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts';
import { buildBaziKnowledge } from '@/lib/bazi/knowledgeLoader';

interface AnalyzeRequestBody {
  context: string;
  dayGan: string;
  shiShenList: string[];
  ganZhiList: string[];
  wuXingDominant: string;
}

export async function POST(request: NextRequest) {
  try {
    const { context, dayGan, shiShenList, ganZhiList, wuXingDominant } =
      (await request.json()) as AnalyzeRequestBody;

    if (!context) return NextResponse.json({ error: '缺少命盤資料' }, { status: 400 });

    // Server-side: load knowledge from classical texts
    let knowledgeContext = '';
    try {
      knowledgeContext = buildBaziKnowledge(
        dayGan || '',
        shiShenList || [],
        ganZhiList || [],
        wuXingDominant || '',
      );
      console.log('[Bazi Analyze] Knowledge loaded:', knowledgeContext.length, 'chars');
    } catch (err) {
      console.error('Knowledge loading error:', err);
    }

    const fullContext = knowledgeContext
      ? `${context}\n\n===== 以下是古典知識庫參考資料（用於輔助分析，不要原文輸出）=====\n\n${knowledgeContext}`
      : context;

    const rawContent = await callOpenRouter({
      model: 'z-ai/glm-5.1',
      temperature: 0.3,
      max_tokens: 12000,
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: `根據以下八字命盤資料，輸出完整的 JSON 格式分析。注意：JSON 必須完整、合法，所有字串值中的雙引號用 \\" 轉義。只輸出 JSON，不要其他文字。\n\n${fullContext}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log('[Analyze] Response length:', cleaned.length);

    let analysis;
    // Try multiple parsing strategies
    const jsonCandidates = [
      cleaned,
      // Extract from code block
      cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1]?.trim(),
      // Extract first { to last }
      (() => { const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}'); return s >= 0 && e > s ? cleaned.substring(s, e + 1) : null; })(),
    ].filter(Boolean);

    for (const candidate of jsonCandidates) {
      if (!candidate) continue;
      try {
        analysis = JSON.parse(candidate);
        break;
      } catch {
        // Try fixing common JSON issues
        try {
          const fixed = candidate
            .replace(/,\s*}/g, '}')       // trailing comma before }
            .replace(/,\s*]/g, ']')       // trailing comma before ]
            .replace(/[\r\n]+/g, ' ')     // newlines in strings
            .replace(/"\s+"/g, '","');     // missing comma between strings
          analysis = JSON.parse(fixed);
          break;
        } catch {
          continue;
        }
      }
    }

    if (!analysis) {
      console.error('[Analyze] All parse attempts failed. First 500 chars:', cleaned.substring(0, 500));
      throw new Error('AI 回應的 JSON 格式有誤，請重新分析');
    }

    if (!analysis.profile) throw new Error('AI 回應缺少關鍵欄位，請重新分析');
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '分析失敗' }, { status: 500 });
  }
}
