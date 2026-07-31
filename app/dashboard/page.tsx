"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

interface DashboardData {
  status: string;
  user: {
    sub: string;
    name: string;
    email: string;
    picture?: string;
    access_token?: string;
    refresh_token?: string;
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

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await fetch(`${API_BASE}/api/dashboard`, {
        credentials: "include", // Required to pass the session cookie
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

  if (loading) return <p style={styles.message}>Loading workspace data...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!data) return null;

  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <h1>Enterprise AI OS Dashboard</h1>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      {/* User Information */}
      <section style={styles.section}>
        <h2>User Profile</h2>
        <div style={styles.profileBox}>
          {data.user.picture && (
            <img 
              src={data.user.picture} 
              alt={data.user.name} 
              style={styles.avatar} 
            />
          )}
          <div>
            <p><strong>Name:</strong> {data.user.name}</p>
            <p><strong>Email:</strong> {data.user.email}</p>
            <p><strong>Subject ID:</strong> {data.user.sub}</p>
          </div>
        </div>
      </section>

      {/* Workspace Summary */}
      <section style={styles.section}>
        <h2>Workspace Summary</h2>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3>Synced Documents</h3>
            <p style={styles.stat}>{data.documents_synced}</p>
          </div>
          <div style={styles.card}>
            <h3>Knowledge Chunks</h3>
            <p style={styles.stat}>{data.chunks_created}</p>
          </div>
          <div style={styles.card}>
            <h3>API Status</h3>
            <p style={{ ...styles.stat, color: "green" }}>{data.status.toUpperCase()}</p>
          </div>
        </div>
      </section>

      {/* Workspace Activity / Langgraph State */}
      <section style={styles.section}>
        <h2>Latest Integration Details</h2>
        <div style={styles.detailsList}>
          <div style={styles.detailItem}>
            <strong>Latest Email:</strong>
            <p>{data.latest_email}</p>
          </div>
          <div style={styles.detailItem}>
            <strong>Latest Calendar Event:</strong>
            <p>{data.latest_calendar}</p>
          </div>
          <div style={styles.detailItem}>
            <strong>Latest Drive File:</strong>
            <p>{data.latest_drive}</p>
          </div>
          <div style={styles.detailItem}>
            <strong>Latest Sheets Data:</strong>
            <p>{data.latest_sheets}</p>
          </div>
        </div>
      </section>

      {/* System Responses */}
      <footer style={styles.footerSection}>
        <strong>System Message:</strong>
        <p>{data.response_msg}</p>
      </footer>
    </main>
  );
}

// Basic Styles
const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "system-ui, sans-serif",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eaeaea",
    paddingBottom: "1rem",
    marginBottom: "2rem",
  },
  logoutButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  section: {
    marginBottom: "2rem",
  },
  profileBox: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  card: {
    padding: "1rem",
    border: "1px solid #eaeaea",
    borderRadius: "6px",
    textAlign: "center" as const,
  },
  stat: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: "0.5rem 0 0 0",
  },
  detailsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  detailItem: {
    padding: "1rem",
    borderLeft: "4px solid #0070f3",
    backgroundColor: "#f9f9f9",
    borderRadius: "0 6px 6px 0",
  },
  footerSection: {
    marginTop: "3rem",
    padding: "1rem",
    backgroundColor: "#e6f7ff",
    border: "1px solid #91d5ff",
    borderRadius: "6px",
  },
  message: {
    textAlign: "center" as const,
    padding: "3rem",
    fontSize: "1.2rem",
  },
  error: {
    textAlign: "center" as const,
    padding: "3rem",
    color: "#ff4d4f",
    fontSize: "1.2rem",
  },
};