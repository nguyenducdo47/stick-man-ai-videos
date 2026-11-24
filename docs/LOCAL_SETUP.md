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

## Local TTS (Phase 4)

Terminal C — Python service (default port **5001**):

```powershell
cd services\local-tts
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 5001
```

Set `TTS_SERVICE_URL=http://127.0.0.1:5001` in the repo `.env` (see `.env.example`).

- **KorvaTTS** (`korvatts` in `requirements.txt`) — default for Vietnamese; first run downloads models from Hugging Face (~vài trăm MB).
- Optional **Piper** / **pyttsx3** fallbacks — see [docs/TTS_VIETNAMESE.md](./TTS_VIETNAMESE.md).

API: `GET /v1/tts/status` · UI: **Settings → TTS**

## Environment file

```powershell
Copy-Item .env.example .env
```

Prisma commands (`pnpm db:push`, `pnpm db:migrate`, `pnpm db:generate`) load **`DATABASE_URL` from the repo root `.env`** via `packages/database` — you do not need a separate `.env` inside `packages/database`.

Set `REDIS_HOST` / `REDIS_PORT` and optional `API_PUBLIC_URL` (same host/port as API for worker HTTP callbacks) in `.env`.

## Dev servers

From repo root after `pnpm install` and `pnpm build`:

| Terminal | Command |
|----------|---------|
| API | `pnpm --filter @ai-video-studio/api dev` |
| Web | `pnpm --filter @ai-video-studio/web dev` |
| Worker (Phase 6.7) | `pnpm --filter @ai-video-studio/worker dev` |

Bật **Redis** trong Laragon trước khi dùng render async (checkbox “Queue via Redis” trên trang project).

## Hero GLB (optional)

Đặt model có license tại `data/assets/characters/stickman-hero.glb` (xem `data/assets/characters/README.md`). Không tự động tải model. API phục vụ file qua `GET /v1/assets/stickman-hero.glb`.

## FFmpeg

Đặt `FFMPEG_PATH` trong `.env` (ví dụ build Laragon) hoặc để trống — API dùng ffmpeg đi kèm Remotion khi tìm thấy.