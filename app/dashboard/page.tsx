"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  if (loading) {
    return (
      <div style={styles.centerMsg}>
        <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 600 }}>
          Loading workspace data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerMsg}>
        <p style={{ color: "#dc2626", fontSize: "16px", fontWeight: 600 }}>
          {error}
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={styles.container}>
      {/* Imported Sidebar Component */}
      <Sidebar
        user={data.user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
      />

      {/* Main View Container */}
      <main style={styles.main}>
        {/* Header Bar */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Dashboard</h1>
            <p style={styles.headerSubtitle}>
              Welcome back, <strong style={{ color: "#0f172a" }}>{data.user.name}</strong>
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot} />
              {data.status.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Top Metric Cards */}
        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>Documents</span>
            <h2 style={styles.cardValue}>{data.documents_synced}</h2>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Knowledge Chunks</span>
            <h2 style={styles.cardValue}>{data.chunks_created}</h2>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Integrations</span>
            <h2 style={styles.cardValue}>4</h2>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>Status</span>
            <h2 style={{ ...styles.cardValue, color: "#16a34a" }}>
              {data.status.toUpperCase()}
            </h2>
          </div>
        </div>

        {/* Recent Activity List */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div style={styles.activityList}>
            <div style={styles.activityItem}>
              <span style={styles.activityDot} />
              <span style={styles.activityText}>Gmail synced successfully</span>
            </div>
            <div style={styles.activityItem}>
              <span style={styles.activityDot} />
              <span style={styles.activityText}>Calendar updated</span>
            </div>
            <div style={styles.activityItem}>
              <span style={styles.activityDot} />
              <span style={styles.activityText}>Drive indexed successfully</span>
            </div>
            <div style={{ ...styles.activityItem, borderBottom: "none" }}>
              <span style={styles.activityDot} />
              <span style={styles.activityText}>Google Sheets processed 339 rows</span>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <div style={styles.integrationGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.badgeGmail}>Gmail</span>
              <span style={styles.panelLabel}>Latest Email</span>
            </div>
            <p style={styles.panelContent}>
              {data.latest_email || "No recent email found"}
            </p>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.badgeCalendar}>Calendar</span>
              <span style={styles.panelLabel}>Latest Calendar Event</span>
            </div>
            <p style={styles.panelContent}>
              {data.latest_calendar || "No upcoming events"}
            </p>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.badgeDrive}>Drive</span>
              <span style={styles.panelLabel}>Latest Drive File</span>
            </div>
            <p style={styles.panelContent}>
              {data.latest_drive || "No recent drive file"}
            </p>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.badgeSheets}>Sheets</span>
              <span style={styles.panelLabel}>Latest Sheets Data</span>
            </div>
            <p style={styles.panelContent}>
              {data.latest_sheets || "No sheet data found"}
            </p>
          </div>
        </div>

        {/* System Message Banner */}
        {data.response_msg && (
          <div style={styles.systemBanner}>
            <strong style={{ color: "#1e40af", display: "block", marginBottom: "4px" }}>
              System Status Message:
            </strong>
            <p style={{ margin: 0, color: "#1e3a8a", fontSize: "14px" }}>
              {data.response_msg}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  main: {
    flex: 1,
    padding: "32px 40px",
    maxWidth: "1200px",
  },
  centerMsg: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  headerTitle: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.02em",
  },
  headerSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    border: "1px solid #bbf7d0",
  },
  statusDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#16a34a",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "28px",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  cardLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    display: "block",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "30px",
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  section: {
    backgroundColor: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    marginBottom: "28px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 16px 0",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  activityDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
  },
  activityText: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#1e293b",
  },
  integrationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "28px",
  },
  panel: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  panelLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
  },
  panelContent: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#0f172a",
    margin: 0,
    wordBreak: "break-word",
    lineHeight: "1.4",
  },
  badgeGmail: {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  badgeCalendar: {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  badgeDrive: {
    backgroundColor: "#faf5ff",
    color: "#9333ea",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  badgeSheets: {
    backgroundColor: "#fffbeb",
    color: "#d97706",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 8px",
    borderRadius: "6px",
    textTransform: "uppercase",
  },
  systemBanner: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "16px",
  },
};