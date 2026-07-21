"use client";

import { useEffect, useRef } from "react";

type Star = {
  xFrac: number;
  yFrac: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
};

type OrbitCenter = { cxFrac: number; cyFrac: number };

// A ring with no body on it — just the path itself, permanently visible.
type OrbitRing = {
  center: OrbitCenter;
  radiusFraction: number;
};

type OrbitBody = {
  kind: "moon" | "planet" | "satellite";
  center: OrbitCenter;
  radiusFraction: number;
  angle: number;
  angularSpeed: number;
  size: number;
  trailSpan: number;
  hasRing?: boolean;
};

const TRAIL_SEGMENTS = 36;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const CENTERS: OrbitCenter[] = [
  { cxFrac: -0.06, cyFrac: -0.06 }, // top-left
  { cxFrac: 1.06, cyFrac: -0.06 }, // top-right
  { cxFrac: -0.06, cyFrac: 1.06 }, // bottom-left
];

const ORBIT_RINGS: OrbitRing[] = [
  { center: CENTERS[0], radiusFraction: 0.85 },
  { center: CENTERS[1], radiusFraction: 0.75 },
  { center: CENTERS[2], radiusFraction: 0.7 },
  { center: { cxFrac: 0.3, cyFrac: 0.15 }, radiusFraction: 0.18 },
  { center: { cxFrac: 0.78, cyFrac: 0.58 }, radiusFraction: 0.22 },
  { center: { cxFrac: 0.5, cyFrac: 0.9 }, radiusFraction: 0.3 },
];

function makeBodies(): OrbitBody[] {
  return [
    {
      kind: "moon",
      center: CENTERS[0],
      radiusFraction: 0.28,
      angle: rand(0, Math.PI * 2),
      angularSpeed: rand(0.0016, 0.0022),
      size: 6,
      trailSpan: 0.65,
    },
    {
      kind: "planet",
      center: CENTERS[0],
      radiusFraction: 0.48,
      angle: rand(0, Math.PI * 2),
      angularSpeed: rand(0.001, 0.0014),
      size: 13,
      trailSpan: 0.85,
      hasRing: true,
    },
    {
      kind: "satellite",
      center: CENTERS[0],
      radiusFraction: 0.65,
      angle: rand(0, Math.PI * 2),
      angularSpeed: -rand(0.003, 0.0042),
      size: 4,
      trailSpan: 0.5,
    },
    {
      kind: "planet",
      center: CENTERS[1],
      radiusFraction: 0.34,
      angle: rand(0, Math.PI * 2),
      angularSpeed: -rand(0.0012, 0.0017),
      size: 9,
      trailSpan: 0.75,
    },
    {
      kind: "satellite",
      center: CENTERS[1],
      radiusFraction: 0.55,
      angle: rand(0, Math.PI * 2),
      angularSpeed: rand(0.0032, 0.0045),
      size: 3.5,
      trailSpan: 0.45,
    },
    {
      kind: "moon",
      center: CENTERS[2],
      radiusFraction: 0.3,
      angle: rand(0, Math.PI * 2),
      angularSpeed: rand(0.0018, 0.0024),
      size: 5,
      trailSpan: 0.6,
    },
    {
      kind: "planet",
      center: CENTERS[2],
      radiusFraction: 0.5,
      angle: rand(0, Math.PI * 2),
      angularSpeed: -rand(0.001, 0.0015),
      size: 8,
      trailSpan: 0.7,
    },
  ];
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    xFrac: rand(0, 1),
    yFrac: rand(0, 1),
    size: rand(0.5, 2),
    baseAlpha: rand(0.15, 0.5),
    twinkleSpeed: rand(0.01, 0.03),
    phase: rand(0, Math.PI * 2),
  }));
}

