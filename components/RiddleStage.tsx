'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

interface Riddle {
  category: string;
  question: string;
  hints: string[];
  answer: string | string[]; // support multiple accepted answers
  answerDisplay: string;     // shown after correct
}

const RIDDLE_POOL: Riddle[] = [
  // ── Math ────────────────────────────────────────────────────────
  {
    category: 'MATH',
    question: 'A convoy has 12 crates. Each crate holds 8 water tanks. 3 crates are damaged. How many tanks are accessible?',
    hints: ['Subtract damaged crates first', 'You have 9 usable crates', 'Multiply 9 × 8'],
    answer: '72',
    answerDisplay: '72 TANKS',
  },
  {
    category: 'MATH',
    question: 'If the temperature drops 4°C every hour, and it starts at 28°C, what is it after 9 hours?',
    hints: ['4 × 9 = 36', 'Subtract from starting temperature', '28 − 36 = ?'],
    answer: ['-8', 'negative 8', '-8c', '-8°c'],
    answerDisplay: '-8°C',
  },
  {
    category: 'MATH',
    question: 'A signal repeats every 13 seconds. You have 3 minutes. How many full signals fit in that window?',
    hints: ['3 minutes = 180 seconds', 'Divide 180 ÷ 13', 'Round down to the nearest whole number'],
    answer: '13',
    answerDisplay: '13 SIGNALS',
  },
  {
    category: 'MATH',
    question: 'The Aegis convoy moves at 60 km/h. Oasis City is 90 km away. How many minutes until it arrives?',
    hints: ['Time = Distance ÷ Speed', '90 ÷ 60 = 1.5 hours', '1.5 hours = ? minutes'],
    answer: ['90', '90 minutes'],
    answerDisplay: '90 MINUTES',
  },
  {
    category: 'MATH',
    question: 'You have 256 bytes of bandwidth. Each packet is 16 bytes. How many packets can you send?',
    hints: ['This is a division problem', '256 ÷ 16', 'Think in powers of 2'],
    answer: '16',
    answerDisplay: '16 PACKETS',
  },
  // ── Logic ────────────────────────────────────────────────────────
  {
    category: 'LOGIC',
    question: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?',
    hints: ['You use me to navigate', 'I represent the world but am flat', 'Explorers carry me'],
    answer: ['map', 'a map'],
    answerDisplay: 'A MAP',
  },
  {
    category: 'LOGIC',
    question: 'The more you take, the more you leave behind. What am I?',
    hints: ['Think about movement', 'You make them with your feet', 'They are impressions in the ground'],
    answer: ['footsteps', 'steps', 'foot steps'],
    answerDisplay: 'FOOTSTEPS',
  },
  {
    category: 'LOGIC',
    question: 'Three guards stand watch. One always lies. One always tells the truth. One alternates. You can ask ONE question to ONE guard. Which question reveals the safe door?',
    hints: ['You need a self-referential question', '"Would the liar say this door is safe?"', 'If the answer is YES, go the other way'],
    answer: ['would the liar say', 'would the other guard say', 'self referential', 'meta question'],
    answerDisplay: 'ASK A SELF-REFERENTIAL QUESTION',
  },
  {
    category: 'LOGIC',
    question: 'A hacker encodes a message: 1=A, 2=B... What does 3-15-25-15-20-5 spell?',
    hints: ['Match each number to a letter', '3=C, 15=O', '25=Y, 20=T, 5=E'],
    answer: ['coyote', 'c o y o t e'],
    answerDisplay: 'COYOTE',
  },
  // ── Science ─────────────────────────────────────────────────────
  {
    category: 'SCIENCE',
    question: 'What element makes up about 78% of Earth\'s atmosphere by volume?',
    hints: ['It is not oxygen', 'Plants do not use it directly for photosynthesis', 'Its atomic number is 7'],
    answer: ['nitrogen', 'n2', 'n₂'],
    answerDisplay: 'NITROGEN',
  },
  {
    category: 'SCIENCE',
    question: 'At what temperature in Celsius does water boil at standard atmospheric pressure?',
    hints: ['Above body temperature', 'Below 200°C', 'A round number'],
    answer: ['100', '100c', '100°c', '100 degrees'],
    answerDisplay: '100°C',
  },
  {
    category: 'SCIENCE',
    question: 'How many bones are in the adult human body?',
    hints: ['More than 100', 'Less than 250', 'Between 200 and 210'],
    answer: ['206', '206 bones'],
    answerDisplay: '206 BONES',
  },
  {
    category: 'SCIENCE',
    question: 'What is the speed of light in a vacuum, in km/s (rounded to nearest thousand)?',
    hints: ['It is approximately 300,000 km/s', 'Light travels from Earth to Moon in ~1.3 seconds', 'Often written as 3 × 10⁵ km/s'],
    answer: ['300000', '300,000', '299792', '299,792'],
    answerDisplay: '~300,000 KM/S',
  },
  // ── Sequence / Pattern ──────────────────────────────────────────
  {
    category: 'PATTERN',
    question: 'Complete the sequence: 2, 4, 8, 16, 32, ___',
    hints: ['Each number doubles', '32 × 2 = ?', 'Powers of 2'],
    answer: ['64'],
    answerDisplay: '64',
  },
  {
    category: 'PATTERN',
    question: 'Complete the Fibonacci-style sequence: 1, 1, 2, 3, 5, 8, 13, ___',
    hints: ['Each number = sum of the two before it', '8 + 13 = ?', 'Add the last two numbers'],
    answer: ['21'],
    answerDisplay: '21',
  },
  {
    category: 'PATTERN',
    question: 'What comes next: MON, TUE, WED, THU, ___',
    hints: ['Days of the week', 'After Thursday...', 'It starts with F'],
    answer: ['fri', 'friday', 'FRI'],
    answerDisplay: 'FRI',
  },
  // ── Wordplay ────────────────────────────────────────────────────
  {
    category: 'WORDPLAY',
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    hints: ['Mountains make me', 'I repeat your words back', 'Call out in a canyon to find me'],
    answer: ['echo', 'an echo'],
    answerDisplay: 'AN ECHO',
  },
  {
    category: 'WORDPLAY',
    question: 'What has keys but no locks, space but no room, and you can enter but can\'t go inside?',
    hints: ['You use it every day', 'It is electronic', 'You are possibly using one right now'],
    answer: ['keyboard', 'a keyboard'],
    answerDisplay: 'A KEYBOARD',
  },
];

function pickRiddles(n: number): Riddle[] {
  const shuffled = [...RIDDLE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9 ]/g, '');
}

function checkAnswer(input: string, answer: string | string[]): boolean {
  const norm = normalize(input);
  const accepted = Array.isArray(answer) ? answer : [answer];
  return accepted.some(a => normalize(a) === norm || normalize(a).includes(norm) && norm.length > 3);
}

export default function RiddleStage({ onSuccess }: Props) {
  const [riddles] = useState(() => pickRiddles(3));
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
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-[0.3em] text-[#cc44ff] rng-glitch">
          <Brain size={24} /> CIPHER INTELLIGENCE TEST
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
