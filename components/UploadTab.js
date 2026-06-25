import { useState, useRef } from "react";
import { FileText, Check, Copy, Loader2 } from "lucide-react";
import { formatBytes } from "../lib/utils";
import { QRCodeSVG } from "qrcode.react";

export default function UploadTab({ onError }) {
  const [uploadType, setUploadType] = useState("file"); // 'file' | 'link'
  const [file, setFile] = useState(null);
  const [linkContent, setLinkContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        onError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
      onError("");
    }
  };

  const handleUpload = async () => {
    onError("");
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

      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Server returned an unexpected response.");
      }

      if (!res.ok) throw new Error(data?.error || "Upload failed");

      setUploadResult(data);
      // Reset inputs
      setFile(null);
      setLinkContent("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      onError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadResult) {
    const dlUrl = `${window.location.origin}/?code=${uploadResult.code}`;
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Uploaded Successfully!
        </h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">
          Use this code to retrieve your drop.
        </p>

        <div className="bg-gray-900 dark:bg-black/30 text-white text-4xl font-mono font-bold tracking-widest py-6 rounded-xl mb-4 relative group border border-gray-800 dark:border-white/10 backdrop-blur-sm">
          {uploadResult.code}
          <button
            onClick={() => {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(uploadResult.code);
              } else {
                const textArea = document.createElement("textarea");
                textArea.value = uploadResult.code;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                  document.execCommand("copy");
                } catch (err) {
                  console.error("Fallback: Oops, unable to copy", err);
                }
                document.body.removeChild(textArea);
              }
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            title="Copy Code"
          >
            <Copy size={20} />
          </button>
        </div>
        {/* qr code section */}
        <div className="flex flex-col items-center justify-center my-6 p-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
          <QRCodeSVG
            value={dlUrl}
            size={160}
            bgColor={"transparent"}
            fgColor={"currentColor"}
            imageSettings={{
              src: "/wisp-logo.png",
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              opacity: 1,
              excavate: true,
            }}
            // Uses the text color of the parent, or use a specific hex like "#4279AA"
            level={"H"} // High error correction, good if you want to add a logo
            className="text-gray-800 dark:text-slate-200"
          />
          <p className="mt-3 text-xs text-gray-500 dark:text-slate-400 font-medium">
            Scan to access anywhere
          </p>
        </div>

        <p className="text-xs text-[#4279AA] dark:text-sky-400 font-medium">
          Expires at {new Date(uploadResult.expiresAt).toLocaleTimeString()}
        </p>

        <button
          onClick={() => {
            setUploadResult(null);
            setFile(null);
            setLinkContent("");
            onError("");
          }}
          className="mt-6 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 underline cursor-pointer"
        >
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <div className="bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-lg inline-flex backdrop-blur-sm">
          <button
            onClick={() => setUploadType("file")}
            className={`cursor-pointer px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              uploadType === "file"
                ? "bg-white cursor-pointer dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 cursor-pointer dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            File
          </button>
          <button
            onClick={() => setUploadType("link")}
            className={`px-4 cursor-pointer py-1.5 rounded-md text-sm font-medium transition-all ${
              uploadType === "link"
                ? "bg-white cursor-pointer dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 cursor-pointer dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200"
            }`}
          >
            Link/Text
          </button>
        </div>
      </div>

      {uploadType === "file" ? (
        <div
          className="border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 bg-[#E5F3F6] dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          {file ? (
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {formatBytes(file.size)}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700 dark:text-slate-300">
                Click to Select File
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                Max 10MB
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
            className="w-full p-4 border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-[#99CDEC] dark:focus:ring-sky-500 focus:border-transparent outline-none min-h-[160px] text-sm placeholder-gray-400 dark:placeholder-slate-500 backdrop-blur-sm resize-none"
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
        className="w-full cursor-pointer py-3 bg-[#99CDEC] hover:bg-[#88BDDC] dark:bg-sky-600 dark:hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Uploading...</span>
          </>
        ) : (
          "Get Code"
        )}
      </button>
    </div>
  );
}
