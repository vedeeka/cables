"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface DashboardData {
  status: string;
  user: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
  };
  latest_email: string;
  latest_calendar: string;
  latest_drive: string;
  latest_sheets: string;
  documents_synced: number;
  chunks_created: number;
  response_msg: string;
}

/* ---------------------------------------------------------
   Icons — same icon set, kept as inline SVG paths
--------------------------------------------------------- */
const METRIC_ICONS: { [key: string]: React.ReactNode } = {
  documents: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </>
  ),
  chunks: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  integrations: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </>
  ),
  status: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const payload: DashboardData = await res.json();
      setData(payload);
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err.message || "An error occurred while loading your workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      window.location.href = "/";
    }
  }

  /* ---------------------------------------------------------
     Loading state — premium skeleton, same "loading" flag
  --------------------------------------------------------- */
  if (loading) {
    return (
      <div className="dc-shell">
        <GlobalStyles />
        <div className="dc-loading-wrap">
          <div className="dc-loading-card">
            <div className="dc-orbit">
              <span className="dc-orbit-dot" />
              <span className="dc-orbit-dot" />
              <span className="dc-orbit-dot" />
            </div>
            <p className="dc-loading-text">Preparing your workspace</p>
            <div className="dc-skeleton-grid">
              <div className="dc-skel dc-shimmer" />
              <div className="dc-skel dc-shimmer" />
              <div className="dc-skel dc-shimmer" />
              <div className="dc-skel dc-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     Error state — same "error" flag, elegant treatment
  --------------------------------------------------------- */
  if (error) {
    return (
      <div className="dc-shell">
        <GlobalStyles />
        <div className="dc-loading-wrap">
          <div className="dc-error-card">
            <div className="dc-error-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="dc-error-title">Something interrupted the sync</h3>
            <p className="dc-error-text">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isHealthy = data.status.toLowerCase() === "ok" || data.status.toLowerCase() === "healthy";

  return (
    <div className="dc-shell">
      <GlobalStyles />

      <main className="dc-main">
        {/* Ambient background accents */}
        <div className="dc-ambient dc-ambient-a" />
        <div className="dc-ambient dc-ambient-b" />

        {/* Header */}
        <header className="dc-header">
          <div>
            <span className="dc-eyebrow">Workspace Overview</span>
            <h1 className="dc-title">Dashboard</h1>
            <p className="dc-subtitle">
              Welcome back, <strong className="dc-subtitle-strong">{data.user.name}</strong>
            </p>
          </div>

          <div className={isHealthy ? "dc-status-pill" : "dc-status-pill dc-status-pill-warn"}>
            <span className={isHealthy ? "dc-status-dot" : "dc-status-dot dc-status-dot-warn"} />
            {data.status.toUpperCase()}
          </div>
        </header>

        {/* Metric cards */}
        <section className="dc-cards-grid">
          <div className="dc-card dc-card-indigo">
            <div className="dc-card-top">
              <span className="dc-card-label">Documents</span>
              <div className="dc-card-icon dc-card-icon-indigo">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {METRIC_ICONS.documents}
                </svg>
              </div>
            </div>
            <h2 className="dc-card-value">{data.documents_synced}</h2>
            <span className="dc-card-foot">synced this session</span>
          </div>

          <div className="dc-card dc-card-violet">
            <div className="dc-card-top">
              <span className="dc-card-label">Knowledge Chunks</span>
              <div className="dc-card-icon dc-card-icon-violet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {METRIC_ICONS.chunks}
                </svg>
              </div>
            </div>
            <h2 className="dc-card-value">{data.chunks_created}</h2>
            <span className="dc-card-foot">indexed &amp; searchable</span>
          </div>

          <div className="dc-card dc-card-cyan">
            <div className="dc-card-top">
              <span className="dc-card-label">Integrations</span>
              <div className="dc-card-icon dc-card-icon-cyan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {METRIC_ICONS.integrations}
                </svg>
              </div>
            </div>
            <h2 className="dc-card-value">4</h2>
            <span className="dc-card-foot">connected services</span>
          </div>

          <div className="dc-card dc-card-emerald">
            <div className="dc-card-top">
              <span className="dc-card-label">Status</span>
              <div className="dc-card-icon dc-card-icon-emerald">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {METRIC_ICONS.status}
                </svg>
              </div>
            </div>
            <h2 className="dc-card-value dc-card-value-emerald">{data.status.toUpperCase()}</h2>
            <span className="dc-card-foot">all systems reporting</span>
          </div>
        </section>

        {/* Recent activity */}
        <section className="dc-panel dc-activity-panel">
          <h2 className="dc-panel-title">Recent Activity</h2>
          <div className="dc-timeline">
            <div className="dc-timeline-line" />

            <div className="dc-timeline-item">
              <span className="dc-timeline-dot">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="dc-timeline-text">Gmail synced successfully</span>
            </div>

            <div className="dc-timeline-item">
              <span className="dc-timeline-dot">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="dc-timeline-text">Calendar updated</span>
            </div>

            <div className="dc-timeline-item">
              <span className="dc-timeline-dot">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="dc-timeline-text">Drive indexed successfully</span>
            </div>

            <div className="dc-timeline-item dc-timeline-item-last">
              <span className="dc-timeline-dot">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="dc-timeline-text">Google Sheets processed 339 rows</span>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="dc-integration-grid">
          <div className="dc-integration-card">
            <div className="dc-integration-head">
              <span className="dc-badge dc-badge-gmail">Gmail</span>
              <span className="dc-integration-label">Latest Email</span>
            </div>
            <p className="dc-integration-content">{data.latest_email || "No recent email found"}</p>
          </div>

          <div className="dc-integration-card">
            <div className="dc-integration-head">
              <span className="dc-badge dc-badge-calendar">Calendar</span>
              <span className="dc-integration-label">Latest Calendar Event</span>
            </div>
            <p className="dc-integration-content">{data.latest_calendar || "No upcoming events"}</p>
          </div>

          <div className="dc-integration-card">
            <div className="dc-integration-head">
              <span className="dc-badge dc-badge-drive">Drive</span>
              <span className="dc-integration-label">Latest Drive File</span>
            </div>
            <p className="dc-integration-content">{data.latest_drive || "No recent drive file"}</p>
          </div>

          <div className="dc-integration-card">
            <div className="dc-integration-head">
              <span className="dc-badge dc-badge-sheets">Sheets</span>
              <span className="dc-integration-label">Latest Sheets Data</span>
            </div>
            <p className="dc-integration-content">{data.latest_sheets || "No sheet data found"}</p>
          </div>
        </section>

        {/* System banner */}
        {data.response_msg && (
          <section className="dc-system-banner">
            <div className="dc-system-banner-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div>
              <strong className="dc-system-banner-title">System status</strong>
              <p className="dc-system-banner-text">{data.response_msg}</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------
   Styles — scoped via a single <style> tag, class-based so
   hover / focus / media-query states are possible (inline
   style objects can't express those).
--------------------------------------------------------- */
function GlobalStyles() {
  return (
    <style>{`
      * { box-sizing: border-box; }

      .dc-shell {
        display: flex;
        height: 100%;
        width: 100%;
        background: #ffffff;
        color: #0f172a;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      }

      .dc-shell ::-webkit-scrollbar { width: 10px; height: 10px; }
      .dc-shell ::-webkit-scrollbar-track { background: transparent; }
      .dc-shell ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #c7c9f5, #e0d4fb);
        border-radius: 20px;
        border: 2px solid #ffffff;
      }

      .dc-sidebar-wrap { flex-shrink: 0; }

      .dc-main {
        position: relative;
        flex: 1;
        padding: 40px 48px 64px;
        max-width: 1280px;
        overflow-x: hidden;
      }

      .dc-ambient {
        position: absolute;
        border-radius: 50%;
        filter: blur(70px);
        opacity: 0.35;
        pointer-events: none;
        z-index: 0;
      }
      .dc-ambient-a {
        width: 340px; height: 340px;
        top: -120px; right: 60px;
        background: radial-gradient(circle, #c7d2fe 0%, transparent 70%);
      }
      .dc-ambient-b {
        width: 280px; height: 280px;
        top: 220px; left: -140px;
        background: radial-gradient(circle, #a7f3d0 0%, transparent 70%);
      }

      .dc-header, .dc-cards-grid, .dc-panel, .dc-integration-grid, .dc-system-banner {
        position: relative;
        z-index: 1;
      }

      /* Header */
      .dc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 36px;
        animation: dc-fade-up 0.5s ease both;
      }
      .dc-eyebrow {
        display: block;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        background: linear-gradient(90deg, #4f46e5, #7c3aed);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        margin-bottom: 8px;
      }
      .dc-title {
        font-size: 32px;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin: 0 0 6px 0;
        color: #0f172a;
      }
      .dc-subtitle { margin: 0; font-size: 14.5px; color: #6b7280; }
      .dc-subtitle-strong { color: #0f172a; font-weight: 700; }

      .dc-status-pill {
        display: flex;
        align-items: center;
        gap: 7px;
        background: #ffffff;
        color: #15803d;
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.04em;
        border: 1px solid #d1fae5;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.12);
      }
      .dc-status-pill-warn {
        color: #b45309;
        border-color: #fde68a;
        box-shadow: 0 4px 14px rgba(217, 119, 6, 0.12);
      }
      .dc-status-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #16a34a;
        box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
      }
      .dc-status-dot-warn {
        background: #d97706;
        box-shadow: 0 0 0 3px rgba(217,119,6,0.15);
      }

      /* Metric cards */
      .dc-cards-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 18px;
        margin-bottom: 28px;
      }
      .dc-card {
        position: relative;
        background: #ffffff;
        padding: 22px 22px 20px;
        border-radius: 18px;
        border: 1px solid #eef0f4;
        box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 12px 24px -16px rgba(16,24,40,0.10);
        overflow: hidden;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        animation: dc-fade-up 0.5s ease both;
      }
      .dc-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 20px 32px -16px rgba(16,24,40,0.16);
      }
      .dc-card::before {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
      }
      .dc-card-indigo::before { background: linear-gradient(90deg, #6366f1, #a5b4fc); }
      .dc-card-violet::before { background: linear-gradient(90deg, #8b5cf6, #c4b5fd); }
      .dc-card-cyan::before { background: linear-gradient(90deg, #06b6d4, #67e8f9); }
      .dc-card-emerald::before { background: linear-gradient(90deg, #10b981, #6ee7b7); }

      .dc-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .dc-card-label { font-size: 12.5px; font-weight: 600; color: #6b7280; }
      .dc-card-icon {
        width: 30px; height: 30px;
        border-radius: 9px;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .dc-card-icon-indigo { background: linear-gradient(135deg,#eef0ff,#e0e7ff); color: #4338ca; }
      .dc-card-icon-violet { background: linear-gradient(135deg,#f5f3ff,#ede9fe); color: #7c3aed; }
      .dc-card-icon-cyan { background: linear-gradient(135deg,#ecfeff,#cffafe); color: #0891b2; }
      .dc-card-icon-emerald { background: linear-gradient(135deg,#f0fdf4,#dcfce7); color: #16a34a; }

      .dc-card-value { font-size: 30px; font-weight: 800; margin: 0 0 4px 0; letter-spacing: -0.02em; color: #0f172a; }
      .dc-card-value-emerald { color: #16a34a; font-size: 22px; }
      .dc-card-foot { font-size: 11.5px; color: #9ca3af; font-weight: 500; }

      /* Panels */
      .dc-panel {
        background: #ffffff;
        padding: 26px 28px;
        border-radius: 18px;
        border: 1px solid #eef0f4;
        box-shadow: 0 1px 2px rgba(16,24,40,0.04), 0 12px 24px -18px rgba(16,24,40,0.10);
        margin-bottom: 24px;
        animation: dc-fade-up 0.55s ease both;
      }
      .dc-panel-title {
        font-size: 15.5px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 18px 0;
        letter-spacing: -0.01em;
      }

      /* Timeline */
      .dc-timeline { position: relative; padding-left: 4px; }
      .dc-timeline-line {
        position: absolute;
        left: 13px; top: 6px; bottom: 20px;
        width: 2px;
        background: linear-gradient(180deg, #a5b4fc, #d1fae5);
        border-radius: 2px;
      }
      .dc-timeline-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 12px 0;
      }
      .dc-timeline-item-last { padding-bottom: 0; }
      .dc-timeline-dot {
        position: relative;
        z-index: 1;
        width: 26px; height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #34d399, #10b981);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 3px 10px rgba(16,185,129,0.35);
      }
      .dc-timeline-text { font-size: 13.5px; font-weight: 500; color: #374151; }

      /* Integrations */
      .dc-integration-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
        margin-bottom: 24px;
      }
      .dc-integration-card {
        background: #fafbfc;
        padding: 20px 22px;
        border-radius: 16px;
        border: 1px solid #eef0f4;
        transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        animation: dc-fade-up 0.6s ease both;
      }
      .dc-integration-card:hover {
        background: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 12px 24px -16px rgba(16,24,40,0.18);
      }
      .dc-integration-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
      .dc-integration-label { font-size: 12.5px; font-weight: 600; color: #6b7280; }
      .dc-integration-content {
        font-size: 15px; font-weight: 600; color: #0f172a;
        margin: 0; word-break: break-word; line-height: 1.45;
      }

      .dc-badge {
        font-size: 10.5px; font-weight: 700;
        padding: 4px 10px; border-radius: 7px;
        text-transform: uppercase; letter-spacing: 0.03em;
      }
      .dc-badge-gmail { background: linear-gradient(135deg,#eff6ff,#dbeafe); color: #2563eb; }
      .dc-badge-calendar { background: linear-gradient(135deg,#f0fdf4,#dcfce7); color: #16a34a; }
      .dc-badge-drive { background: linear-gradient(135deg,#faf5ff,#f3e8ff); color: #9333ea; }
      .dc-badge-sheets { background: linear-gradient(135deg,#fffbeb,#fef3c7); color: #d97706; }

      /* System banner */
      .dc-system-banner {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: linear-gradient(135deg, #eef0ff 0%, #f5f3ff 100%);
        border: 1px solid #dde0ff;
        border-radius: 16px;
        padding: 18px 20px;
        animation: dc-fade-up 0.65s ease both;
      }
      .dc-system-banner-icon {
        flex-shrink: 0;
        margin-top: 1px;
        width: 30px; height: 30px;
        border-radius: 9px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(99,102,241,0.35);
      }
      .dc-system-banner-title { color: #312e81; display: block; margin-bottom: 3px; font-size: 13.5px; font-weight: 700; }
      .dc-system-banner-text { margin: 0; color: #3730a3; font-size: 13.5px; line-height: 1.5; }

      /* Loading state */
      .dc-loading-wrap {
        height: 100%; width: 100%;
        display: flex; align-items: center; justify-content: center;
        background: #ffffff;
      }
      .dc-loading-card { display: flex; flex-direction: column; align-items: center; gap: 20px; width: 320px; }
      .dc-orbit { position: relative; width: 46px; height: 46px; }
      .dc-orbit-dot {
        position: absolute; top: 0; left: 50%;
        width: 9px; height: 9px; border-radius: 50%;
        margin-left: -4.5px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        transform-origin: 4.5px 23px;
        animation: dc-orbit-spin 1.1s linear infinite;
      }
      .dc-orbit-dot:nth-child(2) { animation-delay: -0.37s; opacity: 0.7; }
      .dc-orbit-dot:nth-child(3) { animation-delay: -0.74s; opacity: 0.4; }
      .dc-loading-text { color: #6b7280; font-size: 14px; font-weight: 600; margin: 0; }
      .dc-skeleton-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
      .dc-skel { height: 60px; border-radius: 14px; background: #f1f2f6; }
      .dc-shimmer {
        background: linear-gradient(90deg, #f1f2f6 25%, #f8f8fb 37%, #f1f2f6 63%);
        background-size: 400% 100%;
        animation: dc-shimmer 1.6s ease infinite;
      }

      /* Error state */
      .dc-error-card {
        display: flex; flex-direction: column; align-items: center; gap: 12px;
        max-width: 380px; text-align: center;
        background: #ffffff; padding: 32px 30px;
        border-radius: 20px; border: 1px solid #fde2e2;
        box-shadow: 0 16px 40px -20px rgba(220,38,38,0.18);
      }
      .dc-error-icon {
        width: 46px; height: 46px; border-radius: 50%;
        background: #fef2f2; display: flex; align-items: center; justify-content: center;
      }
      .dc-error-title { margin: 0; font-size: 15.5px; font-weight: 700; color: #0f172a; }
      .dc-error-text { color: #b91c1c; font-size: 13.5px; font-weight: 500; margin: 0; line-height: 1.5; }

      @keyframes dc-fade-up {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes dc-orbit-spin { to { transform: rotate(360deg); } }
      @keyframes dc-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

      @media (prefers-reduced-motion: reduce) {
        .dc-card, .dc-panel, .dc-integration-card, .dc-header, .dc-system-banner,
        .dc-orbit-dot, .dc-shimmer { animation: none !important; }
        .dc-card:hover, .dc-integration-card:hover { transform: none; }
      }

      @media (max-width: 1180px) {
        .dc-cards-grid { grid-template-columns: repeat(2, 1fr); }
        .dc-integration-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .dc-shell { flex-direction: column; }
        .dc-main { padding: 24px 20px 40px; }
        .dc-cards-grid { grid-template-columns: 1fr; }
        .dc-header { flex-direction: column; align-items: flex-start; gap: 14px; }
        .dc-title { font-size: 26px; }
      }
    `}</style>
  );
}