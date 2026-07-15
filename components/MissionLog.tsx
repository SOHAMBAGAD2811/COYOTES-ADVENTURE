'use client';

import { useEffect, useRef } from 'react';
import { ScrollText } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import type { LogEntry } from '@/lib/useInterceptState';

interface MissionLogProps {
  entries: LogEntry[]; // LogEntry = { time: string; message: string; type: 'info' | 'warning' | 'success' | 'danger' }
}

const TYPE_COLORS: Record<LogEntry['type'], { dot: string; text: string; glow: string }> = {
  info:    { dot: '#ffb000', text: 'text-amber-glow',        glow: 'rgba(255,176,0,0.25)' },
  warning: { dot: '#ffd000', text: 'text-[#ffd000]',         glow: 'rgba(255,208,0,0.25)' },
  success: { dot: '#00ff88', text: 'text-[#00ff88]',         glow: 'rgba(0,255,136,0.25)' },
  danger:  { dot: '#cc0000', text: 'text-crimson-alert',     glow: 'rgba(204,0,0,0.3)' },
};

export default function MissionLog({ entries }: MissionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[10px] tracking-wider">
        <ScrollText
          size={12}
          className="text-amber-glow"
          style={{ filter: 'drop-shadow(0 0 3px rgba(255,176,0,0.5))' }}
        />
        <span
          className="font-bold text-amber-glow"
          style={{ textShadow: '0 0 6px rgba(255,176,0,0.4)' }}
        >
          MISSION LOG
        </span>
        <span className="ml-auto text-[9px] text-amber-glow/30 tabular-nums">
          [{entries.length} ENTRIES]
        </span>
      </div>

      {/* Scrollable log area */}
      <div
        ref={scrollRef}
        className="mission-log-scroll flex-1 overflow-y-auto rounded border border-amber-glow/10 bg-black/40 shadow-hardware-in"
        style={{ maxHeight: '100%' }}
      >
        {entries.length === 0 ? (
          /* Empty state */
          <div className="flex h-full min-h-[60px] items-center justify-center">
            <span
              className="animate-pulse text-[9px] tracking-[0.25em] text-amber-glow/25"
              style={{ textShadow: '0 0 8px rgba(255,176,0,0.15)' }}
            >
              AWAITING TRANSMISSION...
            </span>
          </div>
        ) : (
          <div className="p-1.5">
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => {
                const colors = TYPE_COLORS[entry.type];
                return (
                  <motion.div
                    key={`${entry.time}-${i}`}
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: 'easeOut',
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-2 border-b border-amber-glow/[0.06] px-1.5 py-[3px]"
                      style={{
                        textShadow: `0 0 4px ${colors.glow}`,
                      }}
                    >
                      {/* Timestamp */}
                      <span className="flex-shrink-0 text-[9px] tabular-nums text-amber-glow/35 leading-[14px]">
                        {entry.time}
                      </span>

                      {/* Type indicator dot */}
                      <span
                        className="mt-[4px] flex-shrink-0 h-[5px] w-[5px] rounded-full"
                        style={{
                          backgroundColor: colors.dot,
                          boxShadow: `0 0 4px ${colors.dot}, 0 0 8px ${colors.glow}`,
                        }}
                      />

                      {/* Message */}
                      <span className={`text-[9px] leading-[14px] ${colors.text}`}>
                        {entry.message}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Inline scrollbar styles */}
      <style jsx global>{`
        .mission-log-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .mission-log-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }
        .mission-log-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 176, 0, 0.2);
          border-radius: 2px;
        }
        .mission-log-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 176, 0, 0.4);
        }
        .mission-log-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 176, 0, 0.2) rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
