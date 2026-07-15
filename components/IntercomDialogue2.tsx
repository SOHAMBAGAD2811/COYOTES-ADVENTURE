'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  onProceed: () => void;
}

export default function IntercomDialogue2({ onProceed }: Props) {
  const [text, setText] = useState('');
  const fullText = "OXYGEN LEVELS RESTORED. GOOD SAVE. BUT WE STILL NEED FOOD TO SURVIVE THE CYCLE. BOOT UP THE ANCIENT BIOMASS SYNTHESIZER AND ROUTE THE POWER TO THE SEED VAULT. I'LL PREP THE FERTILIZER.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-8 backdrop-blur-md"
    >
      <div className="flex w-full max-w-4xl flex-col md:flex-row items-center gap-8 border-2 border-amber-glow/30 bg-matte-base p-8 shadow-hardware-out">
        
        {/* Avatar */}
        <div className="flex-shrink-0 border-4 border-amber-glow/50 bg-black p-2 shadow-[0_0_15px_rgba(255,176,0,0.3)]">
          <Image
            src="/avatar_human.jpg"
            alt="Korg"
            width={160}
            height={160}
            className="pixelated"
          />
        </div>

        {/* Dialogue */}
        <div className="flex flex-1 flex-col justify-between self-stretch">
          <div>
            <h2 className="mb-4 text-xl font-bold tracking-[0.3em] text-amber-glow/50">
              INCOMING TRANSMISSION...
            </h2>
            <p className="min-h-[100px] text-lg leading-relaxed tracking-widest text-amber-glow">
              {text}
              <span className="animate-pulse">_</span>
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onProceed}
              disabled={text.length < fullText.length}
              className="rounded border border-amber-glow/50 px-8 py-3 text-sm font-bold tracking-[0.2em] text-amber-glow transition-all hover:bg-amber-glow/20 disabled:opacity-20"
            >
              PROCEED TO STAGE 3
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