// A pale, all-yellow-toned night-sky background for unauthenticated pages:
// scattered twinkling stars, a few bare orbit rings, and slow-moving planets/
// moons/satellites (satellites drawn as a small body + solar panels, not just
// a dot) trailing fading arcs like a star-trail timelapse.
export function CosmicBackground() {
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

    const stars = makeStars(90);
    const bodies = makeBodies();
    let frame = 0;
    let raf = 0;

    function yellowRgb(isDark: boolean): string {
      // Matches the app's brand yellow / light-mode link gold, so this stays
      // on-theme without ever needing a non-yellow hue.
      return isDark ? "254, 192, 31" : "146, 102, 10";
    }

    function drawStars(rgb: string) {
      for (const s of stars) {
        const alpha = s.baseAlpha * (0.6 + 0.4 * Math.sin(frame * s.twinkleSpeed + s.phase));
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${rgb}, ${Math.max(0, alpha).toFixed(3)})`;
        ctx!.arc(s.xFrac * width, s.yFrac * height, s.size, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawOrbitRings(rgb: string) {
      for (const ring of ORBIT_RINGS) {
        const cx = ring.center.cxFrac * width;
        const cy = ring.center.cyFrac * height;
        const radius = ring.radiusFraction * Math.max(width, height);
        ctx!.beginPath();
        ctx!.strokeStyle = `rgba(${rgb}, 0.12)`;
        ctx!.lineWidth = 1;
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx!.stroke();
      }
    }

    function drawSatelliteShape(x: number, y: number, size: number, angle: number, rgb: string) {
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(angle);
      ctx!.fillStyle = `rgba(${rgb}, 0.75)`;
      ctx!.fillRect(-size * 0.4, -size * 0.3, size * 0.8, size * 0.6);
      ctx!.fillRect(-size * 1.6, -size * 0.12, size * 1.1, size * 0.24);
      ctx!.fillRect(size * 0.5, -size * 0.12, size * 1.1, size * 0.24);
      ctx!.strokeStyle = `rgba(${rgb}, 0.6)`;
      ctx!.lineWidth = Math.max(0.6, size * 0.08);
      ctx!.beginPath();
      ctx!.moveTo(0, -size * 0.3);
      ctx!.lineTo(0, -size * 0.9);
      ctx!.stroke();
      ctx!.restore();
    }

    function drawBodies(rgb: string) {
      for (const body of bodies) {
        body.angle += body.angularSpeed;
        const cx = body.center.cxFrac * width;
        const cy = body.center.cyFrac * height;
        const radius = body.radiusFraction * Math.max(width, height);
        const dir = body.angularSpeed >= 0 ? 1 : -1;

        // Trailing arc: segments fade from full alpha at the body's current
        // position down to zero at the tail — the "path fades after a while" look.
        for (let i = 0; i < TRAIL_SEGMENTS; i++) {
          const t0 = i / TRAIL_SEGMENTS;
          const t1 = (i + 1) / TRAIL_SEGMENTS;
          const a0 = body.angle - dir * body.trailSpan * t0;
          const a1 = body.angle - dir * body.trailSpan * t1;
          const start = Math.min(a0, a1);
          const end = Math.max(a0, a1);
          const alpha = (1 - t0) * 0.3;
          ctx!.beginPath();
          ctx!.strokeStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
          ctx!.lineWidth = body.kind === "satellite" ? 1 : 1.5;
          ctx!.arc(cx, cy, radius, start, end);
          ctx!.stroke();
        }

        const bx = cx + radius * Math.cos(body.angle);
        const by = cy + radius * Math.sin(body.angle);

        if (body.kind === "satellite") {
          drawSatelliteShape(bx, by, body.size, body.angle + Math.PI / 2, rgb);
          continue;
        }

        if (body.hasRing) {
          ctx!.save();
          ctx!.translate(bx, by);
          ctx!.rotate(0.5);
          ctx!.scale(1, 0.35);
          ctx!.strokeStyle = `rgba(${rgb}, 0.4)`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.arc(0, 0, body.size * 1.8, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.restore();
        }

        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${rgb}, 0.65)`;
        ctx!.arc(bx, by, body.size, 0, Math.PI * 2);
        ctx!.fill();

        if (body.kind === "moon") {
          // A couple of faint craters for texture.
          ctx!.fillStyle = `rgba(${rgb}, 0.3)`;
          ctx!.beginPath();
          ctx!.arc(bx - body.size * 0.3, by - body.size * 0.2, body.size * 0.25, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(bx + body.size * 0.25, by + body.size * 0.3, body.size * 0.18, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains("dark");
      const rgb = yellowRgb(isDark);

      drawStars(rgb);
      drawOrbitRings(rgb);
      drawBodies(rgb);

      frame += 1;
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
