"""
Local TTS service — Phase 4.

Locale backends (first match):
- vi: KorvaTTS (default if installed) → Piper → Windows SAPI (pyttsx3)
- en: Piper → Korva (if KORVATTS_VOICE_EN) → pyttsx3
"""

from __future__ import annotations

from env_loader import load_repo_env

load_repo_env()

import os
import re
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field

from korva_backend import (
    korva_installed,
    korva_ready_for_locale,
    list_korva_voices,
    synthesize_korva,
    vi_voice_env_fallback,
    vi_voice_name,
)
from studio_preferences import read_studio_korva_voice_vi

app = FastAPI(title="AI Video Studio — Local TTS", version="0.1.0")

VI_VOICE_HINTS = (
    "viet",
    "vi-vn",
    "vi_vn",
    "hoaimy",
    "hoài",
    "namminh",
    "việt",
    "vietnam",
)

EN_VOICE_HINTS = ("en-us", "en_gb", "english", "david", "zira", "jenny", "aria")


class SynthesizeBody(BaseModel):
    text: str = Field(min_length=1, max_length=10_000)
    locale: str = Field(default="en", pattern="^(vi|en)$")
    voice: str | None = Field(default=None, max_length=64, pattern=r"^[a-z][a-z0-9_]*$")


def _backend_override(locale: str) -> str:
    key = "TTS_BACKEND_VI" if locale == "vi" else "TTS_BACKEND_EN"
    return os.environ.get(key, "auto").strip().lower() or "auto"


def _piper_configured(locale: str) -> tuple[bool, str | None]:
    exe = os.environ.get("PIPER_EXE", "").strip()
    if not exe or not Path(exe).exists():
        return False, None
    if locale == "vi":
        model = (
            os.environ.get("PIPER_MODEL_VI", "").strip()
            or os.environ.get("PIPER_MODEL", "").strip()
        )
    else:
        model = (
            os.environ.get("PIPER_MODEL_EN", "").strip()
            or os.environ.get("PIPER_MODEL", "").strip()
        )
    if not model or not Path(model).exists():
        return False, None
    return True, model


def _resolve_backend(locale: str) -> str:
    override = _backend_override(locale)
    if override == "korva" and korva_ready_for_locale(locale):
        return "korva"
    if override == "piper" and _piper_configured(locale)[0]:
        return "piper"
    if override == "sapi":
        return "pyttsx3"

    if override not in ("auto", ""):
        raise HTTPException(
            status_code=503,
            detail=f"TTS_BACKEND_{locale.upper()}={override} is not available",
        )

    if locale == "vi" and korva_ready_for_locale("vi"):
        return "korva"
    if _piper_configured(locale)[0]:
        return "piper"
    if locale == "en" and korva_ready_for_locale("en"):
        return "korva"
    return "pyttsx3"


def _engine_info() -> tuple[str, str | None]:
    if korva_installed():
        voice = vi_voice_name()
        return (
            "korva",
            f"KorvaTTS ONNX — giọng VI={voice} (ưu tiên data/studio/tts-preferences.v1.json, sau đó .env)",
        )
    if _piper_configured("vi")[0] or _piper_configured("en")[0]:
        parts = []
        if _piper_configured("vi")[0]:
            parts.append("vi")
        if _piper_configured("en")[0]:
            parts.append("en")
        return "piper", f"locales={','.join(parts)}"
    try:
        import pyttsx3  # noqa: F401

        return (
            "pyttsx3",
            "Windows SAPI — cài giọng VI hoặc pip install korvatts",
        )
    except ImportError:
        return "unavailable", "pip install -r requirements.txt (korvatts / pyttsx3)"


def _list_voices_pyttsx3() -> list[dict[str, str]]:
    import pyttsx3

    engine = pyttsx3.init()
    voices = engine.getProperty("voices") or []
    out: list[dict[str, str]] = []
    for voice in voices:
        out.append(
            {
                "id": getattr(voice, "id", "") or "",
                "name": getattr(voice, "name", "") or "",
            }
        )
    engine.stop()
    return out


def _voice_blob(voice) -> str:
    vid = (getattr(voice, "id", "") or "").lower()
    name = (getattr(voice, "name", "") or "").lower()
    return f"{vid} {name}"


def _score_voice(blob: str, hints: tuple[str, ...]) -> int:
    score = 0
    for hint in hints:
        if hint in blob:
            score += 10
    if re.search(r"\bvi[-_]vn\b", blob):
        score += 20
    return score


class _VoiceView:
    __slots__ = ("id", "name")

    def __init__(self, voice_id: str, name: str) -> None:
        self.id = voice_id
        self.name = name


def _voices_from_dicts(items: list[dict[str, str]]) -> list[_VoiceView]:
    return [_VoiceView(v.get("id", ""), v.get("name", "")) for v in items]


