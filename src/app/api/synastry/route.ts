import { NextRequest, NextResponse } from 'next/server';
import { callMiniMax } from '@/lib/minimax';

const SYNASTRY_PROMPT = `你是「命理大師」的合盤分析模組。根據多人的八字命盤資料和交叉關係，提供合盤分析。

現代化原則：不用嚇人的詞、性別平等、正向引導、關係沒有絕對好壞。

===== 輸出 JSON 格式（只輸出 JSON）=====

{
  "overallScore": 78,
  "overallComment": "一句話總評",
  "dimensions": {
    "compatibility": { "score": 80, "label": "整體契合", "brief": "一句話" },
    "communication": { "score": 75, "label": "溝通順暢", "brief": "一句話" },
    "values": { "score": 70, "label": "價值觀", "brief": "一句話" },
    "growth": { "score": 85, "label": "成長互補", "brief": "一句話" },
    "cooperation": { "score": 72, "label": "合作默契", "brief": "一句話" }
  },
  "pairAnalysis": [
    {
      "personA": "名字A",
      "personB": "名字B",
      "score": 82,
      "relation": "一句話關係描述",
      "strengths": "互動優勢",
      "challenges": "需要注意的地方",
      "advice": "一句話建議"
    }
  ],
  "groupDynamic": "整體團體動力描述（2-3句話，描述這些人在一起時的化學反應）",
  "bestCombination": "這組人最適合一起做什麼（事業合作/家庭生活/創意夥伴等）",
  "advice": "一句話送給這個組合的話"
}

評分 85-100=天生契合 70-84=相處融洽 55-69=需要磨合 40-54=挑戰較多
pairAnalysis 列出每對人的關係分析（如3人就3對，5人就10對）。`;

export async function POST(request: NextRequest) {
  try {
    const { context } = await request.json();
    if (!context) return NextResponse.json({ error: '缺少合盤資料' }, { status: 400 });

    const rawContent = await callMiniMax({
      model: 'MiniMax-M2.7-highspeed',
      temperature: 0.3,
      max_tokens: 4000,
      messages: [
        { role: 'system', content: SYNASTRY_PROMPT },
        { role: 'user', content: `根據以下合盤資料，輸出 JSON 格式分析（只輸出 JSON）：\n\n${context}` },
      ],
    });

    const cleaned = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    let analysis;
    try { analysis = JSON.parse(cleaned); } catch {
      const m = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) analysis = JSON.parse(m[1].trim());
      else { const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}'); if (s >= 0 && e > s) analysis = JSON.parse(cleaned.substring(s, e + 1)); else throw new Error('無法解析'); }
    }
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '合盤分析失敗' }, { status: 500 });
  }
}
