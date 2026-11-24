"""Load monorepo root .env so KORVATTS_* matches Nest (without running Activate.ps1)."""

from __future__ import annotations

from pathlib import Path


def load_repo_env() -> None:
    root_env = Path(__file__).resolve().parents[2] / ".env"
    if not root_env.is_file():
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        _load_env_minimal(root_env)
        return
    # Shell env wins; unset vars are filled from repo .env
    load_dotenv(root_env, override=False)


def _load_env_minimal(path: Path) -> None:
    import os

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value