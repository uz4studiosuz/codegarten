import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-[#141414] text-center font-sans">
      <h2 className="text-4xl font-extrabold text-black dark:text-white mb-2">404</h2>
      <p className="text-gray-500 dark:text-zinc-400 mb-6 text-sm">Sahifa topilmadi</p>
      <Link
        href="/"
        className="btn-primary-tactile px-6 py-2.5 inline-block text-sm"
      >
        Bosh sahifaga qaytish
      </Link>
    </div>
  );
}
