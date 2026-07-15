'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useInterceptState } from '@/lib/useInterceptState';
import BootSequence from '@/components/BootSequence';
import TopBar from '@/components/TopBar';
import TopographicalScanner from '@/components/TopographicalScanner';
import HeatTelemetry from '@/components/HeatTelemetry';
import FrequencySlider from '@/components/FrequencySlider';
import OverdriveBreach from '@/components/OverdriveBreach';
import MissionLog from '@/components/MissionLog';
import EvolutionSlot from '@/components/EvolutionSlot';
import IntercomDialogueGeneric from '@/components/IntercomDialogueGeneric';
import StoryCardsEnd from '@/components/StoryCardsEnd';
import AirStage from '@/components/AirStage';
import EarthStage from '@/components/EarthStage';
import StoryCards from '@/components/StoryCards';
import FirewallStage from '@/components/FirewallStage';
import PowerGridStage from '@/components/PowerGridStage';
import DecryptionStage from '@/components/DecryptionStage';
import ThrusterStage from '@/components/ThrusterStage';
import BiosphereStage from '@/components/BiosphereStage';
import RiddleStage from '@/components/RiddleStage';
import TargetCursor from '@/components/TargetCursor';

const panelVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.15 + 0.3, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function Home() {
  const s = useInterceptState();
  const [hypoxia, setHypoxia] = useState(false);
  const progress = Math.min(1, s.missionElapsed / s.missionDuration);
  const breachDisabled = !s.signalLocked || s.systemFailure || s.missionStatus !== 'active';
  const missionSeconds = Math.max(0, Math.ceil((s.missionDuration - s.missionElapsed) / 1000));
  const missionMin = Math.floor(missionSeconds / 60);
  const missionSec = missionSeconds % 60;

  // Background Music Manager
  useEffect(() => {
    let track = 'intro';
    if (s.missionStatus === 'success') {
      track = 'success';
    } else if (s.missionStatus === 'fail') {
      track = 'intro';
    } else if (s.missionStage === 'firewall') {
      track = 'firewall';
    } else if (s.missionStage === 'power') {
      track = 'power';
    } else if (s.missionStage === 'decryption') {
      track = 'decryption';
    } else if (s.missionStage === 'thruster') {
      track = 'thrusters';
    } else if (s.missionStage === 'air') {
      track = 'air';
    } else if (s.missionStage === 'biosphere' || s.missionStage === 'earth') {
      track = 'biosphere';
    } else if (s.missionStage === 'riddle') {
      track = 'riddle';
    } else if (s.missionStage === 'water') {
      track = 'intro';
    } else if (s.missionStage.includes('intercom')) {
      track = 'intro'; // calm down during dialogue
    }

    // Dynamic import to avoid SSR issues if audio relies on window
    import('@/lib/audioEngine').then(({ audio }) => {
      audio.playTrack(track);
    });
  }, [s.missionStage, s.missionStatus, s.storyComplete, s.booted]);

  // Ambient dust particles
  const dustParticles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: `${5 + Math.random() * 90}%`,
        duration: `${10 + Math.random() * 15}s`,
        delay: `${Math.random() * 8}s`,
      })),
    []
  );

  // Story sequence
  if (!s.storyComplete) {
    return <StoryCards onComplete={() => s.setStoryComplete(true)} />;
  }

  // Boot sequence overlay
  if (!s.booted) {
    return <BootSequence onBootComplete={s.bootComplete} />;
  }

  return (
    <main
      className={`relative flex h-screen w-screen flex-col overflow-hidden bg-matte-base screen-flicker ${
        s.cameraShake ? 'camera-shake' : ''
      } transition-[filter] duration-700 ${hypoxia ? 'grayscale blur-[1px]' : ''}`}
    >
      <TargetCursor 
        targetSelector="button, a, [role='button'], .cursor-pointer, input[type='range']"
        cursorColor="#ffb000"
        cursorColorOnTarget="#00ff88"
        spinDuration={3}
      />
      {/* CRT overlays */}
      <div className="grain-overlay" />
      <div className="crt-overlay" />
      <div className="scan-line-anim" />

      {/* Terminal flash on breach */}
      <AnimatePresence>
        {s.terminalFlash === 'success' && (
          <motion.div
            key="flash-s"
            className="flash-success"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
        {s.terminalFlash === 'fail' && (
          <motion.div
            key="flash-f"
            className="flash-fail"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Ambient dust particles */}
      {dustParticles.map((p) => (
        <div
          key={p.id}
          className="dust-particle"
          style={
            {
              '--dust-x': p.x,
              '--dust-duration': p.duration,
              '--dust-delay': p.delay,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <TopBar time={s.time} battery={s.battery} coords={s.coords} />
      </motion.div>

      {/* Dynamic Main dashboard based on Stage */}
      {s.missionStage === 'intercom_1' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('firewall')} message="COYOTE, THE CONVOY IS PROTECTED BY AN AEGIS FIREWALL. WE NEED TO BYPASS IT TO ACCESS THEIR SYSTEMS. LOCK THE NODES WHEN THEY ALIGN." buttonText="COMMENCE HACK" />
      )}

      {s.missionStage === 'intercom_2' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('power')} message="FIREWALL DOWN. GOOD. NOW WE MUST DIVERT THEIR POWER GRID SO THEY DON'T DETECT OUR INCURSION. BALANCE THE LOAD ACROSS THEIR SYSTEMS." buttonText="STABILIZE GRID" />
      )}

      {s.missionStage === 'intercom_3' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('water')} message="WE'RE IN. FIND THE WATER RESERVES. TUNE INTO THEIR FREQUENCY AND SIPHON THE COOLANT. WATCH OUT FOR OVERHEATING." buttonText="SIPHON WATER" />
      )}

      {s.missionStage === 'intercom_4' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('decryption')} message="WATER SECURED. WE FOUND ENCRYPTED DATA. DECRYPT THE SEQUENCE TO REVEAL THEIR SHIPPING MANIFEST. REPEAT THE PATTERN." buttonText="DECRYPT DATA" />
      )}

      {s.missionStage === 'intercom_5' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('air')} message="WE HAVE THE MANIFEST. NOW ACCESS THEIR LIFE SUPPORT. THE OXYGEN SCRUBBERS ARE MALFUNCTIONING. CALIBRATE THE VALVES TO PURIFY THE AIR." buttonText="PURIFY AIR" />
      )}

      {s.missionStage === 'intercom_6' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('thruster')} message="AIR PURIFIED. THEY'RE ALTERING COURSE THROUGH A DEBRIS FIELD. OVERRIDE THEIR THRUSTERS AND KEEP THE SHIP STABLE." buttonText="CALIBRATE THRUSTERS" />
      )}

      {s.missionStage === 'intercom_7' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('riddle')} message="AIR PURIFIED. THRUSTERS ALIGNED. SENTINEL IS RUNNING INTELLIGENCE VERIFICATION. PROVE YOUR WORTH, COYOTE." buttonText="BEGIN CIPHER TEST" />
      )}

      {s.missionStage === 'intercom_7b' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('biosphere')} message="WE SURVIVED THE DEBRIS. WE NEED TO PREPARE THE SEEDS. INITIALIZE THE BIOSPHERE BY MATCHING THE SOIL AND WATER PH LEVELS." buttonText="INITIALIZE BIOSPHERE" />
      )}

      {s.missionStage === 'intercom_8' && (
        <IntercomDialogueGeneric onProceed={() => s.advanceStage('earth')} message="THE BIOSPHERE IS READY. INITIATE THE SYNTHESIZER TO GROW THE BIOMASS. KEEP THE TEMPERATURE STABLE." buttonText="SYNTHESIZE BIOMASS" />
      )}

      {s.missionStage === 'intercom_end' && (
        <IntercomDialogueGeneric onProceed={s.finishMission} message="ALL SYSTEMS SECURED. OASIS CITY WILL SURVIVE. EXCELLENT WORK, COYOTE. INITIATING SHUTDOWN SEQUENCE." buttonText="COMPLETE MISSION" />
      )}

      {s.missionStage === 'story_end' && (
        <StoryCardsEnd onComplete={s.finalComplete} />
      )}

      {s.missionStage === 'firewall' ? (
        <div className="flex-1">
          <FirewallStage onSuccess={s.completeFirewall} />
        </div>
      ) : s.missionStage === 'power' ? (
        <div className="flex-1">
          <PowerGridStage onSuccess={s.completePower} />
        </div>
      ) : s.missionStage === 'decryption' ? (
        <div className="flex-1">
          <DecryptionStage onSuccess={s.completeDecryption} />
        </div>
      ) : s.missionStage === 'thruster' ? (
        <div className="flex-1">
          <ThrusterStage onSuccess={s.completeThruster} />
        </div>
      ) : s.missionStage === 'riddle' ? (
        <div className="flex-1">
          <RiddleStage onSuccess={s.completeRiddle} />
        </div>
      ) : s.missionStage === 'biosphere' ? (
        <div className="flex-1">
          <BiosphereStage onSuccess={s.completeBiosphere} />
        </div>
      ) : s.missionStage === 'earth' ? (
        <div className="flex-1">
          <EarthStage onSuccess={s.completeEarthStage} />
        </div>
      ) : s.missionStage === 'air' ? (
        <div className="flex-1">
          <AirStage onSuccess={s.completeAirStage} setHypoxia={setHypoxia} />
        </div>
      ) : s.missionStage === 'water' ? (
        <div
          className="grid min-h-0 flex-1 gap-3 p-3"
          style={{ gridTemplateColumns: '260px 1fr 280px' }}
        >
          {/* ── LEFT COLUMN: Heat + Mission Log ── */}
        <motion.div
          className="flex min-h-0 flex-col gap-3"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={panelVariants}
        >
          {/* Heat Telemetry */}
          <div
            className={`rounded-lg border bg-matte-panel/60 p-4 shadow-hardware-out transition-colors ${
              s.systemFailure ? 'border-crimson-alert/50' : 'border-amber-glow/15'
            }`}
          >
            <HeatTelemetry heat={s.heat} systemFailure={s.systemFailure} onVent={s.ventCoolant} />
          </div>

          {/* Mission Log */}
          <div className="min-h-0 flex-1 rounded-lg border border-amber-glow/15 bg-matte-panel/60 p-3 shadow-hardware-out">
            <MissionLog entries={s.missionLog} />
          </div>
        </motion.div>

        {/* ── CENTER: Scanner ── */}
        <motion.div
          className={`min-h-0 overflow-hidden rounded-lg border border-amber-glow/15 shadow-hardware-out ${
            s.systemFailure ? 'system-blur' : ''
          }`}
          custom={1}
          initial="hidden"
          animate="visible"
          variants={panelVariants}
        >
          <TopographicalScanner
            staticOpacity={s.staticOpacity}
            signalLocked={s.signalLocked}
            progress={progress}
            missionStatus={s.missionStatus}
          />
        </motion.div>

        {/* ── RIGHT COLUMN: Frequency + Breach ── */}
        <motion.div
          className="flex min-h-0 flex-col gap-3"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={panelVariants}
        >
          {/* Frequency Tuner */}
          <div className="rounded-lg border border-amber-glow/15 bg-matte-panel/60 p-4 shadow-hardware-out">
            <FrequencySlider
              value={s.currentFrequency}
              onChange={s.setCurrentFrequency}
              locked={s.signalLocked}
              targetFrequency={s.targetFrequency}
            />
          </div>

          {/* Overdrive Breach */}
          <div className="flex-1 rounded-lg border border-amber-glow/15 bg-matte-panel/60 p-4 shadow-hardware-out">
            <OverdriveBreach
              onAttempt={s.attemptBreach}
              flash={s.breachFlash}
              waterSiphoned={s.waterSiphoned}
              waterGoal={s.waterGoal}
              disabled={breachDisabled}
              sweetSpot={s.sweetSpot}
              breachAttempts={s.breachAttempts}
            />
          </div>
        </motion.div>
        </div>
      ) : null}

      {/* ── BOTTOM BAR: Mission Progress + Evolution Slot ── */}
      <motion.div
        className="flex-shrink-0 px-3 pb-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Convoy Progress Bar */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-[9px] tracking-wider text-amber-glow/50">CONVOY PROGRESS</span>
          <div className="mission-progress-bar flex-1">
            <div
              className="mission-progress-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span
            className={`text-[11px] font-bold tracking-wider tabular-nums ${
              missionSeconds < 60 ? 'text-crimson-alert animate-pulse' : 'text-amber-glow'
            }`}
            style={
              missionSeconds < 60
                ? { textShadow: '0 0 8px rgba(204,0,0,0.5)' }
                : { textShadow: '0 0 6px rgba(255,176,0,0.3)' }
            }
          >
            {String(missionMin).padStart(2, '0')}:{String(missionSec).padStart(2, '0')}
          </span>
        </div>

        {/* Evolution Slot */}
        <div className="h-14">
          <EvolutionSlot />
        </div>
      </motion.div>

      {/* ── MISSION END OVERLAY ── */}
      <AnimatePresence>
        {s.missionStatus !== 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
              className="px-6 text-center"
            >
              <p
                className={`glitch-text text-2xl font-bold tracking-[0.3em] ${
                  s.missionStatus === 'success' ? 'text-[#00ff88]' : 'text-crimson-alert'
                }`}
                data-text={
                  s.missionStatus === 'success'
                    ? 'ENVIRONMENT RESTORED'
                    : 'MISSION FAILED'
                }
                style={{
                  textShadow:
                    s.missionStatus === 'success'
                      ? '0 0 16px rgba(0,255,136,0.6)'
                      : '0 0 16px rgba(204,0,0,0.6)',
                }}
              >
                {s.missionStatus === 'success'
                  ? 'ENVIRONMENT RESTORED'
                  : 'MISSION FAILED'}
              </p>
              <p className="mt-2 text-xs tracking-widest text-amber-glow/50">
                {s.missionStatus === 'success'
                  ? 'MISSION COMPLETE — THE SETTLEMENT SURVIVES'
                  : 'MISSION FAILED — TRY AGAIN, COYOTE'}
              </p>

              {/* Mission Stats */}
              <div className="mt-4 flex justify-center gap-6 text-[10px] tracking-wider">
                <span className="text-amber-glow/60">
                  WATER: <span className="text-amber-glow font-bold">{s.waterSiphoned}/{s.waterGoal}</span>
                </span>
                <span className="text-amber-glow/60">
                  ATTEMPTS: <span className="text-amber-glow font-bold">{s.breachAttempts}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={s.restart}
                className="mt-6 rounded-md border border-amber-glow/40 px-5 py-2 text-xs tracking-widest text-amber-glow shadow-hardware-out transition-all hover:bg-amber-glow/10 active:shadow-hardware-in engage-pulse"
              >
                RESTART MISSION
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
