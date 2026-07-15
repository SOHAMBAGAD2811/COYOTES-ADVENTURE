'use client';

import { useState, useEffect, useRef } from 'react';
import { Leaf } from 'lucide-react';
import FuzzyText from './FuzzyText';

interface Props {
  onSuccess: () => void;
}

const TARGETS = { ph: 7.2, nitrogen: 65, water: 80 };

export default function BiosphereStage({ onSuccess }: Props) {
  const [ph, setPh] = useState(5.0);
  const [nitrogen, setNitrogen] = useState(20);
  const [water, setWater] = useState(40);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Stable refs so the interval always reads latest values without restarting
  const phRef = useRef(ph);
  const nitrogenRef = useRef(nitrogen);
  const waterRef = useRef(water);
  phRef.current = ph;
  nitrogenRef.current = nitrogen;
  waterRef.current = water;

  // Call onSuccess safely outside render
  useEffect(() => {
    if (completed) setTimeout(onSuccess, 400);
  }, [completed, onSuccess]);

  // Single stable interval — reads values from refs
  useEffect(() => {
    const t = setInterval(() => {
      const phGood = Math.abs(phRef.current - TARGETS.ph) < 0.3;
      const nGood = Math.abs(nitrogenRef.current - TARGETS.nitrogen) < 5;
      const wGood = Math.abs(waterRef.current - TARGETS.water) < 5;

      if (phGood && nGood && wGood) {
        setProgress(p => {
          const next = Math.min(p + 5, 100);
          if (next >= 100) setCompleted(true);
          return next;
        });
      } else {
        setProgress(p => Math.max(0, p - 2));
      }
    }, 200);

    return () => clearInterval(t);
  }, []); // runs once only — uses refs for latest values

  const phGood = Math.abs(ph - TARGETS.ph) < 0.3;
  const nGood = Math.abs(nitrogen - TARGETS.nitrogen) < 5;
  const wGood = Math.abs(water - TARGETS.water) < 5;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-12 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#00ff88]">
          <Leaf size={24} /> 
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.6} color="#00ff88" fontSize="1.5rem" fontWeight="bold">
            BIOSPHERE INITIALIZATION
          </FuzzyText>
        </h2>
        <p className="text-xs tracking-widest text-[#00ff88]/60">
          CALIBRATE SOIL NUTRIENTS AND HYDRATION LEVELS
        </p>
      </div>

      <div className="flex w-full max-w-2xl justify-between gap-12 mb-12">
        {/* pH */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <span className="text-xs text-[#00ff88]/60">pH LEVEL</span>
          <span className={`text-xl font-bold ${phGood ? 'text-[#00ff88]' : 'text-amber-glow'}`}>
            {ph.toFixed(1)}
          </span>
          <input type="range" min={0} max={14} step={0.1} value={ph}
            onChange={e => setPh(Number(e.target.value))} className="freq-slider w-full" />
          <div className={`text-[10px] mt-2 ${phGood ? 'text-[#00ff88]' : 'text-amber-glow/40'}`}>
            TARGET: {TARGETS.ph.toFixed(1)} {phGood ? '✓' : ''}
          </div>
        </div>

        {/* Nitrogen */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <span className="text-xs text-[#00ff88]/60">NITROGEN (%)</span>
          <span className={`text-xl font-bold ${nGood ? 'text-[#00ff88]' : 'text-amber-glow'}`}>
            {nitrogen}
          </span>
          <input type="range" min={0} max={100} value={nitrogen}
            onChange={e => setNitrogen(Number(e.target.value))} className="freq-slider w-full" />
          <div className={`text-[10px] mt-2 ${nGood ? 'text-[#00ff88]' : 'text-amber-glow/40'}`}>
            TARGET: {TARGETS.nitrogen} {nGood ? '✓' : ''}
          </div>
        </div>

        {/* Water */}
        <div className="flex flex-col items-center gap-4 flex-1">
          <span className="text-xs text-[#00ff88]/60">WATER (%)</span>
          <span className={`text-xl font-bold ${wGood ? 'text-[#00ff88]' : 'text-amber-glow'}`}>
            {water}
          </span>
          <input type="range" min={0} max={100} value={water}
            onChange={e => setWater(Number(e.target.value))} className="freq-slider w-full" />
          <div className={`text-[10px] mt-2 ${wGood ? 'text-[#00ff88]' : 'text-amber-glow/40'}`}>
            TARGET: {TARGETS.water} {wGood ? '✓' : ''}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-[10px] text-[#00ff88]">
          <span>INITIALIZATION PROGRESS</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded border border-[#00ff88]/30 bg-black overflow-hidden">
          <div
            className="h-full bg-[#00ff88] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 text-center text-[10px] text-[#00ff88]/40 tracking-widest">
          {phGood && nGood && wGood ? 'ALL PARAMETERS LOCKED — INITIALIZING...' : 'ADJUST ALL THREE SLIDERS TO TARGET VALUES'}
        </div>
      </div>
    </div>
  );
}
