import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '命理八字 — AI 四柱八字命理分析',
  description: '結合 lunar-typescript 精準排盤與 AI 深度解讀，融合穷通宝典、滴天髓等九本古典，提供現代化八字命理分析。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-[#0f0a05] text-amber-100 min-h-screen" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
