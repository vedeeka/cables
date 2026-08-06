"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  name: string;
  email: string;
  picture?: string;
}

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </>
    ),
  },
  {
    href: "/dashboard/summarizer",
    label: "Summarizer",
    icon: (
      <>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
  },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [logoutHovered, setLogoutHovered] = useState(false);

  return (
    <aside style={styles.sidebar}>
      <div>
        {/* Logo */}
        <div style={styles.brandContainer}>
          <div style={styles.logoIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <span style={styles.brandName}>Workspace AI</span>
        </div>

        {/* Navigation */}
        <nav style={styles.navMenu}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...styles.navItem,
                  ...(isActive
                    ? styles.navItemActive
                    : isHovered
                    ? styles.navItemHover
                    : {}),
                }}
              >
                {isActive && <span style={styles.activeIndicator} />}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={styles.sidebarFooter}>
        <div style={styles.userProfile}>
          <img
            src={user.picture || "https://i.pravatar.cc/100"}
            alt={user.name}
            style={styles.avatar}
          />
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.name}</span>
            <span style={styles.userEmail}>{user.email}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            ...styles.logoutBtnSidebar,
            ...(logoutHovered ? styles.logoutBtnSidebarHover : {}),
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: "264px",
    backgroundColor: "#fff",
    borderRight: "1px solid #eef0f3",
    padding: "22px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    height: "100vh",
    boxSizing: "border-box",
    flexShrink: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
  },

  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 10px 22px",
    borderBottom: "1px solid #f1f3f6",
  },

  logoIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 2px 6px rgba(67, 56, 202, 0.28)",
    flexShrink: 0,
  },

  brandName: {
    fontSize: "15.5px",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.01em",
  },

  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    marginTop: "18px",
  },

  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "11px",
    textDecoration: "none",
    color: "#5b6472",
    padding: "9px 12px",
    borderRadius: "7px",
    fontWeight: 500,
    fontSize: "13.5px",
    letterSpacing: "-0.01em",
    transition: "background-color 0.15s ease, color 0.15s ease",
  },

  navItemHover: {
    backgroundColor: "#f8f9fb",
    color: "#1e293b",
  },

  navItemActive: {
    color: "#4338ca",
    background: "#eef0ff",
    fontWeight: 600,
  },

  activeIndicator: {
    position: "absolute",
    left: "-14px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "3px",
    height: "18px",
    borderRadius: "0 3px 3px 0",
    background: "#4338ca",
  },

  sidebarFooter: {
    borderTop: "1px solid #f1f3f6",
    paddingTop: "14px",
  },

  userProfile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "9px",
    backgroundColor: "#f8f9fb",
    border: "1px solid #f1f3f6",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #fff",
    boxShadow: "0 0 0 1px #e5e7eb",
    flexShrink: 0,
  },

  userInfo: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  userName: {
    fontWeight: 600,
    fontSize: "13px",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userEmail: {
    fontSize: "11.5px",
    color: "#8892a0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  logoutBtnSidebar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    padding: "9px",
    border: "1px solid #fecdd3",
    borderRadius: "8px",
    background: "#fff",
    color: "#e11d48",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "13px",
    transition: "background-color 0.15s ease, border-color 0.15s ease",
  },

  logoutBtnSidebarHover: {
    backgroundColor: "#fff1f2",
    borderColor: "#fca5b5",
  },
};