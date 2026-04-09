import { NextRequest } from 'next/server';
import { streamMiniMax } from '@/lib/minimax';
import { CHAT_SYSTEM_PROMPT } from '@/lib/prompts';

function createThinkStripper(): TransformStream<string, string> {
  let insideThink = false;
  let buffer = '';
  return new TransformStream<string, string>({
    transform(chunk, controller) {
      buffer += chunk;
      while (buffer.length > 0) {
        if (insideThink) {
          const i = buffer.indexOf('</think>');
          if (i === -1) { buffer = ''; return; }
          buffer = buffer.slice(i + 8); insideThink = false; continue;
        }
        const i = buffer.indexOf('<think>');
        if (i === -1) { if (buffer.length <= 7) return; const s = buffer.slice(0, -7); buffer = buffer.slice(-7); if (s) controller.enqueue(s); return; }
        if (i > 0) controller.enqueue(buffer.slice(0, i));
        buffer = buffer.slice(i + 7); insideThink = true;
      }
    },
    flush(controller) { if (!insideThink && buffer) controller.enqueue(buffer); },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, reportContext } = await request.json();
    if (!messages?.length) return new Response(JSON.stringify({ error: '缺少對話' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const stream = streamMiniMax({
      model: 'MiniMax-M2.7-highspeed',
      messages: [
        { role: 'system', content: `${CHAT_SYSTEM_PROMPT}\n\n===== 用戶命盤 =====\n${reportContext}` },
        ...messages,
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const encoder = new TextEncoder();
    const byteStream = stream.pipeThrough(createThinkStripper()).pipeThrough(
      new TransformStream<string, Uint8Array>({ transform(chunk, c) { c.enqueue(encoder.encode(chunk)); } })
    );

    return new Response(byteStream, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : '對話失敗' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
