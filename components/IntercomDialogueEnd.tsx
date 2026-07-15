'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import PixelButton from './PixelButton';

interface Props {
  onProceed: () => void;
}

export default function IntercomDialogueEnd({ onProceed }: Props) {
  const [text, setText] = useState('');
  const fullText = "WE DID IT. WATER, AIR, AND BIOMASS ARE FULLY RESTORED. THE SETTLEMENT WILL SURVIVE ANOTHER CYCLE. GOOD WORKING WITH YOU, COYOTE. SIGNING OFF.";

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
      <div className="flex w-full max-w-4xl flex-col md:flex-row items-center gap-8 border-2 border-[#00ff88]/30 bg-matte-base p-8 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
        
        {/* Avatar */}
        <div className="flex-shrink-0 border-4 border-[#00ff88]/50 bg-black p-2 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
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
            <h2 className="mb-4 text-xl font-bold tracking-[0.3em] text-[#00ff88]/50">
              INCOMING TRANSMISSION...
            </h2>
            <p className="min-h-[100px] text-lg leading-relaxed tracking-widest text-[#00ff88]">
              {text}
              <span className="animate-pulse">_</span>
            </p>
          </div>

          <div className="mt-8 flex justify-end">
            <PixelButton
              variant="green"
              onClick={onProceed}
              disabled={text.length < fullText.length}
              className="px-10 py-4 text-sm font-bold tracking-[0.2em] text-[#00ff88]"
            >
              FINISH MISSION
            </PixelButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
