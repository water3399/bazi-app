import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center max-w-2xl">
          <div className="text-5xl mb-4 opacity-50">☰</div>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-400 mb-4" style={{ fontFamily: "'Noto Serif TC', serif" }}>
            命理八字
          </h1>
          <p className="text-amber-300/80 text-lg mb-2">AI 四柱八字命理分析系統</p>
          <p className="text-amber-500/60 text-sm mb-10 max-w-md mx-auto">
            結合 lunar-typescript 精準排盤、穷通宝典等九本古典知識庫與 AI 深度解讀，以現代視角為你揭示命格密碼
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/analysis"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white font-bold text-lg hover:from-amber-500/80 hover:to-yellow-500/80 transition-all shadow-xl shadow-amber-900/30">
              ☰ 個人排盤分析
            </Link>
            <Link href="/synastry"
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-700/60 to-amber-800/60 text-amber-200 font-bold text-lg hover:from-amber-600/60 hover:to-amber-700/60 transition-all shadow-xl shadow-amber-900/30 border border-amber-600/30">
              🤝 合盤分析
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl w-full">
          {[
            { icon: '🔮', title: '精準排盤', desc: 'lunar-typescript 引擎：四柱、十神、藏干、大運流年流月、十二長生、納音、神煞，一步到位' },
            { icon: '📚', title: '九本古典', desc: '融合穷通宝典、滴天髓、三命通会、渊海子平、子平真诠、千里命稿、神峰通考等經典' },
            { icon: '🤖', title: 'AI 現代解讀', desc: '視覺化報告 + 五維命格指數 + 逐月流年 + 互動問答，用 2026 年的框架解讀古典智慧' },
          ].map((f, i) => (
            <div key={i} className="bg-amber-950/30 border border-amber-800/20 rounded-xl p-6 text-center hover:border-amber-700/30 transition-all">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-amber-300 font-bold mb-2">{f.title}</h3>
              <p className="text-amber-500/60 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <footer className="border-t border-amber-800/20 py-6 text-center">
        <p className="text-amber-700/50 text-xs">命理八字 — 排盤引擎 lunar-typescript | AI 解讀 | 知識庫：穷通宝典 · 滴天髓 · 三命通会</p>
      </footer>
    </div>
  );
}
