'use client';

import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import FuzzyText from './FuzzyText';

interface Props {
  onSuccess: () => void;
}

export default function DecryptionStage({ onSuccess }: Props) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [level, setLevel] = useState(1);

  // Initialize sequence
  useEffect(() => {
    const seq = Array.from({ length: 2 + level }, () => Math.floor(Math.random() * 4));
    setSequence(seq);
    setPlayerSequence([]);
    setShowingSequence(true);
  }, [level]);

  // Play sequence
  useEffect(() => {
    if (!showingSequence || sequence.length === 0) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setActiveIndex(sequence[i]);
        setTimeout(() => setActiveIndex(null), 400);
        i++;
      } else {
        setShowingSequence(false);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [showingSequence, sequence]);

  const handlePress = (idx: number) => {
    if (showingSequence) return;
    
    const newPlayerSeq = [...playerSequence, idx];
    setPlayerSequence(newPlayerSeq);
    setActiveIndex(idx);
    setTimeout(() => setActiveIndex(null), 200);

    const isCorrect = newPlayerSeq.every((val, i) => val === sequence[i]);

    if (!isCorrect) {
      // Failed
      setPlayerSequence([]);
      setShowingSequence(true);
    } else if (newPlayerSeq.length === sequence.length) {
      // Success this level
      if (level >= 3) {
        setTimeout(onSuccess, 500);
      } else {
        setTimeout(() => setLevel(l => l + 1), 1000);
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-12 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#00ff88]">
          <Lock size={24} /> 
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.6} color="#00ff88" fontSize="1.5rem" fontWeight="bold">
            DECRYPTION SEQUENCE
          </FuzzyText>
        </h2>
        <p className="text-xs tracking-widest text-[#00ffff]/60">
          REPEAT THE SIGNAL PATTERN — LAYER {level}/3
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-64 h-64">
        {[0, 1, 2, 3].map(i => (
          <button
            key={i}
            onClick={() => handlePress(i)}
            className={`w-full h-full border-2 transition-colors ${
              activeIndex === i 
                ? 'bg-[#00ffff] border-[#00ffff] shadow-[0_0_20px_#00ffff]' 
                : 'bg-black border-[#00ffff]/30 hover:border-[#00ffff]/60'
            }`}
          />
        ))}
      </div>
      
      <div className="mt-8 text-xs text-[#00ffff]/50">
        {showingSequence ? 'OBSERVE PATTERN...' : 'INPUT PATTERN'}
      </div>
    </div>
  );
}
