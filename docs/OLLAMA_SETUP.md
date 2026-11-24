# Ollama setup

## Defaults

- URL: `http://127.0.0.1:11434`
- Primary model: `qwen3:4b`
- Fallback: `qwen3:1.7b`
- Concurrency: `1` (see `.env.example`)

## Verify

```powershell
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" list
```

Or call the API after `pnpm --filter @ai-video-studio/api start:dev`:

`GET http://127.0.0.1:3001/v1/ollama/status`

The UI settings page (`/settings/ai`) surfaces the same data.

## Qwen3 and empty responses

Models such as **qwen3:4b** may put output in a `thinking` field unless disabled. The studio sets **`think: false`** on Ollama `/api/generate` calls. Use a recent Ollama release that supports this flag; otherwise generation can fail with an empty `response`.

Script/storyboard runs can take **1–10+ minutes** on CPU-only hosts; `OLLAMA_TIMEOUT_MS` defaults to 300000 in the API factory.

## PATH (optional)

Add `%LOCALAPPDATA%\Programs\Ollama` to the user PATH so `ollama` works in any terminal.