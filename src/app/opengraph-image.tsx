import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '命理八字 — AI 四柱八字命理分析';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0a05 0%, #1a1008 40%, #2a1a0a 70%, #0f0a05 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 20,
            bottom: 20,
            border: '1px solid rgba(196, 163, 90, 0.2)',
            borderRadius: 20,
            display: 'flex',
          }}
        />

        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 40, left: 40, color: 'rgba(196, 163, 90, 0.3)', fontSize: 30, display: 'flex' }}>☰</div>
        <div style={{ position: 'absolute', top: 40, right: 40, color: 'rgba(196, 163, 90, 0.3)', fontSize: 30, display: 'flex' }}>☰</div>
        <div style={{ position: 'absolute', bottom: 40, left: 40, color: 'rgba(196, 163, 90, 0.3)', fontSize: 30, display: 'flex' }}>☰</div>
        <div style={{ position: 'absolute', bottom: 40, right: 40, color: 'rgba(196, 163, 90, 0.3)', fontSize: 30, display: 'flex' }}>☰</div>

        {/* Main icon */}
        <div style={{ fontSize: 80, marginBottom: 10, display: 'flex', color: 'rgba(196, 163, 90, 0.5)' }}>
          ☰
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#C4A35A',
            letterSpacing: 8,
            marginBottom: 8,
            display: 'flex',
          }}
        >
          命理八字
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(196, 163, 90, 0.7)',
            letterSpacing: 4,
            marginBottom: 30,
            display: 'flex',
          }}
        >
          AI 四柱八字命理分析系統
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(196,163,90,0.5), transparent)',
            marginBottom: 30,
            display: 'flex',
          }}
        />

        {/* Features */}
        <div style={{ display: 'flex', gap: 40, color: 'rgba(196, 163, 90, 0.5)', fontSize: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔮</span>
            <span>精準排盤</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📚</span>
            <span>九本古典</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🤖</span>
            <span>AI 現代解讀</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📅</span>
            <span>逐月流年</span>
          </div>
        </div>

        {/* Pillar preview */}
        <div style={{ display: 'flex', gap: 16, marginTop: 35 }}>
          {['年柱', '月柱', '日柱', '時柱'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '10px 20px',
                border: '1px solid rgba(196, 163, 90, 0.2)',
                borderRadius: 12,
                background: 'rgba(196, 163, 90, 0.05)',
              }}
            >
              <span style={{ fontSize: 12, color: 'rgba(196, 163, 90, 0.4)', display: 'flex' }}>{label}</span>
              <span style={{ fontSize: 28, color: '#C4A35A', fontWeight: 700, display: 'flex', marginTop: 4 }}>
                {label === '年柱' ? '甲' : label === '月柱' ? '丙' : label === '日柱' ? '庚' : '壬'}
              </span>
              <span style={{ fontSize: 28, color: 'rgba(196, 163, 90, 0.7)', fontWeight: 700, display: 'flex' }}>
                {label === '年柱' ? '子' : label === '月柱' ? '寅' : label === '日柱' ? '午' : '戌'}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
