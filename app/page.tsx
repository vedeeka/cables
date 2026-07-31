"use client";

import { useEffect } from "react";

const API_BASE = "http://localhost:8000";

export default function Home() {
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      });

      console.log("Status:", res.status);

      console.log("Headers:");
      res.headers.forEach((value, key) => {
        console.log(key, value);
      });

      const text = await res.text();
      console.log(text);

      if (res.ok) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }

  function login() {
    window.location.href = `${API_BASE}/login`;
  }

  return (
    <main>
      <h1>Enterprise AI OS</h1>

      <button onClick={login}>
        Continue with Google
      </button>
    </main>
  );
}