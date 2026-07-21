"use client";

import { useEffect, useRef } from "react";

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
};

type Burst = {
  x: number;
  y: number;
  t: number;
};

const METEOR_COUNT = 5;
const BURST_FRAMES = 20;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// A decorative falling-meteor background for unauthenticated pages. Meteors that
// cross a `[data-meteor-target]` element (the logo, a heading) trigger a small
// radial "pop" burst at the collision point, then respawn elsewhere.
export function MeteorShower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let width = 0;
    let height = 0;

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnMeteor(): Meteor {
      return {
        x: rand(0, width),
        y: rand(-height * 0.4, -10),
        vx: rand(-2.4, -1.2),
        vy: rand(2.2, 4),
        len: rand(60, 120),
      };
    }

    const meteors: Meteor[] = Array.from({ length: METEOR_COUNT }, spawnMeteor);
    const bursts: Burst[] = [];
    let raf = 0;

    function targetRects() {
      const canvasRect = canvas!.getBoundingClientRect();
      return Array.from(document.querySelectorAll<HTMLElement>("[data-meteor-target]"))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width > 0 && r.height > 0)
        .map((r) => ({
          left: r.left - canvasRect.left,
          right: r.right - canvasRect.left,
          top: r.top - canvasRect.top,
          bottom: r.bottom - canvasRect.top,
        }));
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const targets = targetRects();
      const isDark = document.documentElement.classList.contains("dark");
      const rgb = isDark ? "254, 192, 31" : "23, 23, 23";

      for (const m of meteors) {
        m.x += m.vx;
        m.y += m.vy;

        const hit = targets.some(
          (t) => m.x >= t.left && m.x <= t.right && m.y >= t.top && m.y <= t.bottom
        );
        if (hit) {
          bursts.push({ x: m.x, y: m.y, t: 0 });
          Object.assign(m, spawnMeteor());
          continue;
        }

        if (m.y - m.len > height || m.x + m.len < 0) {
          Object.assign(m, spawnMeteor());
          continue;
        }

        const dist = Math.hypot(m.vx, m.vy);
        const tailX = m.x - (m.vx / dist) * m.len;
        const tailY = m.y - (m.vy / dist) * m.len;
        const gradient = ctx!.createLinearGradient(tailX, tailY, m.x, m.y);
        gradient.addColorStop(0, `rgba(${rgb}, 0)`);
        gradient.addColorStop(1, `rgba(${rgb}, 0.85)`);
        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(tailX, tailY);
        ctx!.lineTo(m.x, m.y);
        ctx!.stroke();
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.t += 1;
        const progress = b.t / BURST_FRAMES;
        if (progress >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        const radius = progress * 18;
        ctx!.strokeStyle = `rgba(${rgb}, ${1 - progress})`;
        ctx!.lineWidth = 2;
        for (let a = 0; a < 6; a++) {
          const angle = (a / 6) * Math.PI * 2;
          ctx!.beginPath();
          ctx!.moveTo(b.x, b.y);
          ctx!.lineTo(b.x + Math.cos(angle) * radius, b.y + Math.sin(angle) * radius);
          ctx!.stroke();
        }
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10" />;
}
