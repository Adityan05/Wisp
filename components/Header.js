import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-28 h-10 sm:w-32 sm:h-12">
            <Image
              src="/wisp-logo.png"
              alt="Wisp"
              onClick={() => (window.location.href = "/")}
              fill
              sizes="(max-width: 640px) 112px, 128px"
              className="object-contain object-left cursor-pointer"
              priority
            />
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
