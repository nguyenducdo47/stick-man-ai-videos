"""KorvaTTS — Vietnamese-first local ONNX TTS (weights from Hugging Face on first run)."""

from __future__ import annotations

import importlib.util
import os
from functools import lru_cache
from pathlib import Path

from studio_preferences import read_studio_korva_voice_vi

_KORVA_DEFAULT_VI = "khanh_vy"


def korva_installed() -> bool:
    return importlib.util.find_spec("korvatts") is not None


def vi_voice_name() -> str:
    """Studio web prefs → .env KORVATTS_VOICE_VI → default."""
    studio = read_studio_korva_voice_vi()
    if studio:
        return studio
    env = os.environ.get("KORVATTS_VOICE_VI", "").strip()
    if env:
        return env
    return _KORVA_DEFAULT_VI


def vi_voice_env_fallback() -> str | None:
    env = os.environ.get("KORVATTS_VOICE_VI", "").strip()
    return env or None


def _vi_voice_name() -> str:
    return vi_voice_name()


def _en_voice_name() -> str | None:
    name = os.environ.get("KORVATTS_VOICE_EN", "").strip()
    return name or None


def _total_steps() -> int:
    raw = os.environ.get("KORVATTS_TOTAL_STEPS", "32").strip()
    try:
        steps = int(raw)
    except ValueError:
        return 32
    return max(4, min(32, steps))


def _speed() -> float:
    raw = os.environ.get("KORVATTS_SPEED", "1.05").strip()
    try:
        speed = float(raw)
    except ValueError:
        return 1.05
    return max(0.5, min(2.0, speed))


@lru_cache(maxsize=1)
def get_korva_tts():
    from korvatts import TTS

    assets = os.environ.get("KORVATTS_ASSETS_DIR", "").strip()
    if assets:
        return TTS(assets_dir=assets)
    return TTS()


def list_korva_voices() -> list[str]:
    return get_korva_tts().list_voices()


def korva_ready_for_locale(locale: str) -> bool:
    if not korva_installed():
        return False
    if locale == "vi":
        return True
    return _en_voice_name() is not None


def synthesize_korva(
    text: str,
    out_path: Path,
    locale: str,
    voice_override: str | None = None,
) -> None:
    if voice_override and voice_override.strip():
        voice = voice_override.strip()
    else:
        voice = _vi_voice_name() if locale == "vi" else _en_voice_name()
    if not voice:
        raise ValueError(f"Korva EN voice not configured (set KORVATTS_VOICE_EN)")

    tts = get_korva_tts()
    available = tts.list_voices()
    if voice not in available:
        raise ValueError(
            f"Korva voice '{voice}' not found. Available: {', '.join(available)}"
        )

    wav, _duration = tts.synthesize(
        text,
        voice=voice,
        lang=locale,
        total_steps=_total_steps(),
        speed=_speed(),
    )
    tts.save_audio(wav, out_path)