'use client';

import { useState, useEffect, useRef } from 'react';
import { Rocket } from 'lucide-react';
import FuzzyText from './FuzzyText';

interface Props {
  onSuccess: () => void;
}

export default function ThrusterStage({ onSuccess }: Props) {
  const [ui, setUi] = useState({ alt: 10, target: 50 });
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isThrusting, setIsThrusting] = useState(false);

  const isThrustingRef = useRef(false);
  const physics = useRef({
    altitude: 10,
    velocity: 0,
    time: 0,
  });

  // Keep ref synced for the physics loop
  useEffect(() => {
    isThrustingRef.current = isThrusting;
  }, [isThrusting]);

  useEffect(() => {
    if (completed) {
      const t = setTimeout(onSuccess, 500);
      return () => clearTimeout(t);
    }

    let raf: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // cap dt at 0.1s to avoid huge jumps
      lastTime = now;
      
      physics.current.time += dt;

      // Apply thrust or gravity
      if (isThrustingRef.current) {
        physics.current.velocity += 120 * dt; // upward thrust acceleration
      } else {
        physics.current.velocity -= 90 * dt;  // gravity
      }

      // Add some drag/friction so velocity doesn't go infinite
      physics.current.velocity *= 0.95;

      // Update position
      physics.current.altitude += physics.current.velocity * dt;

      // Hard bounds 0 to 100
      if (physics.current.altitude < 0) {
        physics.current.altitude = 0;
        physics.current.velocity = 0;
      }
      if (physics.current.altitude > 100) {
        physics.current.altitude = 100;
        physics.current.velocity = 0;
      }

      // Calculate target position using compound sine waves for unpredictable but smooth drift
      const t = physics.current.time;
      const targetY = 50 + Math.sin(t * 1.2) * 20 + Math.cos(t * 0.7) * 15 + Math.sin(t * 0.3) * 10;

      // Check alignment (target window is ±12% of total height)
      const diff = Math.abs(physics.current.altitude - targetY);
      const isAligned = diff <= 12;

      setProgress(p => {
        let next = p;
        if (isAligned) {
          next = p + 15 * dt; // Takes ~6.6 seconds of being aligned to hit 100
        } else {
          next = p - 10 * dt; // Penalize slowly
        }
        
        next = Math.max(0, Math.min(100, next));
        if (next >= 100) {
          setCompleted(true);
        }
        return next;
      });

      setUi({
        alt: physics.current.altitude,
        target: targetY
      });

      if (!completed) {
        raf = requestAnimationFrame(loop);
      }
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, [completed, onSuccess]);

  // Support Spacebar for thrusting
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsThrusting(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsThrusting(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const diff = Math.abs(ui.alt - ui.target);
  const isAligned = diff <= 12;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 select-none">
      <div className="mb-8 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#ffb000]">
          <Rocket size={24} /> 
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.6} color="#ffb000" fontSize="1.5rem" fontWeight="bold">
            ORBITAL BURN ALIGNMENT
          </FuzzyText>
        </h2>
        <p className="text-xs tracking-widest text-[#ff8800]/60 text-center max-w-md">
          HOLD THRUST TO GAIN ALTITUDE. <br/>
          KEEP THE SHIP (WHITE) INSIDE THE SAFE CORRIDOR (ORANGE).
        </p>
      </div>

      <div className="flex items-center gap-12 w-full max-w-2xl justify-center">
        {/* Altimeter Gauge */}
        <div className="relative w-24 h-64 border-2 border-[#ffb000]/40 bg-black/50 shadow-[0_0_15px_rgba(255,176,0,0.1)] overflow-hidden">
          
          {/* Target Safe Zone (Orange) */}
          <div 
            className={`absolute w-full h-[24%] transition-colors duration-200 ${isAligned ? 'bg-[#00ff88]/20 border-[#00ff88]' : 'bg-[#ffb000]/20 border-[#ffb000]'} border-y-2`}
            style={{ 
              bottom: `${ui.target}%`, 
              transform: 'translateY(50%)' 
            }}
          />

          {/* Ship Indicator (White line) */}
          <div 
            className="absolute w-full h-1 bg-white shadow-[0_0_10px_#fff]"
            style={{ 
              bottom: `${ui.alt}%`, 
              transform: 'translateY(50%)' 
            }}
          />
          
          {/* Grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
               style={{ backgroundImage: 'linear-gradient(0deg, transparent 24px, #ffb000 25px)', backgroundSize: '100% 25px' }} />
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Progress Bar */}
          <div className="w-48">
            <div className="mb-2 flex justify-between text-[10px] text-[#ff8800]">
              <span>STABILIZATION</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded border border-[#ff8800]/30 bg-black overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-100 ${progress === 100 ? 'bg-[#00ff88]' : 'bg-[#ff8800]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[9px] text-[#ff8800]/50 mt-2 text-center h-4">
              {isAligned ? <span className="text-[#00ff88] animate-pulse">LOCKED</span> : 'DRIFTING...'}
            </div>
          </div>

          {/* Thrust Button */}
          <button
            onMouseDown={() => setIsThrusting(true)}
            onMouseUp={() => setIsThrusting(false)}
            onMouseLeave={() => setIsThrusting(false)}
            onTouchStart={(e) => { e.preventDefault(); setIsThrusting(true); }}
            onTouchEnd={(e) => { e.preventDefault(); setIsThrusting(false); }}
            className={`relative overflow-hidden w-32 h-32 rounded-full border-4 flex items-center justify-center font-bold tracking-widest transition-all
              ${isThrusting 
                ? 'border-[#ffb000] bg-[#ffb000]/20 text-[#ffb000] shadow-[0_0_30px_#ffb000]' 
                : 'border-[#ffb000]/40 bg-black text-[#ffb000]/60 hover:border-[#ffb000]/80 hover:text-[#ffb000]'}
            `}
          >
            {/* Thrust Flame Effect */}
            <div 
              className={`absolute bottom-0 w-full bg-gradient-to-t from-[#ffb000] to-transparent transition-all duration-300 ${isThrusting ? 'h-full opacity-30' : 'h-0 opacity-0'}`} 
            />
            <span className="relative z-10 text-sm">{isThrusting ? 'BURNING' : 'THRUST'}</span>
          </button>
          
          <div className="text-[10px] text-[#ff8800]/40 tracking-widest text-center mt-[-1rem]">
            (OR HOLD SPACEBAR)
          </div>
        </div>
      </div>
    </div>
  );
}
