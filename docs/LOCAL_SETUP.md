# Local setup (Windows)

## Toolchain

| Tool | Role |
|------|------|
| Node 22 + pnpm 9 | Monorepo build |
| Python 3.10+ | Local TTS (Phase 4) |
| PostgreSQL | Project data (Phase 1) |
| Redis | BullMQ (Phase 6) |
| Ollama | Local LLM |
| FFmpeg | Video mux (Phase 5) |

## pnpm

If `pnpm` fails via Corepack:

```powershell
corepack prepare pnpm@9.15.0 --activate
```

## PostgreSQL and Redis

### Option A — Docker Desktop

```powershell
docker compose up -d
```

### Option B — Laragon (this machine)

1. Start **PostgreSQL** and **Redis** from the Laragon menu.
2. Create database `ai_video_studio` (pgAdmin or `createdb`).
3. Set `DATABASE_URL` in `.env` to match your Laragon credentials (default in `.env.example` assumes `postgres/postgres` on port 5432).

## Ollama

Install from https://ollama.com. Add to PATH or use:

`%LOCALAPPDATA%\Programs\Ollama\ollama.exe`

Do **not** auto-pull large models. When ready:

```powershell
ollama pull qwen3:4b
ollama pull qwen3:1.7b
```

If the API on port 11434 accepts TCP but HTTP hangs, restart the Ollama app from the system tray.

## Environment file

```powershell
Copy-Item .env.example .env
```

Prisma commands (`pnpm db:push`, `pnpm db:migrate`, `pnpm db:generate`) load **`DATABASE_URL` from the repo root `.env`** via `packages/database` — you do not need a separate `.env` inside `packages/database`.