'use client';

import { motion } from 'framer-motion';
import { Crosshair, Radio } from 'lucide-react';
import type { MissionStatus } from '@/lib/useInterceptState';

interface Props {
  staticOpacity: number;
  signalLocked: boolean;
  progress: number; // 0 (start) -> 1 (reached Oasis City)
  missionStatus: MissionStatus;
}

const CONVOY_START = { x: 14, y: 20 };
const OASIS_POS = { x: 84, y: 82 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function TopographicalScanner({ staticOpacity, signalLocked, progress }: Props) {
  const convoyX = lerp(CONVOY_START.x, OASIS_POS.x, progress);
  const convoyY = lerp(CONVOY_START.y, OASIS_POS.y, progress);
  const etaPercent = Math.max(0, Math.round((1 - progress) * 100));

  return (
    <div className="relative h-full w-full overflow-hidden bg-black/40">
      {/* Grid background */}
      <div className="absolute inset-0 scanner-grid" />
      <div className="absolute inset-0 scanner-scanlines pointer-events-none" />

      {/* Convoy path – dashed SVG line from start to destination */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
        <line
          className="convoy-path"
          x1={`${CONVOY_START.x}%`}
          y1={`${CONVOY_START.y}%`}
          x2={`${OASIS_POS.x}%`}
          y2={`${OASIS_POS.y}%`}
        />
      </svg>

      {/* Radar sweep – sits behind blips, in front of grid */}
      <div className="radar-sweep" />

      {/* Oasis City destination marker */}
      <div
        className="absolute flex flex-col items-center gap-1"
        style={{ left: `${OASIS_POS.x}%`, top: `${OASIS_POS.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="h-4 w-4 rounded-sm border-2 border-crimson-alert/70"
          style={{ boxShadow: '0 0 10px rgba(204,0,0,0.5)' }}
        />
        <span className="text-[8px] tracking-wider text-crimson-alert/80 whitespace-nowrap">OASIS CITY</span>
      </div>

      {/* Rover position marker – diamond at ~(10%, 90%) */}
      <div
        className="absolute flex flex-col items-center gap-1"
        style={{ left: '10%', top: '90%', transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="h-3 w-3 rotate-45 border border-amber-glow/60 bg-amber-glow/20"
          style={{ boxShadow: '0 0 6px rgba(255,176,0,0.3)' }}
        />
        <span className="text-[7px] tracking-wider text-amber-glow/60 whitespace-nowrap">YOUR ROVER</span>
      </div>

      {/* Convoy blip with optional pulsing rings */}
      <motion.div
        className="absolute"
        animate={{ left: `${convoyX}%`, top: `${convoyY}%` }}
        transition={{ duration: 1, ease: 'linear' }}
        style={{ transform: 'translate(-50%, -50%)' }}
      >
        {/* Pulsing rings when signal is locked */}
        {signalLocked && (
          <>
            <div className="pulse-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div
              className="pulse-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ animationDelay: '0.6s' }}
            />
          </>
        )}

        {/* Convoy blip dot */}
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            signalLocked ? 'bg-amber-glow pulse-glow-amber' : 'bg-amber-glow/30'
          }`}
          style={{ boxShadow: signalLocked ? '0 0 10px #ffb000' : 'none' }}
        />
        <span className="absolute -top-4 left-2 text-[8px] whitespace-nowrap text-amber-glow/70">
          AEGIS-CONVOY-01
        </span>
      </motion.div>

      {/* Static noise overlay */}
      <div className="absolute inset-0 pointer-events-none scanner-static" style={{ opacity: staticOpacity }} />

      {/* HUD – top left */}
      <div className="absolute top-2 left-3 flex items-center gap-2 text-[10px] tracking-wider">
        <Crosshair size={12} className="text-amber-glow" />
        <span>TOPOGRAPHICAL SCAN</span>
      </div>

      {/* HUD – top right */}
      <div className="absolute top-2 right-3 flex items-center gap-2 text-[10px] tracking-wider">
        <Radio size={12} className={signalLocked ? 'text-amber-glow' : 'text-amber-glow/30'} />
        <span className={signalLocked ? 'text-amber-glow' : 'text-amber-glow/40'}>
          {signalLocked ? 'SIGNAL LOCKED' : 'SEARCHING...'}
        </span>
      </div>

      {/* HUD – bottom left */}
      <div className="absolute bottom-2 left-3 text-[10px] tracking-wider text-amber-glow/70">
        CONVOY ETA: {etaPercent}% DISTANCE REMAINING
      </div>

      {/* HUD – bottom right stats */}
      <div className="absolute bottom-2 right-3 text-[10px] tracking-wider text-amber-glow/50">
        SECTOR 7G · DUST STORM ACTIVE
      </div>
    </div>
  );
}
