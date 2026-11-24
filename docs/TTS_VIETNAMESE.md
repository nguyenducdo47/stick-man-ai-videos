# TTS tiếng Việt (local)

Studio dùng **KorvaTTS** mặc định cho `locale: "vi"` khi package `korvatts` đã cài trong `services/local-tts`. Không dùng cloud TTS trong luồng chính.

## KorvaTTS (khuyến nghị)

1. Cài dependency (đã có trong `requirements.txt`):

```powershell
cd services\local-tts
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. **Lần chạy đầu** tải model từ Hugging Face (`dogenthq/KorvaTTS`) vào cache (`~\.cache\huggingface`).

3. **Chọn giọng trên web:** Settings → **TTS** → dropdown **Giọng Korva** → **Lưu giọng** (lưu `data/studio/tts-preferences.v1.json`, không cần restart uvicorn).

   Hoặc mặc định từ `.env` / terminal:

```powershell
$env:KORVATTS_VOICE_VI = "khanh_vy"
```

| Giọng | Gợi ý |
|-------|--------|
| `khanh_vy`, `ngoc_huyen`, `phuong_linh`, `quynh_nhu` | Nữ |
| `hoang_nam`, `gia_bao`, `huu_dat`, `quang_huy`, `thanh_phong`, `bao_kim` | Nam |

4. Kiểm tra: `GET http://127.0.0.1:5001/health` → `engine: "korva"`, `vietnameseVoiceAvailable: true`.

## Dùng trong project

1. Scene → **Narration (VI)** → tiếng Việt → **Save VI**.
2. **Generate TTS (vi)**.
3. WAV: `data/audio/projects/.../vi.wav`.

## Dự phòng (không bắt buộc)

| Backend | Khi nào |
|---------|---------|
| **Piper** | `PIPER_EXE` + `PIPER_MODEL_VI`; `TTS_BACKEND_VI=piper` |
| **Windows SAPI** | `TTS_BACKEND_VI=sapi` sau khi cài giọng VI trong Settings |

## Tiếng Anh

Mặc định **pyttsx3** (David/Zira). Korva cho EN chỉ khi đặt `KORVATTS_VOICE_EN=<tên giọng>`.

## Tài liệu Korva

- [KorvaTTS GitHub](https://github.com/dogenthq/KorvaTTS)
- [Hugging Face](https://huggingface.co/dogenthq/KorvaTTS)