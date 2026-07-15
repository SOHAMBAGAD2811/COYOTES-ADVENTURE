'use client';

// Map of tracks to test MP3s (using SoundHelix public test mp3s for ambient/normal songs)
const TRACKS = {
  intro: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  power: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  decryption: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  thrusters: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  air: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  biosphere: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  firewall: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  riddle: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  success: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
};

class AudioEngine {
  currentTrack: string | null = null;
  isMuted: boolean = false;
  volume: number = 0.4;
  listeners: Set<(state: { muted: boolean; volume: number }) => void> = new Set();
  
  audioElement: HTMLAudioElement | null = null;

  init() {
    if (this.audioElement || typeof window === 'undefined') return;
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    this.notifyListeners();
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.audioElement) {
      this.audioElement.volume = this.volume;
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
    if (this.audioElement && this.audioElement.paused && this.audioElement.src) {
      this.audioElement.play().catch(() => {});
    }
  }

  stopAll() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.currentTrack = null;
  }

  playTrack(track: keyof typeof TRACKS | string) {
    this.init();
    if (!this.audioElement) return;

    if (this.currentTrack === track) return;
    this.currentTrack = track;

    console.log(`[AudioEngine] Playing MP3 track: ${track}`);

    const src = TRACKS[track as keyof typeof TRACKS] || TRACKS.intro;
    this.audioElement.src = src;
    
    // Some tracks like success shouldn't loop forever
    this.audioElement.loop = track !== 'success';

    this.audioElement.play().catch(e => {
       console.warn('Audio play blocked:', e);
    });
  }
}

export const audio = new AudioEngine();
