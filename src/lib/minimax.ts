const MINIMAX_BASE_URL = 'https://api.minimaxi.com/v1';

export interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface MiniMaxConfig {
  model: string;
  messages: MiniMaxMessage[];
  temperature?: number;
  max_tokens?: number;
}

/**
 * Call MiniMax API (non-streaming) for analysis
 */
export async function callMiniMax(config: MiniMaxConfig): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('Missing MINIMAX_API_KEY');

  const res = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: config.messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.max_tokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Stream MiniMax API for chat
 */
export function streamMiniMax(config: MiniMaxConfig): ReadableStream<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) throw new Error('Missing MINIMAX_API_KEY');

  return new ReadableStream<string>({
    async start(controller) {
      try {
        const res = await fetch(`${MINIMAX_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: config.messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.max_tokens ?? 4096,
            stream: true,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          controller.error(new Error(`MiniMax API error ${res.status}: ${err}`));
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) { controller.close(); return; }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(content);
              } catch {
                // skip malformed JSON
              }
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
