# Configure Groq API key for PlotCRM AI features
$ErrorActionPreference = "Stop"
$envPath = Join-Path $PSScriptRoot "backend\.env"

Write-Host "`n=== PlotCRM Groq Setup ===" -ForegroundColor Green
Write-Host "Get a free API key: https://console.groq.com/keys`n"

$key = $env:GROQ_API_KEY
if (-not $key) {
    $key = Read-Host "Paste your Groq API key (starts with gsk_)"
}

$key = $key.Trim()
if (-not $key.StartsWith("gsk_")) {
    Write-Host "Invalid key format. Groq keys usually start with gsk_" -ForegroundColor Red
    exit 1
}

$content = Get-Content $envPath -Raw
$content = $content -replace 'GROQ_API_KEY=.*', "GROQ_API_KEY=$key"
if ($content -notmatch 'GROQ_MODEL=') {
    $content += "`nGROQ_MODEL=llama-3.3-70b-versatile`n"
}
Set-Content -Path $envPath -Value $content.TrimEnd() -NoNewline
Add-Content -Path $envPath -Value "`n"

Write-Host "`nGroq API key saved to backend\.env" -ForegroundColor Green

# Quick test
Write-Host "Testing Groq connection..." -ForegroundColor Cyan
Set-Location (Join-Path $PSScriptRoot "backend")
$test = .\venv\Scripts\python.exe -c @"
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path('.env'))
from services.groq_ai import groq_configured, generate_text
if not groq_configured():
    print('FAIL: key not loaded')
    exit(1)
t = generate_text('Say hello in 5 words.', max_tokens=20)
print('OK:', t)
"@ 2>&1
Write-Host $test
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nGroq is ready! Restart the backend if it is already running.`n" -ForegroundColor Green
} else {
    Write-Host "`nKey saved but test failed. Check your key at console.groq.com`n" -ForegroundColor Yellow
}
