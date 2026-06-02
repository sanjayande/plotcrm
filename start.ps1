# PlotCRM — start backend + frontend
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "`n=== PlotCRM ===" -ForegroundColor Green

# Check Groq key
$envFile = Join-Path $root "backend\.env"
$envContent = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
if ($envContent -match 'GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE' -or $envContent -notmatch 'GROQ_API_KEY=gsk_') {
    Write-Host "Note: Groq AI uses template text until you set GROQ_API_KEY in backend\.env" -ForegroundColor Yellow
    Write-Host "  Run: .\setup-groq.ps1`n" -ForegroundColor Yellow
}

# Backend
Write-Host "Starting backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\backend'; .\venv\Scripts\python.exe main.py"
) -WindowStyle Normal

Start-Sleep -Seconds 2

# Frontend
Write-Host "Starting frontend ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\frontend'; npm run dev"
) -WindowStyle Normal

Write-Host "`nOpen http://localhost:5173 in your browser (or the port Vite shows)." -ForegroundColor Green
Write-Host "API docs: http://localhost:8000/docs`n" -ForegroundColor Green
