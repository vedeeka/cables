"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8000";

interface SummaryResponse {
  status: string;
  summary: string;
}

const LOADING_PHRASES = [
  "Reading the room…",
  "Cross-referencing threads…",
  "Weighing signal against noise…",
  "Reducing to essence…",
];

type VesselState = "loading" | "error" | "empty" | "ready";

export default function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSummary = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/summary`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Status:", res.status);
        console.error("Response:", text);
        throw new Error(`Failed: ${res.status}`);
      }

      const data: SummaryResponse = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setError("Unable to load enterprise summary. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const isBusy = loading || refreshing;

  useEffect(() => {
    if (isBusy) {
      tickerRef.current = setInterval(() => {
        setPhraseIdx((i) => (i + 1) % LOADING_PHRASES.length);
      }, 1700);
    } else if (tickerRef.current) {
      clearInterval(tickerRef.current);
    }
    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, [isBusy]);

  let vesselState: VesselState = "empty";
  if (isBusy) vesselState = "loading";
  else if (error) vesselState = "error";
  else if (summary) vesselState = "ready";

  const paragraphs = summary
    ? summary.split(/\n{2,}/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true">
        <div className="mesh mesh-a" />
        <div className="mesh mesh-b" />
        <svg className="grain" aria-hidden="true">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        
      </div>

      <main className="stage">
        <header className="masthead">
          <div className="eyebrow-row">
            <span className={`pulse-dot pulse-${vesselState}`} />
            <span className="eyebrow">WORKSPACE SYNTHESIS · LIVE</span>
          </div>
          <h1 className="title">
            The Distillate<span className="title-mark">.</span>
          </h1>
          <p className="subtitle">
            Your connected workspace, reduced to what actually matters.
          </p>

          <button
            onClick={() => fetchSummary(true)}
            disabled={isBusy}
            className="lever"
            aria-label="Re-distill summary"
          >
            <span className="lever-track">
              <span className={`lever-knob ${refreshing ? "spinning" : ""}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </span>
            </span>
            <span className="lever-label">{refreshing ? "RE-DISTILLING" : "RE-DISTILL"}</span>
          </button>
        </header>

        <section className="vessel-stage">
          <Flask state={vesselState} />
          <div className="status-readout">
            {vesselState === "loading" && (
              <span key={phraseIdx} className="ticker">
                {LOADING_PHRASES[phraseIdx]}
              </span>
            )}
            {vesselState === "ready" && <span className="ticker ready-tick">Distillation complete</span>}
            {vesselState === "error" && <span className="ticker error-tick">Vessel cracked mid-process</span>}
            {vesselState === "empty" && <span className="ticker">Vessel is clear — nothing brewed yet</span>}
          </div>
        </section>

        <section className="distillate-panel">
          {vesselState === "error" && (
            <div className="panel-body panel-error">
              <p className="panel-heading">Something curdled.</p>
              <p className="panel-copy">{error}</p>
              <button onClick={() => fetchSummary()} className="ghost-btn">
                Try again
              </button>
            </div>
          )}

          {vesselState === "empty" && (
            <div className="panel-body panel-empty">
              <p className="panel-heading">Nothing distilled yet.</p>
              <p className="panel-copy">
                Run a distillation and your workspace summary will settle here.
              </p>
            </div>
          )}

          {vesselState === "ready" && (
            <div className="panel-body panel-ready">
              <div className="panel-tag-row">
                <span className="tag">GENERATED</span>
                <span className="tag-time">{new Date().toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</span>
              </div>
              <div className="distillate-text">
                {paragraphs.map((p, i) => (
                  <p key={i} className="pour-line" style={{ animationDelay: `${i * 90}ms` }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {vesselState === "loading" && (
            <div className="panel-body panel-loading">
              <div className="skeleton-line w-90" />
              <div className="skeleton-line w-100" />
              <div className="skeleton-line w-70" />
              <div className="skeleton-line w-85" />
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap");
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          background: #ffffff;
          overflow: hidden;
          font-family: "DM Sans", sans-serif;
        }

        .atmosphere {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .mesh {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.4;
        }
        .mesh-a {
          width: 46vw;
          height: 46vw;
          top: -14vw;
          right: -10vw;
          background: radial-gradient(circle, #f4b482, transparent 70%);
          animation: drift-a 22s ease-in-out infinite;
        }
        .mesh-b {
          width: 38vw;
          height: 38vw;
          bottom: -12vw;
          left: -8vw;
          background: radial-gradient(circle, #a6ece5, transparent 70%);
          opacity: 0.35;
          animation: drift-b 26s ease-in-out infinite;
        }
        @keyframes drift-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4%, 5%) scale(1.08); }
        }
        @keyframes drift-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, -4%) scale(1.05); }
        }
        .grain {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.02;
          mix-blend-mode: multiply;
        }

        .stage {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
          padding: clamp(2.5rem, 6vw, 5rem) 1.5rem 6rem;
        }

        .masthead {
          text-align: center;
          margin-bottom: clamp(2.5rem, 5vw, 3.5rem);
        }
        .eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .eyebrow {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          color: #8a8294;
        }
        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8a8294;
        }
        .pulse-loading { background: #14b8a6; animation: dot-pulse 1.2s ease-in-out infinite; }
        .pulse-ready { background: #e67e3c; box-shadow: 0 0 8px rgba(230,126,60,0.5); }
        .pulse-error { background: #e0473a; }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .title {
          font-family: "Instrument Serif", serif;
          font-weight: 400;
          font-size: clamp(2.6rem, 7vw, 3.8rem);
          color: #1c1626;
          letter-spacing: -0.01em;
          line-height: 1;
          margin: 0 0 0.6rem;
        }
        .title-mark { color: #e67e3c; }

        .subtitle {
          color: #6f6779;
          font-size: 14.5px;
          max-width: 30rem;
          margin: 0 auto 1.8rem;
          line-height: 1.6;
        }

        .lever {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid rgba(28, 22, 38, 0.12);
          border-radius: 999px;
          padding: 6px 16px 6px 6px;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease;
          box-shadow: 0 1px 2px rgba(28,22,38,0.04);
        }
        .lever:hover:not(:disabled) {
          border-color: rgba(230, 126, 60, 0.5);
          background: rgba(230, 126, 60, 0.06);
        }
        .lever:disabled { cursor: not-allowed; opacity: 0.7; }
        .lever-track {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(145deg, #e67e3c, #b85c26);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(230, 126, 60, 0.4);
        }
        .lever-knob { color: #fff7ee; display: flex; }
        .lever-knob.spinning { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lever-label {
          font-family: "DM Mono", monospace;
          font-size: 10.5px;
          letter-spacing: 0.12em;
          color: #1c1626;
        }

        .vessel-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: clamp(2rem, 5vw, 3rem);
        }
        .status-readout {
          margin-top: 14px;
          height: 20px;
          font-family: "DM Mono", monospace;
          font-size: 12px;
          color: #8a8294;
        }
        .ticker {
          display: inline-block;
          animation: ticker-in 0.4s ease;
        }
        .ready-tick { color: #c96628; }
        .error-tick { color: #d1453a; }
        @keyframes ticker-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .distillate-panel {
          position: relative;
          border-radius: 20px;
          background: linear-gradient(180deg, #fdfcfa, #ffffff);
          border: 1px solid rgba(28, 22, 38, 0.08);
          box-shadow: 0 1px 2px rgba(28,22,38,0.04), 0 24px 48px -28px rgba(28,22,38,0.16);
          backdrop-filter: blur(20px);
          overflow: hidden;
        }
        .distillate-panel::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(230,126,60,0.35), transparent 40%, transparent 70%, rgba(20,184,166,0.25));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .panel-body { padding: clamp(1.6rem, 4vw, 2.4rem); }

        .panel-heading {
          font-family: "Instrument Serif", serif;
          font-size: 1.5rem;
          color: #1c1626;
          margin: 0 0 0.5rem;
        }
        .panel-copy {
          color: #6f6779;
          font-size: 13.5px;
          line-height: 1.6;
          margin: 0 0 1.2rem;
        }
        .panel-error .panel-heading { color: #d1453a; }

        .ghost-btn {
          font-family: "DM Mono", monospace;
          font-size: 11.5px;
          letter-spacing: 0.06em;
          color: #1c1626;
          background: transparent;
          border: 1px solid rgba(28, 22, 38, 0.14);
          border-radius: 10px;
          padding: 9px 18px;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .ghost-btn:hover { border-color: rgba(209,69,58,0.5); background: rgba(209,69,58,0.06); }

        .panel-tag-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 1.4rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid rgba(28, 22, 38, 0.07);
        }
        .tag {
          font-family: "DM Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          color: #fff7ee;
          background: linear-gradient(135deg, #e67e3c, #c96628);
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 600;
        }
        .tag-time {
          font-family: "DM Mono", monospace;
          font-size: 11px;
          color: #948c9e;
        }

        .distillate-text {
          font-size: 15px;
          line-height: 1.85;
          color: #2c2536;
        }
        .pour-line {
          margin: 0 0 1.1em;
          opacity: 0;
          transform: translateY(10px);
          animation: pour-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .pour-line:last-child { margin-bottom: 0; }
        @keyframes pour-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .panel-empty { text-align: center; }
        .panel-empty .panel-copy { margin: 0; }

        .skeleton-line {
          height: 12px;
          border-radius: 6px;
          margin-bottom: 14px;
          background: linear-gradient(90deg, rgba(28,22,38,0.04), rgba(28,22,38,0.10), rgba(28,22,38,0.04));
          background-size: 200% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
        .skeleton-line:last-child { margin-bottom: 0; }
        .w-90 { width: 90%; } .w-100 { width: 100%; } .w-70 { width: 70%; } .w-85 { width: 85%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mesh, .pulse-loading, .lever-knob.spinning, .skeleton-line, .pour-line, .ticker {
            animation: none !important;
          }
        }

        @media (max-width: 480px) {
          .lever-label { display: none; }
          .lever { padding: 6px; }
        }
      `}</style>
    </div>
  );
}

function Flask({ state }: { state: VesselState }) {
  const fillLevel = state === "ready" ? 0.74 : state === "loading" ? 0.4 : state === "error" ? 0.16 : 0;
  const liquidColor =
    state === "ready" ? "url(#liquidReady)" : state === "error" ? "url(#liquidError)" : "url(#liquidLoading)";
  const bellyTop = 108;
  const bellyBottom = 232;
  const bellyHeight = bellyBottom - bellyTop;
  const liquidY = bellyBottom - bellyHeight * fillLevel;

  return (
    <div className={`flask-wrap flask-${state}`}>
      <svg width="176" height="200" viewBox="0 0 240 260" fill="none">
        <defs>
          <clipPath id="bellyClip">
            <circle cx="120" cy="170" r="62" />
          </clipPath>
          <linearGradient id="liquidReady" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0a25f" />
            <stop offset="100%" stopColor="#c85f22" />
          </linearGradient>
          <linearGradient id="liquidLoading" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7fe4db" />
            <stop offset="100%" stopColor="#1f9c92" />
          </linearGradient>
          <linearGradient id="liquidError" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8c7f" />
            <stop offset="100%" stopColor="#a83c33" />
          </linearGradient>
          <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {state === "ready" && (
          <circle cx="120" cy="170" r="66" fill="#e67e3c" opacity="0.22" filter="url(#softGlow)" className="glow-pulse" />
        )}

        {/* neck */}
        <path
          d="M104 108 L100 40 Q100 30 112 28 L128 28 Q140 30 140 40 L136 108 Z"
          fill="rgba(28,22,38,0.03)"
          stroke="rgba(28,22,38,0.32)"
          strokeWidth="1.5"
        />
        {/* spout */}
        <path
          d="M136 46 Q168 42 176 66 Q178 74 170 76"
          fill="none"
          stroke="rgba(28,22,38,0.32)"
          strokeWidth="1.5"
        />

        {/* belly outline */}
        <circle cx="120" cy="170" r="63" fill="rgba(28,22,38,0.025)" stroke="rgba(28,22,38,0.32)" strokeWidth="1.5" />

        {/* liquid */}
        {fillLevel > 0 && (
          <g clipPath="url(#bellyClip)">
            <rect x="56" y={liquidY} width="128" height={bellyHeight} fill={liquidColor} className="liquid-shimmer" />
            <rect x="56" y={liquidY - 2} width="128" height="4" fill="rgba(255,255,255,0.35)" />
            {state === "loading" && (
              <>
                <circle className="bubble b1" cx="102" cy="220" r="3" />
                <circle className="bubble b2" cx="130" cy="228" r="2.4" />
                <circle className="bubble b3" cx="118" cy="215" r="2" />
                <circle className="bubble b4" cx="140" cy="222" r="2.6" />
              </>
            )}
          </g>
        )}

        {state === "error" && (
          <g stroke="#1c1626" strokeWidth="1.4" opacity="0.65">
            <path d="M108 130 L120 150 L112 165 L128 190" fill="none" />
            <path d="M150 140 L140 160 L150 178" fill="none" />
          </g>
        )}

        {/* stand */}
        <line x1="70" y1="235" x2="170" y2="235" stroke="rgba(28,22,38,0.22)" strokeWidth="1.5" />
        <line x1="90" y1="235" x2="90" y2="250" stroke="rgba(28,22,38,0.22)" strokeWidth="1.5" />
        <line x1="150" y1="235" x2="150" y2="250" stroke="rgba(28,22,38,0.22)" strokeWidth="1.5" />
      </svg>

      <style jsx>{`
        .flask-wrap { position: relative; transition: transform 0.6s ease; }
        .flask-ready { animation: settle 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes settle {
          0% { transform: translateY(-6px) scale(0.98); }
          60% { transform: translateY(2px) scale(1.01); }
          100% { transform: translateY(0) scale(1); }
        }
        .liquid-shimmer { transition: y 1.1s cubic-bezier(0.22, 1, 0.36, 1); }
        .glow-pulse { animation: glow-breathe 2.4s ease-in-out infinite; }
        @keyframes glow-breathe {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.34; }
        }
        .bubble { fill: rgba(255,255,255,0.65); animation: rise 2.2s ease-in infinite; }
        .b1 { animation-delay: 0s; }
        .b2 { animation-delay: 0.5s; }
        .b3 { animation-delay: 1s; }
        .b4 { animation-delay: 1.5s; }
        @keyframes rise {
          0% { opacity: 0; transform: translateY(0); }
          15% { opacity: 0.8; }
          90% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-70px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .flask-ready, .glow-pulse, .bubble, .liquid-shimmer { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}