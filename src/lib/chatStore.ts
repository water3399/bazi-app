export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const STORAGE_PREFIX = 'fengshui_chat_';
const MAX_MESSAGES = 50;

function getKey(reportId: string): string {
  return `${STORAGE_PREFIX}${reportId}`;
}

export function getChatMessages(reportId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getKey(reportId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatMessages(reportId: string, messages: ChatMessage[]): void {
  // Keep only the latest MAX_MESSAGES
  const trimmed = messages.slice(-MAX_MESSAGES);
  localStorage.setItem(getKey(reportId), JSON.stringify(trimmed));
}

export function appendChatMessage(reportId: string, message: ChatMessage): ChatMessage[] {
  const messages = getChatMessages(reportId);
  messages.push(message);
  saveChatMessages(reportId, messages);
  return messages;
}

export function clearChatMessages(reportId: string): void {
  localStorage.removeItem(getKey(reportId));
}
