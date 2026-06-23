import { useEffect, useState } from "react";
import { Copy } from "lucide-react";

export default function DownloadTab({ onError, initialCode = "" }) {
  const [downloadCode, setDownloadCode] = useState(initialCode);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievedContent, setRetrievedContent] = useState(null);
  useEffect(() => {
    if (initialCode) setDownloadCode(initialCode);
  }, [initialCode]);
  useEffect(() => {
    if (initialCode && initialCode.length == 4) {
      handleDownload();
    }
  }, [initialCode]);
  const handleDownload = async () => {
    onError("");
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

        // text or link
        setRetrievedContent(data);
      } else {
        // file (blob)
        if (!res.ok) throw new Error("Failed to download file");

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Try to get filename from header
        const disposition = res.headers.get("Content-Disposition");
        if (disposition && disposition.indexOf("filename=") !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            a.download = decodeURIComponent(matches[1].replace(/['"]/g, ""));
          }
        }
        if (!a.download) a.download = `wisp-${downloadCode}`;

        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setRetrievedContent({ type: "file_downloaded" });
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">
          Enter your 4-digit code
        </label>
        <div className="flex justify-center">
          <input
            type="text"
            maxLength={4}
            value={downloadCode}
            onChange={(e) => setDownloadCode(e.target.value.toUpperCase())}
            placeholder="XXXX"
            className="w-48 text-center text-3xl font-mono font-bold tracking-widest p-4 border-2 border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/50 text-gray-900 dark:text-white rounded-xl focus:border-[#99CDEC] dark:focus:border-sky-500 outline-none uppercase placeholder-gray-300 dark:placeholder-slate-600 transition-colors backdrop-blur-sm"
          />
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isRetrieving || downloadCode.length !== 4}
        className="cursor-pointer w-full py-3 bg-[#99CDEC] hover:bg-[#88BDDC] dark:bg-sky-600 dark:hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
      >
        {isRetrieving ? "Retrieving..." : "Retrieve Drop"}
      </button>

      {/* Retrieval Result */}
      {retrievedContent && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
          {retrievedContent.type === "file_downloaded" && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-center text-sm font-medium backdrop-blur-sm">
              File downloaded successfully!
            </div>
          )}
          {retrievedContent.content && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Content:
              </p>
              <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-white/10 text-sm break-all font-mono relative group text-gray-800 dark:text-slate-200 backdrop-blur-sm">
                {retrievedContent.content}
                <button
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard.writeText(retrievedContent.content);
                    } else {
                      // Fallback for older browsers or non-secure contexts
                      const textArea = document.createElement("textarea");
                      textArea.value = retrievedContent.content;
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
                  className="cursor-pointer absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
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
  );
}
