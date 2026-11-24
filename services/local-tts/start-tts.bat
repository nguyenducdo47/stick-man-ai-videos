@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Missing .venv — run: python -m venv .venv ^&^& .venv\Scripts\python.exe -m pip install -r requirements.txt
  exit /b 1
)
".venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 5001