const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Local-first studio</p>
            <h1 className="text-xl font-semibold tracking-tight">AI Video Studio</h1>
          </div>
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
            Phase 0 — Foundation
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <h2 className="text-2xl font-semibold">3D Stickman video pipeline</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Monorepo scaffold is in place. Next phases add PostgreSQL projects, Ollama script and
            storyboard generation, 3D preview, local TTS, and Remotion rendering — Vietnamese and
            English exports share the same visual scenes.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <dt className="text-xs uppercase text-zinc-500">Web UI</dt>
              <dd className="mt-1 text-sm">Next.js App Router</dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <dt className="text-xs uppercase text-zinc-500">API</dt>
              <dd className="mt-1 text-sm font-mono text-zinc-300">{apiBase}</dd>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <dt className="text-xs uppercase text-zinc-500">Character</dt>
              <dd className="mt-1 text-sm">White stickman · red hoodie · black sneakers</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}