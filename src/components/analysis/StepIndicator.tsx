'use client';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { num: 1, label: '輸入資料' },
  { num: 2, label: '確認命盤' },
  { num: 3, label: 'AI 分析' },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
            currentStep === step.num
              ? 'bg-amber-600/20 border border-amber-500/60 text-amber-300'
              : currentStep > step.num
                ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-amber-950/40 border border-amber-700/30 text-amber-500'
          }`}>
            <span className="font-bold">{currentStep > step.num ? '✓' : step.num}</span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-px mx-1 ${currentStep > step.num ? 'bg-emerald-500/40' : 'bg-amber-700/40'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
