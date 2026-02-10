export default function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 transition-colors">
      <p>
        &copy; {new Date().getFullYear()} Wisp. Made with{" "}
        <span className="text-red-400">❤️</span> by Adityan.
      </p>
    </footer>
  );
}
