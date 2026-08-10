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
type NodeKind = 0 | 1 | 2 | 3 | 4 | 5; // email, doc, meeting, project, person, agent core

type Node = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  r: number;
  kind: NodeKind;
  pulse: number;
  pulseSpeed: number;
  label?: string;
};

type SynapticPacket = {
  fromIdx: number;
  toIdx: number;
  progress: number;
  speed: number;
  color: string;
};

// Vibrant light-mode particle palette
const KIND_META = [
  { name: "Email", color: "124, 58, 237", hex: "#7c3aed" },   // Deep Violet
  { name: "Doc", color: "2, 132, 199", hex: "#0284c7" },     // Radiant Blue
  { name: "Meeting", color: "234, 88, 12", hex: "#ea580c" }, // Bright Amber
  { name: "Project", color: "5, 150, 105", hex: "#059669" }, // Emerald
  { name: "Person", color: "225, 29, 72", hex: "#e11d48" },   // Hot Pink
  { name: "Agent Core", color: "147, 51, 234", hex: "#9333ea" } // Vivid Purple
];

const SCENE_TITLES = [
  { id: "01", label: "SILENCE", subtitle: "Cognitive Awakening" },
  { id: "02", label: "ASSEMBLY", subtitle: "Neural Fusion" },
  { id: "03", label: "MEMORY", subtitle: "Zero-File Storage" },
  { id: "04", label: "AGENTS", subtitle: "Hex-Mind Intention" },
  { id: "05", label: "DECISION", subtitle: "Temporal Lineage" },
  { id: "06", label: "SINGULARITY", subtitle: "Unified OS Portal" },
];

const SCENE_COPY = [
  {
    h: "Your company already has a brain.",
    h2: "It is waking up right now.",
    s: "Every fragment of your enterprise — conversations, decisions, code, and context — fusing into one living, continuous intelligence.",
  },
  {
    h: "Enterprise AI OS.",
    h2: "Sub-millisecond awareness.",
    s: "Stop forcing humans to bridge broken tools. The OS reads across every silo, continuously indexing organizational intent in real time.",
  },
  {
    h: "Nothing is filed.",
    h2: "Everything is remembered.",
    s: "Unstructured noise becomes structured insight. Emails, docs, meetings, projects, and people live in a fluid, high-dimensional vector space.",
  },
  {
    h: "Six specialized minds,",
    h2: "one collective objective.",
    s: "Autonomous background agents cross-examine findings, draft solutions, predict bottlenecks, and execute workflows without manual prompts.",
  },
  {
    h: "Every single decision",
    h2: "traced through time.",
    s: "Audit any outcome backwards across months of slack messages, spec revisions, and executive calls to see exactly how and why it happened.",
  },
  {
    h: "One unified entry point.",
    h2: "Everything connected.",
    s: "Step into the neural interface of your company. Experience autonomous enterprise intelligence.",
  },
];

const AI_AGENTS = [
  { name: "Synthesizer", role: "Document & Context Fusion", latency: "1.2ms", load: "94%" },
  { name: "Sentinel", role: "Security & Policy Compliance", latency: "0.8ms", load: "88%" },
  { name: "Vector", role: "High-Dimensional Memory Search", latency: "2.1ms", load: "97%" },
  { name: "Chronos", role: "Decision Lineage & Auditing", latency: "1.4ms", load: "91%" },
  { name: "Weaver", role: "Cross-Department Communication", latency: "1.9ms", load: "85%" },
  { name: "Architect", role: "Autonomous Action Execution", latency: "0.5ms", load: "99%" },
];

