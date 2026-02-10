import { Shield } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600 dark:text-indigo-400">
          <Shield className="w-6 h-6" />
          <span>AnonDrop</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
