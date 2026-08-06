"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useMotionTemplate,
} from "framer-motion";

/* ============================================================================
   API CONFIGURATION
============================================================================ */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/* ============================================================================
   TYPES & CONSTANTS
============================================================================ */
type Node = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  r: number;
  kind: number; // 0 email, 1 doc, 2 meeting, 3 project, 4 person
  pulse: number;
  pulseSpeed: number;
};

const KIND_COLOR = [
  "124,140,255", // email — periwinkle
  "20,20,26",    // doc — ink
  "255,157,124", // meeting — coral
  "160,160,170", // project — mist
  "20,20,26",    // person — ink
];

const SCENE_LABELS = [
  "I. Silence",
  "II. Assembly",
  "III. Memory",
  "IV. Agents",
  "V. Decision",
  "VI. Convergence",
];

const SCENE_COPY = [
  { h: "Enterprise AI", h2: "OS.", s: "" },
  {
    h: "It is waking",
    h2: "up right now.",
    s: "Every fragment of your organization is becoming one continuous thought.",
  },
  {
    h: "Nothing is filed.",
    h2: "Everything is remembered.",
    s: "Emails, documents, meetings, projects, people — held in a single living structure.",
  },
  {
    h: "Six minds,",
    h2: "one intention.",
    s: "Specialized agents that read, reason, and act — then tell each other what they found.",
  },
  {
    h: "Every decision",
    h2: "traced through time.",
    s: "Follow any outcome back through the exact threads that produced it.",
  },
  { h: "One point.", h2: "Everything connected.", s: "" },
];

