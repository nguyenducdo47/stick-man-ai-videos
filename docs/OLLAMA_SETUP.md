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

The UI settings page (Phase 2) will surface the same data.

## PATH (optional)

Add `%LOCALAPPDATA%\Programs\Ollama` to the user PATH so `ollama` works in any terminal.