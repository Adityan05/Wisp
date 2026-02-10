import { Upload, Clock, Download } from "lucide-react";

export default function Hero() {
  return (
    <div className="w-full mb-8 text-center">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
        Secure. Temporary. Anonymous.
      </h1>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-xl shadow-lg border border-white/40 dark:border-white/5 transition-all hover:bg-white/40 dark:hover:bg-slate-800/40">
          <div className="w-10 h-10 bg-[#E5F3F6] dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 rounded-full flex items-center justify-center mb-3">
            <Upload size={20} />
          </div>
          <span className="font-semibold text-gray-700 dark:text-slate-200">
            1. Upload
          </span>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            File or Link
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-xl shadow-lg border border-white/40 dark:border-white/5 transition-all hover:bg-white/40 dark:hover:bg-slate-800/40">
          <div className="w-10 h-10 bg-[#E5F3F6] dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 rounded-full flex items-center justify-center mb-3">
            <div className="font-mono font-bold">1234</div>
          </div>
          <span className="font-semibold text-gray-700 dark:text-slate-200">
            2. Get Code
          </span>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            4-Digit Key
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-xl shadow-lg border border-white/40 dark:border-white/5 transition-all hover:bg-white/40 dark:hover:bg-slate-800/40">
          <div className="w-10 h-10 bg-[#E5F3F6] dark:bg-sky-500/10 text-[#4279AA] dark:text-sky-300 rounded-full flex items-center justify-center mb-3">
            <Download size={20} />
          </div>
          <span className="font-semibold text-gray-700 dark:text-slate-200">
            3. Download
          </span>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            With key
          </p>
        </div>
      </div>
    </div>
  );
}
