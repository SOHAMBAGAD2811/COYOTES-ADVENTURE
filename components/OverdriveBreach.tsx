'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Zap } from 'lucide-react';
import type { BreachFlash } from '@/lib/useInterceptState';

interface Props {
  onAttempt: (cursorPercent: number) => void;
  flash: BreachFlash;
  waterSiphoned: number;
  waterGoal: number;
  disabled: boolean;
  sweetSpot: { start: number; end: number };
  breachAttempts?: number;
}

export default function OverdriveBreach({
  onAttempt,
  flash,
  waterSiphoned,
  waterGoal,
  disabled,
  sweetSpot,
  breachAttempts = 0,
}: Props) {
  const cursorPos = useRef(0);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between text-[10px] tracking-wider">
        <span className="flex items-center gap-1.5">
          <Zap size={12} /> OVERDRIVE BREACH
        </span>
        <span className="flex items-center gap-1 text-amber-glow/70">
          ATTEMPTS: {breachAttempts}
        </span>
      </div>

      {/* Water Tank Visualization */}
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-amber-glow text-[10px]">
          <Droplets size={11} /> {waterSiphoned}/{waterGoal}
        </span>
        <div className="flex flex-1 gap-1 h-3">
          {Array.from({ length: waterGoal }).map((_, i) => (
            <div key={i} className="flex-1 bg-black/50 border border-amber-glow/20 rounded-sm overflow-hidden relative">
              {i < waterSiphoned && (
                <div className="absolute inset-0 bg-amber-glow shadow-[0_0_8px_#ffb000] water-fill" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-10 overflow-hidden rounded-md bg-black/50 shadow-hardware-in mt-1">
        {/* Sweet Spot Target Box */}
        <div
          className="absolute bottom-0 top-0 border-x border-amber-glow/50 bg-amber-glow/20"
          style={{ left: `${sweetSpot.start}%`, width: `${sweetSpot.end - sweetSpot.start}%` }}
        />
        
        {/* Sweet Spot Target Labels */}
        <div className="absolute top-0 text-[6px] text-amber-glow/60 -translate-x-1/2" style={{ left: `${sweetSpot.start}%` }}>▼</div>
        <div className="absolute top-0 text-[6px] text-amber-glow/60 -translate-x-1/2" style={{ left: `${sweetSpot.end}%` }}>▼</div>

        {/* Tick Marks */}
        {[0, 25, 50, 75, 100].map(tick => (
          <div key={tick} className="absolute bottom-0 h-1.5 w-px bg-amber-glow/30" style={{ left: `${tick}%` }} />
        ))}

        {/* Enhanced Cursor with Trailing Glow */}
        <motion.div
          className="absolute bottom-0 top-0 w-1 bg-amber-glow z-10"
          style={{ boxShadow: '0 0 10px #ffb000, -2px 0 8px rgba(255,176,0,0.5), -4px 0 4px rgba(255,176,0,0.2)' }}
          animate={{ left: ['4%', '96%'] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          onUpdate={(latest) => {
            const l = latest.left;
            if (typeof l === 'string') cursorPos.current = parseFloat(l);
          }}
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onAttempt(cursorPos.current)}
        className={`mt-auto flex items-center justify-center gap-2 rounded-md border py-3 text-[12px] font-bold tracking-[0.2em] shadow-hardware-out transition-colors active:shadow-hardware-in disabled:cursor-not-allowed disabled:opacity-30 ${
          flash === 'success'
            ? 'border-amber-glow bg-amber-glow/20 text-amber-glow'
            : flash === 'fail'
              ? 'border-crimson-alert bg-crimson-alert/20 text-crimson-alert'
              : `border-amber-glow/50 bg-amber-glow/10 text-amber-glow ${!disabled ? 'pulse-glow-amber hover:bg-amber-glow/20' : ''}`
        }`}
      >
        <Zap size={14} className={!disabled ? 'animate-pulse' : ''} />
        BREACH
      </button>

      {/* Status Text */}
      <div className="h-3 text-center">
        {disabled ? (
          <p className="text-[9px] tracking-wider text-amber-glow/40">
            TUNE FREQUENCY TO ENABLE BREACH
          </p>
        ) : flash === 'success' ? (
          <p className="text-[9px] tracking-wider text-[#00ff88]" style={{ textShadow: '0 0 6px #00ff88' }}>
            BREACH SUCCESSFUL
          </p>
        ) : flash === 'fail' ? (
          <p className="text-[9px] tracking-wider text-crimson-alert" style={{ textShadow: '0 0 6px #cc0000' }}>
            TIMING OFF — RETRY
          </p>
        ) : (
          <p className="text-[9px] tracking-wider text-amber-glow/60">
            AWAITING BREACH TIMING...
          </p>
        )}
      </div>
    </div>
  );
}