def _pick_voice_id(voices, locale: str) -> str | None:
    env_key = "TTS_VOICE_VI" if locale == "vi" else "TTS_VOICE_EN"
    override = os.environ.get(env_key, "").strip()
    if override:
        return override

    hints = VI_VOICE_HINTS if locale == "vi" else EN_VOICE_HINTS
    best_id: str | None = None
    best_score = 0
    for voice in voices:
        blob = _voice_blob(voice)
        score = _score_voice(blob, hints)
        if score > best_score:
            best_score = score
            best_id = voice.id

    if locale == "vi" and best_score < 10:
        return None
    if locale == "en" and best_score < 5 and voices:
        return voices[0].id
    return best_id


def _vietnamese_voice_available() -> bool:
    if korva_ready_for_locale("vi"):
        return True
    if _piper_configured("vi")[0]:
        return True
    voices = _list_voices_pyttsx3()
    return _pick_voice_id(_voices_from_dicts(voices), "vi") is not None


@app.get("/health")
def health():
    engine, detail = _engine_info()
    if engine == "unavailable":
        raise HTTPException(
            status_code=503,
            detail="No TTS backend. pip install -r requirements.txt",
        )
    payload: dict[str, object] = {
        "status": "ok",
        "engine": engine,
        "detail": detail,
        "vietnameseVoiceAvailable": _vietnamese_voice_available(),
    }
    if korva_installed():
        try:
            payload["korvaVoices"] = list_korva_voices()
            payload["korvaDefaultViVoice"] = vi_voice_name()
            studio = read_studio_korva_voice_vi()
            if studio:
                payload["korvaStudioVoiceVi"] = studio
            env_voice = vi_voice_env_fallback()
            if env_voice:
                payload["korvaEnvVoiceVi"] = env_voice
        except Exception as err:  # noqa: BLE001 — health must stay JSON
            payload["korvaLoadError"] = str(err)
    elif engine == "pyttsx3":
        payload["voices"] = _list_voices_pyttsx3()
    return payload


def _synthesize_piper(text: str, out_path: Path, locale: str) -> None:
    ok, model = _piper_configured(locale)
    if not ok or not model:
        raise HTTPException(
            status_code=503,
            detail=(
                f"No Piper model for locale '{locale}'. "
                f"Set PIPER_MODEL_VI / PIPER_MODEL_EN (or PIPER_MODEL)."
            ),
        )
    exe = os.environ["PIPER_EXE"]
    proc = subprocess.run(
        [exe, "--model", model, "--output_file", str(out_path)],
        input=text,
        text=True,
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "piper failed").strip()
        raise HTTPException(status_code=500, detail=err)
    if not out_path.is_file():
        raise HTTPException(status_code=500, detail="Piper produced no output file")


def _synthesize_pyttsx3(text: str, out_path: Path, locale: str) -> None:
    import pyttsx3

    engine = pyttsx3.init()
    voices = engine.getProperty("voices") or []
    voice_id = _pick_voice_id(voices, locale)
    if locale == "vi" and not voice_id:
        engine.stop()
        raise HTTPException(
            status_code=422,
            detail=(
                "Không có giọng tiếng Việt (SAPI). Dùng KorvaTTS: pip install korvatts "
                "và khởi động lại uvicorn, hoặc Piper PIPER_MODEL_VI."
            ),
        )
    if voice_id:
        engine.setProperty("voice", voice_id)
    engine.setProperty("rate", 165 if locale == "en" else 155)
    engine.save_to_file(text, str(out_path))
    engine.runAndWait()
    engine.stop()
    if not out_path.is_file():
        raise HTTPException(status_code=500, detail="pyttsx3 did not write audio")


def _synthesize_korva_safe(
    text: str,
    out_path: Path,
    locale: str,
    voice: str | None = None,
) -> None:
    try:
        synthesize_korva(text, out_path, locale, voice_override=voice)
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err)) from err
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"KorvaTTS failed: {err}") from err


@app.post("/v1/synthesize")
def synthesize(body: SynthesizeBody):
    if _engine_info()[0] == "unavailable":
        raise HTTPException(status_code=503, detail="TTS backend not configured")

    backend = _resolve_backend(body.locale)

    with tempfile.TemporaryDirectory() as tmp:
        wav_path = Path(tmp) / "out.wav"
        if backend == "korva":
            _synthesize_korva_safe(
                body.text,
                wav_path,
                body.locale,
                body.voice if body.locale == "vi" else None,
            )
        elif backend == "piper":
            _synthesize_piper(body.text, wav_path, body.locale)
        else:
            _synthesize_pyttsx3(body.text, wav_path, body.locale)

        data = wav_path.read_bytes()
        if len(data) < 44:
            raise HTTPException(status_code=500, detail="Invalid WAV output")

    return Response(content=data, media_type="audio/wav")