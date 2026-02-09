"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileText,
  Link as LinkIcon,
  Clock,
  Shield,
  Check,
  Copy,
  X,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'download'
  const [uploadType, setUploadType] = useState("file"); // 'file' | 'link'

  // Upload State
  const [file, setFile] = useState(null);
  const [linkContent, setLinkContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { code: '1234', expiresAt: ... }
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Download State
  const [downloadCode, setDownloadCode] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievedContent, setRetrievedContent] = useState(null); // { type: 'text', content: '...' }

  // Handlers
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 20 * 1024 * 1024) {
        setError("File size exceeds 20MB limit.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    setError("");
    setUploadResult(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("type", uploadType);

      if (uploadType === "file") {
        if (!file) throw new Error("Please select a file first.");
        formData.append("file", file);
      } else {
        if (!linkContent) throw new Error("Please enter a link or text.");
        formData.append("content", linkContent);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadResult(data);
      // Reset inputs
      setFile(null);
      setLinkContent("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    setError("");
    setRetrievedContent(null);
    setIsRetrieving(true);

    try {
      if (!downloadCode || downloadCode.length !== 4) {
        throw new Error("Please enter a valid 4-digit code.");
      }

      const res = await fetch(`/api/access/${downloadCode}`);

      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Retrieval failed");

        // It's text or link data
        setRetrievedContent(data);
      } else {
        // It's a file (blob)
        if (!res.ok) throw new Error("Failed to download file");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Try to get filename from header
        const disposition = res.headers.get("Content-Disposition");
        let params = null;
        if (disposition && disposition.indexOf("filename=") !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            a.download = matches[1].replace(/['"]/g, "");
          }
        }
        if (!a.download) a.download = `anondrop-${downloadCode}`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setRetrievedContent({ type: "file_downloaded" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRetrieving(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
            <Shield className="w-6 h-6" />
            <span>AnonDrop</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 flex flex-col items-center">
        {/* Purpose / Process */}
        <div className="w-full mb-8 text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">
            Secure. Temporary. Anonymous.
          </h1>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <Upload size={20} />
              </div>
              <span className="font-semibold text-gray-700">1. Upload</span>
              <p className="text-xs text-gray-500 mt-1">File or Link</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <div className="font-mono font-bold">1234</div>
              </div>
              <span className="font-semibold text-gray-700">2. Get Code</span>
              <p className="text-xs text-gray-500 mt-1">4-Digit Key</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3">
                <Clock size={20} />
              </div>
              <span className="font-semibold text-gray-700">3. Vanish</span>
              <p className="text-xs text-gray-500 mt-1">Expires in 10m</p>
            </div>
          </div>
        </div>

        {/* Main Action Card */}
        <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => {
                setActiveTab("upload");
                setError("");
                setUploadResult(null);
              }}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "upload" ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Upload size={18} /> Upload
            </button>
            <button
              onClick={() => {
                setActiveTab("download");
                setError("");
                setRetrievedContent(null);
              }}
              className={`flex-1 py-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${activeTab === "download" ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:bg-gray-50"}`}
            >
              <Download size={18} /> Download
            </button>
          </div>

          <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <X size={16} /> {error}
              </div>
            )}

            {/* UPLOAD SECTION */}
            {activeTab === "upload" && (
              <div className="space-y-6">
                {!uploadResult ? (
                  <>
                    {/* Upload Type Toggle */}
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                        <button
                          onClick={() => setUploadType("file")}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uploadType === "file" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                        >
                          File
                        </button>
                        <button
                          onClick={() => setUploadType("link")}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uploadType === "link" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}
                        >
                          Link/Text
                        </button>
                      </div>
                    </div>

                    {uploadType === "file" ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FileText size={24} />
                        </div>
                        {file ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-700">
                              Click to Select File
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Max 20MB
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={linkContent}
                          onChange={(e) => setLinkContent(e.target.value)}
                          placeholder="Paste a link or simple text here..."
                          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[160px] text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleUpload}
                      disabled={
                        isUploading ||
                        (uploadType === "file" && !file) ||
                        (uploadType === "link" && !linkContent)
                      }
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isUploading ? "Uploading..." : "Get Code"}
                    </button>
                  </>
                ) : (
                  // Upload Success State
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Uploaded Successfully!
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Use this code to retrieve your drop.
                    </p>

                    <div className="bg-gray-900 text-white text-4xl font-mono font-bold tracking-widest py-6 rounded-xl mb-4 relative group">
                      {uploadResult.code}
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(uploadResult.code)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        title="Copy Code"
                      >
                        <Copy size={20} />
                      </button>
                    </div>

                    <p className="text-xs text-indigo-600 font-medium">
                      Expires at{" "}
                      {new Date(uploadResult.expiresAt).toLocaleTimeString()}
                    </p>

                    <button
                      onClick={() => {
                        setUploadResult(null);
                        setFile(null);
                        setLinkContent("");
                      }}
                      className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Upload Another
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DOWNLOAD SECTION */}
            {activeTab === "download" && (
              <div className="space-y-6">
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Enter your 4-digit code
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="text"
                      maxLength={4}
                      value={downloadCode}
                      onChange={(e) =>
                        setDownloadCode(e.target.value.toUpperCase())
                      }
                      placeholder="XXXX"
                      className="w-48 text-center text-3xl font-mono font-bold tracking-widest p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-600 outline-none uppercase placeholder-gray-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isRetrieving || downloadCode.length !== 4}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isRetrieving ? "Retrieving..." : "Retrieve Drop"}
                </button>

                {/* Retrieval Result */}
                {retrievedContent && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {retrievedContent.type === "file_downloaded" && (
                      <div className="p-4 bg-green-50 text-green-700 rounded-lg text-center text-sm font-medium">
                        File downloaded successfully!
                      </div>
                    )}
                    {retrievedContent.content && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-gray-500">
                          Content:
                        </p>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm break-all font-mono relative group">
                          {retrievedContent.content}
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                retrievedContent.content,
                              )
                            }
                            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600"
                            title="Copy"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} AnonDrop. Made with{" "}
          <span className="text-red-400">♥</span> by Adityan.
        </p>
      </footer>
    </div>
  );
}
