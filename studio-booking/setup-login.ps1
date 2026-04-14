# Ein Befehl: DB-Schema, Admin-User, Verifikation (auf DEINEM PC — braucht Netz zu Supabase).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== Lady Fitness — Admin-Login einrichten ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
  Write-Host "Fehler: .env fehlt. Kopiere .env.example nach .env und trage DATABASE_URL ein." -ForegroundColor Red
  exit 1
}

npm run setup:login
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Fehler beim Setup. Häufig: falsche DATABASE_URL, MariaDB nicht erreichbar, oder Firewall blockiert Port 3306." -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "OK. Als Nächstes:" -ForegroundColor Green
Write-Host "  1) npm run dev"
Write-Host "  2) Browser: http://localhost:3001/admin/login"
Write-Host "  3) E-Mail + Passwort wie in .env (ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)"
Write-Host ""
