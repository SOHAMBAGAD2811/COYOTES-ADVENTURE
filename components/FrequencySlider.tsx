'use client';

import { Radio } from 'lucide-react';
import type { CSSProperties } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  locked: boolean;
  targetFrequency?: number;
}

const horizontalSliderStyle: CSSProperties = {
  width: '100%',
};

export default function FrequencySlider({ value, onChange, locked, targetFrequency = 50 }: Props) {
  const mhz = (value * 0.884 + 10).toFixed(1);
  const delta = Math.abs(value - targetFrequency);
  
  // 5 dots for signal strength.
  const strength = locked ? 5 : Math.max(0, 5 - Math.floor(delta / 10));
  
  let interference = 'NONE';
  if (delta > 40) interference = 'HIGH';
  else if (delta > 20) interference = 'MED';
  else if (delta > 6) interference = 'LOW';

  return (
    <div className="flex h-full flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between text-[10px] tracking-wider">
        <span className="flex items-center gap-1.5">
          <Radio size={12} /> FREQUENCY TUNER
        </span>
        <span className={`text-[8px] ${locked ? 'text-amber-glow' : 'text-crimson-alert'}`}>
          INT: {interference}
        </span>
      </div>

      {/* Waveform Visualization */}
      <div className="flex h-8 items-end gap-1 overflow-hidden px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const speed = locked ? 0.4 + Math.random() * 0.4 : 1 + Math.random();
          const delay = Math.random() * 2;
          return (
            <div
              key={i}
              className={`waveform-bar ${locked ? 'bg-amber-glow' : 'bg-amber-glow/30'}`}
              style={{
                height: locked ? `${60 + Math.random() * 40}%` : `${20 + Math.random() * 30}%`,
                '--wave-speed': `${speed}s`,
                '--wave-delay': `${delay}s`,
              } as React.CSSProperties}
            />
          );
        })}
      </div>

      <div className="flex flex-1 items-center justify-center py-2">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="freq-slider w-full"
          style={horizontalSliderStyle}
        />
      </div>

      <div className="text-center w-full">
        <p
          className={`text-sm font-bold tracking-wider ${locked ? 'text-amber-glow text-pulse-amber' : 'text-amber-glow/60'}`}
          style={locked ? { textShadow: '0 0 8px #ffb000' } : undefined}
        >
          {mhz} MHz
        </p>
        
        {/* Signal Strength Indicator */}
        <div className="flex justify-center gap-1 mt-1.5 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < strength ? 'bg-amber-glow shadow-[0_0_6px_#ffb000]' : 'bg-black/50 border border-amber-glow/30'}`}
            />
          ))}
        </div>

        <p className={`mt-1 text-[9px] tracking-widest ${locked ? 'text-amber-glow' : 'text-amber-glow/30'}`}>
          {locked ? 'SIGNAL LOCKED' : 'TUNING...'}
        </p>
      </div>
    </div>
  );
}
