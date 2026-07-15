'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import PixelButton from './PixelButton';

interface Props {
  onProceed: () => void;
  message: string;
  buttonText?: string;
  avatarSrc?: string;
}

export default function IntercomDialogueGeneric({ onProceed, message, buttonText = "PROCEED", avatarSrc = "/avatar_human.jpg" }: Props) {
  const [text, setText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(message.slice(0, index));
      index++;
      if (index > message.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [message]);

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
            src={avatarSrc}
            alt="Comm"
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
              disabled={text.length < message.length}
              className="px-8 py-3 text-sm font-bold tracking-[0.2em] text-amber-glow"
            >
              {buttonText}
            </PixelButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
