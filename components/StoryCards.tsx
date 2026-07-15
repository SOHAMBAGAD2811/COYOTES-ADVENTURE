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
      delay: i * 1.5, // Faster pacing: 1.5s per line
      duration: 0.6,
      ease: 'linear'
    }
  })
};

export default function StoryCards({ onComplete }: Props) {
  const [stars, setStars] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      size: number;
      delay: number;
      duration: number;
    }>
  >([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        delay: Math.random() * 3,
        duration: Math.random() * 3 + 2,
      }))
    );

    const timeouts: NodeJS.Timeout[] = [];
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      STORY.forEach((line, i) => {
        const t = setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(line);
          utterance.rate = 0.9;
          utterance.pitch = 0.7;
          window.speechSynthesis.speak(utterance);
        }, i * 1500 + 200); // 200ms initial buffer, 1500ms stagger matching animation
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
      
      {/* Glowing Stars Background */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-60">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.1, 1, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

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
