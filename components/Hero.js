import { Upload, Clock } from "lucide-react";

export default function Hero() {
  return (
    <div className="w-full mb-8 text-center">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">
        Secure. Temporary. Anonymous.
      </h1>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
            <Upload size={20} />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            1. Upload
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            File or Link
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
            <div className="font-mono font-bold">1234</div>
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            2. Get Code
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            4-Digit Key
          </p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            3. Vanish
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Expires in 10m
          </p>
        </div>
      </div>
    </div>
  );
}
