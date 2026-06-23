"use client";

import { useState, useEffect } from "react";
import { Upload, Download, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import UploadTab from "@/components/UploadTab";
import DownloadTab from "@/components/DownloadTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'download'
  const [error, setError] = useState("");
  const [urlCode, setUrlCode] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setActiveTab("download");
      setUrlCode(code.toUpperCase());
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-wisp-gradient text-gray-800 dark:text-gray-200 transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        <Hero />

        {/* Main Action Card */}
        <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-white/10 overflow-hidden transition-all">
          {/* Tabs */}
          <div className="flex border-b border-white/20 dark:border-white/5">
            <button
              onClick={() => handleTabChange("upload")}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "upload"
                  ? "bg-white/40 dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 border-b-2 border-[#4279AA] dark:border-sky-400 cursor-pointer"
                  : "text-gray-500 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-slate-800/50 cursor-pointer"
              }`}
            >
              <Upload size={18} /> Upload
            </button>
            <button
              onClick={() => handleTabChange("download")}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === "download"
                  ? "bg-white/40 dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 border-b-2 border-[#4279AA] dark:border-sky-400 cursor-pointer"
                  : "text-gray-500 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-slate-800/50 cursor-pointer"
              }`}
            >
              <Download size={18} /> Download
            </button>
          </div>

          <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center">
            {error && (
              <div className="mb-4 p-3 bg-red-50/50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 border border-red-100/50 dark:border-red-900/30 backdrop-blur-sm">
                <X size={16} /> {error}
              </div>
            )}

            {activeTab === "upload" ? (
              <UploadTab onError={setError} />
            ) : (
              <DownloadTab onError={setError} initialCode={urlCode} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
