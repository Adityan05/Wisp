export default function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-400 dark:text-gray-500 transition-colors">
      <p>
        &copy; {new Date().getFullYear()} Wisp. Made with{" "}
        <span className="text-red-400">❤️</span> by{" "}
        <a
          href="https://adityan.tech"
          target="_blank"
          className="text-gray-500 hover:underline dark:text-gray-400"
        >
          Adityan
        </a>
        .
      </p>
    </footer>
  );
}
