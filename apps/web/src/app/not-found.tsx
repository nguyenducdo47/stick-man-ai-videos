import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-zinc-100">
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link href="/" className="text-sm text-red-400 hover:text-red-300">
        Back to dashboard
      </Link>
    </div>
  );
}