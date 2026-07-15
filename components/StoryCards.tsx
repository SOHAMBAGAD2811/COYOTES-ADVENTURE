'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: () => void;
}

const STORY = [
  "YEAR 2142. EARTH IS A DUST BOWL.",
  "THE MEGA-CORPORATION 'AEGIS' HOARDS ALL REMAINING RESOURCES.",
  "WE SURVIVE IN THE SHADOWS OF OASIS CITY.",
  "YOU ARE A 'COYOTE' — A ROGUE TECH-TRACKER.",
  "YOUR MISSION: INTERCEPT THEIR SUPPLY CONVOYS AND KEEP OUR SETTLEMENT ALIVE."
];

// Glitch fade-in variant
const glitchVariant = {
  hidden: { opacity: 0, x: -10, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: [0, 1, 0.4, 1, 0.8, 1],
    x: [0, -4, 4, -2, 2, 0],
    filter: ['blur(8px)', 'blur(0px)', 'blur(2px)', 'blur(0px)', 'blur(1px)', 'blur(0px)'],
    transition: {
      delay: i * 1.5,
      duration: 0.6,
      ease: 'linear'
    }
  })
};

// Pre-generate star positions once at module level — they're static values
const STAR_DATA = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  x: (7 + (i * 1.618033) % 93).toFixed(2),    // golden-ratio spread for even distribution
  y: ((i * 2.618033) % 97).toFixed(2),
  size: (0.5 + (i % 5) * 0.5).toFixed(1),
  delay: `${((i * 0.37) % 3).toFixed(2)}s`,
  duration: `${(2 + (i % 3)).toFixed(1)}s`,
}));

export default function StoryCards({ onComplete }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      STORY.forEach((line, i) => {
        const t = setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(line);
          utterance.rate = 0.9;
          utterance.pitch = 0.7;
          window.speechSynthesis.speak(utterance);
        }, i * 1500 + 200);
        timeouts.push(t);
      });
    }

    return () => {
      timeouts.forEach(clearTimeout);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black p-8 text-center cursor-pointer"
      onClick={onComplete}
    >
      <div className="grain-overlay z-0" />

      {/* Glowing Stars Background — pure CSS animations, no JS per-star */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-60">
          {STAR_DATA.map((star) => (
            <div
              key={star.id}
              className="story-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                ['--star-delay' as string]: star.delay,
                ['--star-duration' as string]: star.duration,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Story Lines */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col gap-6 md:gap-8 items-center">
        {STORY.map((line, i) => (
          <motion.h1
            key={i}
            custom={i}
            variants={glitchVariant}
            initial="hidden"
            animate="visible"
            className="glitch-text text-lg md:text-2xl font-bold tracking-[0.2em] md:tracking-[0.4em] text-amber-glow/90 shadow-glow"
            data-text={line}
          >
            {line}
          </motion.h1>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: STORY.length * 1.5 + 1, duration: 1 }}
        className="absolute bottom-12 z-20 text-xs font-bold tracking-[0.3em] text-amber-glow/50 hover:text-amber-glow transition-colors animate-pulse"
        onClick={(e) => {
          e.stopPropagation();
          onComplete();
        }}
      >
        [ CLICK ANYWHERE TO INITIATE BOOT SEQUENCE ]
      </motion.button>
    </div>
  );
}
