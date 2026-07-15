'use client';

import { useState, useEffect, useRef } from 'react';
import { Wind } from 'lucide-react';
import type { CSSProperties } from 'react';

const horizontalSliderStyle: CSSProperties = {
  width: '100%',
  transform: 'rotate(270deg)',
};

interface Props {
  onSuccess: () => void;
  setHypoxia: (val: boolean) => void;
}

export default function AirStage({ onSuccess, setHypoxia }: Props) {
  const [valve1, setValve1] = useState(50);
  const [valve2, setValve2] = useState(50);
  const [progress, setProgress] = useState(0);
  
  const v1Ref = useRef(valve1);
  const v2Ref = useRef(valve2);
  v1Ref.current = valve1;
  v2Ref.current = valve2;

  // Drifting effect
  useEffect(() => {
    const t = setInterval(() => {
      // Drift randomly
      setValve1(v => Math.max(0, Math.min(100, v + (Math.random() > 0.5 ? 4 : -5))));
      setValve2(v => Math.max(0, Math.min(100, v + (Math.random() > 0.5 ? -4 : 5))));
    }, 400);
    return () => clearInterval(t);
  }, []);

  // Progression & Hypoxia effect
  useEffect(() => {
    const t = setInterval(() => {
      const v1Safe = v1Ref.current >= 35 && v1Ref.current <= 65;
      const v2Safe = v2Ref.current >= 35 && v2Ref.current <= 65;
      
      if (v1Safe && v2Safe) {
        setProgress(p => Math.min(100, p + 2.5));
        setHypoxia(false);
      } else {
        setProgress(p => Math.max(0, p - 1));
        setHypoxia(true);
      }
    }, 250);
    return () => {
      clearInterval(t);
      setHypoxia(false);
    };
  }, [setHypoxia]);

  useEffect(() => {
    if (progress >= 100) {
      onSuccess();
    }
  }, [progress, onSuccess]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-8 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#00ff88]">
          <Wind size={24} /> OXYGEN SCRUBBERS
        </h2>
        <p className="text-xs tracking-widest text-amber-glow/60">
          KEEP VALVES IN THE GREEN ZONE
        </p>
      </div>

      <div className="flex w-full max-w-xl justify-around gap-12">
        {/* Valve 1 */}
        <div className="flex flex-col items-center gap-4 relative h-64 w-24">
          <div className="absolute inset-y-0 w-8 border border-[#00ff88]/30 rounded bg-black/50 overflow-hidden flex flex-col-reverse items-center justify-center -z-10">
             <div className="h-[30%] w-full bg-[#00ff88]/20 absolute top-[35%]" />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={valve1}
            onChange={(e) => setValve1(Number(e.target.value))}
            className="freq-slider w-64 absolute top-1/2 -translate-y-1/2"
            style={horizontalSliderStyle}
          />
          <span className="absolute -bottom-8 text-xs text-[#00ff88]/60">VALVE A</span>
        </div>

        {/* Valve 2 */}
        <div className="flex flex-col items-center gap-4 relative h-64 w-24">
          <div className="absolute inset-y-0 w-8 border border-[#00ff88]/30 rounded bg-black/50 overflow-hidden flex flex-col-reverse items-center justify-center -z-10">
             <div className="h-[30%] w-full bg-[#00ff88]/20 absolute top-[35%]" />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={valve2}
            onChange={(e) => setValve2(Number(e.target.value))}
            className="freq-slider w-64 absolute top-1/2 -translate-y-1/2"
            style={horizontalSliderStyle}
          />
          <span className="absolute -bottom-8 text-xs text-[#00ff88]/60">VALVE B</span>
        </div>
      </div>

      <div className="mt-16 w-full max-w-xl">
        <div className="mb-2 flex justify-between text-[10px] text-[#00ff88]">
          <span>PURIFICATION PROGRESS</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-4 w-full rounded border border-[#00ff88]/30 bg-black overflow-hidden">
          <div 
            className="h-full bg-[#00ff88] transition-all duration-200"
            style={{ width: `${progress}%`, boxShadow: '0 0 10px #00ff88' }}
          />
        </div>
      </div>
    </div>
  );
}
