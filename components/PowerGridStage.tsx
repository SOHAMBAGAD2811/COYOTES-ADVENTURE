'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';
import FuzzyText from './FuzzyText';

interface Props {
  onSuccess: () => void;
}

const WIRE_COLORS = [
  { id: 'red',    label: 'R', color: '#ff2244', glow: 'rgba(255,34,68,0.8)' },
  { id: 'cyan',   label: 'C', color: '#00e5ff', glow: 'rgba(0,229,255,0.8)' },
  { id: 'yellow', label: 'Y', color: '#ffe600', glow: 'rgba(255,230,0,0.8)' },
  { id: 'green',  label: 'G', color: '#00ff88', glow: 'rgba(0,255,136,0.8)' },
  { id: 'purple', label: 'P', color: '#cc44ff', glow: 'rgba(204,68,255,0.8)' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CONTAINER_W = 700;
const CONTAINER_H = 440;
const LEFT_X = 80;
const RIGHT_X = CONTAINER_W - 80;

function getPlugY(index: number, total: number) {
  const spacing = CONTAINER_H / (total + 1);
  return spacing * (index + 1);
}

export default function PowerGridStage({ onSuccess }: Props) {
  const [rightOrder] = useState(() => shuffle(WIRE_COLORS));
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [errorId, setErrorId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Build lookup: wireId -> rightIndex
  const rightIndexOf = useCallback((id: string) => {
    return rightOrder.findIndex(w => w.id === id);
  }, [rightOrder]);

  const getContainerMouse = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = CONTAINER_W / rect.width;
    const scaleY = CONTAINER_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Global mousemove / mouseup
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setMouse(getContainerMouse(e));
    };

    const onUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      const { x, y } = getContainerMouse(e);
      const currentDragging = dragging;
      if (!currentDragging) { setDragging(null); return; }

      // Check if near any right socket
      let hit = false;
      for (let i = 0; i < rightOrder.length; i++) {
        const target = rightOrder[i];
        const ty = getPlugY(i, WIRE_COLORS.length);
        const dist = Math.hypot(x - RIGHT_X, y - ty);
        if (dist < 32) {
          hit = true;
          if (target.id === currentDragging) {
            // Correct!
            setSuccessId(currentDragging);
            setTimeout(() => setSuccessId(null), 600);
            setConnected(prev => {
              const next = { ...prev, [currentDragging]: true };
              if (Object.keys(next).length === WIRE_COLORS.length) {
                setTimeout(onSuccess, 800);
              }
              return next;
            });
          } else {
            // Wrong
            setErrorId(currentDragging);
            setTimeout(() => setErrorId(null), 500);
          }
          break;
        }
      }
      // If no socket hit, just cancel
      setDragging(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, rightOrder, getContainerMouse, onSuccess]);

  const startDrag = (wireId: string, e: React.MouseEvent) => {
    if (connected[wireId]) return;
    e.preventDefault();
    isDragging.current = true;
    setDragging(wireId);
    setMouse(getContainerMouse(e));
  };

  const completedCount = Object.keys(connected).length;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 select-none">
      {/* Header */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#ffb000]">
          <Zap size={22} /> 
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.6} color="#ffb000" fontSize="1.5rem" fontWeight="bold">
            POWER GRID REWIRING
          </FuzzyText>
        </h2>
        <p className="text-xs tracking-widest text-[#ffb000]/60">
          DRAG EACH WIRE TO ITS MATCHING SOCKET — {completedCount}/{WIRE_COLORS.length} CIRCUITS CLOSED
        </p>
      </div>

      {/* Game canvas */}
      <svg
        ref={containerRef}
        viewBox={`0 0 ${CONTAINER_W} ${CONTAINER_H}`}
        className="w-full max-w-3xl rounded-lg border border-[#ffb000]/20 bg-black/60"
        style={{
          maxHeight: '440px',
          cursor: dragging ? 'crosshair' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,176,0,0.04)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={CONTAINER_W} height={CONTAINER_H} fill="url(#grid)" />

        {/* Center panel decoration */}
        <rect x={CONTAINER_W/2 - 60} y={CONTAINER_H/2 - 60} width={120} height={120}
          rx="8" fill="rgba(0,0,0,0.8)" stroke="rgba(255,176,0,0.15)" strokeWidth="1.5"/>
        <text x={CONTAINER_W/2} y={CONTAINER_H/2 - 16} textAnchor="middle"
          fill="rgba(255,176,0,0.3)" fontSize="9" fontFamily="monospace" letterSpacing="2">POWER</text>
        <text x={CONTAINER_W/2} y={CONTAINER_H/2 - 4} textAnchor="middle"
          fill="rgba(255,176,0,0.3)" fontSize="9" fontFamily="monospace" letterSpacing="2">DIST</text>
        <text x={CONTAINER_W/2} y={CONTAINER_H/2 + 10} textAnchor="middle"
          fill="rgba(255,176,0,0.3)" fontSize="9" fontFamily="monospace" letterSpacing="2">UNIT</text>
        <text x={CONTAINER_W/2} y={CONTAINER_H/2 + 34} textAnchor="middle"
          fill="rgba(255,176,0,0.5)" fontSize="22" fontFamily="monospace" fontWeight="bold">
          {completedCount}/{WIRE_COLORS.length}
        </text>

        {/* Panel labels */}
        <text x={LEFT_X} y={28} textAnchor="middle" fill="rgba(255,176,0,0.35)"
          fontSize="10" fontFamily="monospace" letterSpacing="3">SOURCE</text>
        <text x={RIGHT_X} y={28} textAnchor="middle" fill="rgba(255,176,0,0.35)"
          fontSize="10" fontFamily="monospace" letterSpacing="3">TARGET</text>

        {/* Wires: Connected wires (drawn below plugs) */}
        {WIRE_COLORS.map((w, li) => {
          if (!connected[w.id]) return null;
          const ly = getPlugY(li, WIRE_COLORS.length);
          const ri = rightIndexOf(w.id);
          const ry = getPlugY(ri, WIRE_COLORS.length);

          return (
            <g key={`line-${w.id}`}>
              {/* Glow */}
              <path
                d={`M ${LEFT_X + 20} ${ly} C ${CONTAINER_W/2} ${ly}, ${CONTAINER_W/2} ${ry}, ${RIGHT_X - 20} ${ry}`}
                stroke={w.color} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.18"
              />
              {/* Main */}
              <path
                d={`M ${LEFT_X + 20} ${ly} C ${CONTAINER_W/2} ${ly}, ${CONTAINER_W/2} ${ry}, ${RIGHT_X - 20} ${ry}`}
                stroke={w.color} strokeWidth="4.5" fill="none" strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 5px ${w.glow})` }}
              />
            </g>
          );
        })}

        {/* Active drag wire */}
        {dragging && (() => {
          const li = WIRE_COLORS.findIndex(w => w.id === dragging);
          const w = WIRE_COLORS[li];
          const ly = getPlugY(li, WIRE_COLORS.length);
          const mx = mouse.x;
          const my = mouse.y;
          const cpx = (LEFT_X + 20 + mx) / 2;
          return (
            <g>
              <path
                d={`M ${LEFT_X + 20} ${ly} C ${cpx} ${ly}, ${cpx} ${my}, ${mx} ${my}`}
                stroke={w.color} strokeWidth="12" fill="none" strokeLinecap="round" opacity="0.2"
              />
              <path
                d={`M ${LEFT_X + 20} ${ly} C ${cpx} ${ly}, ${cpx} ${my}, ${mx} ${my}`}
                stroke={w.color} strokeWidth="4.5" fill="none" strokeLinecap="round"
                strokeDasharray="12 4"
                style={{ filter: `drop-shadow(0 0 8px ${w.glow})` }}
              />
              {/* cursor dot */}
              <circle cx={mx} cy={my} r="9" fill={w.color}
                style={{ filter: `drop-shadow(0 0 10px ${w.glow})` }} />
            </g>
          );
        })()}

        {/* Left plugs */}
        {WIRE_COLORS.map((w, i) => {
          const y = getPlugY(i, WIRE_COLORS.length);
          const done = connected[w.id];
          const isError = errorId === w.id;
          const isSuccess = successId === w.id;

          return (
            <g key={`left-${w.id}`}
              onMouseDown={e => startDrag(w.id, e)}
              style={{ cursor: done ? 'not-allowed' : 'grab' }}>
              {/* Stub line */}
              <line x1={LEFT_X + 20} y1={y} x2={LEFT_X + 52} y2={y}
                stroke={w.color} strokeWidth="4" strokeLinecap="round"
                opacity={done ? 0.35 : 0.8}/>
              {/* Glow ring when hovered/active */}
              {!done && (
                <circle cx={LEFT_X} cy={y} r="20" fill="transparent"
                  stroke={w.color} strokeWidth="1" opacity="0.25"/>
              )}
              {/* Main plug circle */}
              <circle cx={LEFT_X} cy={y} r="18"
                fill={done ? `${w.color}22` : isError ? '#ff000033' : `${w.color}18`}
                stroke={isError ? '#ff0000' : w.color}
                strokeWidth={done ? "2" : "2.5"}
                opacity={done ? 0.5 : 1}
                style={done ? undefined : { filter: `drop-shadow(0 0 6px ${w.glow})` }}
              />
              {/* Label */}
              <text x={LEFT_X} y={y + 5} textAnchor="middle"
                fill={done ? w.color : isError ? '#ff0000' : w.color}
                fontSize="13" fontFamily="monospace" fontWeight="bold"
                opacity={done ? 0.5 : 1}>
                {done ? '✓' : w.label}
              </text>
            </g>
          );
        })}

        {/* Right sockets */}
        {rightOrder.map((w, i) => {
          const y = getPlugY(i, WIRE_COLORS.length);
          const done = connected[w.id];
          const isSuccess = successId === w.id;

          return (
            <g key={`right-${w.id}`}>
              {/* Stub line */}
              <line x1={RIGHT_X - 52} y1={y} x2={RIGHT_X - 20} y2={y}
                stroke={w.color} strokeWidth="4" strokeLinecap="round"
                opacity={done ? 0.35 : 0.8}/>
              {/* Socket - octagon look via two rects */}
              <rect x={RIGHT_X - 16} y={y - 16} width="32" height="32" rx="6"
                fill={done ? `${w.color}33` : `${w.color}0d`}
                stroke={w.color}
                strokeWidth={done ? "2.5" : "2"}
                style={done ? { filter: `drop-shadow(0 0 10px ${w.glow})` } : undefined}
              />
              {/* Label */}
              <text x={RIGHT_X} y={y + 5} textAnchor="middle"
                fill={w.color}
                fontSize="13" fontFamily="monospace" fontWeight="bold"
                opacity={done ? 1 : 0.7}>
                {done ? '✓' : w.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-4 text-[10px] tracking-widest text-amber-glow/30">
        CLICK AND DRAG A SOURCE WIRE → DROP ON MATCHING TARGET SOCKET
      </p>
    </div>
  );
}