/* ============================================================================
   MAIN PAGE COMPONENT
============================================================================ */
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, down: false });
  const rippleRef = useRef<{ x: number; y: number; t: number; active: boolean }>({
    x: 0,
    y: 0,
    t: 0,
    active: false,
  });
  const rafRef = useRef<number>(0);
  const sceneRef = useRef(0);

  const [awake, setAwake] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.4,
  });

  /* ---------- Physical Force Cursor ---------- */
  const mvx = useMotionValue(0);
  const mvy = useMotionValue(0);
  const magX = useSpring(mvx, { stiffness: 120, damping: 14 });
  const magY = useSpring(mvy, { stiffness: 120, damping: 14 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mvx.set(e.clientX - window.innerWidth / 2);
      mvy.set(e.clientY - window.innerHeight / 2);
    };
    const onDown = () => (mouseRef.current.down = true);
    const onUp = () => (mouseRef.current.down = false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mvx, mvy]);

  /* ---------- Wake Animation Delay ---------- */
  useEffect(() => {
    const t = setTimeout(() => setAwake(true), 900);
    return () => clearTimeout(t);
  }, []);

  /* ---------- Scroll-Driven Scene Switching ---------- */
  useEffect(() => {
    const unsub = smoothScroll.on("change", (v) => {
      const idx = Math.min(5, Math.floor(v * 6));
      if (idx !== sceneRef.current) {
        sceneRef.current = idx;
        setSceneIndex(idx);
      }
    });
    return () => unsub();
  }, [smoothScroll]);

  /* ---------- Node Formations Per Scene ---------- */
  const formationFor = useCallback(
    (n: Node, idx: number, i: number, W: number, H: number, t: number) => {
      const cx = W / 2,
        cy = H / 2;
      switch (idx) {
        case 0: {
          const a = (i * 137.508 * Math.PI) / 180;
          const r = 40 + (i % 40) * 14;
          return { x: cx + Math.cos(a) * r * 1.4, y: cy + Math.sin(a) * r * 0.7 };
        }
        case 1: {
          const a = (i * 137.508 * Math.PI) / 180 + t * 0.05;
          const r = 60 + (i % 60) * 6;
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.62 };
        }
        case 2: {
          const shell = 90 + n.kind * 55;
          const a = (i * 84.7 * Math.PI) / 180 + t * (0.03 + n.kind * 0.01);
          return { x: cx + Math.cos(a) * shell, y: cy + Math.sin(a) * shell * 0.55 };
        }
        case 3: {
          const cluster = i % 6;
          const cxs = [-0.32, 0, 0.32, -0.32, 0, 0.32];
          const cys = [-0.2, -0.2, -0.2, 0.22, 0.22, 0.22];
          const a = (i * 53 * Math.PI) / 180 + t * 0.08;
          const r = 26 + (i % 20) * 2.4;
          return {
            x: cx + cxs[cluster] * W + Math.cos(a) * r,
            y: cy + cys[cluster] * H + Math.sin(a) * r,
          };
        }
        case 4: {
          const frac = i / (nodesRef.current.length || 1);
          const x = frac * W;
          const y = cy + Math.sin(frac * 40 + i) * 10;
          return { x, y };
        }
        default: {
          const a = (i * 137.508 * Math.PI) / 180;
          const r = 4 + (i % 5);
          return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
        }
      }
    },
    []
  );

  /* ---------- Canvas Render Loop ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let DPR = Math.min(devicePixelRatio, 2);
    let W = (canvas.width = window.innerWidth * DPR);
    let H = (canvas.height = window.innerHeight * DPR);

    const COUNT = window.innerWidth < 768 ? 220 : 460;
    const nodes: Node[] = [];
    for (let i = 0; i < COUNT; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      nodes.push({
        x,
        y,
        z: Math.random(),
        vx: 0,
        vy: 0,
        baseX: x,
        baseY: y,
        r: (0.8 + Math.random() * 1.8) * DPR,
        kind: i % 5,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.5 + Math.random() * 1.2,
      });
    }
    nodesRef.current = nodes;

    const onResize = () => {
      DPR = Math.min(devicePixelRatio, 2);
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", onResize);
    onResize();

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, W, H);

      const idx = sceneRef.current;
      const mouse = mouseRef.current;
      const mx = mouse.x * DPR,
        my = mouse.y * DPR;

      const ripple = rippleRef.current;
      if (ripple.active) {
        ripple.t += 0.02;
        if (ripple.t > 1.4) ripple.active = false;
      }

      const list = nodesRef.current;

      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        const target = formationFor(n, idx, i, W, H, t);
        n.baseX += (target.x - n.baseX) * 0.02;
        n.baseY += (target.y - n.baseY) * 0.02;

        let px = n.baseX + Math.sin(t * n.pulseSpeed + i) * 4 * DPR;
        let py = n.baseY + Math.cos(t * n.pulseSpeed * 0.8 + i) * 4 * DPR;

        const dx = px - mx,
          dy = py - my;
        const dist = Math.hypot(dx, dy);
        const radius = 180 * DPR;
        if (dist < radius) {
          const force = (1 - dist / radius) * (mouse.down ? 46 : 26);
          px += (dx / (dist || 1)) * force;
          py += (dy / (dist || 1)) * force;
        }

        if (ripple.active) {
          const rdx = px - ripple.x,
            rdy = py - ripple.y;
          const rdist = Math.hypot(rdx, rdy);
          const wave = ripple.t * 900 * DPR;
          const band = Math.abs(rdist - wave);
          if (band < 60 * DPR) {
            const push = (1 - band / (60 * DPR)) * 30 * (1 - ripple.t);
            px += (rdx / (rdist || 1)) * push;
            py += (rdy / (rdist || 1)) * push;
          }
        }

        n.x = px;
        n.y = py;
      }

      // Connective Lines
      ctx.lineWidth = 0.6 * DPR;
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j += 3) {
          const b = list[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const maxD = 130 * DPR;
          if (d2 < maxD * maxD) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / maxD) * 0.14;
            ctx.strokeStyle = `rgba(20,20,26,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        const glowR = n.r * 5;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        const col = KIND_COLOR[n.kind];
        const pulse = 0.5 + Math.sin(t * n.pulseSpeed + n.pulse) * 0.5;
        grad.addColorStop(0, `rgba(${col},${0.55 + pulse * 0.25})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${col},0.9)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [formationFor]);

  const triggerRipple = (e: React.MouseEvent) => {
    const DPR = Math.min(devicePixelRatio, 2);
    rippleRef.current = {
      x: e.clientX * DPR,
      y: e.clientY * DPR,
      t: 0,
      active: true,
    };
  };

  /* ============================================================================
     AUTHENTICATION / ENTRY HANDLER
     Called ONLY when clicking "ENTER" in Scene 5.
  ============================================================================ */
  const handleGetStarted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerRipple(e);
    setIsLoading(true);

    try {
      console.log("Checking session at:", `${API_BASE}/api/me`);
      const res = await fetch(`${API_BASE}/api/me`, {
        credentials: "include", // Sends session cookies
      });

      console.log("Response Status:", res.status);

      if (res.ok) {
        console.log("Authenticated! Redirecting to Dashboard...");
        window.location.href = "/dashboard";
      } else {
        console.log("Not Authenticated. Redirecting to Google Login...");
        window.location.href = `${API_BASE}/login`;
      }
    } catch (err) {
      console.error("Session check failed or backend unreachable:", err);
      // Fallback: Attempt login flow directly
      window.location.href = `${API_BASE}/login`;
    }
  };

  /* ---------- Transformations ---------- */
  const heroOpacity = useTransform(smoothScroll, [0, 0.08, 0.15], [1, 1, 0]);
  const heroScale = useTransform(smoothScroll, [0, 0.15], [1, 1.4]);
  const heroBlur = useTransform(smoothScroll, [0, 0.15], [0, 12]);
  const heroFilter = useMotionTemplate`blur(${heroBlur}px)`;

  return (
    <main
      ref={wrapRef}
      onClick={triggerRipple}
      className="relative w-full bg-[#fdfdfc] text-[#0a0a0c] selection:bg-[#0a0a0c] selection:text-[#fdfdfc] overflow-x-hidden"
    >
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
          background: #fdfdfc;
        }
        ::-webkit-scrollbar {
          width: 0px;
        }
        @font-face {
          font-family: "system-serif";
          src: local("Georgia");
        }
        .breathe {
          animation: breathe 6s ease-in-out infinite;
        }
        @keyframes breathe {
          0%,
          100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }
        .grain::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 40;
          opacity: 0.025;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="grain" />

      {/* Living Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Initial Fade Cover */}
      <AnimatePresence>
        {!awake && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#fdfdfc]"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.19, 1, 0.22, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Top Header Controls */}
      <div className="fixed top-8 left-8 z-30 mix-blend-difference text-white text-[10px] tracking-[0.35em] uppercase font-mono">
        cognition
      </div>

      <motion.div
        className="fixed top-8 right-8 z-30 mix-blend-difference text-white text-[10px] tracking-[0.3em] uppercase font-mono text-right"
        key={sceneIndex}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {SCENE_LABELS[sceneIndex]}
      </motion.div>

      {/* Corner Magnetic Field Indicators */}
      <motion.div
        className="fixed bottom-8 left-8 z-30 w-3 h-3 border-l border-b border-[#0a0a0c]/30 pointer-events-none"
        style={{
          x: useTransform(magX, (v) => v * 0.02),
          y: useTransform(magY, (v) => v * 0.02),
        }}
      />
      <motion.div
        className="fixed bottom-8 right-8 z-30 w-3 h-3 border-r border-b border-[#0a0a0c]/30 pointer-events-none"
        style={{
          x: useTransform(magX, (v) => v * -0.02),
          y: useTransform(magY, (v) => v * 0.02),
        }}
      />

      {/* SCENE 0: Hero Title */}
      <section className="relative h-[100vh] flex items-center justify-center px-8">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
          className="text-center"
        >
          <AnimatePresence mode="wait">
            {awake && (
              <motion.div
                key="line1"
                initial={{ opacity: 0, letterSpacing: "0.4em" }}
                animate={{ opacity: 1, letterSpacing: "-0.02em" }}
                transition={{ duration: 2.2, ease: [0.19, 1, 0.22, 1] }}
              >
                <h1 className="font-light text-[clamp(28px,5vw,54px)] leading-[1.05] tracking-tight">
                  Your company already has a brain.
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: awake ? 0.4 : 0 }}
            transition={{ delay: 2.4, duration: 1.4 }}
            className="mt-6 text-[11px] tracking-[0.3em] uppercase font-mono breathe"
          >
            scroll to enter it
          </motion.p>
        </motion.div>
      </section>

      {/* SCENES 1 TO 5 */}
      {SCENE_COPY.slice(1).map((copy, i) => {
        const sceneNum = i + 1;
        const isLast = sceneNum === SCENE_COPY.length - 1;
        return (
          <SceneBlock
            key={sceneNum}
            index={sceneNum}
            copy={copy}
            isLast={isLast}
            isLoading={isLoading}
            onGetStarted={handleGetStarted}
          />
        );
      })}

      {/* Atmospheric Footer */}
      <section className="relative h-[40vh] flex items-center justify-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.35 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 1.5 }}
          className="text-[10px] tracking-[0.35em] uppercase font-mono"
        >
          it is still thinking
        </motion.p>
      </section>
    </main>
  );
}

