'use client';

import { SHICHEN_LIST, type BirthData, type Gender } from '@/lib/bazi/types';

interface BirthFormProps {
  birthData: BirthData;
  onChange: (data: Partial<BirthData>) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function BirthForm({ birthData, onChange, onSubmit, disabled }: BirthFormProps) {
  const daysInMonth = new Date(birthData.year, birthData.month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleShichen = (value: string) => {
    const [h, m] = value.split(':').map(Number);
    onChange({ hour: h, minute: m });
  };

  // Find which shichen matches current hour
  const currentShichenValue = SHICHEN_LIST.find(sc => {
    const [h] = sc.value.split(':').map(Number);
    return h === birthData.hour || (h === 0 && birthData.hour === 0) || (h === 23 && birthData.hour === 23);
  })?.value || '12:00';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* 出生日期 */}
      <div>
        <label className="block text-amber-300 text-sm mb-2">出生日期（國曆）</label>
        <div className="grid grid-cols-3 gap-3">
          <select value={birthData.year} onChange={e => onChange({ year: Number(e.target.value) })}
            className="w-full bg-amber-950/40 border border-amber-700/30 rounded-lg px-3 py-2.5 text-amber-100 text-sm focus:border-amber-500/60 focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select value={birthData.month} onChange={e => onChange({ month: Number(e.target.value) })}
            className="w-full bg-amber-950/40 border border-amber-700/30 rounded-lg px-3 py-2.5 text-amber-100 text-sm focus:border-amber-500/60 focus:outline-none">
            {months.map(m => <option key={m} value={m}>{m}月</option>)}
          </select>
          <select value={birthData.day > daysInMonth ? daysInMonth : birthData.day} onChange={e => onChange({ day: Number(e.target.value) })}
            className="w-full bg-amber-950/40 border border-amber-700/30 rounded-lg px-3 py-2.5 text-amber-100 text-sm focus:border-amber-500/60 focus:outline-none">
            {days.map(d => <option key={d} value={d}>{d}日</option>)}
          </select>
        </div>
      </div>

      {/* 出生時辰 */}
      <div>
        <label className="block text-amber-300 text-sm mb-2">出生時辰</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SHICHEN_LIST.map(sc => (
            <button key={sc.value} onClick={() => handleShichen(sc.value)}
              className={`py-2 px-1 rounded-lg border text-xs transition-all ${
                currentShichenValue === sc.value
                  ? 'bg-amber-600/20 border-amber-500/60 text-amber-300'
                  : 'bg-amber-950/30 border-amber-800/30 text-amber-500 hover:border-amber-600/50'
              }`}>
              <div className="font-medium">{sc.label.split('（')[0]}</div>
              <div className="text-[10px] text-amber-600/50 mt-0.5">{sc.range}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 性別 */}
      <div>
        <label className="block text-amber-300 text-sm mb-2">性別</label>
        <div className="flex gap-3">
          {(['男', '女'] as Gender[]).map(g => (
            <button key={g} onClick={() => onChange({ gender: g })}
              className={`flex-1 py-2.5 rounded-lg border text-sm transition-all ${
                birthData.gender === g
                  ? 'bg-amber-600/20 border-amber-500/60 text-amber-300'
                  : 'bg-amber-950/30 border-amber-800/30 text-amber-500 hover:border-amber-600/50'
              }`}>
              {g === '男' ? '♂ 男' : '♀ 女'}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onSubmit} disabled={disabled}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-600/80 to-yellow-600/80 text-white font-bold text-sm hover:from-amber-500/80 hover:to-yellow-500/80 disabled:opacity-50 transition-all shadow-lg shadow-amber-900/20">
        {disabled ? '排盤中...' : '☰ 開始排盤'}
      </button>
    </div>
  );
}
