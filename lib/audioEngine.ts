'use client';

class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  activeOscillators: OscillatorNode[] = [];
  activeNoises: AudioBufferSourceNode[] = [];
  activeIntervals: NodeJS.Timeout[] = [];
  currentTrack: string | null = null;
  isMuted: boolean = false;
  volume: number = 0.4;
  listeners: Set<(state: { muted: boolean; volume: number }) => void> = new Set();

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);

    const unlock = () => {
      this.resume();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    this.notifyListeners();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(l => l({ muted: this.isMuted, volume: this.volume }));
  }

  subscribe(listener: (state: { muted: boolean; volume: number }) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stopAll() {
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch(e) {}
    });
    this.activeNoises.forEach(noise => {
      try { noise.stop(); noise.disconnect(); } catch(e) {}
    });
    this.activeIntervals.forEach(clearInterval);
    
    this.activeOscillators = [];
    this.activeNoises = [];
    this.activeIntervals = [];
    this.currentTrack = null;
  }

  createOscillator(type: OscillatorType, freq: number, dest: AudioNode = this.masterGain!) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.connect(dest);
    this.activeOscillators.push(osc);
    return osc;
  }

  createNoise(type: 'white' | 'pink', dest: AudioNode = this.masterGain!) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // (roughly) compensate for gain
        b6 = white * 0.115926;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.connect(dest);
    this.activeNoises.push(noise);
    return noise;
  }

  // Common track elements
  addDrone(freq: number, type: OscillatorType, lfoFreq: number, vol: number) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    gain.connect(this.masterGain!);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = lfoFreq;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = vol * 0.5;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    
    lfo.start();
    this.activeOscillators.push(lfo);

    const osc = this.createOscillator(type, freq, gain);
    if (osc) osc.start();
  }

  addArp(notes: number[], speedMs: number, type: OscillatorType, vol: number) {
    if (!this.ctx) return;
    let idx = 0;
    
    const playNote = () => {
      if (!this.ctx) return;
      const freq = notes[idx];
      idx = (idx + 1) % notes.length;
      
      const gain = this.ctx.createGain();
      gain.connect(this.masterGain!);
      
      const osc = this.ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      osc.connect(gain);
      
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (speedMs/1000) * 0.9);
      
      osc.start(now);
      osc.stop(now + speedMs/1000);
      
      setTimeout(() => {
        try { osc.disconnect(); } catch(e){}
      }, speedMs + 100);
    };

    playNote();
    const id = setInterval(playNote, speedMs);
    this.activeIntervals.push(id);
  }

  addNoiseSweep(type: 'white'|'pink', filterMin: number, filterMax: number, sweepTime: number, vol: number) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    gain.connect(this.masterGain!);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.5;
    filter.connect(gain);

    const noise = this.createNoise(type, filter);
    if (noise) noise.start();

    const now = this.ctx.currentTime;
    filter.frequency.setValueAtTime(filterMin, now);
    
    const sweep = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      filter.frequency.setValueAtTime(filterMin, t);
      filter.frequency.exponentialRampToValueAtTime(filterMax, t + sweepTime / 2);
      filter.frequency.exponentialRampToValueAtTime(filterMin, t + sweepTime);
    };

    sweep();
    const id = setInterval(sweep, sweepTime * 1000);
    this.activeIntervals.push(id);
  }

  addClockTick(speedMs: number, vol: number) {
    if (!this.ctx) return;
    const tick = () => {
      if (!this.ctx) return;
      const gain = this.ctx.createGain();
      gain.connect(this.masterGain!);
      
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 1200;
      osc.connect(gain);
      
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc.start(now);
      osc.stop(now + 0.05);
      
      setTimeout(() => {
        try { osc.disconnect(); } catch(e){}
      }, 100);
    };

    tick();
    const id = setInterval(tick, speedMs);
    this.activeIntervals.push(id);
  }

  // --- Track Presets ---
  
  playTrack(track: string) {
    if (!this.ctx) this.init();
    this.resume();
    
    if (this.currentTrack === track) return;
    this.stopAll();
    this.currentTrack = track;

    console.log(`[AudioEngine] Playing track: ${track}`);

    switch (track) {
      case 'intro':
        // Deep pulsing drone with some data crunches
        this.addDrone(55, 'triangle', 0.5, 0.15); // A1
        this.addDrone(110, 'sine', 0.2, 0.1); // A2
        this.addArp([880, 0, 1760, 0, 0, 440], 120, 'sine', 0.04);
        break;

      case 'power':
        // Deep power hum, high tension but smooth
        this.addDrone(65.41, 'triangle', 2, 0.15); // C2 slow pulse
        this.addDrone(130.81, 'sine', 4, 0.1); // C3 faster pulse
        this.addArp([261.63, 392.00, 311.13, 466.16], 300, 'sine', 0.06);
        break;

      case 'decryption':
        // Mysterious, echoing sine waves
        this.addDrone(73.42, 'sine', 0.1, 0.15); // D2
        this.addDrone(146.83, 'sine', 0.15, 0.1); // D3
        this.addArp([587.33, 880, 1174.66, 0, 880, 0], 350, 'sine', 0.08); // D5, A5, D6
        break;

      case 'thrusters':
        // Deep rumbling, fast arpeggiator
        this.addNoiseSweep('pink', 50, 400, 2, 0.2); // Engine rumble
        this.addDrone(41.20, 'triangle', 0.5, 0.15); // E1
        this.addArp([164.81, 196.00, 246.94, 196.00], 150, 'sine', 0.08); // E3 minor pentatonic
        break;

      case 'air':
        // White noise swooshes, airy pads
        this.addNoiseSweep('white', 400, 2000, 4, 0.08);
        this.addDrone(82.41, 'sine', 0.2, 0.15); // E2
        this.addDrone(123.47, 'sine', 0.25, 0.1); // B2
        this.addDrone(164.81, 'triangle', 0.1, 0.05); // E3
        break;

      case 'biosphere':
        // Bubbling sounds, smooth ethereal pads
        this.addDrone(65.41, 'sine', 0.1, 0.15); // C2
        this.addDrone(98.00, 'sine', 0.12, 0.1); // G2
        this.addNoiseSweep('pink', 200, 800, 1.5, 0.05); // Bubbling water illusion
        this.addArp([261.63, 329.63, 392.00, 523.25], 400, 'sine', 0.06); // C maj arp
        break;

      case 'firewall':
        // Aggressive alarms, but smoother tone
        this.addDrone(55, 'triangle', 4, 0.15); // A1 vibrating fast but not buzzing
        this.addArp([440, 466.16], 150, 'sine', 0.1); // A4, A#4 alarm
        this.addNoiseSweep('white', 1000, 3000, 0.5, 0.05); // Fast hi-hat like
        break;

      case 'riddle':
        // Tense clock-ticking, minimal drone
        this.addDrone(73.42, 'sine', 0.05, 0.15); // D2 very slow pulse
        this.addClockTick(1000, 0.05); // Tick every second
        this.addClockTick(500, 0.02); // Sub-ticks
        break;
        
      case 'success':
        // Triumphant chord
        this.addDrone(261.63, 'triangle', 0, 0.1); // C4
        this.addDrone(329.63, 'triangle', 0, 0.1); // E4
        this.addDrone(392.00, 'triangle', 0, 0.1); // G4
        setTimeout(() => this.stopAll(), 3000);
        break;
    }
  }
}

export const audio = new AudioEngine();