/* ============================================================================
   SCENE BLOCK COMPONENT
============================================================================ */
function SceneBlock({
  index,
  copy,
  isLast,
  isLoading,
  onGetStarted,
}: {
  index: number;
  copy: { h: string; h2: string; s: string };
  isLast: boolean;
  isLoading: boolean;
  onGetStarted: (e: React.MouseEvent) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.32, 0.68, 1], [0, 1, 1, 0]);
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [index % 2 === 0 ? -2 : 2, index % 2 === 0 ? 2 : -2]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.92]);

  return (
    <section
      ref={ref}
      className="relative h-[100vh] flex items-center justify-center px-8 overflow-hidden"
    >
      <motion.div style={{ y, opacity, rotate, scale }} className="text-center max-w-3xl">
        <span className="block text-[10px] tracking-[0.35em] uppercase font-mono opacity-40 mb-6">
          {String(index).padStart(2, "0")}
        </span>

        <h2 className="font-light text-[clamp(32px,6vw,72px)] leading-[1.02] tracking-tight">
          {copy.h}
          <br />
          <span
            className="italic"
            style={{ fontFamily: "system-serif, Georgia, serif" }}
          >
            {copy.h2}
          </span>
        </h2>

        {copy.s && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 0.55, y: 0 }}
            viewport={{ once: false, amount: 0.6 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-8 text-[15px] font-light max-w-md mx-auto leading-relaxed"
          >
            {copy.s}
          </motion.p>
        )}

        {/* Action Button on Final Scene */}
        {isLast && (
          <motion.button
            onClick={onGetStarted}
            disabled={isLoading}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.6 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 140, damping: 12 }}
            className="relative mt-14 w-28 h-28 rounded-full mx-auto flex items-center justify-center group cursor-pointer"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffffff 0%, #0a0a0c 70%)",
              boxShadow:
                "0 0 0 1px rgba(10,10,12,0.08), 0 30px 60px -20px rgba(10,10,12,0.35)",
            }}
          >
            <motion.span
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{
                boxShadow: [
                  "0 0 0px 0px rgba(124,140,255,0.0)",
                  "0 0 40px 8px rgba(124,140,255,0.35)",
                  "0 0 0px 0px rgba(124,140,255,0.0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] tracking-[0.2em] uppercase text-white font-mono relative z-10">
              {isLoading ? "Checking..." : "ENTER"}
            </span>
          </motion.button>
        )}
      </motion.div>
    </section>
  );
}