/* ============================================================================
   MAIN PAGE COMPONENT
============================================================================ */
export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<SynapticPacket[]>([]);
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
  const [activeTab, setActiveTab] = useState<number>(0);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    mass: 0.3,
  });

  /* ---------- Physical Force & 3D Tilt Cursor ---------- */
  const mvx = useMotionValue(0);
  const mvy = useMotionValue(0);
  const magX = useSpring(mvx, { stiffness: 100, damping: 18 });
  const magY = useSpring(mvy, { stiffness: 100, damping: 18 });

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
    const t = setTimeout(() => setAwake(true), 600);
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

  /* ---------- Dynamic Neural Node Formations Per Scene ---------- */
  const formationFor = useCallback(
    (n: Node, idx: number, i: number, W: number, H: number, t: number) => {
      const cx = W / 2;
      const cy = H / 2;

      switch (idx) {
        case 0: {
          // Dormant Quantum Core Cloud
          const angle = (i * 137.508 * Math.PI) / 180 + t * 0.02;
          const radius = 50 + (i % 45) * 16;
          return {
            x: cx + Math.cos(angle) * radius * 1.5,
            y: cy + Math.sin(angle) * radius * 0.75,
          };
        }
        case 1: {
          // Double Helical Neural Assembly
          const spiral = (i / 400) * Math.PI * 8 + t * 0.2;
          const r = 180 + Math.sin(i * 0.05 + t) * 40;
          const offset = i % 2 === 0 ? 1 : -1;
          return {
            x: cx + Math.cos(spiral) * r * offset,
            y: cy + (i - 200) * 2.2 + Math.sin(spiral) * 30,
          };
        }
        case 2: {
          // Concentric Data Shells (Memory Spheres)
          const shell = 80 + n.kind * 65;
          const angle = (i * 84.7 * Math.PI) / 180 + t * (0.04 + n.kind * 0.015);
          return {
            x: cx + Math.cos(angle) * shell * 1.6,
            y: cy + Math.sin(angle) * shell * 0.85,
          };
        }
        case 3: {
          // 6 Hexagonal Agent Cluster Hubs
          const cluster = i % 6;
          const hexAngle = (cluster * 60 * Math.PI) / 180;
          const clusterDist = Math.min(W, H) * 0.28;
          const hubX = cx + Math.cos(hexAngle) * clusterDist;
          const hubY = cy + Math.sin(hexAngle) * clusterDist;

          const localAngle = (i * 53 * Math.PI) / 180 + t * 0.12;
          const localR = 20 + (i % 25) * 3;
          return {
            x: hubX + Math.cos(localAngle) * localR,
            y: hubY + Math.sin(localAngle) * localR,
          };
        }
        case 4: {
          // Temporal Lineage Wave Graphs
          const frac = i / (nodesRef.current.length || 1);
          const x = frac * (W * 0.85) + W * 0.075;
          const wave = Math.sin(frac * 12 + t * 1.5) * 120 + Math.cos(frac * 6) * 40;
          return {
            x,
            y: cy + wave,
          };
        }
        case 5: default: {
          // Hyper-Dense Core Singularity Ring
          const angle = (i * 137.508 * Math.PI) / 180 + t * 0.15;
          const r = 12 + (i % 8) * 6;
          return {
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r,
          };
        }
      }
    },
    []
  );

  /* ---------- Canvas Render Loop (PBR Light-Mode Neural Particle Engine) ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = (canvas.width = window.innerWidth * DPR);
    let H = (canvas.height = window.innerHeight * DPR);

    const COUNT = window.innerWidth < 768 ? 200 : 420;
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
        r: (1.2 + Math.random() * 2.2) * DPR,
        kind: (i % 6) as NodeKind,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.6 + Math.random() * 1.4,
      });
    }
    nodesRef.current = nodes;

    // Initialize random synaptic packets
    const packets: SynapticPacket[] = [];
    for (let p = 0; p < 35; p++) {
      const fromIdx = Math.floor(Math.random() * COUNT);
      let toIdx = Math.floor(Math.random() * COUNT);
      while (toIdx === fromIdx) toIdx = Math.floor(Math.random() * COUNT);

      packets.push({
        fromIdx,
        toIdx,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.008,
        color: KIND_META[nodes[fromIdx].kind].color,
      });
    }
    packetsRef.current = packets;

    const onResize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    window.addEventListener("resize", onResize);
    onResize();

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, W, H);

      const idx = sceneRef.current;
      const mouse = mouseRef.current;
      const mx = mouse.x * DPR;
      const my = mouse.y * DPR;

      const ripple = rippleRef.current;
      if (ripple.active) {
        ripple.t += 0.025;
        if (ripple.t > 1.6) ripple.active = false;
      }

      const list = nodesRef.current;

      // Update Node Physics
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        const target = formationFor(n, idx, i, W, H, t);

        // Interpolate base position with smooth dampening
        n.baseX += (target.x - n.baseX) * 0.035;
        n.baseY += (target.y - n.baseY) * 0.035;

        let px = n.baseX + Math.sin(t * n.pulseSpeed + i) * 6 * DPR;
        let py = n.baseY + Math.cos(t * n.pulseSpeed * 0.9 + i) * 6 * DPR;

        // Mouse Gravitational Repulsion / Attraction
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.hypot(dx, dy);
        const radius = 220 * DPR;
        if (dist < radius && dist > 0) {
          const force = (1 - dist / radius) * (mouse.down ? -60 : 38);
          px += (dx / dist) * force;
          py += (dy / dist) * force;
        }

        // Kinetic Shockwave Ripple Effect
        if (ripple.active) {
          const rdx = px - ripple.x;
          const rdy = py - ripple.y;
          const rdist = Math.hypot(rdx, rdy);
          const wave = ripple.t * 1100 * DPR;
          const band = Math.abs(rdist - wave);
          if (band < 80 * DPR) {
            const push = (1 - band / (80 * DPR)) * 45 * (1 - ripple.t);
            px += (rdx / (rdist || 1)) * push;
            py += (rdy / (rdist || 1)) * push;
          }
        }

        n.x = px;
        n.y = py;
      }

      // Draw Synaptic Web Connections (Crisp, light-mode friendly lines)
      ctx.lineWidth = 0.8 * DPR;
      for (let i = 0; i < list.length; i++) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j += 4) {
          const b = list[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const maxD = 140 * DPR;
          if (d2 < maxD * maxD) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / maxD) * 0.18;
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw Neural Light Packets Traveling along Synapses
      const pkts = packetsRef.current;
      for (let p = 0; p < pkts.length; p++) {
        const pkt = pkts[p];
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.fromIdx = Math.floor(Math.random() * list.length);
          pkt.toIdx = Math.floor(Math.random() * list.length);
        }

        const na = list[pkt.fromIdx];
        const nb = list[pkt.toIdx];
        if (!na || !nb) continue;

        const curX = na.x + (nb.x - na.x) * pkt.progress;
        const curY = na.y + (nb.y - na.y) * pkt.progress;

        ctx.fillStyle = `rgba(${pkt.color}, 0.95)`;
        ctx.shadowColor = `rgba(${pkt.color}, 0.6)`;
        ctx.shadowBlur = 6 * DPR;
        ctx.beginPath();
        ctx.arc(curX, curY, 2.2 * DPR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Render Glowing Node Elements
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        const glowR = n.r * 6.5;
        const col = KIND_META[n.kind].color;
        const pulse = 0.5 + Math.sin(t * n.pulseSpeed + n.pulse) * 0.5;

        // Radial Bioluminescent Aura optimized for white background
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grad.addColorStop(0, `rgba(${col}, ${0.35 + pulse * 0.3})`);
        grad.addColorStop(0.5, `rgba(${col}, 0.08)`);
        grad.addColorStop(1, `rgba(${col}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core Solid Node Particle
        ctx.fillStyle = `rgba(${col}, 0.95)`;
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
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    rippleRef.current = {
      x: e.clientX * DPR,
      y: e.clientY * DPR,
      t: 0,
      active: true,
    };
  };

  /* ============================================================================
     AUTHENTICATION / ENTRY HANDLER
  ============================================================================ */
  const handleGetStarted = async (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerRipple(e);
    setIsLoading(true);

    try {
      console.log("Checking enterprise session at:", `${API_BASE}/api/v1/auth/me`);
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        credentials: "include",
      });

      console.log("Response Status:", res.status);

      if (res.ok) {
        console.log("Authenticated! Entering Enterprise OS Dashboard...");
        window.location.href = "/dashboard";
      } else {
        console.log("Not Authenticated. Redirecting to Enterprise SSO / Google Login...");
        window.location.href = `${API_BASE}/api/v1/auth/login`;
      }
    } catch (err) {
      console.error("Session check failed or backend unreachable:", err);
      window.location.href = `${API_BASE}/api/v1/auth/login`;
    }
  };

  /* ---------- Motion Transformations ---------- */
  const heroOpacity = useTransform(smoothScroll, [0, 0.08, 0.16], [1, 1, 0]);
  const heroScale = useTransform(smoothScroll, [0, 0.16], [1, 1.15]);
  const heroBlur = useTransform(smoothScroll, [0, 0.16], [0, 16]);
  const heroFilter = useMotionTemplate`blur(${heroBlur}px)`;

  return (
    <main
      ref={wrapRef}
      onClick={triggerRipple}
      className="relative w-full min-h-screen bg-[#FFFFFF] text-zinc-900 font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden"
    >
      {/* Google Fonts Import for High-End Visuals */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-serif-italic { font-family: 'Instrument Serif', serif; font-style: italic; }
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-code { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      {/* Pristine Light Mesh Background Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft floating blurred mesh gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-purple-200/40 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-200/35 blur-[150px]" />
        <div className="absolute top-[35%] right-[20%] w-[45vw] h-[45vw] rounded-full bg-cyan-100/40 blur-[120px]" />
        <div className="absolute top-[60%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-rose-100/30 blur-[140px]" />
        
        {/* Crisp grid pattern for subtle tech depth */}
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:32px_32px] opacity-70" />
      </div>

      {/* Living Light Particle Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Ultra-Luxury White Initial Fade Screen */}
      <AnimatePresence>
        {!awake && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#FFFFFF] flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative flex items-center justify-center"
            >
              <div className="w-20 h-20 rounded-full border border-purple-500/20 border-t-purple-600 animate-spin" />
              <span className="absolute text-[11px] tracking-[0.35em] font-mono-code text-purple-600 font-semibold uppercase">
                INIT
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glass Top Navigation Bar */}
      <header className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between px-6 py-3.5 rounded-full bg-white/70 backdrop-blur-2xl border border-zinc-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-[1px] shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-ping" />
            </div>
          </div>
          <div>
            <span className="block text-xs font-extrabold tracking-[0.2em] uppercase text-zinc-950 font-grotesk">
              COGNITION AI
            </span>
            <span className="block text-[9px] text-zinc-400 font-mono-code tracking-widest font-medium">
              ENTERPRISE OS // V4.8.2
            </span>
          </div>
        </div>

        {/* Live System Telemetry */}
        <div className="hidden md:flex items-center gap-8 text-[11px] font-mono-code text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wider">SYNAPTIC RATE: <strong className="text-zinc-900 font-semibold">99.4%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="tracking-wider">NODES ACTIVE: <strong className="text-zinc-900 font-semibold">4,280</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="tracking-wider">LATENCY: <strong className="text-zinc-900 font-semibold">0.4ms</strong></span>
          </div>
        </div>

        {/* Scene Indicator Capsule */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-100/90 border border-zinc-200/90 text-xs font-mono-code shadow-inner"
          >
            <span className="text-purple-600 font-bold">
              {SCENE_TITLES[sceneIndex].id}
            </span>
            <span className="text-zinc-300">//</span>
            <span className="text-zinc-800 tracking-wider font-semibold">
              {SCENE_TITLES[sceneIndex].label}
            </span>
          </motion.div>
        </AnimatePresence>
      </header>

      {/* Right Side Glass HUD Navigator */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 p-3 rounded-full bg-white/60 backdrop-blur-xl border border-zinc-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        {SCENE_TITLES.map((st, i) => {
          const isActive = sceneIndex === i;
          return (
            <button
              key={st.id}
              onClick={() => {
                const targetY = (i / 6) * (document.body.scrollHeight - window.innerHeight);
                window.scrollTo({ top: targetY, behavior: "smooth" });
              }}
              className="group relative flex items-center justify-end"
            >
              {/* Tooltip on hover */}
              <span className="absolute right-10 opacity-0 group-hover:opacity-100 transition-all duration-200 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono-code whitespace-nowrap text-zinc-100 shadow-xl">
                {st.id} — {st.label}
              </span>

              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? "bg-purple-600 scale-125 shadow-[0_0_12px_rgba(147,51,234,0.5)]"
                    : "bg-zinc-300 group-hover:bg-zinc-500"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Dynamic Magnetic Corner Anchors */}
      <motion.div
        className="fixed bottom-6 left-6 z-30 w-4 h-4 border-l-2 border-b-2 border-purple-600/30 pointer-events-none"
        style={{
          x: useTransform(magX, (v) => v * 0.03),
          y: useTransform(magY, (v) => v * 0.03),
        }}
      />
      <motion.div
        className="fixed bottom-6 right-6 z-30 w-4 h-4 border-r-2 border-b-2 border-purple-600/30 pointer-events-none"
        style={{
          x: useTransform(magX, (v) => v * -0.03),
          y: useTransform(magY, (v) => v * 0.03),
        }}
      />

      {/* ============================================================================
         SCENE 0: HERO INTRO
      ============================================================================ */}
      <section className="relative h-[100vh] flex flex-col items-center justify-center px-6 text-center z-10">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, filter: heroFilter }}
          className="max-w-5xl flex flex-col items-center"
        >
          {/* Holographic Glowing Pill Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: awake ? 1 : 0, y: awake ? 0 : 20 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-purple-50/80 border border-purple-200/80 backdrop-blur-md mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span className="text-xs font-mono-code tracking-[0.25em] uppercase text-purple-700 font-bold">
              Next-Gen Enterprise Core
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            {awake && (
              <motion.div
                key="line1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              >
                <h1 className="font-grotesk font-extrabold text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[1.02] text-zinc-950">
                  Your enterprise already has a{" "}
                  <span className="font-serif-italic font-normal text-purple-600 underline decoration-purple-300 decoration-wavy decoration-2">
                    brain.
                  </span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: awake ? 0.8 : 0 }}
            transition={{ delay: 1.6, duration: 1.2 }}
            className="mt-8 text-lg sm:text-2xl font-light text-zinc-600 max-w-3xl leading-relaxed font-sans"
          >
            Every meeting, document, signal, and decision — fused into one living, high-dimensional neural graph.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: awake ? 1 : 0, y: awake ? 0 : 20 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="mt-14 flex flex-col items-center gap-3"
          >
            <div className="w-6 h-10 rounded-full border-2 border-zinc-300 flex items-start justify-center p-1.5 bg-white shadow-sm">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_#9333ea]"
              />
            </div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-mono-code text-zinc-400 font-semibold">
              Scroll to explore cognition
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================================
         SCENES 1 TO 5: INTERACTIVE SCROLLETTING BLOCKS
      ============================================================================ */}
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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        );
      })}

      {/* Atmospheric Deep Footer */}
      <section className="relative h-[50vh] flex flex-col items-center justify-center text-center px-6 border-t border-zinc-200/80 bg-[#FAFAFC]">
        <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center mb-6 shadow-inner">
          <div className="w-4 h-4 rounded-full bg-purple-600 animate-ping" />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.8 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 1.5 }}
          className="text-xs tracking-[0.4em] uppercase font-mono-code text-purple-700 font-bold"
        >
          COGNITION OS // ALWAYS LEARNING
        </motion.p>
        <p className="mt-3 text-xs text-zinc-400 font-mono-code">
          © {new Date().getFullYear()} Cognition AI Inc. All rights reserved.
        </p>
      </section>
    </main>
  );
}

