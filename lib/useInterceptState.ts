'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type MissionStage = 
  | 'intercom_1' | 'firewall' 
  | 'intercom_2' | 'power' 
  | 'intercom_3' | 'water' 
  | 'intercom_4' | 'decryption' 
  | 'intercom_5' | 'air' 
  | 'intercom_6' | 'thruster'
  | 'intercom_7' | 'riddle'
  | 'intercom_7b' | 'biosphere' 
  | 'intercom_8' | 'earth' 
  | 'intercom_end' | 'story_end';
export type MissionStatus = 'active' | 'success' | 'failed';
export type BreachFlash = 'idle' | 'success' | 'fail';
export type LogEntry = {
  time: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
};

const MISSION_DURATION_MS = 6 * 60 * 1000; // extended to 6 minutes for 8 stages
const WATER_GOAL = 8;
const TUNE_LOCK_THRESHOLD = 6;
const HEAT_RISE_PER_TICK = 2.2;
const VENT_RELIEF = 55;
const SYSTEM_FAILURE_MS = 3200;
const SPOT_WIDTH_INITIAL = 18; // starting sweet spot width
const SPOT_WIDTH_MIN    = 5;  // minimum sweet spot width
function randomSweetSpot(width = SPOT_WIDTH_INITIAL) {
  const w = Math.max(SPOT_WIDTH_MIN, width);
  const start = Math.round(6 + Math.random() * (100 - 6 - w - 6));
  return { start, end: start + w };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function timestamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function useInterceptState() {
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState(76);
  const [coords, setCoords] = useState({ x: 2291, y: 847 });

  const [missionElapsed, setMissionElapsed] = useState(0);
  const [missionStatus, setMissionStatus] = useState<MissionStatus>('active');
  const [missionStage, setMissionStage] = useState<MissionStage>('intercom_1');

  const [currentFrequency, setCurrentFrequency] = useState(50);
  const [targetFrequency] = useState(() => Math.round(10 + Math.random() * 80));

  const [heat, setHeat] = useState(18);
  const [systemFailure, setSystemFailure] = useState(false);

  const [waterSiphoned, setWaterSiphoned] = useState(0);
  const [breachFlash, setBreachFlash] = useState<BreachFlash>('idle');
  const [breachAttempts, setBreachAttempts] = useState(0);
  const [sweetSpot, setSweetSpot] = useState(() => randomSweetSpot());

  const [storyComplete, setStoryComplete] = useState(false);
  const [booted, setBooted] = useState(false);
  const [missionLog, setMissionLog] = useState<LogEntry[]>([]);
  const [cameraShake, setCameraShake] = useState(false);
  const [terminalFlash, setTerminalFlash] = useState<'idle' | 'success' | 'fail'>('idle');

  const failureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const terminalFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasSignalLockedRef = useRef(false);
  const heatWarnedRef = useRef(false);
  const prevSystemFailureRef = useRef(false);

  const addLogEntry = useCallback(
    (message: string, type: LogEntry['type'] = 'info') => {
      setMissionLog((prev) => [...prev, { time: timestamp(), message, type }]);
    },
    []
  );

  const bootComplete = useCallback(() => {
    setBooted(true);
    setMissionLog((prev) => [
      ...prev,
      { time: timestamp(), message: 'SYSTEM ONLINE — INITIATING CONVOY SCAN', type: 'info' },
    ]);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!booted || missionStatus !== 'active' || missionStage.includes('intercom')) return;
    const t = setInterval(() => {
      setBattery((b) => Math.max(4, b - Math.random() * 0.4));
    }, 4000);
    return () => clearInterval(t);
  }, [booted, missionStatus, missionStage]);

  useEffect(() => {
    const t = setInterval(() => {
      setCoords((c) => ({
        x: c.x + Math.round((Math.random() - 0.5) * 4),
        y: c.y + Math.round((Math.random() - 0.5) * 4),
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!booted || missionStatus !== 'active' || missionStage.includes('intercom')) return;
    const t = setInterval(() => {
      setMissionElapsed((e) => Math.min(e + 1000, MISSION_DURATION_MS));
    }, 1000);
    return () => clearInterval(t);
  }, [booted, missionStatus, missionStage]);

  useEffect(() => {
    if (missionElapsed >= MISSION_DURATION_MS && missionStatus === 'active') {
      setMissionStatus('failed');
      addLogEntry('CONVOY REACHED OASIS CITY — MISSION FAILED', 'danger');
    }
  }, [missionElapsed, missionStatus, addLogEntry]);

  const triggerSystemFailure = useCallback(() => {
    setSystemFailure(true);
    addLogEntry('SYSTEM OVERLOAD — EMERGENCY COOLING ENGAGED', 'danger');
    if (failureTimeoutRef.current) clearTimeout(failureTimeoutRef.current);
    failureTimeoutRef.current = setTimeout(() => {
      setSystemFailure(false);
      setHeat(15);
    }, SYSTEM_FAILURE_MS);
  }, [addLogEntry]);

  useEffect(() => {
    if (prevSystemFailureRef.current && !systemFailure && booted) {
      addLogEntry('SYSTEM RESTORED — RESUMING OPERATIONS', 'success');
    }
    prevSystemFailureRef.current = systemFailure;
  }, [systemFailure, booted, addLogEntry]);

  useEffect(() => {
    if (!booted || missionStatus !== 'active' || systemFailure || missionStage.includes('intercom') || missionStage !== 'water') return;
    const t = setInterval(() => {
      setHeat((h) => Math.min(h + HEAT_RISE_PER_TICK, 100));
    }, 1000);
    return () => clearInterval(t);
  }, [booted, missionStatus, systemFailure, missionStage]);

  useEffect(() => {
    if (heat >= 100 && !systemFailure) {
      triggerSystemFailure();
    }
  }, [heat, systemFailure, triggerSystemFailure]);

  useEffect(() => {
    if (heat > 75 && !heatWarnedRef.current) {
      heatWarnedRef.current = true;
      addLogEntry('THERMAL WARNING — CORE TEMP CRITICAL', 'warning');
    }
    if (heat <= 75) {
      heatWarnedRef.current = false;
    }
  }, [heat, addLogEntry]);

  const ventCoolant = useCallback(() => {
    setHeat((h) => Math.max(0, h - VENT_RELIEF));
  }, []);

  const staticDelta = Math.abs(currentFrequency - targetFrequency);
  const signalLocked = staticDelta <= TUNE_LOCK_THRESHOLD;
  const staticOpacity = clamp(staticDelta / 90, 0.06, 0.92);

  useEffect(() => {
    if (!booted || missionStage !== 'water') return;
    if (signalLocked && !wasSignalLockedRef.current) {
      addLogEntry('CONVOY SIGNAL ACQUIRED — FREQUENCY LOCKED', 'success');
    }
    if (!signalLocked && wasSignalLockedRef.current) {
      addLogEntry('WARNING: SIGNAL LOST — RETUNE FREQUENCY', 'warning');
    }
    wasSignalLockedRef.current = signalLocked;
  }, [signalLocked, booted, addLogEntry, missionStage]);

  const attemptBreach = useCallback(
    (cursorPercent: number) => {
      if (missionStatus !== 'active' || systemFailure || !signalLocked || missionStage !== 'water') return;
      setBreachAttempts((n) => n + 1);
      const success = cursorPercent >= sweetSpot.start && cursorPercent <= sweetSpot.end;

      if (success) {
        // Shrink the window with each successful tank — forces more precision over time
        setWaterSiphoned((w) => {
          const next = w + 1;
          const newWidth = SPOT_WIDTH_INITIAL - next * 1.5; // shrinks by 1.5 per success
          setSweetSpot(randomSweetSpot(newWidth));
          addLogEntry(`WATER SIPHON SUCCESSFUL — TANK ${next}/${WATER_GOAL} [TARGET ZONE ${Math.round(Math.max(SPOT_WIDTH_MIN, newWidth))}% WIDE]`, 'success');
          return next;
        });
      } else {
        // On fail — keep same width but jump position
        const currentWidth = sweetSpot.end - sweetSpot.start;
        setSweetSpot(randomSweetSpot(currentWidth));
        setCameraShake(true);
        if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = setTimeout(() => setCameraShake(false), 500);
        addLogEntry('BREACH FAILED — TARGET ZONE RELOCATED', 'danger');
      }

      setBreachFlash(success ? 'success' : 'fail');
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = setTimeout(() => setBreachFlash('idle'), 700);

      setTerminalFlash(success ? 'success' : 'fail');
      if (terminalFlashTimeoutRef.current) clearTimeout(terminalFlashTimeoutRef.current);
      terminalFlashTimeoutRef.current = setTimeout(() => setTerminalFlash('idle'), 400);
    },
    [missionStatus, systemFailure, signalLocked, addLogEntry, missionStage, sweetSpot]
  );

  // Stage Progression logic
  useEffect(() => {
    if (waterSiphoned >= WATER_GOAL && missionStage === 'water' && missionStatus === 'active') {
      setMissionStage('intercom_4');
      addLogEntry('WATER SECURED — INCOMING TRANSMISSION', 'success');
    }
  }, [waterSiphoned, missionStage, missionStatus, addLogEntry]);

  const advanceStage = useCallback((next: MissionStage) => {
    setMissionStage(next);
  }, []);

  const completeFirewall = useCallback(() => {
    setMissionStage('intercom_2');
    addLogEntry('FIREWALL BYPASSED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completePower = useCallback(() => {
    setMissionStage('intercom_3');
    addLogEntry('POWER GRID STABILIZED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeDecryption = useCallback(() => {
    setMissionStage('intercom_5');
    addLogEntry('PAYLOAD DECRYPTED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeAirStage = useCallback(() => {
    setMissionStage('intercom_6');
    addLogEntry('AIR SCRUBBERS SECURED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeThruster = useCallback(() => {
    setMissionStage('intercom_7');
    addLogEntry('THRUSTERS ALIGNED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeRiddle = useCallback(() => {
    setMissionStage('intercom_7b');
    addLogEntry('CIPHER TEST PASSED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeBiosphere = useCallback(() => {
    setMissionStage('intercom_8');
    addLogEntry('BIOSPHERE INITIALIZED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const completeEarthStage = useCallback(() => {
    setMissionStage('intercom_end');
    addLogEntry('BIOMASS SYNTHESIZED — INCOMING TRANSMISSION', 'success');
  }, [addLogEntry]);

  const finishMission = useCallback(() => {
    setMissionStage('story_end');
    addLogEntry('MISSION COMPLETE — ALL SYSTEMS RESTORED', 'success');
  }, [addLogEntry]);

  const finalComplete = useCallback(() => {
    setMissionStatus('success');
  }, []);

  const restart = useCallback(() => {
    setMissionElapsed(0);
    setMissionStatus('active');
    setMissionStage('intercom_1');
    setHeat(18);
    setSystemFailure(false);
    setWaterSiphoned(0);
    setBreachAttempts(0);
    setSweetSpot(randomSweetSpot());
    setBattery(76);
    setMissionLog([]);
    setCameraShake(false);
    setTerminalFlash('idle');
    wasSignalLockedRef.current = false;
    heatWarnedRef.current = false;
    prevSystemFailureRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      if (failureTimeoutRef.current) clearTimeout(failureTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (terminalFlashTimeoutRef.current) clearTimeout(terminalFlashTimeoutRef.current);
    };
  }, []);

  return {
    time, battery, coords, missionElapsed, missionDuration: MISSION_DURATION_MS, missionStatus,
    currentFrequency, setCurrentFrequency, targetFrequency, staticOpacity, signalLocked,
    heat, systemFailure, ventCoolant, waterSiphoned, waterGoal: WATER_GOAL,
    breachFlash, breachAttempts, attemptBreach, sweetSpot, restart,
    booted, bootComplete, storyComplete, setStoryComplete,
    missionLog, addLogEntry, cameraShake, terminalFlash,
    missionStage, advanceStage,
    completeFirewall, completePower, completeDecryption, completeAirStage,
    completeThruster, completeRiddle, completeBiosphere, completeEarthStage,
    finishMission, finalComplete,
  };
}

