import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function StudioShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-xs uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300">
              AI Video Studio
            </Link>
            {title ? <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-zinc-400 hover:text-zinc-100">
              <Link href="/">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" className="text-zinc-400 hover:text-zinc-100">
              <Link href="/settings/ai">Ollama</Link>
            </Button>
            <Button asChild className="bg-red-600 hover:bg-red-500">
              <Link href="/projects/new">New project</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}