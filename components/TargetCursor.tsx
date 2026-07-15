'use client';

import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
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

const TargetCursor = ({
  targetSelector = '.cursor-target',
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
  cursorColor = '#ffffff',
  cursorColorOnTarget,
}: TargetCursorProps) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const cornersRef = useRef<HTMLDivElement[]>([]);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua) ||
      (window.innerWidth <= 768 && navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current) return;

    const wrapper = cursorRef.current;
    const corners = cornersRef.current;
    const dot = dotRef.current;

    if (hideDefaultCursor) document.body.style.cursor = 'none';

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let rafId = 0;
    let spinning = true;
    let rotation = 0;
    let lastTime = performance.now();
    const degsPerMs = 360 / (spinDuration * 1000);

    const cornerCurrent = [
      { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 },
    ];

    let locked = false;
    let lockStrength = 0;
    let lockedRect: { tl: {x:number,y:number}, tr: {x:number,y:number}, br: {x:number,y:number}, bl: {x:number,y:number} } | null = null;

    // Unlock helper — called on click or mouseleave
    const unlock = () => {
      if (!locked) return;
      locked = false;
      lockedRect = null;

      corners.forEach(c => (c.style.borderColor = cursorColor));
      if (dot) dot.style.backgroundColor = cursorColor;

      setTimeout(() => { if (!locked) spinning = true; }, 50);
    };

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 50); // cap dt to avoid jumps on tab switch
      lastTime = now;

      const ease = 1 - Math.pow(0.008, dt / 1000);
      curX += (mouseX - curX) * ease;
      curY += (mouseY - curY) * ease;

      wrapper.style.left = `${curX}px`;
      wrapper.style.top = `${curY}px`;

      if (spinning) {
        rotation = (rotation + degsPerMs * dt) % 360;
        wrapper.style.transform = `rotate(${rotation}deg)`;
      }

      if (locked && lockedRect) {
        lockStrength = Math.min(1, lockStrength + dt / (hoverDuration * 1000));
        const t = lockStrength;

        const freeTargets = [
          { x: curX - 10, y: curY - 10 },
          { x: curX + 10, y: curY - 10 },
          { x: curX + 10, y: curY + 10 },
          { x: curX - 10, y: curY + 10 },
        ];
        const locked4 = [lockedRect.tl, lockedRect.tr, lockedRect.br, lockedRect.bl];

        corners.forEach((corner, i) => {
          let tx = freeTargets[i].x + (locked4[i].x - freeTargets[i].x) * t;
          let ty = freeTargets[i].y + (locked4[i].y - freeTargets[i].y) * t;

          if (parallaxOn && t >= 1) {
            const cx = (lockedRect!.tl.x + lockedRect!.tr.x) / 2;
            const cy = (lockedRect!.tl.y + lockedRect!.bl.y) / 2;
            tx += (mouseX - cx) * 0.04;
            ty += (mouseY - cy) * 0.04;
          }

          const e2 = Math.min(ease * 1.5, 1);
          cornerCurrent[i].x += (tx - cornerCurrent[i].x) * e2;
          cornerCurrent[i].y += (ty - cornerCurrent[i].y) * e2;
        });
      } else {
        lockStrength = Math.max(0, lockStrength - dt / 150);

        const freeTargets = [
          { x: curX - 10, y: curY - 10 },
          { x: curX + 10, y: curY - 10 },
          { x: curX + 10, y: curY + 10 },
          { x: curX - 10, y: curY + 10 },
        ];

        corners.forEach((corner, i) => {
          cornerCurrent[i].x += (freeTargets[i].x - cornerCurrent[i].x) * ease;
          cornerCurrent[i].y += (freeTargets[i].y - cornerCurrent[i].y) * ease;
        });
      }

      corners.forEach((corner, i) => {
        const dx = cornerCurrent[i].x - curX;
        const dy = cornerCurrent[i].y - curY;
        corner.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      rafId = requestAnimationFrame(tick);
    };

    // Init corner positions
    corners.forEach((_, i) => {
      const freeTargets = [
        { x: curX - 10, y: curY - 10 },
        { x: curX + 10, y: curY - 10 },
        { x: curX + 10, y: curY + 10 },
        { x: curX - 10, y: curY + 10 },
      ];
      cornerCurrent[i] = { ...freeTargets[i] };
    });

    rafId = requestAnimationFrame(tick);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let activeTarget: Element | null = null;
    let activeLeave: (() => void) | null = null;

    const detachLeave = () => {
      if (activeTarget && activeLeave) {
        activeTarget.removeEventListener('mouseleave', activeLeave);
        activeLeave = null;
      }
      activeTarget = null;
    };

    const onMouseOver = (e: MouseEvent) => {
      let el = e.target as HTMLElement | null;
      while (el && el !== document.body) {
        if (el.matches && el.matches(targetSelector)) break;
        el = el.parentElement;
      }
      if (!el || el === document.body) return;
      if (el === activeTarget) return;

      detachLeave();

      activeTarget = el;
      locked = true;
      spinning = false;
      wrapper.style.transform = 'rotate(0deg)';
      rotation = 0;

      const r = el.getBoundingClientRect();
      const pad = 5;
      lockedRect = {
        tl: { x: r.left  - pad,     y: r.top    - pad },
        tr: { x: r.right + pad,     y: r.top    - pad },
        br: { x: r.right + pad,     y: r.bottom + pad },
        bl: { x: r.left  - pad,     y: r.bottom + pad },
      };

      const targetColor = cursorColorOnTarget ?? cursorColor;
      corners.forEach(c => (c.style.borderColor = targetColor));
      if (dot) dot.style.backgroundColor = targetColor;

      const onLeave = () => {
        unlock();
        detachLeave();
      };
      activeLeave = onLeave;
      el.addEventListener('mouseleave', onLeave);
    };
    window.addEventListener('mouseover', onMouseOver, { passive: true });

    // Fix: clicking should force-unlock so corners don't get stuck
    const onClick = () => {
      unlock();
      detachLeave();
    };
    window.addEventListener('click', onClick, { passive: true });

    const onMouseDown = () => {
      if (dot) gsap.to(dot, { scale: 0.6, duration: 0.12 });
    };
    const onMouseUp = () => {
      if (dot) gsap.to(dot, { scale: 1, duration: 0.2 });
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      detachLeave();
      if (hideDefaultCursor) document.body.style.cursor = '';
    };
  }, [isMobile, hideDefaultCursor, targetSelector, spinDuration, hoverDuration, parallaxOn, cursorColor, cursorColorOnTarget]);

  if (isMobile) return null;

  return (
    <div ref={cursorRef} className="target-cursor-wrapper">
      <div ref={dotRef} className="target-cursor-dot" style={{ backgroundColor: cursorColor }} />
      {(['corner-tl', 'corner-tr', 'corner-br', 'corner-bl'] as const).map((cls, i) => (
        <div
          key={cls}
          ref={el => { if (el) cornersRef.current[i] = el; }}
          className={`target-cursor-corner ${cls}`}
          style={{ borderColor: cursorColor }}
        />
      ))}
    </div>
  );
};

export default TargetCursor;
