# Local TTS Service (Phase 4)

FastAPI wrapper for **on-device** narration synthesis. Used by the Nest API via `TTS_SERVICE_URL` (default `http://127.0.0.1:5001`).

## Backends

| Backend | When | Notes |
|---------|------|--------|
| **KorvaTTS** (`korvatts`) | Default for `locale: vi` when installed | Vietnamese ONNX; first run downloads weights from Hugging Face. |
| **Piper** | `PIPER_EXE` + `PIPER_MODEL_*` | Optional; set `TTS_BACKEND_VI=piper`. |
| **pyttsx3** | Fallback | Windows SAPI — poor `vi` without a VI voice pack. |

No cloud TTS. The API returns **503** if this service is down — the studio does not fake audio.

## Run (Windows)

```powershell
cd C:\laragon\www\stick-man-ai-videos\services\local-tts
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\start-tts.bat
```

If PowerShell blocks scripts (*running scripts is disabled*), use **`start-tts.bat`** or:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 5001
```

Health: `GET http://127.0.0.1:5001/health`

Synthesize: `POST http://127.0.0.1:5001/v1/synthesize`  
JSON body: `{"text":"Hello","locale":"en"}` → `audio/wav` bytes.

## Vietnamese (`locale: vi`)

See **[docs/TTS_VIETNAMESE.md](../../docs/TTS_VIETNAMESE.md)**.

`GET /health` returns `vietnameseVoiceAvailable`. Without a VI voice, synthesize `vi` returns **422** (no English fallback for Vietnamese text).

## Optional Piper (per locale)

```powershell
$env:PIPER_EXE = "C:\path\to\piper\piper.exe"
$env:PIPER_MODEL_VI = "C:\path\to\vi_VN-medium.onnx"
$env:PIPER_MODEL_EN = "C:\path\to\en_US-lessac-medium.onnx"
```

Legacy: `PIPER_MODEL` applies to both if `PIPER_MODEL_VI` / `PIPER_MODEL_EN` unset.

## Output layout (API writes files)

WAV files land under repo `data/audio/projects/<projectId>/scenes/<sceneId>/<locale>.wav` (relative path stored on `SceneLocalization.audioPath`).