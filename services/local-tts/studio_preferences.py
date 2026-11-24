"""Read Nest studio TTS prefs from repo data/ (same file as PATCH /v1/tts/preferences)."""

from __future__ import annotations

import json
from pathlib import Path

_STUDIO_REL = Path("data") / "studio" / "tts-preferences.v1.json"


def _prefs_path() -> Path:
    repo_root = Path(__file__).resolve().parents[2]
    return repo_root / _STUDIO_REL


def read_studio_korva_voice_vi() -> str | None:
    path = _prefs_path()
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        voice = data.get("korvaVoiceVi")
        if isinstance(voice, str) and voice.strip():
            return voice.strip()
    except (json.JSONDecodeError, OSError):
        return None
    return None