'use client';

import { useEffect, useState } from 'react';
import { Battery, EyeOff, Navigation, Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

interface TopBarProps {
  time: Date;
  battery: number;
  coords: { x: number; y: number };
}

function pad(n: number, len = 2) {
  return String(Math.round(n)).padStart(len, '0');
}

export default function TopBar({ time, battery, coords }: TopBarProps) {
  const [muted, setMuted] = useState(audio.isMuted);
  const exoTime = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const critical = battery < 20;

  useEffect(() => {
    return audio.subscribe(setMuted);
  }, []);

  return (
    <header className="flex-shrink-0 grid grid-cols-3 items-center gap-4 px-5 py-3 border-b border-amber-glow/20 bg-matte-panel/60">
      <div className="flex items-center gap-4 text-[11px] tracking-wider">
        <span className="flex items-center gap-1.5">
          <Battery size={13} className={critical ? 'text-crimson-alert' : 'text-amber-glow'} />
          <span className={critical ? 'text-crimson-alert animate-pulse' : ''}>{Math.round(battery)}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Navigation size={13} />
          X:{String(coords.x).padStart(4, '0')} Y:{String(coords.y).padStart(3, '0')}
        </span>
      </div>

      <div className="flex flex-col items-center justify-self-center">
        <span
          className="text-amber-glow font-bold tracking-[0.25em] text-sm"
          style={{ textShadow: '0 0 10px rgba(255,176,0,0.5)' }}
        >
          COYOTE INTERCEPT TERMINAL
        </span>
        <span className="text-[9px] tracking-[0.2em] text-amber-glow/40">KEPLER-88 · THE RUST</span>
      </div>

      <div className="flex items-center justify-end gap-4 text-[11px]">
        <button 
          onClick={() => audio.toggleMute()} 
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-amber-glow/40 text-amber-glow shadow-hardware-out hover:bg-amber-glow/10 active:shadow-hardware-in transition-all"
        >
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded border border-amber-glow/40 text-amber-glow shadow-hardware-in">
          <EyeOff size={12} className="animate-pulse" />
          STEALTH MODE: ACTIVE
        </span>
        <span className="tracking-wider text-amber-glow">
          {exoTime} <span className="text-amber-glow/40">LOCAL</span>
        </span>
      </div>
    </header>
  );
}
