'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import FuzzyText from './FuzzyText';

interface BioTargets {
  ph: number;
  nitrogen: number;
  water: number;
}

interface Props {
  onSuccess: () => void;
  bioTargets: BioTargets;
}

interface Riddle {
  category: string;
  question: string;
  hints: string[];
  answer: string[];
  answerDisplay: string;
}

function generateRiddles(targets: BioTargets): Riddle[] {
  return [
    {
      category: 'BIOMETRICS',
      question: `Soil analysis complete. Base pH is 4.0. The terraformer requires exactly ${(targets.ph - 4.0).toFixed(1)} additional pH units to neutralize xenotoxins. What is the target pH?`,
      hints: ['Add the two numbers together', `4.0 + ${(targets.ph - 4.0).toFixed(1)}`],
      answer: [targets.ph.toFixed(1), targets.ph.toString()],
      answerDisplay: `${targets.ph.toFixed(1)} pH`,
    },
    {
      category: 'ATMOSPHERICS',
      question: `Atmospheric mix is unbalanced. We have 100% capacity. If ${100 - targets.nitrogen}% is allocated to oxygen and argon, what percentage remains for Nitrogen?`,
      hints: ['Subtract from 100', `100 - ${100 - targets.nitrogen}`],
      answer: [targets.nitrogen.toString(), `${targets.nitrogen}%`],
      answerDisplay: `${targets.nitrogen}% NITROGEN`,
    },
    {
      category: 'HYDRATION',
      question: `Reservoir tank A holds ${targets.water - 15}%. Tank B holds 15%. Tank C is empty. If we combine them for the biosphere, what is the total water percentage?`,
      hints: ['Add the percentages of Tank A and Tank B', `${targets.water - 15} + 15`],
      answer: [targets.water.toString(), `${targets.water}%`],
      answerDisplay: `${targets.water}% WATER`,
    }
  ];
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
}

function checkAnswer(input: string, answer: string[]): boolean {
  const norm = normalize(input);
  return answer.some(a => normalize(a) === norm || (normalize(a).includes(norm) && norm.length > 3));
}

export default function RiddleStage({ onSuccess, bioTargets }: Props) {
  const [riddles] = useState(() => generateRiddles(bioTargets));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (completed) setTimeout(onSuccess, 800);
  }, [completed, onSuccess]);

  useEffect(() => {
    setHintsRevealed(0);
    setInput('');
    setStatus('idle');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [currentIdx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'correct') return;

    const riddle = riddles[currentIdx];
    if (checkAnswer(input, riddle.answer)) {
      setStatus('correct');
      setTimeout(() => {
        if (currentIdx + 1 >= riddles.length) {
          setCompleted(true);
        } else {
          setCurrentIdx(i => i + 1);
        }
      }, 1200);
    } else {
      setStatus('wrong');
      setTimeout(() => { setStatus('idle'); setInput(''); }, 800);
    }
  };

  const riddle = riddles[currentIdx];
  const categoryColors: Record<string, string> = {
    MATH: '#00e5ff',
    LOGIC: '#cc44ff',
    SCIENCE: '#00ff88',
    PATTERN: '#ffb000',
    WORDPLAY: '#ff6644',
  };
  const catColor = categoryColors[riddle.category] ?? '#ffb000';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#cc44ff]">
          <Brain size={24} /> 
          <FuzzyText baseIntensity={0.2} hoverIntensity={0.6} color="#cc44ff" fontSize="1.5rem" fontWeight="bold">
            CIPHER INTELLIGENCE TEST
          </FuzzyText>
        </h2>
        <p className="text-xs tracking-widest text-[#cc44ff]/60">
          ANSWER THE RIDDLE TO UNLOCK THE NEXT PROTOCOL — {currentIdx + 1}/{riddles.length}
        </p>
        {/* Progress dots */}
        <div className="flex gap-3 mt-1">
          {riddles.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${
              i < currentIdx ? 'bg-[#00ff88]' : i === currentIdx ? 'bg-[#cc44ff] animate-pulse' : 'bg-white/20'
            }`} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl border border-[#cc44ff]/30 bg-black/60 rounded-lg p-8 font-mono">
        {/* Category badge */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <span
            className="text-[10px] tracking-[0.3em] font-bold px-2 py-1 rounded"
            style={{ color: catColor, border: `1px solid ${catColor}55`, background: `${catColor}11` }}
          >
            {riddle.category}
          </span>
          <span className="text-[10px] tracking-widest text-white/30">
            {hintsRevealed > 0 ? `${hintsRevealed}/${riddle.hints.length} HINTS USED` : 'NO HINTS USED YET'}
          </span>
        </div>

        {/* Question */}
        <p className="text-base leading-relaxed tracking-wide text-white/90 mb-8">
          {riddle.question}
        </p>

        {/* Hints */}
        <div className="flex flex-col gap-2 mb-8">
          {riddle.hints.map((hint, i) => (
            <div key={i} className={`flex items-start gap-3 text-sm transition-all duration-300 ${
              i < hintsRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'
            }`}>
              <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-[#ffb000]" />
              <span className="text-[#ffb000]/80 tracking-wide">{hint}</span>
            </div>
          ))}
          {hintsRevealed < riddle.hints.length && (
            <button
              onClick={() => setHintsRevealed(h => h + 1)}
              className="mt-2 self-start text-[10px] tracking-widest text-[#ffb000]/50 border border-[#ffb000]/20 px-3 py-1 rounded hover:border-[#ffb000]/50 hover:text-[#ffb000]/80 transition-all"
            >
              ▶ REVEAL HINT {hintsRevealed + 1}
            </button>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={status === 'correct'}
            placeholder="TYPE YOUR ANSWER..."
            className={`flex-1 bg-black border rounded px-4 py-3 text-sm tracking-widest outline-none transition-all ${
              status === 'correct'
                ? 'border-[#00ff88] text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : status === 'wrong'
                ? 'border-red-500 text-red-400 shadow-[0_0_12px_rgba(255,0,0,0.3)] animate-pulse'
                : 'border-[#cc44ff]/40 text-white focus:border-[#cc44ff] focus:shadow-[0_0_10px_rgba(204,68,255,0.3)]'
            }`}
          />
          <button
            type="submit"
            disabled={status === 'correct' || !input.trim()}
            className="px-6 py-3 text-xs tracking-widest border border-[#cc44ff]/50 text-[#cc44ff] rounded hover:bg-[#cc44ff]/10 disabled:opacity-30 transition-all"
          >
            SUBMIT
          </button>
        </form>

        {/* Status feedback */}
        <div className="mt-4 h-6 flex items-center gap-2">
          {status === 'correct' && (
            <div className="flex items-center gap-2 text-[#00ff88] text-xs tracking-widest">
              <CheckCircle size={14} /> CORRECT — {riddle.answerDisplay}
            </div>
          )}
          {status === 'wrong' && (
            <div className="flex items-center gap-2 text-red-400 text-xs tracking-widest">
              <XCircle size={14} /> INCORRECT — TRY AGAIN
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
