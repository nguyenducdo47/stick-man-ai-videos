#Requires -Version 5.1
$ErrorActionPreference = 'Continue'

Write-Host "=== AI Video Studio — environment check ===" -ForegroundColor Cyan

function Test-Command($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { Write-Host "[OK] $name -> $($cmd.Source)" -ForegroundColor Green }
  else { Write-Host "[MISSING] $name" -ForegroundColor Yellow }
}

Test-Command node
Test-Command pnpm
Test-Command python
Test-Command git

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host "[OK] docker" -ForegroundColor Green
} else {
  Write-Host "[MISSING] docker (optional — use Laragon PostgreSQL/Redis)" -ForegroundColor Yellow
}

$ollama = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
if (Test-Path $ollama) {
  Write-Host "[OK] Ollama at $ollama" -ForegroundColor Green
} else {
  Write-Host "[MISSING] Ollama executable" -ForegroundColor Yellow
}

try {
  $tcp = Test-NetConnection -ComputerName 127.0.0.1 -Port 11434 -WarningAction SilentlyContinue
  if ($tcp.TcpTestSucceeded) {
    Write-Host "[OK] Ollama port 11434 is open" -ForegroundColor Green
  } else {
    Write-Host "[WARN] Ollama port 11434 not reachable" -ForegroundColor Yellow
  }
} catch {
  Write-Host "[WARN] Could not probe Ollama port" -ForegroundColor Yellow
}

$pg = "C:\laragon\bin\postgresql\postgresql-14.5-1\bin\psql.exe"
if (Test-Path $pg) {
  Write-Host "[OK] Laragon PostgreSQL client found" -ForegroundColor Green
} else {
  Write-Host "[INFO] psql not found at Laragon default path" -ForegroundColor DarkGray
}

Write-Host "`nRun from repo root: pnpm install && pnpm build" -ForegroundColor DarkGray