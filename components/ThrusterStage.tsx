'use client';

import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export default function ThrusterStage({ onSuccess }: Props) {
  const [position, setPosition] = useState(50);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Call onSuccess outside of render cycle
  useEffect(() => {
    if (completed) setTimeout(onSuccess, 300);
  }, [completed, onSuccess]);

  useEffect(() => {
    if (completed) return;
    const t = setInterval(() => {
      // random drift
      const drift = (Math.random() - 0.5) * 15;
      setPosition(p => Math.max(0, Math.min(100, p + drift)));
      
      setPosition(p => {
        if (p >= 40 && p <= 60) {
          setProgress(prog => {
            const next = prog + 2;
            if (next >= 100) {
              clearInterval(t);
              setCompleted(true);
            }
            return Math.min(next, 100);
          });
        } else {
          setProgress(prog => Math.max(0, prog - 2));
        }
        return p;
      });
    }, 100);

    return () => clearInterval(t);
  }, [completed]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-12 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#ffb000] rng-glitch">
          <Rocket size={24} /> THRUSTER CALIBRATION
        </h2>
        <p className="text-xs tracking-widest text-[#ff8800]/60">
          KEEP ALIGNMENT CENTERED TO TRAVERSE DEBRIS FIELD
        </p>
      </div>

      <div className="w-full max-w-xl h-4 bg-black border border-[#ff8800]/30 mb-16 rounded overflow-hidden relative">
        <div 
          className="absolute h-full bg-[#ff8800]/30" 
          style={{ left: '40%', width: '20%' }} 
        />
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="freq-slider absolute inset-0 w-full z-10 opacity-0 cursor-pointer"
        />
        <div 
          className="absolute h-6 w-2 bg-[#ff8800] top-1/2 -translate-y-1/2 shadow-[0_0_10px_#ff8800] pointer-events-none" 
          style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }} 
        />
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-[10px] text-[#ff8800]">
          <span>TRAVERSAL PROGRESS</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded border border-[#ff8800]/30 bg-black overflow-hidden">
          <div 
            className="h-full bg-[#ff8800] transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
