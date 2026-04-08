'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'zh-TW' | 'zh-CN';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  langLabel: string;
  langPrompt: string;
}

const LangContext = createContext<LangContextType>({
  lang: 'zh-TW',
  setLang: () => {},
  langLabel: '繁體中文',
  langPrompt: '請使用繁體中文（正體中文）回覆，不要使用簡體字。',
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh-TW');

  useEffect(() => {
    const saved = localStorage.getItem('bazi_lang') as Lang;
    if (saved === 'zh-CN' || saved === 'zh-TW') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('bazi_lang', l);
  };

  const langLabel = lang === 'zh-TW' ? '繁體中文' : '简体中文';
  const langPrompt = lang === 'zh-TW'
    ? '【語言要求】請全程使用繁體中文（正體中文）回覆。所有漢字必須使用繁體字，例如：「運勢」不要寫成「运势」，「財運」不要寫成「财运」，「關係」不要寫成「关系」。這是最高優先級的要求。'
    : '【语言要求】请全程使用简体中文回复。';

  return (
    <LangContext.Provider value={{ lang, setLang, langLabel, langPrompt }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
