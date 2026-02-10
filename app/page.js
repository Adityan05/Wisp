"use client";

import { useState } from "react";
import { Upload, Download, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import UploadTab from "@/components/UploadTab";
import DownloadTab from "@/components/DownloadTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'download'
  const [error, setError] = useState("");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        <Hero />

        {/* Main Action Card */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => handleTabChange("upload")}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === "upload"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Upload size={18} /> Upload
            </button>
            <button
              onClick={() => handleTabChange("download")}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === "download"
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <Download size={18} /> Download
            </button>
          </div>

          <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                <X size={16} /> {error}
              </div>
            )}

            {activeTab === "upload" ? (
              <UploadTab onError={setError} />
            ) : (
              <DownloadTab onError={setError} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
