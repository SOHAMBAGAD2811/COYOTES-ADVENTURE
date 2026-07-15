'use client';

import { Thermometer, Wind } from 'lucide-react';

interface Props {
  heat: number;
  systemFailure: boolean;
  onVent: () => void;
}

/* ── Zone label config ────────────────────────────────────────────── */
const ZONE_LABELS: { segment: number; label: string; color: string }[] = [
  { segment: 0, label: 'SAFE', color: '#4ade80' },   // green — bottom
  { segment: 8, label: 'WARN', color: '#ffb000' },   // amber — middle
  { segment: 12, label: 'CRIT', color: '#cc0000' },   // red   — top
];

/* 75 % threshold sits at segment index 12 (Math.round(0.75 * 16)) */
const THRESHOLD_SEGMENT = 12;

export default function HeatTelemetry({ heat, systemFailure, onVent }: Props) {
  const segments = 16;
  const filled = Math.round((heat / 100) * segments);
  const critical = heat > 75;
  const warn = heat > 50;

  /* Temperature readout: heat × 4.2 → plausible °C range */
  const celsius = (heat * 4.2).toFixed(1);

  /* Vent button glow class */
  const ventGlowClass = critical
    ? 'pulse-glow-red'
    : warn
      ? 'pulse-glow-amber'
      : '';

  return (
    <div
      className={`flex h-full flex-col gap-3 rounded-md border transition-colors duration-300 ${
        systemFailure
          ? 'border-crimson-alert/70'
          : 'border-transparent'
      }`}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-[10px] tracking-wider">
        <span className="flex items-center gap-1.5">
          <Thermometer size={12} /> CORE TEMP
        </span>
        <span className={critical ? 'text-crimson-alert animate-pulse' : 'text-amber-glow'}>
          {Math.round(heat)}%
        </span>
      </div>

      {/* ── Temperature °C readout ──────────────────────────────── */}
      <div className="text-center text-[9px] tabular-nums tracking-wider text-amber-glow/50">
        {celsius}°C
      </div>

      {/* ── Segment bar with zone labels ────────────────────────── */}
      <div className="flex gap-2">
        {/* Zone labels column (right-aligned to bar) */}
        <div className="relative flex h-40 w-6 flex-col-reverse">
          {ZONE_LABELS.map(({ segment, label, color }) => (
            <span
              key={label}
              className="absolute left-0 text-[7px] font-bold tracking-widest"
              style={{
                /* position label at segment's vertical offset */
                bottom: `${(segment / segments) * 100}%`,
                color,
                textShadow: `0 0 4px ${color}`,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Segment bar */}
        <div
          className={`relative flex h-40 flex-1 flex-col-reverse gap-1 ${
            heat > 60 ? 'heat-shimmer' : ''
          }`}
        >
          {Array.from({ length: segments }).map((_, i) => {
            const isFilled = i < filled;
            /* Per-segment color: green ≤ 7, amber 8-11, red ≥ 12 */
            const segColor = i >= 12 ? '#cc0000' : i >= 8 ? '#ffb000' : '#4ade80';
            const bgClass = isFilled
              ? i >= 12
                ? 'bg-crimson-alert'
                : i >= 8
                  ? 'bg-amber-glow'
                  : 'bg-green-400/60'
              : 'bg-black/50';

            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-[background-color,box-shadow] duration-300 ease-in-out ${bgClass}`}
                style={
                  isFilled
                    ? { boxShadow: `0 0 6px ${segColor}` }
                    : { boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.8)' }
                }
              />
            );
          })}

          {/* ── 75 % warning threshold line ─────────────────────── */}
          <div
            className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
            style={{
              /* position from the bottom: 75% of bar height */
              bottom: `${(THRESHOLD_SEGMENT / segments) * 100}%`,
            }}
          >
            <div className="h-px w-full border-t border-dashed border-crimson-alert/70" />
            <span className="ml-1 whitespace-nowrap text-[6px] tracking-wider text-crimson-alert/60">
              75%
            </span>
          </div>
        </div>
      </div>

      {/* ── Vent coolant button ──────────────────────────────────── */}
      <button
        type="button"
        onClick={onVent}
        disabled={systemFailure}
        className={`mt-auto flex items-center justify-center gap-2 rounded-md border border-amber-glow/30 bg-matte-panel py-2.5 text-[11px] tracking-widest text-amber-glow shadow-hardware-out transition-shadow active:shadow-hardware-in disabled:cursor-not-allowed disabled:opacity-30 ${ventGlowClass}`}
      >
        <Wind size={13} /> VENT COOLANT
      </button>

      {systemFailure && (
        <p className="text-center text-[9px] tracking-wider text-crimson-alert animate-pulse">
          SYSTEM OVERLOAD — COOLING
        </p>
      )}
    </div>
  );
}
