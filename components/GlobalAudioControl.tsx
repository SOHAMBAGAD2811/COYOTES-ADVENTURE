'use client';

import { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audio } from '@/lib/audioEngine';

export default function GlobalAudioControl() {
  const [audioState, setAudioState] = useState({ muted: audio.isMuted, volume: audio.volume });
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return audio.subscribe(setAudioState);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
    >
      {isExpanded && (
        <div className="flex flex-col items-center gap-3 p-3 mb-2 bg-matte-panel/90 border border-amber-glow/40 rounded shadow-hardware-out backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioState.volume}
            onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
            className="w-24 accent-amber-glow cursor-pointer"
            style={{
              writingMode: 'horizontal-tb',
            }}
          />
          <div className="text-[10px] text-amber-glow/70 tracking-wider">
            VOL {Math.round(audioState.volume * 100)}%
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (isExpanded) {
            audio.toggleMute();
          } else {
            setIsExpanded(true);
          }
        }}
        onDoubleClick={() => audio.toggleMute()}
        title="Audio Controls (Double click to mute)"
        className="flex items-center justify-center w-10 h-10 rounded border border-amber-glow/40 bg-matte-panel/80 text-amber-glow shadow-hardware-out hover:bg-amber-glow/20 active:shadow-hardware-in transition-all backdrop-blur-sm cursor-pointer"
      >
        {audioState.muted || audioState.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
