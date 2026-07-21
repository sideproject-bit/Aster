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

type OrbitBody = {
  kind: "moon" | "planet" | "satellite";
  radiusFraction: number; // fraction of max(width, height), resolved to px on layout
  radius: number;
  angle: number;
  angularSpeed: number;
  size: number;
  trailSpan: number;
  hasRing?: boolean;
};

const METEOR_COUNT = 30;
const BURST_FRAMES = 20;
const TRAIL_SEGMENTS = 36;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// A decorative cosmic background for unauthenticated pages: a dense meteor
// shower up front, plus pale planets/moon/satellites tracing long, fading
// orbital arcs around the top-left corner — like a star-trail timelapse.
// Meteors "pop" when they cross a `[data-meteor-target]` element (the logo, a
// heading); orbit bodies have no collision behavior and just pass behind.
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
      for (const body of orbitBodies) {
        body.radius = body.radiusFraction * Math.max(width, height);
      }
    }

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

    const orbitBodies: OrbitBody[] = [
      {
        kind: "moon",
        radiusFraction: 0.32,
        radius: 0,
        angle: rand(0, Math.PI * 2),
        angularSpeed: rand(0.0016, 0.0022),
        size: 7,
        trailSpan: 0.7,
      },
      {
        kind: "planet",
        radiusFraction: 0.5,
        radius: 0,
        angle: rand(0, Math.PI * 2),
        angularSpeed: rand(0.001, 0.0015),
        size: 10,
        trailSpan: 0.85,
        hasRing: true,
      },
      {
        kind: "planet",
        radiusFraction: 0.68,
        radius: 0,
        angle: rand(0, Math.PI * 2),
        angularSpeed: -rand(0.0012, 0.0018),
        size: 8,
        trailSpan: 0.75,
      },
      {
        kind: "satellite",
        radiusFraction: 0.42,
        radius: 0,
        angle: rand(0, Math.PI * 2),
        angularSpeed: rand(0.003, 0.0045),
        size: 2.5,
        trailSpan: 0.5,
      },
      {
        kind: "satellite",
        radiusFraction: 0.6,
        radius: 0,
        angle: rand(0, Math.PI * 2),
        angularSpeed: -rand(0.0028, 0.004),
        size: 2,
        trailSpan: 0.45,
      },
    ];

    resize();
    window.addEventListener("resize", resize);

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

    function orbitColor(kind: OrbitBody["kind"], isDark: boolean): string {
      if (kind === "moon") return isDark ? "222, 224, 232" : "110, 112, 122";
      if (kind === "satellite") return isDark ? "255, 255, 255" : "70, 72, 82";
      return isDark ? "205, 196, 224" : "120, 108, 140";
    }

    function drawOrbitBodies(isDark: boolean) {
      const cx = -width * 0.05;
      const cy = -height * 0.05;

      for (const body of orbitBodies) {
        body.angle += body.angularSpeed;
        const rgb = orbitColor(body.kind, isDark);
        const dir = body.angularSpeed >= 0 ? 1 : -1;

        // Trailing arc: split the recent path into short segments whose alpha
        // fades from full (at the body's current position) to zero (the tail),
        // which is what gives the "path fades after a while" star-trail look.
        for (let i = 0; i < TRAIL_SEGMENTS; i++) {
          const t0 = i / TRAIL_SEGMENTS;
          const t1 = (i + 1) / TRAIL_SEGMENTS;
          const a0 = body.angle - dir * body.trailSpan * t0;
          const a1 = body.angle - dir * body.trailSpan * t1;
          const start = Math.min(a0, a1);
          const end = Math.max(a0, a1);
          const alpha = (1 - t0) * 0.35;
          ctx!.beginPath();
          ctx!.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
          ctx!.lineWidth = body.kind === "satellite" ? 1 : 1.5;
          ctx!.arc(cx, cy, body.radius, start, end);
          ctx!.stroke();
        }

        const bx = cx + body.radius * Math.cos(body.angle);
        const by = cy + body.radius * Math.sin(body.angle);

        if (body.hasRing) {
          ctx!.save();
          ctx!.translate(bx, by);
          ctx!.rotate(0.5);
          ctx!.scale(1, 0.35);
          ctx!.strokeStyle = `rgba(${rgb}, 0.5)`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(0, 0, body.size * 1.8, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.restore();
        }

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${rgb}, 0.9)`;
        ctx!.arc(bx, by, body.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const targets = targetRects();
      const isDark = document.documentElement.classList.contains("dark");
      const meteorRgb = isDark ? "254, 192, 31" : "23, 23, 23";

      drawOrbitBodies(isDark);

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
        gradient.addColorStop(0, `rgba(${meteorRgb}, 0)`);
        gradient.addColorStop(1, `rgba(${meteorRgb}, 0.85)`);
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
        ctx!.strokeStyle = `rgba(${meteorRgb}, ${1 - progress})`;
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
