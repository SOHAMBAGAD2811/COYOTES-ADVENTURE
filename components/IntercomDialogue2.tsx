'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import PixelButton from './PixelButton';
import PixelSnow from './PixelSnow';

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
      <PixelSnow 
        color="#ffb000"
        flakeSize={0.01}
        minFlakeSize={1.25}
        pixelResolution={200}
        speed={1.25}
        density={0.2}
        direction={125}
        brightness={0.3}
        className="absolute inset-0 z-0 pointer-events-none opacity-50"
      />
      <div className="relative z-10 flex w-full max-w-4xl flex-col md:flex-row items-center gap-8 border-2 border-amber-glow/30 bg-matte-base p-8 shadow-hardware-out">
        
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
            <PixelButton
              variant="coyote"
              onClick={onProceed}
              disabled={text.length < fullText.length}
              className="px-10 py-4 text-sm font-bold tracking-[0.2em] text-amber-glow"
            >
              PROCEED TO STAGE 3
            </PixelButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
