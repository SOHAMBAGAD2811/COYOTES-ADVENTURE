import { Puzzle } from 'lucide-react';

export default function EvolutionSlot() {
  return (
    <div className="flex h-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-glow/20 text-[10px] tracking-[0.2em] text-amber-glow/30">
      <Puzzle size={13} />
      EVOLUTION MODULE — RESERVED SLOT
    </div>
  );
}
