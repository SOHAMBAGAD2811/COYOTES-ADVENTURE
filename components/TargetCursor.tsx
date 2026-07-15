'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { cursorStore } from '@/lib/cursorStore';
import './TargetCursor.css';

interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
  cursorColor?: string;
  cursorColorOnTarget?: string;
}

function HandCursor({ color, pressed }: { color: string; pressed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="28"
      height="28"
      fill={color}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        transform: `translate(-4px, -4px) scale(${pressed ? 0.88 : 1})`,
        transition: 'transform 0.1s ease-out',
        filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}44)`,
        pointerEvents: 'none',
      }}
    >
      <path d="M9 1.5A1.5 1.5 0 0 0 7.5 3v8.25l-.97-.97A2.25 2.25 0 0 0 3.34 13.5l3.41 3.41A6.75 6.75 0 0 0 11.54 19h2.46A5.25 5.25 0 0 0 19.25 13.75V9A1.5 1.5 0 0 0 16.25 9v-.25A1.5 1.5 0 0 0 13.25 8.75V8.5A1.5 1.5 0 0 0 10.5 8.5V3A1.5 1.5 0 0 0 9 1.5z" />
    </svg>
  );
}

// ─── Geometry constants (must match .target-cursor-corner CSS) ───────────────
// Corner element size (px)
const CORNER_SIZE   = 12;
const CORNER_HALF   = CORNER_SIZE / 2;   // 6
// Distance from cursor centre to each corner's centre (px)
const CORNER_RADIUS = 14;

// CSS top/left of each corner's top-left edge relative to wrapper origin (= mouse pos),
// chosen so each corner's CENTRE sits at ±CORNER_RADIUS from the wrapper origin.
// Centre = top-left + CORNER_HALF  →  top-left = ±CORNER_RADIUS - CORNER_HALF
const CORNER_CSS = [
  { l: -(CORNER_RADIUS + CORNER_HALF), t: -(CORNER_RADIUS + CORNER_HALF) }, // TL → -20, -20
  { l:  (CORNER_RADIUS - CORNER_HALF), t: -(CORNER_RADIUS + CORNER_HALF) }, // TR →   8, -20
  { l:  (CORNER_RADIUS - CORNER_HALF), t:  (CORNER_RADIUS - CORNER_HALF) }, // BR →   8,   8
  { l: -(CORNER_RADIUS + CORNER_HALF), t:  (CORNER_RADIUS - CORNER_HALF) }, // BL → -20,   8
] as const;
// ─────────────────────────────────────────────────────────────────────────────

const TargetCursor = ({
  targetSelector   = '.cursor-target',
  spinDuration     = 2,
  hideDefaultCursor = true,
  parallaxOn       = true,
  cursorColor      = '#ffffff',
  cursorColorOnTarget,
}: TargetCursorProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dotRef     = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);

  const [mode,    setMode]    = useState<'full' | 'minimal'>(cursorStore.mode);
  const [pressed, setPressed] = useState(false);

  useEffect(() => cursorStore.subscribe(setMode), []);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent ?? '') ||
      (window.innerWidth <= 768 && navigator.maxTouchPoints > 0)
    );
  }, []);

  useEffect(() => {
    if (isMobile || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const dot     = dotRef.current;

    if (hideDefaultCursor) document.body.classList.add('hide-cursor-global');

    // ── State ──────────────────────────────────────────────────────────────
    let mouseX = window.innerWidth  / 2;
    let mouseY = window.innerHeight / 2;

    let spinning    = cursorStore.mode === 'full';
    let rotation    = 0;
    let lastTime    = performance.now();
    const degsPerMs = 360 / (spinDuration * 1000);

    type Rect4 = {
      tl: { x: number; y: number };
      tr: { x: number; y: number };
      br: { x: number; y: number };
      bl: { x: number; y: number };
    };
    let locked     = false;
    let lockedRect: Rect4 | null = null;

    // Extra JS delta applied on top of each corner's CSS position.
    // delta = {0,0} → corner sits exactly at its CSS-defined resting place (on the dot).
    // During lock-on, delta springs toward whatever offset is needed to
    // place the corner's centre on the target element's corner in page space.
    const delta = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    const setColor = (color: string) => {
      if (dot) dot.style.color = color;
      cornersRef.current.forEach(c => { if (c) c.style.color = color; });
    };
    setColor(cursorColor);

    const unlock = () => {
      if (!locked) return;
      locked     = false;
      lockedRect = null;
      setColor(cursorColor);
      setTimeout(() => { if (!locked) spinning = cursorStore.mode === 'full'; }, 50);
    };

    const unsubMode = cursorStore.subscribe(m => {
      spinning = m === 'full';
      if (m !== 'full') rotation = 0;
    });

    // ── RAF loop ─────────────────────────────────────────────────────────────
    let rafId = 0;

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;

      // 1. Move wrapper to mouse position (instantly — no lag on the dot)
      let wt = `translate(${mouseX}px, ${mouseY}px)`;
      if (spinning) {
        rotation = (rotation + degsPerMs * dt) % 360;
        wt += ` rotate(${rotation}deg)`;
      }
      wrapper.style.transform = wt;

      // 2. Update corner deltas
      //    Frame-rate-independent exponential ease:
      //    at 60 fps (dt≈16ms) → ease ≈ 0.16  (snappy but smooth)
      const ease    = 1 - Math.pow(0.001, dt / 1000);
      const corners = cornersRef.current;
      const lock4   = locked && lockedRect
        ? [lockedRect.tl, lockedRect.tr, lockedRect.br, lockedRect.bl]
        : null;

      for (let i = 0; i < 4; i++) {
        const c = corners[i];
        if (!c) continue;

        let targetDx: number;
        let targetDy: number;

        if (lock4) {
          // Page-space position of this corner's CENTRE when at rest (delta = 0):
          const restPageX = mouseX + CORNER_CSS[i].l + CORNER_HALF;
          const restPageY = mouseY + CORNER_CSS[i].t + CORNER_HALF;

          // Page-space target for this corner's centre = button rect corner
          let tx = lock4[i].x;
          let ty = lock4[i].y;

          // Mild parallax nudge
          if (parallaxOn) {
            const cx = (lockedRect!.tl.x + lockedRect!.tr.x) / 2;
            const cy = (lockedRect!.tl.y + lockedRect!.bl.y) / 2;
            tx += (mouseX - cx) * 0.04;
            ty += (mouseY - cy) * 0.04;
          }

          // Required extra translate to move from rest to target
          // Note: rotation = 0 during lock, so wrapper local ≡ page space
          targetDx = tx - restPageX;
          targetDy = ty - restPageY;
        } else {
          // Free-roam: spring delta back to zero → corners return to CSS rest positions
          targetDx = 0;
          targetDy = 0;
        }

        delta[i].x += (targetDx - delta[i].x) * ease;
        delta[i].y += (targetDy - delta[i].y) * ease;

        c.style.transform = `translate(${delta[i].x}px, ${delta[i].y}px)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // ── Mouse tracking ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Target lock-on ──────────────────────────────────────────────────────
    let activeTarget: Element | null = null;
    let activeLeave:  (() => void) | null = null;
    let moveCount = 0;
    const CHECK_INTERVAL = 4; // check every Nth mousemove

    const detachLeave = () => {
      if (activeTarget && activeLeave) activeTarget.removeEventListener('mouseleave', activeLeave);
      activeLeave  = null;
      activeTarget = null;
    };

    const onMouseMoveTarget = (e: MouseEvent) => {
      if (cursorStore.mode !== 'full') return;
      if (++moveCount % CHECK_INTERVAL !== 0) return;

      const el = (e.target as HTMLElement | null)?.closest?.(targetSelector) as HTMLElement | null;

      if (!el) {
        if (activeTarget) { unlock(); detachLeave(); }
        return;
      }
      if (el === activeTarget) return;

      detachLeave();
      activeTarget = el;
      locked       = true;
      spinning     = false;
      rotation     = 0;

      const r   = el.getBoundingClientRect();
      const pad = 5;
      lockedRect = {
        tl: { x: r.left  - pad, y: r.top    - pad },
        tr: { x: r.right + pad, y: r.top    - pad },
        br: { x: r.right + pad, y: r.bottom + pad },
        bl: { x: r.left  - pad, y: r.bottom + pad },
      };

      setColor(cursorColorOnTarget ?? cursorColor);

      const onLeave = () => { unlock(); detachLeave(); };
      activeLeave = onLeave;
      el.addEventListener('mouseleave', onLeave);
    };
    window.addEventListener('mousemove', onMouseMoveTarget, { passive: true });

    const onClick = () => { unlock(); detachLeave(); };
    window.addEventListener('click', onClick, { passive: true });

    // ── Press feedback ──────────────────────────────────────────────────────
    const onMouseDown = () => {
      setPressed(true);
      // Preserve centering translate while scaling
      if (dot) dot.style.transform = 'translate(-50%, -50%) scale(0.6)';
    };
    const onMouseUp = () => {
      setPressed(false);
      // Clear inline style → CSS rule `translate(-50%, -50%)` takes over again
      if (dot) dot.style.transform = '';
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup',   onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onMouseMoveTarget);
      window.removeEventListener('click',     onClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup',   onMouseUp);
      detachLeave();
      unsubMode();
      if (hideDefaultCursor) document.body.classList.remove('hide-cursor-global');
    };
  }, [isMobile, hideDefaultCursor, targetSelector, spinDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  if (isMobile) return null;

  return (
    <div ref={wrapperRef} className="target-cursor-wrapper">
      {mode === 'minimal' ? (
        /* ── GAMEPLAY: glowing hand pointer ── */
        <HandCursor color={cursorColor} pressed={pressed} />
      ) : (
        /* ── STORY / INTERCOM: dot + spinning bracket corners ── */
        <>
          <div
            ref={dotRef}
            className="target-cursor-dot"
            style={{ color: cursorColor }}
          />
          {(['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'] as const).map((cls, i) => (
            <div
              key={cls}
              ref={el => { cornersRef.current[i] = el; }}
              className={`target-cursor-corner ${cls}`}
              style={{ color: cursorColor }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default TargetCursor;
