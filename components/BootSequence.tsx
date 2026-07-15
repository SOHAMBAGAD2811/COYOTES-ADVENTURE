'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PixelButton from './PixelButton';
import LetterGlitch from './LetterGlitch';

interface BootSequenceProps {
  onBootComplete: () => void;
}

/* ─── tiny typewriter hook ─── */
function useTypewriter(text: string, active: boolean, charDelayMs = 35) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, charDelayMs);
    return () => clearInterval(id);
  }, [text, active, charDelayMs]);

  return { displayed, done };
}

/* ─── component ─── */
export default function BootSequence({ onBootComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState(0); // 0‑based: 0→title, 1→diag, 2→briefing, 3→engage
  const [exiting, setExiting] = useState(false);
  const [diagIndex, setDiagIndex] = useState(-1);
  const [briefIndex, setBriefIndex] = useState(-1);
  const audioCtx = useRef<AudioContext | null>(null);

  /* ── phase transitions ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* ── staggered diagnostic lines ── */
  const diagLines = [
    '> INITIALIZING ROVER TERMINAL...',
    '> SCANNING ATMOSPHERIC INTERFERENCE...',
    '> CALIBRATING FREQUENCY ARRAY...',
    '> THERMAL MANAGEMENT ONLINE...',
  ];
  useEffect(() => {
    if (phase < 1) return;
    let i = 0;
    const id = setInterval(() => {
      setDiagIndex(i);
      i++;
      if (i >= diagLines.length) clearInterval(id);
    }, 350);
    return () => clearInterval(id);
  }, [phase]);

  /* ── staggered briefing lines ── */
  const briefLines = [
    '⚠ CRITICAL ALERT',
    'SETTLEMENT WATER SYNTHESIZER: OFFLINE',
    'AEGIS CONVOY DETECTED — EN ROUTE TO OASIS CITY',
    'OBJECTIVE: INTERCEPT AND SIPHON WATER RESERVES',
    'TIME WINDOW: 4 MINUTES',
  ];
  useEffect(() => {
    if (phase < 2) return;
    let i = 0;
    const id = setInterval(() => {
      setBriefIndex(i);
      i++;
      if (i >= briefLines.length) clearInterval(id);
    }, 380);
    return () => clearInterval(id);
  }, [phase]);

  /* ── tiny blip sound (Web Audio) ── */
  const playBlip = useCallback(() => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      /* audio not available — silent fallback */
    }
  }, []);

  /* ── engage handler ── */
  const handleEngage = useCallback(() => {
    playBlip();
    setExiting(true);
    setTimeout(onBootComplete, 700);
  }, [onBootComplete, playBlip]);

  /* ── title typewriter ── */
  const titleText = 'AEGIS INTERCEPT PROTOCOL v4.7.2';
  const { displayed: titleDisplayed, done: titleDone } = useTypewriter(titleText, true, 40);

  /* ─── amber text-shadow helper ─── */
  const glow = (intensity = 0.5) =>
    `0 0 8px rgba(255,176,0,${intensity}), 0 0 20px rgba(255,176,0,${intensity * 0.4})`;

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="boot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.65, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black font-mono select-none overflow-hidden"
        >
          <LetterGlitch
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={false}
            smooth={false}
            glitchColors={["#ffb000", "#ff0055", "#00ff88"]}
            className="opacity-40 absolute inset-0 z-0 pointer-events-none"
          />

          {/* ── CRT scanlines ── */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(to bottom, rgba(0,255,60,0.03) 0px, rgba(0,255,60,0.03) 1px, transparent 1px, transparent 3px)',
            }}
          />

          {/* ── CRT grain overlay ── */}
          <div className="grain-overlay absolute inset-0 z-10 !opacity-[0.06]" />

          {/* ── vignette ── */}
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* ── Geometric Shapes ── */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, ease: "linear", repeat: Infinity }}
              className="absolute w-[800px] h-[800px] border border-amber-glow rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, ease: "linear", repeat: Infinity }}
              className="absolute w-[700px] h-[700px] border-2 border-amber-glow rounded-full opacity-50"
              style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
              className="absolute w-[600px] h-[600px] flex items-center justify-center"
            >
              <div className="absolute w-full h-full border border-amber-glow/30" />
              <div className="absolute w-full h-full border border-amber-glow/30 rotate-45" />
            </motion.div>
          </div>

          {/* ── content container ── */}
          <div className="relative z-20 flex w-full max-w-2xl flex-col gap-6 px-8">
            {/* ── Phase 0: Title ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <h1
                className="text-xl tracking-[0.3em] text-amber-glow sm:text-2xl"
                style={{ textShadow: glow(0.7) }}
              >
                {titleDisplayed}
                {!titleDone && (
                  <span className="ml-0.5 inline-block w-2.5 animate-pulse bg-amber-glow" style={{ height: '1.1em', verticalAlign: 'text-bottom' }}>
                    &nbsp;
                  </span>
                )}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-2 text-[10px] tracking-[0.4em] text-amber-glow"
              >
                KEPLER-88 · OUTPOST DESIGNATION: THE RUST
              </motion.p>
            </motion.div>

            {/* ── Phase 1: System diagnostics ── */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-1 text-[11px] tracking-wider sm:text-xs"
                >
                  {diagLines.map((line, i) => (
                    <DiagLine key={i} text={line} active={i <= diagIndex} delay={i * 0.15} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 2: Mission briefing ── */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="rounded border border-amber-glow/20 bg-amber-glow/[0.03] p-4"
                >
                  <div className="flex flex-col gap-1.5 text-[11px] tracking-wider sm:text-xs">
                    {briefLines.map((line, i) => (
                      <BriefLine
                        key={i}
                        text={line}
                        active={i <= briefIndex}
                        isAlert={i === 0}
                        delay={i * 0.12}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 3: Engage button ── */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="flex justify-center pt-2"
                >
                  <PixelButton
                    variant="coyote"
                    onClick={handleEngage}
                    className="engage-btn px-10 py-3 text-sm font-bold tracking-[0.35em] text-amber-glow"
                  >
                    ▶ PRESS TO ENGAGE
                  </PixelButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── bottom tag ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-6 z-20 text-[9px] tracking-[0.5em] text-amber-glow"
          >
            COYOTE SYSTEMS — UNAUTHORIZED ACCESS ONLY
          </motion.p>

          {/* ── keyframes injected inline ── */}
          <style jsx>{`
            @keyframes engage-pulse {
              0%,
              100% {
                box-shadow: 0 0 15px rgba(255, 176, 0, 0.15),
                  0 0 40px rgba(255, 176, 0, 0.08);
              }
              50% {
                box-shadow: 0 0 25px rgba(255, 176, 0, 0.35),
                  0 0 60px rgba(255, 176, 0, 0.15);
              }
            }
          `}</style>
        </motion.div>
      ) : (
        /* ── exit flash ── */
        <motion.div
          key="flash"
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] bg-amber-glow/10"
        />
      )}
    </AnimatePresence>
  );
}

/* ── Diagnostic line with typewriter ── */
function DiagLine({ text, active, delay }: { text: string; active: boolean; delay: number }) {
  const { displayed, done } = useTypewriter(text, active, 20);

  if (!active) return null;

  return (
    <motion.p
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 0.8, x: 0 }}
      transition={{ duration: 0.2, delay }}
      className="text-green-400/80"
      style={{ textShadow: '0 0 6px rgba(74,222,128,0.3)' }}
    >
      {displayed}
      {!done && (
        <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-green-400/60" />
      )}
    </motion.p>
  );
}

/* ── Briefing line with typewriter ── */
function BriefLine({
  text,
  active,
  isAlert,
  delay,
}: {
  text: string;
  active: boolean;
  isAlert: boolean;
  delay: number;
}) {
  const { displayed, done } = useTypewriter(text, active, 25);

  if (!active) return null;

  return (
    <motion.p
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay }}
      className={
        isAlert
          ? 'text-crimson-alert font-bold tracking-[0.3em] animate-pulse'
          : 'text-amber-glow/90'
      }
      style={{
        textShadow: isAlert
          ? '0 0 10px rgba(204,0,0,0.6)'
          : '0 0 6px rgba(255,176,0,0.3)',
      }}
    >
      {displayed}
      {!done && (
        <span
          className={`ml-0.5 inline-block h-3 w-1.5 animate-pulse ${
            isAlert ? 'bg-crimson-alert/60' : 'bg-amber-glow/60'
          }`}
        />
      )}
    </motion.p>
  );
}
