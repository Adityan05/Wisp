"use client";

import { useEffect, useState } from "react";
import { formatBytes } from "@/lib/utils";

export default function Stats() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // silently fail — stats are non-critical
    }
  };

  useEffect(() => {
    fetchStats();

    // poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  if (!stats) return null; // don't show anything while loading

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 flex items-center justify-center">
      <p className="text-xs text-center text-gray-400 dark:text-slate-500 font-medium tracking-wide">
        ✦{" "}
        <span className="text-[#4279AA] dark:text-sky-400">
          {stats.uploads.toLocaleString()}
        </span>{" "}
        uploads &nbsp;·&nbsp;{" "}
        <span className="text-[#4279AA] dark:text-sky-400">
          {formatBytes(stats.bytes)}
        </span>{" "}
        transferred &nbsp;·&nbsp;{" "}
        <span className="text-[#4279AA] dark:text-sky-400">
          {stats.downloads.toLocaleString()}
        </span>{" "}
        drops retrieved ✦
      </p>
    </div>
  );
}