/* ============================================================================
   SCENE BLOCK COMPONENT WITH INTERACTIVE HUD WIDGETS
============================================================================ */
function SceneBlock({
  index,
  copy,
  isLast,
  isLoading,
  onGetStarted,
  activeTab,
  setActiveTab,
}: {
  index: number;
  copy: { h: string; h2: string; s: string };
  isLast: boolean;
  isLoading: boolean;
  onGetStarted: (e: React.MouseEvent) => void;
  activeTab: number;
  setActiveTab: (t: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] py-24 flex items-center justify-center px-6 lg:px-16 overflow-hidden z-10"
    >
      <motion.div
        style={{ y, opacity, scale }}
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
      >
        {/* Left Side Copy */}
        <div className={`lg:col-span-6 text-left ${index % 2 === 0 ? "lg:order-2" : "lg:order-1"}`}>
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono-code text-purple-700 mb-6 font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_#9333ea]" />
            <span>SCENE {String(index).padStart(2, "0")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-grotesk font-extrabold tracking-tight leading-[1.08] text-zinc-950">
            {copy.h}
            <br />
            <span className="font-serif-italic font-normal text-purple-600">
              {copy.h2}
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg font-light text-zinc-600 leading-relaxed max-w-xl">
            {copy.s}
          </p>

          {/* Render CTA Button on Final Scene */}
          {isLast && (
            <div className="mt-10">
              <motion.button
                onClick={onGetStarted}
                disabled={isLoading}
                whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(124,58,237,0.25)" }}
                whileTap={{ scale: 0.97 }}
                className="relative group overflow-hidden px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-mono-code text-sm tracking-widest font-semibold uppercase shadow-xl transition-all duration-300 border border-purple-400/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      ENTER ENTERPRISE OS
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Right Side Futuristic Light HUD Card Graphic */}
        <div className={`lg:col-span-6 ${index % 2 === 0 ? "lg:order-1" : "lg:order-2"}`}>
          <div className="relative p-6 sm:p-8 rounded-[32px] bg-white/80 backdrop-blur-2xl border border-zinc-200/90 shadow-[0_30px_70px_rgba(0,0,0,0.06)] overflow-hidden group hover:border-purple-300 transition-all duration-500">
            {/* Ambient Inner Light Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-200/60 transition-all duration-700" />

            {/* Top Widget Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-zinc-100 mb-6 font-mono-code text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]" />
                <span className="text-zinc-900 font-bold">HUD INTERFACE</span>
              </div>
              <span className="font-semibold text-zinc-400">MODULE // 0{index}</span>
            </div>

            {/* SCENE SPECIFIC GRAPHIC CONTENT */}
            {index === 1 && (
              <div className="space-y-4 font-mono-code text-xs">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                  <div className="flex justify-between text-zinc-500 font-medium">
                    <span>Neural Ingestion Stream</span>
                    <span className="text-emerald-600 font-bold">LIVE</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-200/70 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 rounded-full"
                      animate={{ width: ["10%", "85%", "45%", "98%"] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    <span className="block text-zinc-400 text-[10px] font-semibold">VECTOR INDEX</span>
                    <span className="text-lg text-zinc-900 font-bold font-grotesk">14.8M Vectors</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    <span className="block text-zinc-400 text-[10px] font-semibold">SYNC ACCURACY</span>
                    <span className="text-lg text-purple-600 font-bold font-grotesk">99.98%</span>
                  </div>
                </div>
              </div>
            )}

            {index === 2 && (
              <div className="space-y-2.5 font-mono-code text-xs">
                {KIND_META.slice(0, 5).map((km, idx) => (
                  <div
                    key={km.name}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/70 hover:bg-zinc-100/80 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: km.hex, boxShadow: `0 0 8px ${km.hex}` }}
                      />
                      <span className="text-zinc-900 font-semibold">{km.name} Stream</span>
                    </div>
                    <span className="text-zinc-500 font-medium">{(idx + 1) * 1420} Nodes Synced</span>
                  </div>
                ))}
              </div>
            )}

            {index === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5 font-mono-code text-xs">
                  {AI_AGENTS.map((agent, aIdx) => (
                    <button
                      key={agent.name}
                      onClick={() => setActiveTab(aIdx)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        activeTab === aIdx
                          ? "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/25"
                          : "bg-zinc-50 border-zinc-200/80 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="font-bold">{agent.name}</div>
                      <div className={`text-[10px] ${activeTab === aIdx ? "text-purple-100" : "text-zinc-400"}`}>
                        {agent.role}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs font-mono-code text-zinc-700">
                  <div className="flex justify-between mb-1">
                    <span className="text-purple-800 font-bold">ACTIVE AGENT: {AI_AGENTS[activeTab].name}</span>
                    <span className="text-emerald-600 font-bold">{AI_AGENTS[activeTab].latency}</span>
                  </div>
                  <p className="text-zinc-500 text-[11px] mb-2">{AI_AGENTS[activeTab].role}</p>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400 font-semibold">COMPUTATIONAL LOAD</span>
                    <span className="text-zinc-900 font-bold">{AI_AGENTS[activeTab].load}</span>
                  </div>
                </div>
              </div>
            )}

            {index === 4 && (
              <div className="space-y-4 font-mono-code text-xs">
                <div className="relative pl-6 space-y-4 border-l-2 border-purple-300">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_8px_#9333ea]" />
                    <span className="text-purple-800 font-bold">14:32 PM — Decision Node #9401</span>
                    <p className="text-zinc-600 text-[11px] mt-0.5">Q3 Roadmap approved based on sentiment synthesis from 14 Slack threads & 3 budget specs.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-sky-500" />
                    <span className="text-sky-800 font-bold">11:15 AM — Vector Alignment</span>
                    <p className="text-zinc-600 text-[11px] mt-0.5">Cross-referenced legal policy doc v4.2 with engineering task queue.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-amber-800 font-bold">09:00 AM — Initial Trigger</span>
                    <p className="text-zinc-600 text-[11px] mt-0.5">Executive sync call transcript parsed and linked to Project Vector hub.</p>
                  </div>
                </div>
              </div>
            )}

            {index === 5 && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-purple-50 border border-purple-200">
                  <div className="w-16 h-16 rounded-full border border-purple-400/50 animate-ping" />
                  <span className="absolute text-purple-700 font-mono-code text-xs font-bold">READY</span>
                </div>
                <p className="text-xs font-mono-code text-zinc-500 max-w-xs">
                  Enterprise SSO session check available. Click below to establish your neural uplink.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}