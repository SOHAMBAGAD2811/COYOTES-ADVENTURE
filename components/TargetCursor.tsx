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

// Glowing hand SVG — hotspot is the tip of the index finger (top-left of SVG)
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
        left: '0px',
        top: '0px',
        // Use CSS transition instead of GSAP — no JS overhead per frame
        transform: pressed ? 'scale(0.88)' : 'scale(1)',
        transition: 'transform 0.1s ease-out',
        filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 12px ${color}44)`,
        pointerEvents: 'none',
      }}
    >
      <path d="M9 1.5A1.5 1.5 0 0 0 7.5 3v8.25l-.97-.97A2.25 2.25 0 0 0 3.34 13.5l3.41 3.41A6.75 6.75 0 0 0 11.54 19h2.46A5.25 5.25 0 0 0 19.25 13.75V9A1.5 1.5 0 0 0 16.25 9v-.25A1.5 1.5 0 0 0 13.25 8.75V8.5A1.5 1.5 0 0 0 10.5 8.5V3A1.5 1.5 0 0 0 9 1.5z" />
    </svg>
  );
}

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#ffffff',
  cursorColorOnTarget,
}: TargetCursorProps) => {
  const cursorRef  = useRef<HTMLDivElement>(null);
  const dotRef     = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement[]>([]);

  const [mode, setMode]     = useState(cursorStore.mode);
  const [pressed, setPressed] = useState(false);

  useEffect(() => cursorStore.subscribe(setMode), []);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
      (window.innerWidth <= 768 && navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const wrapper = cursorRef.current;
    const corners  = cornersRef.current;
    const dot      = dotRef.current;

    if (hideDefaultCursor) document.body.classList.add('hide-cursor-global');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let rafId  = 0;
    let spinning = cursorStore.mode === 'full';
    let rotation = 0;
    let lastTime = performance.now();
    const degsPerMs = 360 / (spinDuration * 1000);

    // Track whether the wrapper currently has a rotate() in its transform
    // so we never read wrapper.style.transform (expensive style read on every tick)
    let hasRotation = false;

    const unsubMode = cursorStore.subscribe(m => {
      spinning = m === 'full';
      if (m === 'full') {
        rotation = 0;
      } else {
        // Clear rotation immediately without reading the current style
        hasRotation = false;
        wrapper.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    });

    const cornerCurrent = [
      { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    ];

    let locked       = false;
    let lockStrength = 0;
    let lockedRect: { tl:{x:number,y:number}, tr:{x:number,y:number}, br:{x:number,y:number}, bl:{x:number,y:number} } | null = null;

    const unlock = () => {
      if (!locked) return;
      locked     = false;
      lockedRect = null;
      corners.forEach(c => (c.style.borderColor = cursorColor));
      if (dot) dot.style.backgroundColor = cursorColor;
      setTimeout(() => { if (!locked) spinning = cursorStore.mode === 'full'; }, 50);
    };

    // ── RAF tick — the ONLY place we write DOM styles ────────────────────────
    const tick = (now: number) => {
      const dt  = Math.min(now - lastTime, 50);
      lastTime  = now;

      // Compose transform string without ever reading style properties
      let transformStr = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      if (spinning) {
        rotation = (rotation + degsPerMs * dt) % 360;
        transformStr += ` rotate(${rotation}deg)`;
        hasRotation = true;
      } else if (hasRotation) {
        transformStr += ` rotate(0deg)`;
        hasRotation = false;
      }

      wrapper.style.transform = transformStr;

      // Corner animation — only in full mode (story/intercom) and only when corners exist
      if (cursorStore.mode === 'full' && corners.length === 4) {
        const ease = 1 - Math.pow(0.001, dt / 1000);
        if (locked && lockedRect) {
          lockStrength = Math.min(1, lockStrength + dt / (hoverDuration * 1000));
          const t = lockStrength;
          const lock4 = [lockedRect.tl, lockedRect.tr, lockedRect.br, lockedRect.bl];
          for (let i = 0; i < 4; i++) {
            const fx = mouseX + (i < 2 ? -10 : 10) * (i === 1 || i === 2 ? 1 : -1);
            const fy = mouseY + (i >= 2 ? 10 : -10);
            let tx = fx + (lock4[i].x - fx) * t;
            let ty = fy + (lock4[i].y - fy) * t;
            if (parallaxOn && t >= 1) {
              const cx = (lockedRect.tl.x + lockedRect.tr.x) / 2;
              const cy = (lockedRect.tl.y + lockedRect.bl.y) / 2;
              tx += (mouseX - cx) * 0.04;
              ty += (mouseY - cy) * 0.04;
            }
            const e2 = Math.min(ease * 1.5, 1);
            cornerCurrent[i].x += (tx - cornerCurrent[i].x) * e2;
            cornerCurrent[i].y += (ty - cornerCurrent[i].y) * e2;
          }
        } else {
          lockStrength = Math.max(0, lockStrength - dt / 150);
          for (let i = 0; i < 4; i++) {
            const fx = mouseX + (i === 0 || i === 3 ? -10 : 10);
            const fy = mouseY + (i < 2 ? -10 : 10);
            cornerCurrent[i].x += (fx - cornerCurrent[i].x) * ease;
            cornerCurrent[i].y += (fy - cornerCurrent[i].y) * ease;
          }
        }
        for (let i = 0; i < 4; i++) {
          corners[i].style.transform = `translate(${cornerCurrent[i].x - mouseX}px, ${cornerCurrent[i].y - mouseY}px)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    // Init corner positions
    for (let i = 0; i < 4; i++) {
      cornerCurrent[i] = {
        x: mouseX + (i === 0 || i === 3 ? -10 : 10),
        y: mouseY + (i < 2 ? -10 : 10),
      };
    }

    rafId = requestAnimationFrame(tick);

    // ── Mouse position — passive, just updates a variable ──────────────────
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── Target lock-on — use mousemove + closest() instead of mouseover ─────
    // mouseover fires for EVERY element the mouse crosses (including children),
    // causing constant DOM traversals. Using mousemove + closest() is much cheaper
    // because we already have a mousemove listener and closest() is optimised by browsers.
    let activeTarget: Element | null = null;
    let activeLeave: (() => void) | null = null;
    // Throttle: only check for target elements every N mousemove events
    let moveCount = 0;
    const TARGET_CHECK_INTERVAL = 4; // check every 4th mousemove event

    const detachLeave = () => {
      if (activeTarget && activeLeave) activeTarget.removeEventListener('mouseleave', activeLeave);
      activeLeave  = null;
      activeTarget = null;
    };

    const onMouseMoveTarget = (e: MouseEvent) => {
      // Only run target detection in full mode
      if (cursorStore.mode !== 'full') return;
      // Throttle — only check every Nth call to avoid per-pixel DOM queries
      if (++moveCount % TARGET_CHECK_INTERVAL !== 0) return;

      // Use closest() — O(depth), much cheaper than manual while loop + matches
      const el = (e.target as HTMLElement | null)?.closest?.(targetSelector) as HTMLElement | null;

      if (!el) {
        // Mouse moved off any target
        if (activeTarget) { unlock(); detachLeave(); }
        return;
      }
      if (el === activeTarget) return;

      detachLeave();
      activeTarget = el;
      locked       = true;
      spinning     = false;
      hasRotation  = false;
      wrapper.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      rotation = 0;

      const r = el.getBoundingClientRect();
      const pad = 5;
      lockedRect = {
        tl: { x: r.left - pad,  y: r.top    - pad },
        tr: { x: r.right + pad, y: r.top    - pad },
        br: { x: r.right + pad, y: r.bottom + pad },
        bl: { x: r.left - pad,  y: r.bottom + pad },
      };

      const tc = cursorColorOnTarget ?? cursorColor;
      corners.forEach(c => (c.style.borderColor = tc));
      if (dot) dot.style.backgroundColor = tc;

      const onLeave = () => { unlock(); detachLeave(); };
      activeLeave = onLeave;
      el.addEventListener('mouseleave', onLeave);
    };
    // Attach to the same mousemove — no extra event listener
    window.addEventListener('mousemove', onMouseMoveTarget, { passive: true });

    const onClick = () => { unlock(); detachLeave(); };
    window.addEventListener('click', onClick, { passive: true });

    // ── Press state — use CSS transition on dot, no GSAP ──────────────────
    const onMouseDown = () => {
      setPressed(true);
      if (dot) dot.style.transform = 'scale(0.6)';
    };
    const onMouseUp = () => {
      setPressed(false);
      if (dot) dot.style.transform = 'scale(1)';
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousemove', onMouseMoveTarget);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      detachLeave();
      unsubMode();
      if (hideDefaultCursor) document.body.classList.remove('hide-cursor-global');
    };
  }, [isMobile, hideDefaultCursor, targetSelector, spinDuration, hoverDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      {mode === 'minimal' ? (
        /* ── GAMEPLAY MODE: glowing hand ── */
        <HandCursor color={cursorColor} pressed={pressed} />
      ) : (
        /* ── STORY / INTERCOM MODE: spinning target brackets ── */
        <>
          <div
            ref={dotRef}
            className="target-cursor-dot"
            style={{
              backgroundColor: cursorColor,
              // CSS transition handles the press scale — no GSAP needed
              transition: 'transform 0.12s ease-out, background-color 0.1s',
            }}
          />
          {(['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'] as const).map((cls, i) => (
            <div
              key={cls}
              ref={el => { if (el) cornersRef.current[i] = el; }}
              className={`target-cursor-corner ${cls}`}
              style={{ borderColor: cursorColor }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default TargetCursor;
