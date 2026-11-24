# Start local TTS without activating the venv (avoids PowerShell execution policy on Activate.ps1).
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Python = Join-Path $Root ".venv\Scripts\python.exe"
if (-not (Test-Path $Python)) {
  Write-Host "Missing venv. Run: python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt" -ForegroundColor Yellow
  exit 1
}
Set-Location $Root
& $Python -m uvicorn main:app --host 127.0.0.1 --port 5001