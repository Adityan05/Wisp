import { useState } from "react";
import { Copy } from "lucide-react";

export default function DownloadTab({ onError }) {
  const [downloadCode, setDownloadCode] = useState("");
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrievedContent, setRetrievedContent] = useState(null);

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
      onError(err.message);
    } finally {
      setIsRetrieving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Enter your 4-digit code
        </label>
        <div className="flex justify-center">
          <input
            type="text"
            maxLength={4}
            value={downloadCode}
            onChange={(e) => setDownloadCode(e.target.value.toUpperCase())}
            placeholder="XXXX"
            className="w-48 text-center text-3xl font-mono font-bold tracking-widest p-4 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:border-indigo-600 dark:focus:border-indigo-500 outline-none uppercase placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
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
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {retrievedContent.type === "file_downloaded" && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-center text-sm font-medium">
              File downloaded successfully!
            </div>
          )}
          {retrievedContent.content && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Content:
              </p>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm break-all font-mono relative group text-gray-800 dark:text-gray-200">
                {retrievedContent.content}
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(retrievedContent.content)
                  }
                  className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
