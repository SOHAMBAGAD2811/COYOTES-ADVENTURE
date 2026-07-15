'use client';

import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface Cell {
  id: number;
  type: 'straight' | 'corner';
  targetRot: number;
  rot: number;
  isPath: boolean;
}

const INITIAL_GRID: Cell[] = [
  { id: 0, type: 'corner', targetRot: 0, rot: 90, isPath: true },
  { id: 1, type: 'corner', targetRot: 180, rot: 0, isPath: true },
  { id: 2, type: 'straight', targetRot: 0, rot: 90, isPath: false },
  { id: 3, type: 'corner', targetRot: 90, rot: 180, isPath: false },

  { id: 4, type: 'straight', targetRot: 90, rot: 0, isPath: false },
  { id: 5, type: 'corner', targetRot: 0, rot: 270, isPath: true },
  { id: 6, type: 'corner', targetRot: 180, rot: 90, isPath: true },
  { id: 7, type: 'corner', targetRot: 270, rot: 0, isPath: false },

  { id: 8, type: 'corner', targetRot: 180, rot: 270, isPath: false },
  { id: 9, type: 'straight', targetRot: 0, rot: 90, isPath: false },
  { id: 10, type: 'straight', targetRot: 90, rot: 0, isPath: true },
  { id: 11, type: 'corner', targetRot: 0, rot: 180, isPath: false },

  { id: 12, type: 'corner', targetRot: 90, rot: 0, isPath: false },
  { id: 13, type: 'corner', targetRot: 270, rot: 90, isPath: false },
  { id: 14, type: 'corner', targetRot: 0, rot: 270, isPath: true },
  { id: 15, type: 'corner', targetRot: 180, rot: 90, isPath: true },
];

interface Props {
  onSuccess: () => void;
}

export default function EarthStage({ onSuccess }: Props) {
  const [grid, setGrid] = useState<Cell[]>(INITIAL_GRID);
  const [solved, setSolved] = useState(false);

  const rotate = (id: number) => {
    if (solved) return;
    setGrid(prev => prev.map(c => 
      c.id === id ? { ...c, rot: (c.rot + 90) % 360 } : c
    ));
  };

  const isCorrect = (c: Cell) => {
    if (c.type === 'straight') return (c.rot % 180) === (c.targetRot % 180);
    return c.rot === c.targetRot;
  };

  useEffect(() => {
    const isSolved = grid.every(isCorrect);

    if (isSolved && !solved) {
      setSolved(true);
      setTimeout(onSuccess, 2000);
    }
  }, [grid, solved, onSuccess]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="mb-10 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#a3e635]">
          <Leaf size={24} /> BIOMASS SYNTHESIZER
        </h2>
        <p className="text-xs tracking-widest text-amber-glow/60">
          CLICK TILES TO ALIGN THE POWER GRID
        </p>
      </div>

      <div className="relative">
        {/* Entry / Exit markers */}
        <div className="absolute -top-8 left-4 text-xs font-bold text-[#a3e635] animate-pulse">▼ PWR</div>
        <div className="absolute -bottom-8 right-2 text-xs font-bold text-[#a3e635] animate-pulse">▼ VAULT</div>

        <div className="grid grid-cols-4 gap-1 rounded-lg border-2 border-amber-glow/20 bg-black p-2 shadow-[0_0_20px_rgba(163,230,53,0.1)]">
          {grid.map(cell => {
            const isLit = isCorrect(cell);
            return (
              <button
                key={cell.id}
                onClick={() => rotate(cell.id)}
                className={`flex h-16 w-16 items-center justify-center rounded bg-matte-panel/80 transition-all hover:bg-matte-panel ${
                  isLit ? 'shadow-[0_0_15px_rgba(163,230,53,0.4)] bg-matte-panel' : ''
                }`}
              >
                <div 
                  className="h-full w-full transition-transform duration-200"
                  style={{ transform: `rotate(${cell.rot}deg)` }}
                >
                  {cell.type === 'straight' && (
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <rect x="0" y="40" width="100" height="20" fill={isLit ? '#a3e635' : '#444'} />
                    </svg>
                  )}
                  {cell.type === 'corner' && (
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <path d="M 50 0 L 50 50 L 100 50" fill="none" stroke={isLit ? '#a3e635' : '#444'} strokeWidth="20" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex h-8 items-center justify-center">
        {solved ? (
          <p className="text-sm font-bold tracking-widest text-[#a3e635] animate-pulse shadow-glow">
            BIOMASS SEEDING INITIATED
          </p>
        ) : (
          <button
            onClick={() => {
              setSolved(true);
              onSuccess();
            }}
            className="text-[9px] tracking-widest text-amber-glow/30 hover:text-amber-glow/80 transition-colors"
          >
            [ EMERGENCY OVERRIDE ]
          </button>
        )}
      </div>
    </div>
  );
}
