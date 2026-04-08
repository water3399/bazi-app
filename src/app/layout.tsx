import type { Metadata } from 'next';
import { LangProvider } from '@/lib/langContext';
import './globals.css';

export const metadata: Metadata = {
  title: '命理八字 — AI 四柱八字命理分析',
  description: '結合精準排盤引擎與 AI 深度解讀，融合穷通宝典、滴天髓、三命通会等九本古典，以現代視角提供四柱八字命理分析、流年逐月預測、互動問答。',
  openGraph: {
    title: '命理八字 — AI 四柱八字命理分析系統',
    description: '精準排盤 + 九本古典知識庫 + AI 現代解讀 + 逐月流年 + 互動問答',
    siteName: '命理八字',
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '命理八字 — AI 四柱八字命理分析系統',
    description: '精準排盤 + 九本古典知識庫 + AI 現代解讀',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0f0a05] text-amber-100 min-h-screen" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
