"use client";

import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

interface SummaryResponse {
  status: string;
  summary: string;
}

export default function SummaryPage() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      setLoading(true);
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

      console.log("Backend response:", data);

      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      setError("Unable to load enterprise summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="mx-auto max-w-5xl rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            Enterprise AI Summary
          </h1>

          <button
            onClick={fetchSummary}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="rounded-lg bg-gray-100 p-6">
            Generating summary...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-6 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-6 leading-8 text-gray-800">
            {summary}
          </div>
        )}
      </div>
    </div>
  );
}