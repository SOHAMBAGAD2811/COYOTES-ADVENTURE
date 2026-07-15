'use client';

import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Terminal, AlertTriangle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

const WORDS = [
  'SYS.OVR', 'NULL_PTR', 'BYPASS_01', 'HEX_DUMP', 'ROOT_ACCESS', 'DECRYPT_KEY', 'PROXY_ROUTE', 'INJECT_PAYLOAD'
];

const HARD_WORDS = [
  'AEGIS_CRITICAL_LOCK', 'SYS_PURGE_99', 'FATAL_EXCEPTION', 'TERMINATE_CONN', 'QUARANTINE_PROTOCOL'
];

export default function FirewallStage({ onSuccess }: Props) {
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [errorFlash, setErrorFlash] = useState(false);
  const [botActive, setBotActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pick 4 random words
    const shuffled = [...WORDS].sort(() => 0.5 - Math.random());
    setTargetWords(shuffled.slice(0, 4));
  }, []);

  // Bot intervention
  useEffect(() => {
    if (currentIndex >= targetWords.length) return;
    
    const t = setInterval(() => {
      // 30% chance every 3.5s to trigger bot if not already active
      if (Math.random() < 0.3 && !botActive) {
        setBotActive(true);
        setErrorFlash(true);
        setTimeout(() => setErrorFlash(false), 400);
        
        setTargetWords(prev => {
          const newWords = [...prev];
          const hardWord = HARD_WORDS[Math.floor(Math.random() * HARD_WORDS.length)];
          newWords[currentIndex] = hardWord;
          return newWords;
        });
        setInput('');
      }
    }, 3500);
    
    return () => clearInterval(t);
  }, [currentIndex, targetWords.length, botActive]);

  // auto focus
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentIndex, botActive]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    const currentTarget = targetWords[currentIndex];

    // If they type a wrong character, flash error and clear
    if (!currentTarget.startsWith(val)) {
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 200);
      setInput('');
      return;
    }

    setInput(val);

    if (val === currentTarget) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setInput('');
      setBotActive(false);
      if (nextIdx >= targetWords.length) {
        setTimeout(onSuccess, 500);
      }
    }
  };

  if (targetWords.length === 0) return null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-12 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#ff0055] rng-glitch">
          <ShieldAlert size={24} /> ICE FIREWALL DETECTED
        </h2>
        <p className="text-xs tracking-widest text-[#ff0055]/60">
          ENTER OVERRIDE COMMANDS TO BYPASS
        </p>
      </div>

      <div className={`w-full max-w-2xl border-2 p-8 transition-colors duration-75 ${
        errorFlash ? 'bg-[#ff0055]/20 border-[#ff0055] shadow-[0_0_30px_rgba(255,0,85,0.4)]' : 'bg-black border-[#ff0055]/30 shadow-hardware-out'
      }`}>
        <div className="flex flex-col gap-6 font-mono">
          <div className="flex items-center gap-4 text-xl text-[#ff0055]/50 border-b border-[#ff0055]/20 pb-4">
            <Terminal size={24} />
            <span>{botActive ? 'WARNING: SENTINEL INTERVENTION' : 'AWAITING ROOT OVERRIDE...'}</span>
          </div>
          
          {botActive && (
            <div className="flex items-center gap-2 text-xs tracking-widest text-crimson-alert animate-pulse mb-2">
              <AlertTriangle size={14} /> FIREWALL TAKING BACK CONTROL — COMPLEX OVERRIDE REQUIRED
            </div>
          )}
          
          <div className="flex flex-col gap-4 mt-2">
            {targetWords.map((word, idx) => (
              <div key={idx} className="flex items-center gap-4 text-2xl tracking-widest">
                {idx < currentIndex ? (
                  <span className="text-[#00ff88]">✓ {word}</span>
                ) : idx === currentIndex ? (
                  <div className={`flex items-center gap-2 font-bold shadow-glow ${botActive ? 'text-crimson-alert rng-glitch-fast' : 'text-[#ff0055]'}`}>
                    <span>&gt;</span>
                    <div className="relative">
                      <span className="opacity-30">{word}</span>
                      <span className="absolute left-0 top-0 text-white">{input}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[#ff0055]/30 opacity-50">&gt; {word}</span>
                )}
              </div>
            ))}
          </div>

          <input 
            ref={inputRef}
            type="text" 
            value={input}
            onChange={handleChange}
            onBlur={() => inputRef.current?.focus()}
            disabled={currentIndex >= targetWords.length}
            className="absolute opacity-0 pointer-events-none"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
